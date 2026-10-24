import {
  onlineMatchmaker
} from "./online_matchmaker.js";
import {
  auth,
  signInWithGoogle,
  signInAsGuest,
  updateUserProfileName,
  testConnection
} from "./firebase.ts";
import { renderMiiAvatar } from "./mii_avatars.js";

export class FirebaseLobbyUI {
  constructor(callbacks = {}) {
    this.callbacks = callbacks; // onStartOnlineMatch({ roomId, role, gamesToWin, isHost, hostName, guestName })
    this.modal = document.getElementById("firebase-lobby-modal");
    this.unsubLobbyRooms = null;
    this.currentRoom = null;
    this.isHost = false;
    this._p1AvatarRendered = false;
    this._p2AvatarRendered = false;
    this._lastRenderedRoomsSig = "";

    this._bindElements();
    this._bindEvents();
    this._initProfile();
    this._initFirebaseHealth();
    this._initMatchmakerCallbacks();
    this._checkURLRoomParam();
  }

  _bindElements() {
    this.btnOpenLobby = document.getElementById("btn-online-lobby");
    this.btnTitleOnline = document.getElementById("btn-title-online");
    this.btnCloseLobby = document.getElementById("btn-close-lobby");
    this.btnCloseLobbyX = document.getElementById("btn-close-lobby-x");

    this.profileNameInput = document.getElementById("lobby-profile-name");
    this.btnSaveProfileName = document.getElementById("btn-save-profile-name");
    this.btnGoogleLogin = document.getElementById("btn-google-login");
    this.firebaseStatusBadge = document.getElementById("lobby-firebase-status");

    // Views
    this.browseView = document.getElementById("lobby-browse-view");
    this.waitingRoomView = document.getElementById("lobby-waiting-room");

    // Host room form elements
    this.btnHostCreate = document.getElementById("btn-host-create");
    this.hostGamesSelect = document.getElementById("host-games-select");
    this.hostCustomCodeInput = document.getElementById("host-custom-code");
    this.hostPreviewLinkInput = document.getElementById("host-preview-link");
    this.btnCopyBrowseCode = document.getElementById("btn-copy-browse-code");
    this.btnCopyBrowseLink = document.getElementById("btn-copy-browse-link");

    // Join room elements
    this.joinCodeInput = document.getElementById("join-code-input");
    this.btnJoinRoom = document.getElementById("btn-join-room");
    this.roomsListContainer = document.getElementById("lobby-rooms-list");
    this.roomsEmptyHint = document.getElementById("lobby-rooms-empty");

    // Dedicated Waiting Room Elements
    this.waitingGamesBadge = document.getElementById("waiting-games-badge");
    this.waitingMyRoleBadge = document.getElementById("waiting-my-role-badge");

    this.waitingCodeInput = document.getElementById("waiting-code-input");
    this.btnCopyWaitingCode = document.getElementById("btn-copy-waiting-code");
    this.waitingLinkInput = document.getElementById("waiting-link-input");
    this.btnCopyWaitingLink = document.getElementById("btn-copy-waiting-link");

    this.waitingP1Card = document.getElementById("waiting-p1-card");
    this.waitingP1AvatarWrap = document.getElementById("waiting-p1-avatar-wrap");
    this.waitingP1Avatar = document.getElementById("waiting-p1-avatar");
    this.waitingP1Name = document.getElementById("waiting-p1-name");

    this.waitingP2Card = document.getElementById("waiting-p2-card");
    this.waitingP2AvatarWrap = document.getElementById("waiting-p2-avatar-wrap");
    this.waitingP2Avatar = document.getElementById("waiting-p2-avatar");
    this.waitingP2Name = document.getElementById("waiting-p2-name");
    this.waitingP2Status = document.getElementById("waiting-p2-status");
    this.waitingP2Sub = document.getElementById("waiting-p2-sub");

    this.waitingHostControls = document.getElementById("waiting-host-controls");
    this.btnWaitingStartMatch = document.getElementById("btn-waiting-start-match");
    this.waitingHostHint = document.getElementById("waiting-host-hint");
    this.btnWaitingCancelRoom = document.getElementById("btn-waiting-cancel-room");

    this.waitingGuestControls = document.getElementById("waiting-guest-controls");
    this.btnWaitingLeaveRoom = document.getElementById("btn-waiting-leave-room");

    // 3-2-1 Countdown overlay elements
    this.waitingCountdownOverlay = document.getElementById("waiting-countdown-overlay");
    this.waitingCountdownNumber = document.getElementById("waiting-countdown-number");
    this.waitingCountdownLabel = document.getElementById("waiting-countdown-label");
    this.waitingCountdownBar = document.getElementById("waiting-countdown-bar");
    this._isCountingDown = false;

    // Notification toast
    this.toastEl = document.getElementById("lobby-toast");
    this._toastTimer = null;
    this._toastFadeTimer = null;
  }

