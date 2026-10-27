import {
  auth,
  db,
  signInAsGuest,
  setFirebaseNetworkEnabled,
  handleFirestoreError
} from "./firebase.ts";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs
} from "firebase/firestore";
import { characterShopManager } from "./character_shop.js";

// Tự động xóa phòng trống hoặc không hoạt động sau 5 phút (300,000 ms)
export const ROOM_IDLE_TTL_MS = 5 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 30 * 1000;
const MIN_SNAPSHOT_INTERVAL_MS = 95; // ~10.5 Hz tick rate để tiết kiệm tối đa băng thông Firebase
const MIN_MOVEMENT_INTERVAL_MS = 95; // ~10.5 Hz cho di chuyển của Guest

export class OnlineMatchmaker {
  constructor(callbacks = {}) {
    this.callbacks = callbacks; // onRoomUpdate, onGuestAction, onHostSnapshot, onPlayerJoined, onLoadoutSync, onError, onRoomsPurged
    this.currentRoomId = null;
    this.isHost = false;
    this.user = null;
    this.unsubRoom = null;
    this.unsubLobby = null;
    this.hostSnapshotSeq = 0;
    this.guestActionSeq = 0;
    this.lastGuestActionSeqReceived = 0;
    this.lastHostSnapshotSeqReceived = 0;
    this.hostLoadout = null;
    this.guestLoadout = null;
    this._lastLoadoutSig = "";

    // Bandwidth & Rate-limiting state
    this._lastSnapshotSentTime = 0;
    this._lastSnapshotDigest = "";
    this._lastMoveSentTime = 0;
    this._lastMoveX = null;
    this._lastMoveZ = null;

    // Heartbeat & 5-minute auto-expiry timers
    this._heartbeatTimer = null;
    this._idleExpiryTimer = null;
    this._periodicPurgeTimer = null;
    this._roomCreatedOrJoinedAtMs = 0;

    // Monitor auth
    auth.onAuthStateChanged((u) => {
      if (u) {
        this.user = u;
      }
      if (this.callbacks.onAuthChanged) {
        this.callbacks.onAuthChanged(this.user);
      }
    });

    // Tự động xóa/rời phòng ngay khi đóng tab hoặc tải lại trang để giải phóng kết nối & DB
    if (typeof window !== "undefined") {
      const handleUnload = () => {
        if (this.currentRoomId) {
          this.leaveRoom();
        }
      };
      window.addEventListener("pagehide", handleUnload);
      window.addEventListener("beforeunload", handleUnload);
    }
  }

  /**
   * Kiểm tra xem một phòng có bị trống, kết thúc, hay quá 5 phút không hoạt động hay không
   */
  isRoomExpiredOrEmpty(data, now = Date.now()) {
    if (!data) return true;
    if (data.status === "finished") return true;
    if (!data.hostId || data.activeUserCount === 0) return true;

    // Trích xuất thời gian hoạt động gần nhất của phòng
    let lastActive = typeof data.lastActiveMs === "number" ? data.lastActiveMs : 0;
    if (!lastActive && data.updatedAt && typeof data.updatedAt.toMillis === "function") {
      lastActive = data.updatedAt.toMillis();
    }
    if (!lastActive && data.createdAt && typeof data.createdAt.toMillis === "function") {
      lastActive = data.createdAt.toMillis();
    }
    if (!lastActive && typeof data.createdAtMs === "number") {
      lastActive = data.createdAtMs;
    }

    // Các phòng cũ từ phiên trước không có timestamp hoặc đã quá 5 phút -> xóa ngay
    if (!lastActive) return true;
    if (now - lastActive > ROOM_IDLE_TTL_MS) return true;

    // Nếu phòng đang ở trạng thái chờ (chỉ có 1 người hoặc trống) quá 5 phút từ lúc tạo
    const createdMs =
      typeof data.createdAtMs === "number"
        ? data.createdAtMs
        : data.createdAt && typeof data.createdAt.toMillis === "function"
        ? data.createdAt.toMillis()
        : lastActive;

    if (data.status === "waiting" && !data.guestId && now - createdMs > ROOM_IDLE_TTL_MS) {
      return true;
    }

    // Kiểm tra heartbeat của chủ phòng
    if (typeof data.hostLastSeenMs === "number" && now - data.hostLastSeenMs > ROOM_IDLE_TTL_MS) {
      return true;
    }

    return false;
  }

