import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  doc,
  getDoc,
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
  let userMessage = "Đã xảy ra lỗi kết nối máy chủ. Vui lòng thử lại.";
  let retryable = true;

  if (errorCode === "permission-denied") {
    userMessage = "Không có quyền truy cập dữ liệu phòng chơi.";
    retryable = false;
  } else if (errorCode === "not-found") {
    userMessage = "Phòng chơi không tồn tại hoặc đã bị hủy.";
    retryable = false;
  } else if (errorCode === "unavailable" || errorCode === "deadline-exceeded") {
    userMessage = "Mạng yếu hoặc máy chủ đang bận. Đang thử kết nối lại...";
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

  console.error(`[ArgonTennis Firebase] ${actionDescription} failed:`, errorInfo, error);
  return errorInfo;
}

/**
 * Health check to verify Firestore connectivity
 */
export async function testConnection(): Promise<boolean> {
  try {
    const healthRef = doc(db, "rooms", "healthcheck");
    await getDoc(healthRef);
    return true;
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error?.code === "not-found") {
      return true;
    }
    handleFirestoreError(err, "kiểm tra kết nối Firestore");
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

function getOrCreateLocalGuest(displayName?: string): GuestUser {
  let uid = "";
  try {
    uid = sessionStorage.getItem(GUEST_UID_STORAGE_KEY) || "";
    if (!uid) {
      const rand = Math.random().toString(36).substring(2, 10) + Date.now().toString(36).slice(-4);
      uid = `guest_${rand}`;
      sessionStorage.setItem(GUEST_UID_STORAGE_KEY, uid);
    }
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
      if (mapped.displayName) {
        try {
          localStorage.setItem(GUEST_NAME_STORAGE_KEY, mapped.displayName);
        } catch {}
      }
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
      // Fallback gracefully to active profile when Token Service API is disabled in GCP project
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