  _bindEvents() {
    if (this.btnOpenLobby) {
      this.btnOpenLobby.addEventListener("click", (e) => {
        e.stopPropagation();
        this.open();
      });
    }
    if (this.btnTitleOnline) {
      this.btnTitleOnline.addEventListener("click", (e) => {
        e.stopPropagation();
        this.open();
      });
    }
    if (this.btnCloseLobby) {
      this.btnCloseLobby.addEventListener("click", (e) => {
        e.stopPropagation();
        this.close();
      });
    }
    if (this.btnCloseLobbyX) {
      this.btnCloseLobbyX.addEventListener("click", (e) => {
        e.stopPropagation();
        this.close();
      });
    }

    // Save profile nickname
    if (this.btnSaveProfileName && this.profileNameInput) {
      this.btnSaveProfileName.addEventListener("click", async () => {
        const name = this.profileNameInput.value.trim();
        if (name) {
          updateUserProfileName(name);
          this.showToast(`Đã lưu tên hiển thị: ${name}`);
        }
      });
    }

    // Google Sign In
    if (this.btnGoogleLogin) {
      this.btnGoogleLogin.addEventListener("click", async () => {
        try {
          this.btnGoogleLogin.disabled = true;
          this.btnGoogleLogin.textContent = "Đang đăng nhập...";
          const user = await signInWithGoogle();
          if (user && user.displayName && this.profileNameInput) {
            this.profileNameInput.value = user.displayName;
            localStorage.setItem("argon_tennis_nickname", user.displayName);
          }
          this.showToast(`Chào mừng ${user?.displayName || "Bạn"}!`);
        } catch (err) {
          this.showToast("Đăng nhập Google không hoàn tất.");
        } finally {
          this.btnGoogleLogin.disabled = false;
          this.btnGoogleLogin.innerHTML = `<span>Đăng nhập tài khoản Google</span>`;
        }
      });
    }

    // Auto-extract room code if user pastes a full invite link into room code inputs
    if (this.joinCodeInput) {
      this.joinCodeInput.addEventListener("input", () => {
        const extracted = this._extractRoomCode(this.joinCodeInput.value);
        if (extracted !== this.joinCodeInput.value) {
          this.joinCodeInput.value = extracted;
        }
      });
    }
    if (this.hostCustomCodeInput) {
      this.hostCustomCodeInput.addEventListener("input", () => {
        const extracted = this._extractRoomCode(this.hostCustomCodeInput.value);
        if (extracted !== this.hostCustomCodeInput.value) {
          this.hostCustomCodeInput.value = extracted;
        }
        this._syncBrowsePreviewLink();
      });
    }

    // Copy room code from Browse View (and auto-create room so friend can join immediately)
    if (this.btnCopyBrowseCode) {
      this.btnCopyBrowseCode.addEventListener("click", async () => {
        this._ensureBrowseRoomCode();
        const code = this._extractRoomCode(this.hostCustomCodeInput?.value || "");
        if (code) {
          try {
            await navigator.clipboard.writeText(code);
            this._flashCopyButton(this.btnCopyBrowseCode, "Đã sao chép");
          } catch {}
          await this._handleHostRoom();
        }
      });
    }

    // Copy invite link from Browse View (and auto-create room so friend can join immediately)
    if (this.btnCopyBrowseLink) {
      this.btnCopyBrowseLink.addEventListener("click", async () => {
        this._ensureBrowseRoomCode();
        const link = this.hostPreviewLinkInput?.value || "";
        if (link) {
          try {
            await navigator.clipboard.writeText(link);
            this._flashCopyButton(this.btnCopyBrowseLink, "Đã sao chép");
          } catch {}
          await this._handleHostRoom();
        }
      });
    }

    // Host room creation
    if (this.btnHostCreate) {
      this.btnHostCreate.addEventListener("click", async () => {
        await this._handleHostRoom();
      });
    }

    // Join room by code
    if (this.btnJoinRoom) {
      this.btnJoinRoom.addEventListener("click", async () => {
        const code = this._extractRoomCode(this.joinCodeInput?.value || "");
        if (!code) {
          this.showToast("Vui lòng nhập mã phòng!");
          return;
        }
        await this._handleJoinRoom(code);
      });
    }

    // Copy room code in Waiting Room
    if (this.btnCopyWaitingCode) {
      this.btnCopyWaitingCode.addEventListener("click", () => {
        const code = this.waitingCodeInput?.value || "";
        if (code && code !== "------") {
          navigator.clipboard.writeText(code).then(() => {
            this._flashCopyButton(this.btnCopyWaitingCode, "Đã sao chép");
            this.showToast("Đã sao chép mã phòng vào bộ nhớ tạm");
          }).catch(() => {
            this.showToast(`Mã phòng của bạn: ${code}`);
          });
        }
      });
    }

    // Copy invite link in Waiting Room
    if (this.btnCopyWaitingLink) {
      this.btnCopyWaitingLink.addEventListener("click", () => {
        const link = this.waitingLinkInput?.value || "";
        if (link) {
          navigator.clipboard.writeText(link).then(() => {
            this._flashCopyButton(this.btnCopyWaitingLink, "Đã sao chép");
            this.showToast("Đã sao chép đường dẫn mời vào bộ nhớ tạm");
          }).catch(() => {
            this.showToast("Vui lòng bôi đen và sao chép đường dẫn.");
          });
        }
      });
    }

    // Host clicks Start Match
    if (this.btnWaitingStartMatch) {
      this.btnWaitingStartMatch.addEventListener("click", async () => {
        if (!this.isHost || this.btnWaitingStartMatch.disabled) return;
        try {
          this.btnWaitingStartMatch.disabled = true;
          this.btnWaitingStartMatch.textContent = "ĐANG BẮT ĐẦU...";
          await onlineMatchmaker.startMatch();
        } catch (err) {
          this.showToast(err.message || "Không thể bắt đầu trận đấu.");
          this.btnWaitingStartMatch.disabled = false;
          this.btnWaitingStartMatch.innerHTML = `<span>BẮT ĐẦU TRẬN ĐẤU</span>`;
        }
      });
    }

    // Host cancels room
    if (this.btnWaitingCancelRoom) {
      this.btnWaitingCancelRoom.addEventListener("click", async () => {
        await onlineMatchmaker.leaveRoom();
        this.showBrowseView();
        this.showToast("Đã hủy phòng thi đấu.");
      });
    }

    // Guest leaves room
    if (this.btnWaitingLeaveRoom) {
      this.btnWaitingLeaveRoom.addEventListener("click", async () => {
        await onlineMatchmaker.leaveRoom();
        this.showBrowseView();
        this.showToast("Đã rời phòng thi đấu.");
      });
    }
  }

