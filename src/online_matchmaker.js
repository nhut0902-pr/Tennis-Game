import {
  auth,
  db,
  signInAsGuest,
  signInWithGoogle,
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

export class OnlineMatchmaker {
  constructor(callbacks = {}) {
    this.callbacks = callbacks; // onRoomUpdate, onGuestAction, onHostSnapshot, onPlayerJoined, onError
    this.currentRoomId = null;
    this.isHost = false;
    this.user = null;
    this.unsubRoom = null;
    this.unsubLobby = null;
    this.hostSnapshotSeq = 0;
    this.guestActionSeq = 0;
    this.lastGuestActionSeqReceived = 0;
    this.lastHostSnapshotSeqReceived = 0;

    // Monitor auth
    auth.onAuthStateChanged((u) => {
      if (u) {
        this.user = u;
      }
      if (this.callbacks.onAuthChanged) {
        this.callbacks.onAuthChanged(this.user);
      }
    });
  }

  async ensureUser(displayName = "") {
    if (auth.currentUser) {
      this.user = auth.currentUser;
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

  /**
   * Tạo phòng đấu 1v1 mới (hoặc tự động vào phòng nếu người dùng nhập mã phòng đang chờ có sẵn vào ô Mã tùy chỉnh)
   */
  async createRoom({ customCode = "", hostName = "", gamesToWin = 1 } = {}) {
    const user = await this.ensureUser(hostName);
    const cleanedCustom = (customCode || "").trim().toUpperCase();
    const roomId = cleanedCustom || this.generateRoomCode();
    const finalHostName = (hostName || user.displayName || "Host P1").trim();

    const roomRef = doc(db, "rooms", roomId);

    try {
      // Nếu người chơi dán mã phòng của bạn bè vào ô Mã phòng tùy chỉnh, tự động cho họ vào phòng đó với tư cách Guest (P2)
      if (cleanedCustom) {
        const existingSnap = await getDoc(roomRef);
        if (existingSnap.exists()) {
          const existingData = existingSnap.data();
          if (existingData.status === "waiting" && existingData.hostId && existingData.hostId !== user.uid && !existingData.guestId) {
            return await this.joinRoom(roomId, finalHostName);
          }
        }
      }

      const initialData = {
        roomId,
        hostId: user.uid,
        hostName: finalHostName,
        guestId: null,
        guestName: null,
        status: "waiting", // waiting | playing | finished
        gamesToWin: Number(gamesToWin || 1),
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
      this.currentRoomId = roomId;
      this.isHost = true;
      this.matchStartedTriggered = false;
      this._subscribeToRoom(roomId);
      return { roomId, isHost: true, hostName: finalHostName, gamesToWin: Number(gamesToWin || 1) };
    } catch (err) {
      handleFirestoreError(err, `tạo phòng đấu [${roomId}]`, { roomId });
      throw err;
    }
  }

  /**
   * Tham gia phòng đấu có sẵn
   */
  async joinRoom(targetRoomId, guestName = "") {
    const roomId = (targetRoomId || "").trim().toUpperCase();
    if (!roomId) throw new Error("Vui lòng nhập mã phòng hợp lệ.");

    const user = await this.ensureUser(guestName);
    const finalGuestName = (guestName || user.displayName || "Guest P2").trim();
    const roomRef = doc(db, "rooms", roomId);

    try {
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        throw new Error(`Không tìm thấy phòng "${roomId}". Vui lòng kiểm tra lại mã phòng!`);
      }
      const data = snap.data();
      if (data.status === "finished") {
        throw new Error(`Phòng "${roomId}" đã kết thúc trận đấu.`);
      }
      if (data.status === "playing" && data.guestId && data.guestId !== user.uid) {
        throw new Error(`Phòng "${roomId}" đã đủ 2 người chơi và đang thi đấu.`);
      }
      if (data.guestId && data.guestId !== user.uid) {
        throw new Error(`Phòng "${roomId}" đã có đối thủ tham gia.`);
      }

      // Update room as joined - duy trì status: "waiting" để 2 người vào sảnh chờ
      await updateDoc(roomRef, {
        guestId: user.uid,
        guestName: finalGuestName,
        updatedAt: serverTimestamp()
      });

      this.currentRoomId = roomId;
      this.isHost = false;
      this.matchStartedTriggered = false;
      this._subscribeToRoom(roomId);
      return { roomId, isHost: false, hostName: data.hostName, guestName: finalGuestName, gamesToWin: data.gamesToWin };
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
    const roomRef = doc(db, "rooms", this.currentRoomId);
    try {
      await updateDoc(roomRef, {
        status: "playing",
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
          if (this.callbacks.onRoomClosed) {
            this.callbacks.onRoomClosed({ message: "Phòng chơi đã bị hủy hoặc đóng bởi chủ phòng." });
          } else if (this.callbacks.onError) {
            this.callbacks.onError({ message: "Phòng chơi đã bị hủy hoặc đóng bởi chủ phòng." });
          }
          return;
        }

        const data = docSnap.data();

        // Cập nhật thông tin sảnh chờ (Host, Guest, Games, Status)
        if (this.callbacks.onWaitingRoomUpdate) {
          this.callbacks.onWaitingRoomUpdate(data);
        }

        // Báo cho chủ phòng khi khách vào
        if (this.isHost && data.guestId) {
          if (this.callbacks.onPlayerJoined) {
            this.callbacks.onPlayerJoined({
              role: "p2",
              guestName: data.guestName || "Player 2"
            });
          }
        }

        // Khi chủ phòng bấm Bắt đầu -> status đổi sang "playing"
        if (data.status === "playing" && !this.matchStartedTriggered) {
          this.matchStartedTriggered = true;
          if (this.callbacks.onMatchStart) {
            this.callbacks.onMatchStart({
              roomId,
              role: this.isHost ? "p1" : "p2",
              gamesToWin: data.gamesToWin || 1,
              isHost: this.isHost,
              hostName: data.hostName || "Player 1",
              guestName: data.guestName || "Player 2"
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
   * Lắng nghe danh sách phòng chờ công khai trong sảnh chờ
   */
  subscribeToLobbyRooms(onListUpdate) {
    if (this.unsubLobby) {
      this.unsubLobby();
      this.unsubLobby = null;
    }

    try {
      const q = query(
        collection(db, "rooms"),
        where("status", "==", "waiting")
      );

      this.unsubLobby = onSnapshot(
        q,
        (querySnapshot) => {
          const rooms = [];
          querySnapshot.forEach((doc) => {
            rooms.push({ id: doc.id, ...doc.data() });
          });
          // Sort by creation or update time descending
          rooms.sort((a, b) => {
            const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
            const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
            return timeB - timeA;
          });
          onListUpdate(rooms.slice(0, 15));
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
      };
    } catch (err) {
      handleFirestoreError(err, "khởi tạo danh sách phòng chờ");
      return () => {};
    }
  }

  /**
   * Host đồng bộ snapshot trận đấu
   */
  async broadcastSnapshot(snapshot) {
    if (!this.isHost || !this.currentRoomId) return;
    this.hostSnapshotSeq += 1;
    const roomRef = doc(db, "rooms", this.currentRoomId);
    try {
      await updateDoc(roomRef, {
        snapshot,
        snapshotSeq: this.hostSnapshotSeq,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      // Non-blocking sync throttled
    }
  }

  /**
   * Guest gửi hành động swing / serve / toss
   */
  async sendGuestAction(actionPayload) {
    if (this.isHost || !this.currentRoomId) return;
    this.guestActionSeq += 1;
    const roomRef = doc(db, "rooms", this.currentRoomId);
    try {
      await updateDoc(roomRef, {
        guestAction: {
          ...actionPayload,
          seq: this.guestActionSeq,
          timestamp: Date.now()
        },
        guestActionSeq: this.guestActionSeq,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, "gửi hành động đánh bóng của Guest");
    }
  }

  /**
   * Guest gửi hướng di chuyển joystick / phím
   */
  async sendGuestMovement(moveInput) {
    if (this.isHost || !this.currentRoomId) return;
    const roomRef = doc(db, "rooms", this.currentRoomId);
    try {
      await updateDoc(roomRef, {
        guestInput: {
          x: Number(moveInput.x.toFixed(2)),
          z: Number(moveInput.z.toFixed(2)),
          timestamp: Date.now()
        }
      });
    } catch (err) {
      // Ignored non-fatal
    }
  }

  /**
   * Rời khỏi phòng hiện tại (Host hủy phòng hoặc Guest thoát sảnh)
   */
  async leaveRoom() {
    if (this.unsubRoom) {
      this.unsubRoom();
      this.unsubRoom = null;
    }
    if (this.currentRoomId) {
      try {
        const roomRef = doc(db, "rooms", this.currentRoomId);
        if (this.isHost) {
          await deleteDoc(roomRef);
        } else if (this.user) {
          await updateDoc(roomRef, {
            guestId: null,
            guestName: null,
            updatedAt: serverTimestamp()
          });
        }
      } catch (e) {
        console.warn("[OnlineMatchmaker] Lỗi khi rời phòng:", e);
      }
    }
    this.currentRoomId = null;
    this.isHost = false;
    this.matchStartedTriggered = false;
  }
}

export const onlineMatchmaker = new OnlineMatchmaker();
