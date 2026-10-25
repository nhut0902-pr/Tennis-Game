import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  doc,
  getDoc,
  enableNetwork,
  disableNetwork,
  Firestore
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Purge any stale cached Firebase Auth tokens in IndexedDB/localStorage from previous sessions
// so disabled securetoken.googleapis.com in the GCP project never poisons network requests.
try {
  if (typeof indexedDB !== "undefined" && typeof indexedDB.deleteDatabase === "function") {
    indexedDB.deleteDatabase("firebaseLocalStorageDb");
  }
  if (typeof localStorage !== "undefined") {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith("firebase:authUser:") || k.startsWith("firebase:host:")) {
        localStorage.removeItem(k);
      }
    });
  }
} catch {}

// Initialize a dedicated Firebase App strictly for Cloud Firestore
// Never attach Firebase Auth to this app instance so Firestore never calls securetoken.googleapis.com
export const app = initializeApp(firebaseConfig, "argon-firestore-client");

// Initialize Cloud Firestore using explicit databaseId from config
export const db: Firestore = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true
  },
  firebaseConfig.firestoreDatabaseId || "(default)"
);

let networkEnabledState = true;

/**
 * Enable or disable Firestore network connection to save simultaneous connections
 * and prevent background retries when playing Offline with AI.
 */
export async function setFirebaseNetworkEnabled(enabled: boolean): Promise<void> {
  if (typeof navigator !== "undefined" && !navigator.onLine && enabled) {
    return;
  }
  if (networkEnabledState === enabled) return;
  networkEnabledState = enabled;
  try {
    if (enabled) {
      await enableNetwork(db);
    } else {
      await disableNetwork(db);
    }
  } catch {
    // Ignore transient state errors
  }
}

/**
 * Standard Firebase Error structure conforming to guidelines
 */
export interface FirestoreErrorInfo {
  userMessage: string;
  retryable: boolean;
  action: string;
  code: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

/**
 * Robust error handler for Firestore & Auth operations
 */
export function handleFirestoreError(
  error: unknown,
  actionDescription = "database operation",
  context: Record<string, unknown> = {}
): FirestoreErrorInfo {
  const err = error as { code?: string; message?: string };
  const errorCode = err?.code || "unknown";
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
  let userMessage = isOffline
    ? "Đang ở chế độ Offline không có mạng. Bạn vẫn có thể chơi với Máy (AI)."
    : "Đã xảy ra lỗi kết nối máy chủ. Vui lòng thử lại.";
  let retryable = true;

  if (errorCode === "permission-denied") {
    userMessage = "Không có quyền truy cập dữ liệu phòng chơi.";
    retryable = false;
  } else if (errorCode === "not-found") {
    userMessage = "Phòng chơi không tồn tại hoặc đã tự động xóa sau 5 phút trống.";
    retryable = false;
  } else if (errorCode === "unavailable" || errorCode === "deadline-exceeded" || isOffline) {
    userMessage = isOffline
      ? "Thiết bị đang Offline. Hãy chọn Đấu với Máy (AI) để chơi không cần mạng."
      : "Mạng yếu hoặc máy chủ đang bận. Đang thử kết nối lại...";
    retryable = true;
  } else if (errorCode === "auth/popup-closed-by-user") {
    userMessage = "Đã đóng cửa sổ đăng nhập Google.";
    retryable = true;
  } else if (errorCode === "auth/network-request-failed") {
    userMessage = "Lỗi kết nối mạng khi xác thực. Vui lòng kiểm tra internet.";
    retryable = true;
  }

  const errorInfo: FirestoreErrorInfo = {
    userMessage,
    retryable,
    action: actionDescription,
    code: errorCode,
    timestamp: new Date().toISOString(),
    context
  };

  if (isOffline || errorCode === "unavailable") {
    console.warn(`[ArgonTennis Offline/Network] ${actionDescription}:`, errorInfo.userMessage);
  } else {
    console.error(`[ArgonTennis Firebase] ${actionDescription} failed:`, errorInfo, error);
  }
  return errorInfo;
}

/**
 * Health check to verify Firestore connectivity (returns false immediately when offline)
 */
export async function testConnection(): Promise<boolean> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return false;
  }
  try {
    await setFirebaseNetworkEnabled(true);
    const healthRef = doc(db, "rooms", "healthcheck");
    await getDoc(healthRef);
    return true;
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error?.code === "not-found") {
      return true;
    }
    return false;
  }
}

export interface GuestUser {
  uid: string;
  displayName: string | null;
  isAnonymous: boolean;
  isLocalGuest?: boolean;
}

export type AppUser = GuestUser;

const GUEST_UID_STORAGE_KEY = "argon_tennis_guest_uid";
const GUEST_NAME_STORAGE_KEY = "argon_tennis_nickname";
const GOOGLE_USER_STORAGE_KEY = "argon_tennis_google_user_v1";