  _flashCopyButton(btn, text) {
    if (!btn) return;
    const oldHTML = btn.innerHTML;
    btn.innerHTML = `<span>${text}</span>`;
    btn.classList.add("copied");
    setTimeout(() => {
      btn.innerHTML = oldHTML;
      btn.classList.remove("copied");
    }, 2200);
  }

  _initMatchmakerCallbacks() {
    // Listen for room data updates in waiting room
    onlineMatchmaker.callbacks.onWaitingRoomUpdate = (roomData) => {
      if (!this.currentRoom || this.currentRoom.roomId !== roomData.roomId) return;
      this._updateWaitingRoomState(roomData);
    };

    // Listen for match start (triggered when status becomes "playing")
    onlineMatchmaker.callbacks.onMatchStart = (matchData) => {
      this._runCountdownAndStart(matchData);
    };

    // Listen for room closed by host
    onlineMatchmaker.callbacks.onRoomClosed = () => {
      this.showToast("Phòng chơi đã bị đóng hoặc hủy bởi chủ phòng.");
      this.showBrowseView();
    };
  }

  _extractRoomCode(rawValue = "") {
    const val = String(rawValue || "").trim();
    if (!val) return "";
    // If user pasted a full invite URL containing ?room=CODE or &room=CODE or #room=CODE
    const match = val.match(/[?&#]room=([A-Za-z0-9_-]+)/i);
    if (match && match[1]) {
      return match[1].trim().toUpperCase().slice(0, 12);
    }
    if (/^https?:\/\//i.test(val)) {
      try {
        const u = new URL(val);
        const r = u.searchParams.get("room");
        if (r) return r.trim().toUpperCase().slice(0, 12);
      } catch {}
    }
    return val.replace(/[^A-Za-z0-9_-]/g, "").toUpperCase().slice(0, 12);
  }

  async _checkURLRoomParam() {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
    const rawRoom = params.get("room") || hashParams.get("room") || "";
    const roomParam = this._extractRoomCode(rawRoom);

    if (roomParam && roomParam !== "DEFAULT") {
      // Open lobby modal immediately so title modal never flashes
      this.open();
      if (this.joinCodeInput) {
        this.joinCodeInput.value = roomParam;
      }
      const guestName = (this.profileNameInput?.value || localStorage.getItem("argon_tennis_nickname") || "Player 2").trim();
      await this._handleJoinRoom(roomParam, guestName);
    }
  }

  async _initProfile() {
    const savedName = localStorage.getItem("argon_tennis_nickname") || "";
    if (this.profileNameInput) {
      this.profileNameInput.value = savedName || `TayVot_${Math.floor(100 + Math.random() * 900)}`;
    }
    auth.onAuthStateChanged((user) => {
      if (user && user.displayName && this.profileNameInput && !this.profileNameInput.value) {
        this.profileNameInput.value = user.displayName;
      }
    });
  }

  async _initFirebaseHealth() {
    const ok = await testConnection();
    if (this.firebaseStatusBadge) {
      if (ok) {
        this.firebaseStatusBadge.textContent = "Máy chủ trực tuyến";
        this.firebaseStatusBadge.className = "status-badge online";
      } else {
        this.firebaseStatusBadge.textContent = "Đang kết nối máy chủ...";
        this.firebaseStatusBadge.className = "status-badge connecting";
      }
    }
  }

  _getPublicBaseUrl() {
    const origin = (window.location.origin || "").replace(/^https:\/\/ais-dev-/i, "https://ais-pre-");
    const pathname = window.location.pathname || "/";
    return origin + pathname;
  }

  _buildInviteLink(roomId) {
    const cleanCode = this._extractRoomCode(roomId) || "TENNIS";
    const url = new URL(this._getPublicBaseUrl());
    url.searchParams.set("room", cleanCode);
    url.searchParams.set("role", "p2");
    return url.toString();
  }

  _ensureBrowseRoomCode() {
    if (!this.hostCustomCodeInput) return "";
    let code = this._extractRoomCode(this.hostCustomCodeInput.value);
    if (!code) {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.hostCustomCodeInput.value = code;
    }
    this._syncBrowsePreviewLink();
    return code;
  }

  _syncBrowsePreviewLink() {
    if (!this.hostPreviewLinkInput) return;
    const code = this._extractRoomCode(this.hostCustomCodeInput?.value || "") || "TENNIS";
    this.hostPreviewLinkInput.value = this._buildInviteLink(code);
  }

  showBrowseView() {
    this.currentRoom = null;
    this.isHost = false;
    const profileBar = this.modal?.querySelector(".lobby-profile-bar");
    if (profileBar) profileBar.classList.remove("hidden");
    if (this.browseView) this.browseView.classList.remove("hidden");
    if (this.waitingRoomView) this.waitingRoomView.classList.add("hidden");
    if (this.btnHostCreate) this.btnHostCreate.disabled = false;
    this._ensureBrowseRoomCode();
  }

  showWaitingRoomView({ roomId, isHost, hostName, guestName, gamesToWin }) {
    this.currentRoom = { roomId, isHost, hostName, guestName, gamesToWin };
    this.isHost = isHost;

    const profileBar = this.modal?.querySelector(".lobby-profile-bar");
    if (profileBar) profileBar.classList.add("hidden");
    if (this.browseView) this.browseView.classList.add("hidden");
    if (this.waitingRoomView) this.waitingRoomView.classList.remove("hidden");

    // Format badge
    if (this.waitingGamesBadge) {
      const gNum = Number(gamesToWin || 1);
      this.waitingGamesBadge.textContent = gNum === 1 ? "1 Game" : `Best of ${gNum * 2 - 1} (Thắng ${gNum})`;
    }

    // Role badge
    if (this.waitingMyRoleBadge) {
      this.waitingMyRoleBadge.textContent = isHost ? "Vai trò: Chủ phòng (P1)" : "Vai trò: Khách đấu (P2)";
    }

    // Room Code text box
    if (this.waitingCodeInput) {
      this.waitingCodeInput.value = roomId;
    }

    // Invite Link text box (uses public shared URL so friends can open directly)
    if (this.waitingLinkInput) {
      this.waitingLinkInput.value = this._buildInviteLink(roomId);
    }

    // Player 1 (Host) Card
    if (this.waitingP1Name) {
      this.waitingP1Name.textContent = hostName || "Player 1";
    }
    if (this.waitingP1Avatar && !this._p1AvatarRendered) {
      renderMiiAvatar(this.waitingP1Avatar, "player1");
      this._p1AvatarRendered = true;
    }

    // Player 2 (Guest) Card
    this._renderGuestCard(guestName);

    // Host vs Guest Controls
    if (isHost) {
      if (this.waitingHostControls) this.waitingHostControls.classList.remove("hidden");
      if (this.waitingGuestControls) this.waitingGuestControls.classList.add("hidden");
      this._updateHostStartButton(!!guestName);
    } else {
      if (this.waitingHostControls) this.waitingHostControls.classList.add("hidden");
      if (this.waitingGuestControls) this.waitingGuestControls.classList.remove("hidden");
    }
  }

  _renderGuestCard(guestName) {
    if (!this.waitingP2Card) return;

    if (this.waitingP2Avatar && !this._p2AvatarRendered) {
      renderMiiAvatar(this.waitingP2Avatar, "opponent1");
      this._p2AvatarRendered = true;
    }

    if (guestName) {
      this.waitingP2Card.classList.add("connected");
      if (this.waitingP2Name) {
        this.waitingP2Name.textContent = guestName;
        this.waitingP2Name.classList.remove("empty");
      }
      if (this.waitingP2Status) {
        this.waitingP2Status.className = "player-status-tag ready";
        this.waitingP2Status.textContent = "Đã kết nối - Sẵn sàng";
      }
    } else {
      this.waitingP2Card.classList.remove("connected");
      if (this.waitingP2Name) {
        this.waitingP2Name.textContent = "Đang chờ đối thủ...";
        this.waitingP2Name.classList.add("empty");
      }
      if (this.waitingP2Status) {
        this.waitingP2Status.className = "player-status-tag waiting";
        this.waitingP2Status.textContent = "Chưa kết nối";
      }
    }
  }

  _updateHostStartButton(hasGuest) {
    if (!this.btnWaitingStartMatch || !this.waitingHostHint) return;

    if (hasGuest) {
      this.btnWaitingStartMatch.disabled = false;
      this.btnWaitingStartMatch.classList.remove("disabled");
      this.btnWaitingStartMatch.innerHTML = `<span>BẮT ĐẦU TRẬN ĐẤU</span>`;
      this.waitingHostHint.textContent = "Đối thủ đã sẵn sàng. Nhấn BẮT ĐẦU TRẬN ĐẤU để vào sân.";
    } else {
      this.btnWaitingStartMatch.disabled = true;
      this.btnWaitingStartMatch.classList.add("disabled");
      this.btnWaitingStartMatch.innerHTML = `<span>BẮT ĐẦU TRẬN ĐẤU</span>`;
      this.waitingHostHint.textContent = "Đang chờ đối thủ vào phòng. Sao chép mã phòng hoặc đường dẫn ở trên để gửi cho bạn bè.";
    }
  }

  _updateWaitingRoomState(roomData) {
    if (!this.currentRoom) return;

    const guestName = roomData.guestName || null;
    const hostName = roomData.hostName || this.currentRoom.hostName;
    if (this.currentRoom.guestName === guestName && this.currentRoom.hostName === hostName) {
      return;
    }
    this.currentRoom.guestName = guestName;
    this.currentRoom.hostName = hostName;

    if (this.waitingP1Name && hostName) {
      this.waitingP1Name.textContent = hostName;
    }

    // Render guest card
    this._renderGuestCard(guestName);

    // Update host button if host
    if (this.isHost) {
      this._updateHostStartButton(!!guestName);
    }
  }

  open() {
    if (!this.modal) return;
    const titleModal = document.getElementById("title-modal");
    if (titleModal) {
      titleModal.classList.add("hidden");
      titleModal.style.display = "none";
    }

    this.modal.classList.remove("hidden");
    this.modal.style.display = "flex";

    // Default to browse view if not already in a room
    if (!this.currentRoom) {
      this.showBrowseView();
    }

    // Subscribe to live rooms
    if (!this.unsubLobbyRooms) {
      this.unsubLobbyRooms = onlineMatchmaker.subscribeToLobbyRooms((rooms) => {
        if (this.firebaseStatusBadge) {
          this.firebaseStatusBadge.textContent = "Máy chủ trực tuyến";
          this.firebaseStatusBadge.className = "status-badge online";
        }
        this._renderRoomsList(rooms);
      });
    }
  }

  close({ startingMatch = false } = {}) {
    if (!this.modal) return;
    this.modal.classList.add("hidden");
    this.modal.style.display = "";
    if (this.unsubLobbyRooms) {
      this.unsubLobbyRooms();
      this.unsubLobbyRooms = null;
    }
    // If not starting a match and still in TITLE phase or background showcase, show title modal again
    if (!startingMatch) {
      const engine = window.__argonTennis;
      if (!engine || engine.phase === "TITLE" || engine.autoPlayMode) {
        const titleModal = document.getElementById("title-modal");
        if (titleModal) {
          titleModal.classList.remove("hidden");
          titleModal.style.display = "flex";
        }
      }
    }
  }

  showToast(message, duration = 2400) {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.classList.remove("hidden", "fading-out");
    // Trigger DOM reflow to restart transition
    void this.toastEl.offsetWidth;
    this.toastEl.classList.add("show");

    clearTimeout(this._toastTimer);
    clearTimeout(this._toastFadeTimer);

    this._toastTimer = setTimeout(() => {
      this.toastEl.classList.remove("show");
      this.toastEl.classList.add("fading-out");
      this._toastFadeTimer = setTimeout(() => {
        this.toastEl.classList.add("hidden");
        this.toastEl.classList.remove("fading-out");
      }, 500);
    }, duration);
  }

  _runCountdownAndStart(matchData) {
    if (this._isCountingDown) return;
    this._isCountingDown = true;

    // Ensure waiting room view is active and visible
    if (this.modal) this.modal.classList.remove("hidden");
    if (this.browseView) this.browseView.classList.add("hidden");
    if (this.waitingRoomView) this.waitingRoomView.classList.remove("hidden");

    // Lock interactive buttons during countdown
    if (this.btnWaitingStartMatch) {
      this.btnWaitingStartMatch.disabled = true;
      this.btnWaitingStartMatch.innerHTML = `<span>CHUẨN BỊ VÀO SÂN</span>`;
    }
    if (this.btnWaitingCancelRoom) this.btnWaitingCancelRoom.disabled = true;
    if (this.btnWaitingLeaveRoom) this.btnWaitingLeaveRoom.disabled = true;
    if (this.btnCloseLobbyX) this.btnCloseLobbyX.disabled = true;

    // Display countdown overlay
    if (this.waitingCountdownOverlay) {
      this.waitingCountdownOverlay.classList.remove("hidden");
    }

    const steps = [
      { text: "3", label: "Vào vị trí sân đấu", progress: 33, pitch: 520, isStart: false },
      { text: "2", label: "Sẵn sàng đỡ giao bóng", progress: 66, pitch: 520, isStart: false },
      { text: "1", label: "Tập trung theo dõi bóng", progress: 100, pitch: 660, isStart: false },
      { text: "BẮT ĐẦU", label: "TRẬN ĐẤU CHÍNH THỨC BẮT ĐẦU", progress: 100, pitch: 880, isStart: true }
    ];

    let currentStepIndex = 0;

    const playCountdownBeep = (freq, isFinal) => {
      try {
        const audioCtx = window.__argonTennis?.audio?.ctx || (window.AudioContext || window.webkitAudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null);
        if (!audioCtx) return;
        if (audioCtx.state === "suspended") {
          audioCtx.resume().catch(() => {});
        }
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = isFinal ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, now);
        if (isFinal) {
          osc.frequency.exponentialRampToValueAtTime(1046, now + 0.3);
        }
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(isFinal ? 0.2 : 0.14, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.45 : 0.22));
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + (isFinal ? 0.5 : 0.25));
      } catch (e) {
        // Audio blip optional fallback
      }
    };