  /**
   * Dọn dẹp toàn bộ phòng cũ / phòng trống quá 5 phút trên Firestore để DB luôn nhẹ và trống
   */
  async purgeStaleRooms({ deleteAllUnused = false } = {}) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return 0;
    }
    try {
      await setFirebaseNetworkEnabled(true);
      const snap = await getDocs(collection(db, "rooms"));
      const now = Date.now();
      const deletePromises = [];

      snap.forEach((docSnap) => {
        const roomId = docSnap.id;
        if (roomId === "healthcheck") return;
        // Không xóa phòng mà chính người chơi đang ở trong đó
        if (this.currentRoomId && roomId === this.currentRoomId) return;

        const data = docSnap.data();
        const shouldDelete =
          deleteAllUnused
            ? data.status !== "playing" || this.isRoomExpiredOrEmpty(data, now)
            : this.isRoomExpiredOrEmpty(data, now);

        if (shouldDelete) {
          deletePromises.push(
            deleteDoc(doc(db, "rooms", roomId)).catch(() => {})
          );
        }
      });

      // Also purge any legacy documents in players and clubs collections so DB stores zero player/character profiles
      try {
        const [playersSnap, clubsSnap] = await Promise.all([
          getDocs(collection(db, "players")).catch(() => null),
          getDocs(collection(db, "clubs")).catch(() => null)
        ]);
        if (playersSnap) {
          playersSnap.forEach((d) => {
            deletePromises.push(deleteDoc(doc(db, "players", d.id)).catch(() => {}));
          });
        }
        if (clubsSnap) {
          clubsSnap.forEach((d) => {
            deletePromises.push(deleteDoc(doc(db, "clubs", d.id)).catch(() => {}));
          });
        }
      } catch {}

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        if (this.callbacks.onRoomsPurged) {
          this.callbacks.onRoomsPurged(deletePromises.length);
        }
      }
      return deletePromises.length;
    } catch {
      return 0;
    }
  }

  async ensureUser(displayName = "") {
    if (auth.currentUser) {
      this.user = auth.currentUser;
      if (displayName && displayName.trim()) {
        this.user.displayName = displayName.trim();
      }
      return this.user;
    }
    if (this.user && this.user.uid) {
      if (displayName && displayName.trim()) {
        this.user.displayName = displayName.trim();
      }
      return this.user;
    }
    try {
      this.user = await signInAsGuest(displayName);
      return this.user;
    } catch (err) {
      handleFirestoreError(err, "tự động khởi tạo tài khoản khách");
      throw err;
    }
  }

  generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  _startRoomTimers(roomId) {
    this._stopRoomTimers();
    this._roomCreatedOrJoinedAtMs = Date.now();

    // Heartbeat mỗi 30 giây để báo phòng còn người hoạt động
    this._heartbeatTimer = setInterval(async () => {
      if (!this.currentRoomId || this.currentRoomId !== roomId) {
        this._stopRoomTimers();
        return;
      }
      if (typeof navigator !== "undefined" && !navigator.onLine) return;

      const now = Date.now();
      const roomRef = doc(db, "rooms", roomId);
      try {
        const payload = this.isHost
          ? { lastActiveMs: now, hostLastSeenMs: now }
          : { lastActiveMs: now, guestLastSeenMs: now };
        await updateDoc(roomRef, payload);
      } catch {
        // Phòng có thể đã bị xóa
      }
    }, HEARTBEAT_INTERVAL_MS);

    // Bộ đếm kiểm tra mỗi 20 giây: nếu phòng vẫn trống (không có đối thủ) sau 5 phút -> tự động xóa phòng
    this._idleExpiryTimer = setInterval(async () => {
      if (!this.currentRoomId || this.currentRoomId !== roomId) {
        this._stopRoomTimers();
        return;
      }
      const elapsed = Date.now() - this._roomCreatedOrJoinedAtMs;
      if (elapsed >= ROOM_IDLE_TTL_MS && !this.matchStartedTriggered) {
        const expiredRoomId = this.currentRoomId;
        await this.leaveRoom();
        if (this.callbacks.onRoomClosed) {
          this.callbacks.onRoomClosed({
            reason: "idle_timeout",
            message: `Phòng ${expiredRoomId} đã tự động xóa do trống quá 5 phút.`
          });
        }
      }
    }, 15 * 1000);
  }

  _stopRoomTimers() {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
    if (this._idleExpiryTimer) {
      clearInterval(this._idleExpiryTimer);
      this._idleExpiryTimer = null;
    }
  }

  /**
   * Đồng bộ cấu hình Nhân Vật Chính + Bot Đồng Đội của người chơi lên phòng hiện tại
   */
  async syncMyLoadout(loadout = null) {
    if (!this.currentRoomId) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    const myLoadout =
      loadout ||
      characterShopManager.getCompactOnlineLoadout({
        avoidCloningHostLoadout: !this.isHost ? this.hostLoadout : null
      });
    const roomRef = doc(db, "rooms", this.currentRoomId);
    try {
      if (this.isHost) {
        this.hostLoadout = myLoadout;
        await updateDoc(roomRef, {
          hostLoadout: myLoadout,
          lastActiveMs: Date.now()
        });
      } else {
        this.guestLoadout = myLoadout;
        await updateDoc(roomRef, {
          guestLoadout: myLoadout,
          lastActiveMs: Date.now()
        });
      }
    } catch {
      // Non-fatal sync
    }
  }

  /**
   * Tạo phòng đấu 1v1 mới (hoặc tự động vào phòng nếu người dùng nhập mã phòng đang chờ có sẵn)
   */
  async createRoom({
    customCode = "",
    hostName = "",
    gamesToWin = 1,
    pointsToWinGame = 4,
    mapId = "auto",
    weatherId = "auto",
    customCoinReward = 50000
  } = {}) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new Error("Không có kết nối mạng. Vui lòng chuyển sang Chơi Offline với Máy (AI).");
    }

    await setFirebaseNetworkEnabled(true);
    // Dọn các phòng cũ quá hạn trước khi tạo phòng mới
    this.purgeStaleRooms().catch(() => {});

    const user = await this.ensureUser(hostName);
    const cleanedCustom = (customCode || "").trim().toUpperCase();
    const roomId = cleanedCustom || this.generateRoomCode();
    const finalHostName = (hostName || user.displayName || "Host P1").trim();

    const roomRef = doc(db, "rooms", roomId);

    try {
      if (cleanedCustom) {
        const existingSnap = await getDoc(roomRef);
        if (existingSnap.exists()) {
          const existingData = existingSnap.data();
          if (this.isRoomExpiredOrEmpty(existingData)) {
            await deleteDoc(roomRef).catch(() => {});
          } else if (
            existingData.status === "waiting" &&
            existingData.hostId &&
            existingData.hostId !== user.uid &&
            !existingData.guestId
          ) {
            return await this.joinRoom(roomId, finalHostName);
          }
        }
      }

      const now = Date.now();
      const myLoadout = characterShopManager.getCompactOnlineLoadout();
      this.hostLoadout = myLoadout;
      this.guestLoadout = null;

      const availableMapIds = [
        "melbourne_blue",
        "gale_canyon",
        "storm_island",
        "typhoon_arena",
        "roland_clay",
        "wimbledon_grass",
        "cyber_neon",
        "tokyo_sakura",
        "golden_finals",
        "arctic_glacier",
        "volcano_inferno"
      ];
      const mapSelectionMode = mapId === "auto" || !mapId ? "auto" : "manual";
      const resolvedMapId =
        mapSelectionMode === "auto"
          ? availableMapIds[Math.floor(Math.random() * availableMapIds.length)]
          : mapId;
      const safeCoinReward = Math.max(1000, Math.min(100000000, Number(customCoinReward || 50000)));
      const safePointsToWin = Number(pointsToWinGame || 4);

      const initialData = {
        roomId,
        hostId: user.uid,
        hostName: finalHostName,
        hostLoadout: myLoadout,
        guestId: null,
        guestName: null,
        guestLoadout: null,
        status: "waiting", // waiting | playing | finished
        gamesToWin: Number(gamesToWin || 1),
        pointsToWinGame: safePointsToWin,
        mapId: resolvedMapId,
        mapSelectionMode,
        weatherId: weatherId || "auto",
        customCoinReward: safeCoinReward,
        activeUserCount: 1,
        createdAtMs: now,
        lastActiveMs: now,
        hostLastSeenMs: now,
        guestLastSeenMs: null,
        p1Score: 0,
        p2Score: 0,
        p1Games: 0,
        p2Games: 0,
        serverRole: "player",
        snapshot: null,
        snapshotSeq: 0,
        guestAction: null,
        guestActionSeq: 0,
        guestInput: null,
        winner: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(roomRef, initialData);
      try {
        localStorage.setItem("argon_hosting_room_id", roomId);
      } catch {}
      this.currentRoomId = roomId;
      this.isHost = true;
      this.matchStartedTriggered = false;
      this._subscribeToRoom(roomId);
      this._startRoomTimers(roomId);
      return {
        roomId,
        isHost: true,
        hostName: finalHostName,
        hostLoadout: myLoadout,
        guestLoadout: null,
        gamesToWin: Number(gamesToWin || 1),
        pointsToWinGame: safePointsToWin,
        mapId: resolvedMapId,
        mapSelectionMode,
        weatherId: weatherId || "auto",
        customCoinReward: safeCoinReward
      };
    } catch (err) {
      handleFirestoreError(err, `tạo phòng đấu [${roomId}]`, { roomId });
      throw err;
    }
  }

  /**
   * Tham gia phòng đấu có sẵn
   */
  async joinRoom(targetRoomId, guestName = "") {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new Error("Không có kết nối mạng. Vui lòng chuyển sang Chơi Offline với Máy (AI).");
    }

    await setFirebaseNetworkEnabled(true);
    const roomId = (targetRoomId || "").trim().toUpperCase();
    if (!roomId) throw new Error("Vui lòng nhập mã phòng hợp lệ.");

    const user = await this.ensureUser(guestName);
    const finalGuestName = (guestName || user.displayName || "Guest P2").trim();
    const roomRef = doc(db, "rooms", roomId);

    try {
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        throw new Error(`Không tìm thấy phòng "${roomId}" (hoặc phòng đã tự động xóa sau 5 phút trống).`);
      }
      const data = snap.data();
      if (this.isRoomExpiredOrEmpty(data)) {
        await deleteDoc(roomRef).catch(() => {});
        throw new Error(`Phòng "${roomId}" đã hết hạn sau 5 phút không hoạt động và đã được dọn dẹp.`);
      }
      if (data.status === "finished") {
        await deleteDoc(roomRef).catch(() => {});
        throw new Error(`Phòng "${roomId}" đã kết thúc trận đấu.`);
      }
      if (data.status === "playing" && data.guestId && data.guestId !== user.uid) {
        throw new Error(`Phòng "${roomId}" đã đủ 2 người chơi và đang thi đấu.`);
      }
      if (data.guestId && data.guestId !== user.uid) {
        throw new Error(`Phòng "${roomId}" đã có đối thủ tham gia.`);
      }

      const now = Date.now();
      const isSameBrowserAsHost =
        data.hostId === user.uid ||
        (typeof localStorage !== "undefined" && localStorage.getItem("argon_hosting_room_id") === roomId);
      const shouldAvoidHostClone =
        isSameBrowserAsHost || characterShopManager.isFreshDefaultProfile();
      const myLoadout = characterShopManager.getCompactOnlineLoadout({
        avoidCloningHostLoadout: shouldAvoidHostClone ? data.hostLoadout : null
      });
      this.hostLoadout = data.hostLoadout || null;
      this.guestLoadout = myLoadout;

      await updateDoc(roomRef, {
        guestId: user.uid,
        guestName: finalGuestName,
        guestLoadout: myLoadout,
        activeUserCount: 2,
        lastActiveMs: now,
        guestLastSeenMs: now,
        updatedAt: serverTimestamp()
      });

      this.currentRoomId = roomId;
      this.isHost = false;
      this.matchStartedTriggered = false;
      this._subscribeToRoom(roomId);
      this._startRoomTimers(roomId);
      return {
        roomId,
        isHost: false,
        hostName: data.hostName,
        guestName: finalGuestName,
        hostLoadout: data.hostLoadout || null,
        guestLoadout: myLoadout,
        gamesToWin: data.gamesToWin || 1,
        pointsToWinGame: data.pointsToWinGame || 4,
        mapId: data.mapId || "melbourne_blue",
        mapSelectionMode: data.mapSelectionMode || "manual",
        weatherId: data.weatherId || "auto",
        customCoinReward: Number(data.customCoinReward || 50000)
      };
    } catch (err) {
      handleFirestoreError(err, `tham gia phòng [${roomId}]`, { roomId });
      throw err;
    }
  }

  /**
   * Chủ phòng bấm bắt đầu trận đấu
   */
  async startMatch() {
    if (!this.currentRoomId || !this.isHost) {
      throw new Error("Chỉ chủ phòng mới có quyền bắt đầu trận đấu.");
    }
    const now = Date.now();
    this._roomCreatedOrJoinedAtMs = now;
    const myLoadout = characterShopManager.getCompactOnlineLoadout();
    this.hostLoadout = myLoadout;
    const roomRef = doc(db, "rooms", this.currentRoomId);
    try {
      await updateDoc(roomRef, {
        status: "playing",
        hostLoadout: myLoadout,
        lastActiveMs: now,
        hostLastSeenMs: now,
        matchStartedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, `bắt đầu trận đấu [${this.currentRoomId}]`, { roomId: this.currentRoomId });
      throw err;
    }
  }

  /**
   * Lắng nghe cập nhật phòng thời gian thực
   */
  _subscribeToRoom(roomId) {
    if (this.unsubRoom) {
      this.unsubRoom();
      this.unsubRoom = null;
    }

    const roomRef = doc(db, "rooms", roomId);
    this.unsubRoom = onSnapshot(
      roomRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          this._stopRoomTimers();
          if (this.callbacks.onRoomClosed) {
            this.callbacks.onRoomClosed({ message: "Phòng chơi đã đóng hoặc tự động xóa." });
          } else if (this.callbacks.onError) {
            this.callbacks.onError({ message: "Phòng chơi đã đóng hoặc tự động xóa." });
          }
          return;
        }

        const data = docSnap.data();

        // Nếu cả 2 người thoát hoặc phòng hết hạn 5 phút -> xóa ngay
        if (this.isRoomExpiredOrEmpty(data)) {
          deleteDoc(roomRef).catch(() => {});
          return;
        }

        if (data.hostLoadout) this.hostLoadout = data.hostLoadout;
        if (data.guestLoadout) this.guestLoadout = data.guestLoadout;

        const loadoutSig = JSON.stringify({
          h: this.hostLoadout,
          g: this.guestLoadout
        });
        if (loadoutSig !== this._lastLoadoutSig) {
          this._lastLoadoutSig = loadoutSig;
          if (this.callbacks.onLoadoutSync) {
            this.callbacks.onLoadoutSync({
              hostLoadout: this.hostLoadout,
              guestLoadout: this.guestLoadout
            });
          }
        }

        if (this.callbacks.onWaitingRoomUpdate) {
          this.callbacks.onWaitingRoomUpdate(data);
        }

        if (this.isHost && data.guestId) {
          // Reset 5-minute idle timer when guest joins
          this._roomCreatedOrJoinedAtMs = Date.now();
          if (this.callbacks.onPlayerJoined) {
            this.callbacks.onPlayerJoined({
              role: "p2",
              guestName: data.guestName || "Player 2",
              guestLoadout: data.guestLoadout || null
            });
          }
        }

        if (data.status === "playing" && !this.matchStartedTriggered) {
          this.matchStartedTriggered = true;
          this._roomCreatedOrJoinedAtMs = Date.now();
          if (this.callbacks.onMatchStart) {
            this.callbacks.onMatchStart({
              roomId,
              role: this.isHost ? "p1" : "p2",
              gamesToWin: data.gamesToWin || 1,
              pointsToWinGame: data.pointsToWinGame || 4,
              mapId: data.mapId || "melbourne_blue",
              mapSelectionMode: data.mapSelectionMode || "manual",
              weatherId: data.weatherId || "auto",
              customCoinReward: Number(data.customCoinReward || 50000),
              isHost: this.isHost,
              hostName: data.hostName || "Player 1",
              guestName: data.guestName || "Player 2",
              hostLoadout: data.hostLoadout || this.hostLoadout,
              guestLoadout: data.guestLoadout || this.guestLoadout
            });
          }
        }

        // Host receives Guest Action
        if (this.isHost && data.guestAction && data.guestActionSeq > this.lastGuestActionSeqReceived) {
          this.lastGuestActionSeqReceived = data.guestActionSeq;
          if (this.callbacks.onGuestAction) {
            this.callbacks.onGuestAction(data.guestAction);
          }
        }

        // Host receives Guest live movement
        if (this.isHost && data.guestInput && this.callbacks.onGuestInput) {
          this.callbacks.onGuestInput(data.guestInput);
        }

        // Guest receives Host Snapshot
        if (!this.isHost && data.snapshot && data.snapshotSeq > this.lastHostSnapshotSeqReceived) {
          this.lastHostSnapshotSeqReceived = data.snapshotSeq;
          if (this.callbacks.onHostSnapshot) {
            this.callbacks.onHostSnapshot(data.snapshot, data.snapshotSeq);
          }
        }

        if (this.callbacks.onRoomUpdate) {
          this.callbacks.onRoomUpdate(data);
        }
      },
      (error) => {
        handleFirestoreError(error, `lắng nghe trạng thái phòng [${roomId}]`, { roomId });
        if (this.callbacks.onError) {
          this.callbacks.onError(error);
        }
      }
    );
  }

  /**
   * Lắng nghe danh sách phòng chờ công khai trong sảnh chờ (kèm tự động dọn phòng quá 5 phút)
   */
  subscribeToLobbyRooms(onListUpdate) {
    if (this.unsubLobby) {
      this.unsubLobby();
      this.unsubLobby = null;
    }
    if (this._periodicPurgeTimer) {
      clearInterval(this._periodicPurgeTimer);
      this._periodicPurgeTimer = null;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      onListUpdate([]);
      return () => {};
    }

    setFirebaseNetworkEnabled(true).catch(() => {});
    // Quét và xóa ngay tất cả phòng cũ khi mở sảnh chờ
    this.purgeStaleRooms().catch(() => {});

    // Quét định kỳ mỗi 45 giây khi đang mở sảnh chờ
    this._periodicPurgeTimer = setInterval(() => {
      this.purgeStaleRooms().catch(() => {});
    }, 45 * 1000);

    try {
      const q = query(
        collection(db, "rooms"),
        where("status", "==", "waiting")
      );

      this.unsubLobby = onSnapshot(
        q,
        (querySnapshot) => {
          const now = Date.now();
          const activeRooms = [];
          querySnapshot.forEach((docSnap) => {
            if (docSnap.id === "healthcheck") return;
            const data = docSnap.data();
            // Nếu phát hiện phòng quá 5 phút hoặc không có người -> xóa tự động khỏi DB ngay lập tức
            if (this.isRoomExpiredOrEmpty(data, now)) {
              if (!this.currentRoomId || docSnap.id !== this.currentRoomId) {
                deleteDoc(doc(db, "rooms", docSnap.id)).catch(() => {});
              }
              return;
            }
            activeRooms.push({ id: docSnap.id, ...data });
          });

          activeRooms.sort((a, b) => {
            const timeA = a.lastActiveMs || (a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0);
            const timeB = b.lastActiveMs || (b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0);
            return timeB - timeA;
          });
          onListUpdate(activeRooms.slice(0, 15));
        },
        (error) => {
          handleFirestoreError(error, "lắng nghe danh sách phòng chờ");
        }
      );

      return () => {
        if (this.unsubLobby) {
          this.unsubLobby();
          this.unsubLobby = null;
        }
        if (this._periodicPurgeTimer) {
          clearInterval(this._periodicPurgeTimer);
          this._periodicPurgeTimer = null;
        }
      };
    } catch (err) {
      handleFirestoreError(err, "khởi tạo danh sách phòng chờ");
      return () => {};
    }
  }

  /**
   * Host đồng bộ snapshot trận đấu (Đã tối ưu Tick-rate ~10Hz & Delta/Compact Payload để tiết kiệm băng thông)
   */
  async broadcastSnapshot(snapshot) {
    if (!this.isHost || !this.currentRoomId) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    const now = performance.now();
    const isCriticalPhaseChange =
      snapshot.phase === "POINT_OVER" ||
      snapshot.phase === "MATCH_OVER" ||
      snapshot.banner?.seq;

    if (!isCriticalPhaseChange && now - this._lastSnapshotSentTime < MIN_SNAPSHOT_INTERVAL_MS) {
      return;
    }

    // Kiểm tra xem dữ liệu có thay đổi thực sự không (tránh gửi trùng lặp khi đứng yên chờ giao bóng)
    const digest = `${snapshot.phase}|${snapshot.score?.playerPoints}-${snapshot.score?.opponentPoints}|${snapshot.ball?.px},${snapshot.ball?.py},${snapshot.ball?.pz}|${snapshot.actors?.player?.px},${snapshot.actors?.player?.pz}|${snapshot.actors?.opponent?.px},${snapshot.actors?.opponent?.pz}|${snapshot.banner?.seq || 0}`;
    if (!isCriticalPhaseChange && digest === this._lastSnapshotDigest && now - this._lastSnapshotSentTime < 1500) {
      return;
    }

    this._lastSnapshotSentTime = now;
    this._lastSnapshotDigest = digest;
    this.hostSnapshotSeq += 1;

    const wallNow = Date.now();
    const roomRef = doc(db, "rooms", this.currentRoomId);
    try {
      await updateDoc(roomRef, {
        snapshot,
        snapshotSeq: this.hostSnapshotSeq,
        lastActiveMs: wallNow,
        hostLastSeenMs: wallNow
      });
    } catch {
      // Non-blocking sync throttled
    }
  }

  /**
   * Guest gửi hành động swing / serve / toss
   */
  async sendGuestAction(actionPayload) {
    if (this.isHost || !this.currentRoomId) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    this.guestActionSeq += 1;
    const now = Date.now();
    const roomRef = doc(db, "rooms", this.currentRoomId);
    try {
      await updateDoc(roomRef, {
        guestAction: {
          type: actionPayload.type || "swing",
          shotType: actionPayload.shotType || "TOPSPIN",
          speed: Number(Number(actionPayload.speed || 1.15).toFixed(2)),
          dirX: Number(Number(actionPayload.dirX || 0).toFixed(2)),
          side: actionPayload.side || null,
          seq: this.guestActionSeq,
          timestamp: now
        },
        guestActionSeq: this.guestActionSeq,
        lastActiveMs: now,
        guestLastSeenMs: now
      });
    } catch (err) {
      handleFirestoreError(err, "gửi hành động đánh bóng của Guest");
    }
  }

  /**
   * Guest gửi tọa độ di chuyển siêu gọn {x, z} ở tần suất ~10Hz chỉ khi vị trí thay đổi
   */
  async sendGuestMovement(moveInput) {
    if (this.isHost || !this.currentRoomId) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    const now = performance.now();
    if (now - this._lastMoveSentTime < MIN_MOVEMENT_INTERVAL_MS) return;

    const x = Number(moveInput.x.toFixed(2));
    const z = Number(moveInput.z.toFixed(2));

    if (
      this._lastMoveX !== null &&
      this._lastMoveZ !== null &&
      Math.abs(x - this._lastMoveX) < 0.02 &&
      Math.abs(z - this._lastMoveZ) < 0.02
    ) {
      return;
    }

    this._lastMoveSentTime = now;
    this._lastMoveX = x;
    this._lastMoveZ = z;

    const wallNow = Date.now();
    const roomRef = doc(db, "rooms", this.currentRoomId);
    try {
      await updateDoc(roomRef, {
        guestInput: { x, z, t: wallNow },
        lastActiveMs: wallNow,
        guestLastSeenMs: wallNow
      });
    } catch {
      // Ignored non-fatal
    }
  }

  /**
   * Xóa phòng ngay khi trận đấu kết thúc để không tốn dung lượng lưu trữ DB
   */
  async finishAndCleanRoom() {
    const roomId = this.currentRoomId;
    if (!roomId) return;
    this._stopRoomTimers();
    if (this.unsubRoom) {
      this.unsubRoom();
      this.unsubRoom = null;
    }
    this.currentRoomId = null;
    this.isHost = false;
    this.matchStartedTriggered = false;
    try {
      await deleteDoc(doc(db, "rooms", roomId));
    } catch {}
  }

  /**
   * Rời khỏi phòng hiện tại & xóa phòng nếu trống hoặc không còn người chơi
   */
  async leaveRoom() {
    this._stopRoomTimers();
    if (this.unsubRoom) {
      this.unsubRoom();
      this.unsubRoom = null;
    }
    const roomId = this.currentRoomId;
    const wasHost = this.isHost;
    this.currentRoomId = null;
    this.isHost = false;
    this.matchStartedTriggered = false;

    if (roomId && (typeof navigator === "undefined" || navigator.onLine)) {
      try {
        const roomRef = doc(db, "rooms", roomId);
        if (wasHost) {
          // Chủ phòng thoát -> xóa hẳn phòng ngay lập tức
          await deleteDoc(roomRef);
        } else {
          const snap = await getDoc(roomRef);
          if (snap.exists()) {
            const data = snap.data();
            if (!data.hostId || this.isRoomExpiredOrEmpty(data)) {
              await deleteDoc(roomRef);
            } else {
              await updateDoc(roomRef, {
                guestId: null,
                guestName: null,
                activeUserCount: 1,
                lastActiveMs: Date.now(),
                updatedAt: serverTimestamp()
              });
            }
          }
        }
      } catch (e) {
        console.warn("[OnlineMatchmaker] Lỗi khi rời phòng:", e);
      }
    }
  }

  /**
   * Ngắt toàn bộ kết nối Realtime khi người chơi quay về Menu hoặc chơi Offline với AI
   */
  async disconnectIfIdle() {
    if (this.unsubLobby) {
      this.unsubLobby();
      this.unsubLobby = null;
    }
    if (this._periodicPurgeTimer) {
      clearInterval(this._periodicPurgeTimer);
      this._periodicPurgeTimer = null;
    }
    if (!this.currentRoomId) {
      await setFirebaseNetworkEnabled(false);
    }
  }
}

export const onlineMatchmaker = new OnlineMatchmaker();