function getOrCreateLocalGuest(displayName?: string): GuestUser {
  // Check if user previously signed in with Google and saved their profile locally
  if (!displayName) {
    try {
      const savedGoogleRaw = localStorage.getItem(GOOGLE_USER_STORAGE_KEY);
      if (savedGoogleRaw) {
        const parsedGoogle = JSON.parse(savedGoogleRaw);
        if (parsedGoogle && typeof parsedGoogle.uid === "string" && parsedGoogle.uid.length >= 4) {
          return {
            uid: parsedGoogle.uid,
            displayName: parsedGoogle.displayName || localStorage.getItem(GUEST_NAME_STORAGE_KEY) || "TayVot",
            isAnonymous: false,
            isLocalGuest: false
          };
        }
      }
    } catch {}
  }

  let uid = "";
  try {
    uid =
      localStorage.getItem(GUEST_UID_STORAGE_KEY) ||
      sessionStorage.getItem(GUEST_UID_STORAGE_KEY) ||
      "";
    if (!uid) {
      const rand = Math.random().toString(36).substring(2, 10) + Date.now().toString(36).slice(-4);
      uid = `guest_${rand}`;
    }
    localStorage.setItem(GUEST_UID_STORAGE_KEY, uid);
    sessionStorage.setItem(GUEST_UID_STORAGE_KEY, uid);
  } catch {
    uid = `guest_${Math.floor(100000 + Math.random() * 900000)}`;
  }

  let savedName = "";
  try {
    savedName = localStorage.getItem(GUEST_NAME_STORAGE_KEY) || "";
  } catch {}

  const chosenName =
    (displayName || "").trim() ||
    savedName.trim() ||
    `TayVot_${Math.floor(100 + Math.random() * 900)}`;

  try {
    localStorage.setItem(GUEST_NAME_STORAGE_KEY, chosenName);
  } catch {}

  return {
    uid,
    displayName: chosenName,
    isAnonymous: true,
    isLocalGuest: true
  };
}

type AuthStateCallback = (user: AppUser | null) => void;
const authListeners = new Set<AuthStateCallback>();

export const auth: {
  currentUser: AppUser | null;
  onAuthStateChanged: (cb: AuthStateCallback) => () => void;
} = {
  currentUser: getOrCreateLocalGuest(),
  onAuthStateChanged(cb: AuthStateCallback) {
    authListeners.add(cb);
    const current = this.currentUser;
    Promise.resolve().then(() => {
      if (authListeners.has(cb)) {
        cb(current);
      }
    });
    return () => {
      authListeners.delete(cb);
    };
  }
};

function notifyAuthListeners() {
  for (const cb of authListeners) {
    try {
      cb(auth.currentUser);
    } catch {}
  }
}

export function updateUserProfileName(displayName: string): AppUser {
  const cleaned = (displayName || "").trim();
  const updated = getOrCreateLocalGuest(cleaned);
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    updated.uid = auth.currentUser.uid;
    updated.isAnonymous = false;
    updated.isLocalGuest = false;
    try {
      localStorage.setItem(GOOGLE_USER_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  auth.currentUser = updated;
  notifyAuthListeners();
  return updated;
}

/**
 * Sign in as Guest with a chosen nickname.
 */
export async function signInAsGuest(displayName?: string): Promise<AppUser> {
  const user = getOrCreateLocalGuest(displayName);
  auth.currentUser = user;
  notifyAuthListeners();
  return user;
}

/**
 * Sign in with Google Popup (isolated on a separate FirebaseApp so it never affects Firestore)
 */
export async function signInWithGoogle(): Promise<AppUser> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("Không thể đăng nhập Google khi không có kết nối mạng.");
  }
  try {
    const { getAuth, signInWithPopup, GoogleAuthProvider, signOut } = await import("firebase/auth");
    const authApp = initializeApp(firebaseConfig, "argon-google-auth-popup");
    const googleAuth = getAuth(authApp);
    const provider = new GoogleAuthProvider();
    try {
      const userCred = await signInWithPopup(googleAuth, provider);
      const gUser = userCred.user;
      const mapped: AppUser = {
        uid: gUser.uid,
        displayName: gUser.displayName || auth.currentUser?.displayName || "TayVot",
        isAnonymous: false,
        isLocalGuest: false
      };
      try {
        if (mapped.displayName) {
          localStorage.setItem(GUEST_NAME_STORAGE_KEY, mapped.displayName);
        }
        localStorage.setItem(GOOGLE_USER_STORAGE_KEY, JSON.stringify(mapped));
      } catch {}
      // Sign out the popup instance immediately so it never caches tokens requiring securetoken API
      await signOut(googleAuth).catch(() => {});
      auth.currentUser = mapped;
      notifyAuthListeners();
      return mapped;
    } catch (innerErr: unknown) {
      await signOut(googleAuth).catch(() => {});
      throw innerErr;
    }
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    const msg = String(err?.message || err?.code || "");
    if (msg.includes("token-service-api-has-not-been-used") || msg.includes("securetoken")) {
      const fallbackUser = getOrCreateLocalGuest();
      auth.currentUser = fallbackUser;
      notifyAuthListeners();
      return fallbackUser;
    }
    handleFirestoreError(error, "đăng nhập tài khoản Google");
    throw error;
  }
}

/**
 * Listen for user auth state
 */
export function subscribeAuthState(callback: (user: AppUser | null) => void): () => void {
  return auth.onAuthStateChanged(callback);
}