    const renderStep = (idx) => {
      const step = steps[idx];
      if (!step) return;

      if (this.waitingCountdownNumber) {
        this.waitingCountdownNumber.classList.remove("start-pop");
        // Reflow to restart keyframe
        void this.waitingCountdownNumber.offsetWidth;
        this.waitingCountdownNumber.textContent = step.text;
        if (step.isStart) {
          this.waitingCountdownNumber.classList.add("start-pop");
        }
      }

      if (this.waitingCountdownLabel) {
        this.waitingCountdownLabel.textContent = step.label;
      }

      if (this.waitingCountdownBar) {
        this.waitingCountdownBar.style.width = `${step.progress}%`;
      }

      playCountdownBeep(step.pitch, step.isStart);
    };

    renderStep(0);

    const countdownInterval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        renderStep(currentStepIndex);
      } else {
        clearInterval(countdownInterval);
        setTimeout(() => {
          if (this.waitingCountdownOverlay) {
            this.waitingCountdownOverlay.classList.add("hidden");
          }
          this._isCountingDown = false;
          if (this.btnWaitingCancelRoom) this.btnWaitingCancelRoom.disabled = false;
          if (this.btnWaitingLeaveRoom) this.btnWaitingLeaveRoom.disabled = false;
          if (this.btnCloseLobbyX) this.btnCloseLobbyX.disabled = false;

          this.close({ startingMatch: true });

          if (this.callbacks.onStartOnlineMatch) {
            this.callbacks.onStartOnlineMatch(matchData);
          }
        }, 600);
      }
    }, 1000);
  }

  _renderRoomsList(rooms) {
    if (!this.roomsListContainer) return;

    const sig = JSON.stringify((rooms || []).map(r => `${r.roomId}:${r.hostName}:${r.gamesToWin}`));
    if (sig === this._lastRenderedRoomsSig) return;
    this._lastRenderedRoomsSig = sig;

    if (!rooms || rooms.length === 0) {
      this.roomsListContainer.innerHTML = "";
      if (this.roomsEmptyHint) this.roomsEmptyHint.classList.remove("hidden");
      return;
    }

    if (this.roomsEmptyHint) this.roomsEmptyHint.classList.add("hidden");
    this.roomsListContainer.innerHTML = rooms.map((r) => {
      const isMine = this.currentRoom && r.roomId === this.currentRoom.roomId;
      const gamesLabel = r.gamesToWin === 1 ? "1 Game" : `Best of ${r.gamesToWin * 2 - 1}`;
      return `
        <div class="lobby-room-item ${isMine ? 'my-room' : ''}">
          <div class="room-item-info">
            <span class="room-item-code">${r.roomId}</span>
            <span class="room-item-host">Chủ phòng: <strong>${r.hostName || 'Player 1'}</strong></span>
            <span class="room-item-games">${gamesLabel}</span>
          </div>
          <div class="room-item-actions">
            ${
              isMine
                ? `<span class="room-badge-own">Phòng của bạn</span>`
                : `<button type="button" class="btn-room-join" data-room-id="${r.roomId}">Tham gia</button>`
            }
          </div>
        </div>
      `;
    }).join("");

    // Bind join buttons
    this.roomsListContainer.querySelectorAll(".btn-room-join").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const roomId = btn.dataset.roomId;
        if (roomId) {
          await this._handleJoinRoom(roomId);
        }
      });
    });
  }

  async _handleHostRoom() {
    const hostName = (this.profileNameInput?.value || "Player 1").trim();
    const gamesToWin = parseInt(this.hostGamesSelect?.value || "1", 10);
    const customCode = this._extractRoomCode(this.hostCustomCodeInput?.value || "");

    if (this.btnHostCreate) this.btnHostCreate.disabled = true;

    try {
      this.showToast("Đang tạo phòng trên Firebase...");
      const res = await onlineMatchmaker.createRoom({
        customCode,
        hostName,
        gamesToWin
      });

      const isHostRole = res.isHost !== false;

      // Switch to dedicated waiting room view immediately!
      this.showWaitingRoomView({
        roomId: res.roomId,
        isHost: isHostRole,
        hostName: res.hostName || hostName,
        guestName: res.guestName || null,
        gamesToWin: res.gamesToWin || gamesToWin
      });

      if (isHostRole) {
        this.showToast(`Đã tạo phòng ${res.roomId}! Hãy sao chép mã hoặc link để mời bạn bè.`);
      } else {
        this.showToast(`Đã vào phòng ${res.roomId}! Đang đợi chủ phòng bấm Bắt đầu.`);
      }

    } catch (err) {
      this.showToast(`Lỗi tạo phòng: ${err.message || "Thử lại sau"}`);
      if (this.btnHostCreate) this.btnHostCreate.disabled = false;
    }
  }

  async _handleJoinRoom(rawRoomId, explicitGuestName = "") {
    const roomId = this._extractRoomCode(rawRoomId);
    const guestName = (explicitGuestName || this.profileNameInput?.value || "Player 2").trim();

    if (!roomId) {
      this.showToast("Mã phòng không hợp lệ!");
      return;
    }

    try {
      this.showToast(`Đang kết nối vào phòng ${roomId}...`);
      const res = await onlineMatchmaker.joinRoom(roomId, guestName);

      // Switch to dedicated waiting room view immediately!
      this.showWaitingRoomView({
        roomId: res.roomId,
        isHost: false,
        hostName: res.hostName || "Player 1",
        guestName: res.guestName || guestName,
        gamesToWin: res.gamesToWin || 1
      });

      this.showToast(`Đã vào phòng ${roomId}! Đang đợi chủ phòng bấm Bắt đầu.`);

    } catch (err) {
      this.showToast(err.message || "Không thể vào phòng. Kiểm tra lại mã phòng!");
    }
  }
}
