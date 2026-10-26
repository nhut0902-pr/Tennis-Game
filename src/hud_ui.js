import * as d3 from "d3";
import { renderAllHudMiiAvatars as renderMiiAvatars, renderMiiAvatar as renderSingleMii } from "./mii_avatars.js";
import { triggerPhysicalHardwareVibration } from "./motion_controls.js";

export class HudUI {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.bannerTimer = null;
    this.timingPopupTimer = null;
    this.skillHistory = [980, 1005, 1030, 1065, 1120];
    this.selectedGamesToWin = 2;
    this.selectedInputMode = "mouse";
    this.selectedDifficulty = "casual";
    this.currentRoomId = "default";
    this.currentTunnelUrl = "https://argon-tennis-sandbox-170440.uc.r.appspot.com";

    // Modals
    this.elTitleModal = document.getElementById("title-modal");
    this.elCompanionModal = document.getElementById("companion-modal");
    this.elVictoryModal = document.getElementById("victory-modal");
    this.elControlsModal = document.getElementById("controls-modal");

    // Scoreboard Elements
    this.elScoreCenter = document.getElementById("score-center-display");
    this.elScorePlayer = document.getElementById("score-player-text");
    this.elScoreSep = document.getElementById("score-separator");
    this.elScoreOpponent = document.getElementById("score-opponent-text");
    this.elGamesPlayer = document.getElementById("games-pill-player");
    this.elGamesOpponent = document.getElementById("games-pill-opponent");

    // World Projected Elements
    this.elServerTag = document.getElementById("server-tag");
    this.elPlayerNameplate = document.getElementById("player-nameplate");
    this.elTimingPopup = document.getElementById("timing-popup");
    this.elTimingGrade = document.getElementById("timing-popup-grade");
    this.elTimingDetail = document.getElementById("timing-popup-detail");

    // Center Banner & Replay
    this.elBannerLayer = document.getElementById("center-banner-layer");
    this.elBannerText = document.getElementById("center-banner-text");
    this.elBannerSub = document.getElementById("center-banner-sub");
    this.elReplayBadge = document.getElementById("replay-badge");

    // Gauges & Indicators
    this.elTimingCursor = document.getElementById("timing-cursor");
    this.elGaugeModeTitle = document.getElementById("gauge-mode-title");
    this.elGaugeSpeedReadout = document.getElementById("gauge-speed-readout");
    this.elAudioDot = document.getElementById("audio-status-dot");
    this.elAudioLabel = document.getElementById("audio-track-label");
    this.elCameraLabel = document.getElementById("camera-mode-label");
    this.elWebcamPip = document.getElementById("webcam-pip-card");
    this.elWebcamDot = document.getElementById("webcam-status-dot");
    this.elPhoneDot = document.getElementById("phone-status-dot");
    this.elPhoneLabel = document.getElementById("phone-status-label");
    this.elTouchDot = document.getElementById("touch-status-dot");
    this.elGyroDot = document.getElementById("gyro-status-dot");

    // Opponent presence
    this.elOpponentPresencePill = document.getElementById("opponent-presence-pill");
    this.elOpponentPresenceText = document.getElementById("opponent-presence-text");
    this._lastRoomStatus = {};
    this._lastOtherReady = false;
    this._justJoinedTimer = null;

    this._renderAllMiiPortraits();
    this._bindEvents();
    this._initUrlParamsState();
  }

  _renderAllMiiPortraits() {
    renderMiiAvatars();
    const lobbyAvatar = document.getElementById("lobby-mii-avatar");
    if (lobbyAvatar) {
      renderSingleMii(lobbyAvatar, "player1");
    }
  }

  _drawMiiFace(canvas, opts = {}) {
    renderSingleMii(canvas, opts.characterId || canvas?.id || "player1", opts);
  }

  _initUrlParamsState() {
    const params = new URLSearchParams(window.location.search);
    const room = (params.get("room") || "").trim().toUpperCase();
    const role = (params.get("role") || "p1").trim().toLowerCase() === "p2" ? "p2" : "p1";
    const mode = (params.get("mode") || params.get("difficulty") || "").toLowerCase();

    this.playerRole = role;
    if (room && room !== "DEFAULT") {
      this.currentRoomId = room;
      this._setMainMode("online");
      this._setDifficultySelection("1v1", { notify: false });
    } else if (mode === "1v1") {
      this._setMainMode("online");
      this._setDifficultySelection("1v1", { notify: false });
    } else if (["casual", "pro"].includes(mode)) {
      this._setMainMode("bot");
      this._setDifficultySelection(mode, { notify: false });
    } else {
      this._setMainMode("bot");
    }

    if (role === "p2") {
      const youTag = document.querySelector(".you-tag");
      if (youTag) youTag.textContent = "Player 1";
      const oppLabel = document.getElementById("setup-opponent-label");
      if (oppLabel) oppLabel.textContent = "You";
    }

    this.updateMultiplayerRoomInfo({
      roomId: this.currentRoomId,
      tunnelUrl: this.currentTunnelUrl,
      role: this.playerRole
    });
  }

  _setMainMode(mode = "bot") {
    const isBot = mode !== "online";
    const tabBot = document.getElementById("tab-mode-bot");
    const tabOnline = document.getElementById("tab-mode-online");
    const botOptions = document.getElementById("bot-mode-options");
    const onlineOptions = document.getElementById("online-mode-options");

    if (tabBot) tabBot.classList.toggle("selected", isBot);
    if (tabOnline) tabOnline.classList.toggle("selected", !isBot);
    if (botOptions) botOptions.classList.toggle("hidden", !isBot);
    if (onlineOptions) onlineOptions.classList.toggle("hidden", isBot);

    if (isBot) {
      if (this.selectedDifficulty === "1v1") {
        this._setDifficultySelection("casual", { notify: true });
      }
    } else {
      this._setDifficultySelection("1v1", { notify: true });
    }
  }

  _setDifficultySelection(diff, { notify = true } = {}) {
    const target = ["casual", "pro", "1v1"].includes(diff) ? diff : "casual";
    this.selectedDifficulty = target;
    document.querySelectorAll("#difficulty-mode-group .wii-green-choice").forEach(b => {
      b.classList.toggle("selected", b.dataset.difficulty === target);
    });

    const matchLenSection = document.getElementById("match-length-section");
    if (target === "1v1") {
      if (matchLenSection) matchLenSection.classList.add("hidden");
      this.selectedGamesToWin = 1;
      this.configureGameBubbles(1);
      if (notify && this.callbacks.onSelectMatchLength) this.callbacks.onSelectMatchLength(1);
    } else {
      if (matchLenSection) matchLenSection.classList.remove("hidden");
      const selMatch = document.querySelector("#match-length-group .wii-green-choice.selected");
      const g = parseInt(selMatch?.dataset?.games || "3", 10);
      this.selectedGamesToWin = Math.ceil(g / 2);
      this.configureGameBubbles(this.selectedGamesToWin);
      if (notify && this.callbacks.onSelectMatchLength) this.callbacks.onSelectMatchLength(this.selectedGamesToWin);
    }

    const oppLabel = document.getElementById("setup-opponent-label");
    if (oppLabel && this.playerRole !== "p2") {
      if (target === "1v1") oppLabel.textContent = "Player 2";
      else if (target === "pro") oppLabel.textContent = "Matt";
      else oppLabel.textContent = "Club AI";
    }

    this.updateOpponentPresence(this._lastRoomStatus || {});
    if (notify && this.callbacks.onSelectDifficulty) {
      this.callbacks.onSelectDifficulty(target);
    }
  }

  _bindEvents() {
    // Mode switcher buttons (Bot vs Online)
    const tabBot = document.getElementById("tab-mode-bot");
    if (tabBot) {
      tabBot.addEventListener("click", () => this._setMainMode("bot"));
    }
    const tabOnline = document.getElementById("tab-mode-online");
    if (tabOnline) {
      tabOnline.addEventListener("click", () => this._setMainMode("online"));
    }

    // Difficulty mode buttons
    document.querySelectorAll("#difficulty-mode-group .wii-green-choice").forEach(btn => {
      btn.addEventListener("click", () => {
        const d = btn.dataset.difficulty || "casual";
        this._setDifficultySelection(d, { notify: true });
      });
    });

    // Match length buttons
    const lenButtons = document.querySelectorAll("#match-length-group .wii-green-choice");
    lenButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        lenButtons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        const g = parseInt(btn.dataset.games || "3", 10);
        this.selectedGamesToWin = Math.ceil(g / 2);
        this.configureGameBubbles(this.selectedGamesToWin);
        if (this.callbacks.onSelectMatchLength) {
          this.callbacks.onSelectMatchLength(this.selectedGamesToWin);
        }
      });
    });

    // Start match button
    const btnStart = document.getElementById("btn-start-match");
    if (btnStart) {
      btnStart.addEventListener("click", () => {
        this.hideTitleModal();
        if (this.callbacks.onStartMatch) {
          this.callbacks.onStartMatch({
            gamesToWin: this.selectedGamesToWin,
            inputMode: this.selectedInputMode,
            difficulty: this.selectedDifficulty
          });
        }
      });
    }

    // Audio toggle
    const btnAudio = document.getElementById("btn-audio-toggle");
    if (btnAudio) {
      btnAudio.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.callbacks.onToggleAudio) this.callbacks.onToggleAudio();
      });
    }

    // Camera cycle
    const btnCam = document.getElementById("btn-camera-cycle");
    if (btnCam) {
      btnCam.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.callbacks.onCycleCamera) this.callbacks.onCycleCamera();
      });
    }

    // Replay toggle
    const btnReplay = document.getElementById("btn-replay-trigger");
    if (btnReplay) {
      btnReplay.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.callbacks.onToggleReplay) this.callbacks.onToggleReplay();
      });
    }

    // Webcam toggle
    const btnWebcam = document.getElementById("btn-webcam-toggle");
    if (btnWebcam) {
      btnWebcam.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.callbacks.onToggleWebcam) this.callbacks.onToggleWebcam();
      });
    }

    // Controls Guide Modal buttons
    const btnControls = document.getElementById("btn-controls-guide");
    if (btnControls) {
      btnControls.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openControlsModal();
      });
    }

    const btnTitleControls = document.getElementById("btn-title-controls");
    if (btnTitleControls) {
      btnTitleControls.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openControlsModal();
      });
    }

    const btnCloseControls = document.getElementById("btn-close-controls");
    if (btnCloseControls) {
      btnCloseControls.addEventListener("click", () => this.closeControlsModal());
    }

    const btnCloseControlsX = document.getElementById("btn-close-controls-x");
    if (btnCloseControlsX) {
      btnCloseControlsX.addEventListener("click", () => this.closeControlsModal());
    }

    // Controls Tab Switching
    const tabBtns = document.querySelectorAll(".controls-tab-btn");
    tabBtns.forEach(tb => {
      tb.addEventListener("click", () => {
        const targetTab = tb.dataset.tab;
        tabBtns.forEach(b => b.classList.remove("active"));
        tb.classList.add("active");

        document.querySelectorAll(".controls-tab-pane").forEach(pane => {
          pane.classList.remove("active");
        });
        const activePane = document.getElementById(`tab-pane-${targetTab}`);
        if (activePane) activePane.classList.add("active");
      });
    });

    // Touch Gamepad Toggle button on HUD
    const btnTouchToggle = document.getElementById("btn-touch-toggle");
    if (btnTouchToggle) {
      btnTouchToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.callbacks.onToggleTouchControls) this.callbacks.onToggleTouchControls();
      });
    }

    // Gyroscope / Motion Toggle button on HUD
    const btnGyroToggle = document.getElementById("btn-gyro-toggle");
    if (btnGyroToggle) {
      btnGyroToggle.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (this.callbacks.onToggleDeviceMotion) await this.callbacks.onToggleDeviceMotion();
      });
    }

    // Settings Modal Checkboxes
    const setTouchGamepad = document.getElementById("setting-touch-gamepad");
    if (setTouchGamepad) {
      setTouchGamepad.addEventListener("change", () => {
        if (this.callbacks.onUpdateSettings) {
          this.callbacks.onUpdateSettings({ touchGamepadEnabled: setTouchGamepad.checked });
        }
      });
    }

    const setGyroMotion = document.getElementById("setting-gyro-motion");
    if (setGyroMotion) {
      setGyroMotion.addEventListener("change", async () => {
        if (this.callbacks.onUpdateSettings) {
          this.callbacks.onUpdateSettings({ deviceMotionEnabled: setGyroMotion.checked });
        }
      });
    }

    const setHaptics = document.getElementById("setting-haptics");
    if (setHaptics) {
      setHaptics.addEventListener("change", () => {
        if (this.callbacks.onUpdateSettings) {
          this.callbacks.onUpdateSettings({ hapticsEnabled: setHaptics.checked });
        }
      });
    }

    const setManualMovement = document.getElementById("setting-manual-movement");
    if (setManualMovement) {
      setManualMovement.addEventListener("change", () => {
        if (this.callbacks.onUpdateSettings) {
          this.callbacks.onUpdateSettings({ manualMovement: setManualMovement.checked });
        }
      });
    }

    const setMoveSpeed = document.getElementById("setting-move-speed");
    const speedValBadge = document.getElementById("setting-speed-val");
    if (setMoveSpeed) {
      const updateSpeedBadge = (val) => {
        if (!speedValBadge) return;
        const num = parseFloat(val);
        if (num <= 0.7) speedValBadge.textContent = `Chậm (${num.toFixed(1)}x)`;
        else if (num >= 1.2) speedValBadge.textContent = `Nhanh (${num.toFixed(1)}x)`;
        else speedValBadge.textContent = `Chuẩn (${num.toFixed(1)}x)`;
      };
      setMoveSpeed.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        updateSpeedBadge(val);
        if (this.callbacks.onUpdateSettings) {
          this.callbacks.onUpdateSettings({ moveSpeedRatio: val });
        }
      });
    }

    // Companion modal
    const btnCloseCompanion = document.getElementById("btn-close-companion");
    if (btnCloseCompanion) {
      btnCloseCompanion.addEventListener("click", () => {
        if (this.elCompanionModal) this.elCompanionModal.classList.add("hidden");
      });
    }

    // Victory modal
    const btnPlayAgain = document.getElementById("btn-play-again");
    if (btnPlayAgain) {
      btnPlayAgain.addEventListener("click", () => {
        this.hideVictoryModal();
        if (this.callbacks.onPlayAgain) this.callbacks.onPlayAgain();
      });
    }

    const btnReturnTitle = document.getElementById("btn-return-title");
    if (btnReturnTitle) {
      btnReturnTitle.addEventListener("click", () => {
        this.hideVictoryModal();
        this.showTitleModal();
      });
    }

    const btnVictoryShop = document.getElementById("btn-victory-open-shop");
    if (btnVictoryShop) {
      btnVictoryShop.addEventListener("click", () => {
        this.hideVictoryModal();
        window.__argonTennis?.characterShopUI?.openShop?.("upgrades");
      });
    }

    document.querySelectorAll("[data-victory-pose]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pose = btn.getAttribute("data-victory-pose") || "jump";
        document.querySelectorAll("[data-victory-pose]").forEach((b) => {
          b.classList.toggle("active", b === btn);
        });
        window.__argonTennis?.characterShopUI?.setVictoryPose?.(pose);
      });
    });
  }

  openControlsModal(defaultTab = null) {
    if (!this.elControlsModal) return;
    const isMobile = typeof window !== "undefined" && (window.innerWidth <= 1024 || "ontouchstart" in window);
    const targetTab = defaultTab || (isMobile ? "mobile" : "pc");

    // Activate tab
    document.querySelectorAll(".controls-tab-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.tab === targetTab);
    });
    document.querySelectorAll(".controls-tab-pane").forEach(p => {
      p.classList.toggle("active", p.id === `tab-pane-${targetTab}`);
    });

    // Sync settings form inputs
    try {
      const saved = JSON.parse(localStorage.getItem("argon_tennis_controls_settings") || "{}");
      const cbTouch = document.getElementById("setting-touch-gamepad");
      const cbGyro = document.getElementById("setting-gyro-motion");
      const cbHaptics = document.getElementById("setting-haptics");
      const cbManual = document.getElementById("setting-manual-movement");
      const speedInput = document.getElementById("setting-move-speed");
      const speedBadge = document.getElementById("setting-speed-val");

      if (cbTouch && typeof saved.touchGamepadEnabled === "boolean") cbTouch.checked = saved.touchGamepadEnabled;
      if (cbGyro && typeof saved.deviceMotionEnabled === "boolean") cbGyro.checked = saved.deviceMotionEnabled;
      if (cbHaptics && typeof saved.hapticsEnabled === "boolean") cbHaptics.checked = saved.hapticsEnabled;
      if (cbManual && typeof saved.manualMovement === "boolean") cbManual.checked = saved.manualMovement;
      if (speedInput) {
        const val = typeof saved.moveSpeedRatio === "number" ? saved.moveSpeedRatio : (typeof saved.moveSensitivity === "number" ? saved.moveSensitivity : 1.0);
        speedInput.value = String(val);
        if (speedBadge) {
          if (val <= 0.7) speedBadge.textContent = `Chậm (${val.toFixed(1)}x)`;
          else if (val >= 1.2) speedBadge.textContent = `Nhanh (${val.toFixed(1)}x)`;
          else speedBadge.textContent = `Chuẩn (${val.toFixed(1)}x)`;
        }
      }
    } catch {}

    this.elControlsModal.classList.remove("hidden");
  }

  closeControlsModal() {
    if (this.elControlsModal) {
      this.elControlsModal.classList.add("hidden");
    }
  }

  setTouchToggleActive(active) {
    if (this.elTouchDot) this.elTouchDot.classList.toggle("active", !!active);
    const btn = document.getElementById("btn-touch-toggle");
    if (btn) btn.classList.toggle("active", !!active);
    const cb = document.getElementById("setting-touch-gamepad");
    if (cb) cb.checked = !!active;
  }

  setGyroToggleActive(active) {
    if (this.elGyroDot) this.elGyroDot.classList.toggle("active", !!active);
    const btn = document.getElementById("btn-gyro-toggle");
    if (btn) btn.classList.toggle("active", !!active);
    const cb = document.getElementById("setting-gyro-motion");
    if (cb) cb.checked = !!active;
  }

  hideTitleModal() {
    document.documentElement.classList.add("autoplay-mode");
    if (this.elTitleModal) {
      this.elTitleModal.classList.add("hidden");
      this.elTitleModal.style.display = "none";
    }
  }

  showTitleModal() {
    document.documentElement.classList.remove("autoplay-mode");
    if (this.elTitleModal) {
      this.elTitleModal.classList.remove("hidden");
      this.elTitleModal.style.display = "flex";
    }
  }

  hideVictoryModal() {
    if (this.elVictoryModal) this.elVictoryModal.classList.add("hidden");
    window.__argonTennis?.characterShopUI?.stopVictoryModal3D?.();
  }

  showVersusIntro({
    p1Name = "Player 1",
    p2Name = "Player 2",
    p1Loadout = null,
    p2Loadout = null,
    isOnline = false,
    gamesToWin = 1,
    difficulty = "casual",
    onComplete = null
  } = {}) {
    const overlay = document.getElementById("match-versus-overlay");
    if (!overlay) {
      if (typeof onComplete === "function") onComplete();
      return;
    }

    if (this._vsIntroTimers) {
      this._vsIntroTimers.forEach(clearTimeout);
      this._vsIntroTimers = [];
    } else {
      this._vsIntroTimers = [];
    }

    overlay.classList.remove("hidden", "versus-fade-out");
    overlay.setAttribute("aria-hidden", "false");

    // Draw Mii Portraits for VS cards
    const cvs1 = document.getElementById("vs-mii-canvas-p1");
    if (cvs1) renderSingleMii(cvs1, "player1");
    const cvs2 = document.getElementById("vs-mii-canvas-p2");
    if (cvs2) renderSingleMii(cvs2, isOnline ? "opponent1" : "opponent1");

    // Player 1 Meta
    const p1NameEl = document.getElementById("vs-p1-name");
    const p1TitleEl = document.getElementById("vs-p1-title");
    const p1BannerEl = document.getElementById("vs-p1-banner");
    if (p1NameEl) p1NameEl.textContent = p1Name || "BẠN";
    if (p1TitleEl) p1TitleEl.textContent = isOnline ? "Đấu Thủ Host (P1)" : "Vận Động Viên Chủ Nhà";
    if (p1BannerEl) p1BannerEl.textContent = isOnline ? "HOST P1" : "BẠN";

    // Player 2 Meta
    const p2NameEl = document.getElementById("vs-p2-name");
    const p2TitleEl = document.getElementById("vs-p2-title");
    const p2BannerEl = document.getElementById("vs-p2-banner");
    if (p2NameEl) p2NameEl.textContent = p2Name || (isOnline ? "CHALLENGER" : "BOT AI");
    if (p2TitleEl) p2TitleEl.textContent = isOnline ? "Đấu Thủ Khách (P2)" : `Cấp Độ: ${String(difficulty || "casual").toUpperCase()}`;
    if (p2BannerEl) p2BannerEl.textContent = isOnline ? "CHALLENGER P2" : "BOT AI";

    // Match condition text
    const condEl = document.getElementById("vs-condition-text");
    if (condEl) {
      const mapName = window.__argonTennis?.courtMapManager?.getSelectedMap?.()?.name || "GRAND SLAM HARD COURT";
      condEl.textContent = `SET: ${gamesToWin || 1} GAME · ${mapName.toUpperCase()}`;
    }

    const countText = document.getElementById("vs-countdown-text");
    const countdownSteps = [
      { text: "READY", delay: 0, vib: "countdown_tick", sfx: null },
      { text: "3", delay: 550, vib: "countdown_tick", sfx: "toss" },
      { text: "2", delay: 1050, vib: "countdown_tick", sfx: "toss" },
      { text: "1", delay: 1550, vib: "countdown_tick", sfx: "toss" },
      { text: "SERVE!", delay: 2000, vib: "serve_go", sfx: "start" }
    ];

    let finished = false;
    const finishIntro = () => {
      if (finished) return;
      finished = true;
      if (this._vsIntroTimers) {
        this._vsIntroTimers.forEach(clearTimeout);
        this._vsIntroTimers = [];
      }
      if (this._vsSkipCleanup) {
        this._vsSkipCleanup();
        this._vsSkipCleanup = null;
      }
      overlay.classList.add("versus-fade-out");
      setTimeout(() => {
        overlay.classList.add("hidden");
        overlay.classList.remove("versus-fade-out");
        overlay.setAttribute("aria-hidden", "true");
        if (typeof onComplete === "function") onComplete();
      }, 340);
    };

    countdownSteps.forEach((step) => {
      const tid = setTimeout(() => {
        if (finished) return;
        if (countText) {
          countText.textContent = step.text;
          countText.style.animation = "none";
          void countText.offsetWidth;
          countText.style.animation = "vsCountPulse 0.35s ease-out";
        }
        if (step.vib) {
          triggerPhysicalHardwareVibration(step.vib, { intensity: 1 });
        }
        if (step.sfx && window.__argonTennis?.audioEngine) {
          if (step.sfx === "start") {
            window.__argonTennis.audioEngine.playVoiceCallout?.("start");
          } else {
            window.__argonTennis.audioEngine.playServeToss?.();
          }
        }
      }, step.delay);
      this._vsIntroTimers.push(tid);
    });

    // Auto finish after countdown completes
    const endTid = setTimeout(finishIntro, 2450);
    this._vsIntroTimers.push(endTid);

    // Skip on tap/click or keydown
    const onSkip = (e) => {
      if (e && e.target && e.target.tagName === "INPUT") return;
      finishIntro();
    };
    overlay.addEventListener("click", onSkip, { once: true });
    const onKeySkip = (e) => {
      if (e.code === "Space" || e.code === "Enter" || e.code === "Escape") {
        onSkip();
      }
    };
    window.addEventListener("keydown", onKeySkip, { once: true });
    this._vsSkipCleanup = () => {
      overlay.removeEventListener("click", onSkip);
      window.removeEventListener("keydown", onKeySkip);
    };
  }

  hideVersusIntro() {
    if (this._vsIntroTimers) {
      this._vsIntroTimers.forEach(clearTimeout);
      this._vsIntroTimers = [];
    }
    if (this._vsSkipCleanup) {
      this._vsSkipCleanup();
      this._vsSkipCleanup = null;
    }
    const overlay = document.getElementById("match-versus-overlay");
    if (overlay) {
      overlay.classList.add("hidden");
      overlay.setAttribute("aria-hidden", "true");
    }
  }

  showVictoryModal({
    playerWon,
    playerGames,
    opponentGames,
    coinsEarned = 0,
    isOnline = false,
    winnerName = null,
    winnerRole = null
  }) {
    if (!this.elVictoryModal) return;
    const banner = document.getElementById("victory-result-banner");
    const scoreText = document.getElementById("victory-match-score");
    const skillValue = document.getElementById("skill-rating-value");
    const coinText = document.getElementById("victory-coin-reward-text");
    const winnerTagEl = document.getElementById("victory-winner-tag");
    const winnerNameEl = document.getElementById("victory-winner-3d-name");
    const skillPlayerNameEl = document.getElementById("victory-skill-player-name");

    if (banner) {
      banner.textContent = playerWon ? "CHIẾN THẮNG!" : isOnline ? "THẤT BẠI!" : "HOÀN THÀNH TRẬN ĐẤU!";
      banner.style.color = playerWon ? "#ffea28" : isOnline ? "#f43f5e" : "#9ad4ff";
    }
    if (winnerTagEl) {
      winnerTagEl.textContent = playerWon ? "BẠN LÀ NHÀ VÔ ĐỊCH SÂN ĐẤU" : isOnline ? "ĐỐI THỦ GIÀNH CHIẾN THẮNG" : "KẾT QUẢ CHUNG CUỘC";
    }
    if (scoreText) {
      scoreText.textContent = isOnline
        ? `Tỷ Số Set: Bạn ${playerGames} - Đối thủ ${opponentGames}`
        : `Tỷ Số Set: ${playerGames} - ${opponentGames}`;
    }
    if (coinText) {
      const rewardAmt = coinsEarned > 0 ? coinsEarned : playerWon ? (isOnline ? 1400 : 950) : (isOnline ? 380 : 280);
      coinText.textContent = `+${rewardAmt.toLocaleString("vi-VN")} XU THƯỞNG${isOnline ? " ONLINE" : ""}`;
    }

    const shop = window.__argonTennis?.characterShop;
    const pChar = shop?.getSelectedCharacter("player") || { name: "Ammaar" };
    const bChar = shop?.getSelectedCharacter("partner") || { name: "Maya" };

    if (winnerNameEl) {
      if (playerWon) {
        winnerNameEl.textContent = `${pChar.name} & Bot ${bChar.name} · VÔ ĐỊCH!`;
      } else {
        if (winnerName) {
          winnerNameEl.textContent = `${winnerName} · VÔ ĐỊCH!`;
        } else {
          winnerNameEl.textContent = isOnline ? "Đối Thủ · VÔ ĐỊCH!" : `Đối Thủ & Bot Maya`;
        }
      }
    }
    if (skillPlayerNameEl) {
      skillPlayerNameEl.textContent = pChar.name;
    }

    const finalRating = playerWon ? 1165 : 1030;
    if (skillValue) skillValue.textContent = String(finalRating);

    document.querySelectorAll("[data-victory-pose]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-victory-pose") === "jump");
    });

    this._drawSkillGraph(playerWon);
    this.elVictoryModal.classList.remove("hidden");

    // Real hardware vibration for victory/defeat
    triggerPhysicalHardwareVibration(playerWon ? "match_won" : "point_lost", { intensity: playerWon ? 1.5 : 0.8 });

    setTimeout(() => {
      window.__argonTennis?.characterShopUI?.startVictoryModal3D?.({
        playerWon,
        playerGames,
        opponentGames,
        coinsEarned,
        isOnline
      });
    }, 30);
  }

  _drawSkillGraph(won) {
    let container = document.getElementById("skill-graph-canvas");
    if (!container) return;

    // Ensure #skill-graph-canvas can host D3 SVG elements cleanly even if originally a <canvas>
    if (container.tagName === "CANVAS") {
      const replacement = document.createElement("div");
      replacement.id = "skill-graph-canvas";
      replacement.className = container.className || "skill-radar-container";
      container.replaceWith(replacement);
      container = replacement;
    }

    const shop = window.__argonTennis?.characterShop;
    const mods = shop?.getEffectivePlayerModifiers?.() || {};

    // Normalize player's effective performance stats to a 0-100 radar scale
    const normStat = (pts, fallback) => {
      const raw = Number(pts) || fallback;
      return Math.max(38, Math.min(100, Math.round(35 + raw * 1.65 + (won ? 8 : 0))));
    };

    const playerStats = {
      Speed: normStat(mods.speedPoints, won ? 84 : 72),
      Power: normStat(mods.powerPoints, won ? 88 : 74),
      Spin: normStat(mods.spinPoints, won ? 82 : 70),
      Reflex: normStat(mods.reflexPoints, won ? 86 : 73)
    };

    const matchAverageStats = {
      Speed: 66,
      Power: 64,
      Spin: 62,
      Reflex: 65
    };

    const axes = [
      { key: "Speed", label: "Speed" },
      { key: "Power", label: "Power" },
      { key: "Spin", label: "Spin" },
      { key: "Reflex", label: "Reflex" }
    ];

    const width = 280;
    const height = 176;
    const centerX = width / 2;
    const centerY = height / 2 + 6;
    const radius = 54;

    const root = d3.select(container);
    root.selectAll("*").remove();

    const svg = root
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", height)
      .style("display", "block")
      .style("overflow", "visible");

    // Background card rect
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("rx", 10)
      .attr("fill", "#0f172a");

    // Header & Legend row
    const legend = svg.append("g").attr("transform", "translate(10, 14)");
    legend
      .append("circle")
      .attr("cx", 5)
      .attr("cy", -3)
      .attr("r", 4)
      .attr("fill", "#38bdf8");
    legend
      .append("text")
      .attr("x", 13)
      .attr("y", 0)
      .attr("fill", "#e2e8f0")
      .attr("font-size", "9.5px")
      .attr("font-weight", "800")
      .text("Player Stats");

    legend
      .append("circle")
      .attr("cx", 92)
      .attr("cy", -3)
      .attr("r", 4)
      .attr("fill", "#facc15");
    legend
      .append("text")
      .attr("x", 100)
      .attr("y", 0)
      .attr("fill", "#cbd5e1")
      .attr("font-size", "9.5px")
      .attr("font-weight", "700")
      .text("Match Avg");

    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);
    const angleSlice = (Math.PI * 2) / axes.length;

    const radarGroup = svg
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // Concentric radar grid polygons
    const levels = [25, 50, 75, 100];
    levels.forEach((lvl) => {
      const r = rScale(lvl);
      const pts = axes
        .map((_, i) => {
          const angle = i * angleSlice - Math.PI / 2;
          return `${(Math.cos(angle) * r).toFixed(1)},${(Math.sin(angle) * r).toFixed(1)}`;
        })
        .join(" ");

      radarGroup
        .append("polygon")
        .attr("points", pts)
        .attr("fill", lvl === 100 ? "rgba(30, 41, 59, 0.45)" : "none")
        .attr("stroke", "rgba(148, 163, 184, 0.25)")
        .attr("stroke-width", 1);
    });

    // Axis spokes and outer labels
    axes.forEach((axis, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x2 = Math.cos(angle) * radius;
      const y2 = Math.sin(angle) * radius;

      radarGroup
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "rgba(148, 163, 184, 0.35)")
        .attr("stroke-width", 1);

      const labelR = radius + 19;
      const lx = Math.cos(angle) * labelR;
      const ly = Math.sin(angle) * labelR;

      radarGroup
        .append("text")
        .attr("x", lx)
        .attr("y", ly + 3)
        .attr("text-anchor", Math.abs(lx) < 5 ? "middle" : lx > 0 ? "start" : "end")
        .attr("fill", "#f8fafc")
        .attr("font-size", "10px")
        .attr("font-weight", "800")
        .text(`${axis.label} (${playerStats[axis.key]})`);
    });

    const radarLine = d3
      .lineRadial()
      .radius((d) => rScale(d.value))
      .angle((_, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    const avgDataset = axes.map((a) => ({ axis: a.key, value: matchAverageStats[a.key] }));
    const playerDataset = axes.map((a) => ({ axis: a.key, value: playerStats[a.key] }));

    // Match Average polygon
    radarGroup
      .append("path")
      .datum(avgDataset)
      .attr("d", radarLine)
      .attr("fill", "rgba(250, 204, 21, 0.16)")
      .attr("stroke", "#facc15")
      .attr("stroke-width", 1.75)
      .attr("stroke-dasharray", "3,3");

    // Player Performance polygon
    radarGroup
      .append("path")
      .datum(playerDataset)
      .attr("d", radarLine)
      .attr("fill", "rgba(56, 189, 248, 0.34)")
      .attr("stroke", "#38bdf8")
      .attr("stroke-width", 2.4);

    // Player data vertices
    radarGroup
      .selectAll(".radar-vertex-player")
      .data(playerDataset)
      .enter()
      .append("circle")
      .attr("class", "radar-vertex-player")
      .attr("cx", (d, i) => Math.cos(i * angleSlice - Math.PI / 2) * rScale(d.value))
      .attr("cy", (d, i) => Math.sin(i * angleSlice - Math.PI / 2) * rScale(d.value))
      .attr("r", 3.6)
      .attr("fill", "#38bdf8")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.4);
  }

  configureGameBubbles(targetWins = 2) {
    [this.elGamesPlayer, this.elGamesOpponent].forEach(pill => {
      if (!pill) return;
      pill.querySelectorAll(".game-bubble").forEach((b, idx) => {
        if (idx < Math.max(1, targetWins)) b.classList.remove("hidden");
        else b.classList.add("hidden");
      });
    });
  }

  updateScoreboard({
    playerScoreText = "00",
    opponentScoreText = "00",
    deuceLabel = null,
    playerGames = 0,
    opponentGames = 0,
    gamesToWin = 2
  }) {
    if (this.elScoreCenter) {
      if (deuceLabel) {
        this.elScoreCenter.classList.add("deuce-mode");
        this.elScorePlayer.textContent = deuceLabel;
        this.elScoreSep.classList.add("hidden");
        this.elScoreOpponent.classList.add("hidden");
      } else {
        this.elScoreCenter.classList.remove("deuce-mode");
        this.elScorePlayer.textContent = playerScoreText;
        this.elScoreSep.classList.remove("hidden");
        this.elScoreOpponent.classList.remove("hidden");
        this.elScoreOpponent.textContent = opponentScoreText;
      }
      this.configureGameBubbles(gamesToWin);
      if (this.elGamesPlayer) {
        this.elGamesPlayer.querySelectorAll(".game-bubble").forEach((b, idx) => {
          b.classList.toggle("won", idx < playerGames);
        });
      }
      if (this.elGamesOpponent) {
        this.elGamesOpponent.querySelectorAll(".game-bubble").forEach((b, idx) => {
          b.classList.toggle("won", idx < opponentGames);
        });
      }
    }
  }

  updateServerTag(pos, visible) {
    if (!this.elServerTag) return;
    const isVis = !!(visible && pos && pos.visible);
    if (!isVis) {
      if (this._serverTagVis !== false) {
        this._serverTagVis = false;
        this.elServerTag.classList.add("hidden");
      }
      return;
    }
    if (this._serverTagVis !== true) {
      this._serverTagVis = true;
      this.elServerTag.classList.remove("hidden");
    }
    const cx = Math.round(Math.max(80, Math.min(window.innerWidth - 80, pos.x)));
    const cy = Math.round(Math.max(95, Math.min(window.innerHeight - 90, pos.y)));
    if (this._serverTagX !== cx) {
      this._serverTagX = cx;
      this.elServerTag.style.left = `${cx}px`;
    }
    if (this._serverTagY !== cy) {
      this._serverTagY = cy;
      this.elServerTag.style.top = `${cy}px`;
    }
  }

  updatePlayerNameplate(pos, visible) {
    if (!this.elPlayerNameplate) return;
    if (!visible || !pos || !pos.visible) {
      this.elPlayerNameplate.classList.add("hidden");
      return;
    }
    this.elPlayerNameplate.classList.remove("hidden");
    const cx = Math.max(90, Math.min(window.innerWidth - 90, pos.x));
    const cy = Math.max(120, Math.min(window.innerHeight - 50, pos.y));
    this.elPlayerNameplate.style.left = `${cx.toFixed(1)}px`;
    this.elPlayerNameplate.style.top = `${cy.toFixed(1)}px`;
  }

  showTimingPopup({ grade = "PERFECT", detail = "POWER TOPSPIN • 176 KM/H", screenPos = null, durationMs = 1100 }) {
    if (!this.elTimingPopup) return;
    if (this.timingPopupTimer) clearTimeout(this.timingPopupTimer);

    this.elTimingGrade.textContent = grade;
    this.elTimingGrade.className = "timing-grade";
    if (grade.includes("EARLY")) this.elTimingGrade.classList.add("grade-early");
    else if (grade.includes("LATE")) this.elTimingGrade.classList.add("grade-late");
    else this.elTimingGrade.classList.add("grade-perfect");

    this.elTimingDetail.textContent = detail;
    if (screenPos && screenPos.visible) {
      const cx = Math.max(110, Math.min(window.innerWidth - 110, screenPos.x));
      const cy = Math.max(110, Math.min(window.innerHeight - 120, screenPos.y));
      this.elTimingPopup.style.left = `${cx.toFixed(1)}px`;
      this.elTimingPopup.style.top = `${cy.toFixed(1)}px`;
    } else {
      this.elTimingPopup.style.left = "50%";
      this.elTimingPopup.style.top = "54%";
    }
    this.elTimingPopup.classList.remove("hidden");
    if (durationMs > 0) {
      this.timingPopupTimer = setTimeout(() => {
        this.elTimingPopup.classList.add("hidden");
      }, durationMs);
    }
  }

  showCenterBanner(text, { style = "style-gold", subText = "", durationMs = 1500, persistent = false } = {}) {
    if (!this.elBannerLayer || !this.elBannerText) return;
    if (this.bannerTimer) {
      clearTimeout(this.bannerTimer);
      this.bannerTimer = null;
    }
    this.elBannerText.textContent = text;
    this.elBannerText.className = `center-banner-text ${style}`;
    if (this.elBannerSub) {
      if (subText) {
        this.elBannerSub.textContent = subText;
        this.elBannerSub.classList.remove("hidden");
      } else {
        this.elBannerSub.classList.add("hidden");
      }
    }
    this.elBannerLayer.classList.remove("hidden");
    if (!persistent && durationMs > 0) {
      this.bannerTimer = setTimeout(() => {
        this.hideCenterBanner();
      }, durationMs);
    }
  }

  hideCenterBanner() {
    if (this.bannerTimer) {
      clearTimeout(this.bannerTimer);
      this.bannerTimer = null;
    }
    if (this.elBannerLayer) this.elBannerLayer.classList.add("hidden");
  }

  setReplayMode(active) {
    document.body.classList.toggle("replay-mode", !!active);
    if (this.elReplayBadge) this.elReplayBadge.classList.toggle("hidden", !active);
  }

  updateTimingGauge({ cursorNormalized = 0.5, modeTitle = "SWING TIMING", speedText = "READY" }) {
    if (this.elTimingCursor) {
      const pct = Math.max(4, Math.min(96, cursorNormalized * 100)).toFixed(1);
      if (this._lastGaugePct !== pct) {
        this._lastGaugePct = pct;
        this.elTimingCursor.style.left = `${pct}%`;
      }
    }
    if (this.elGaugeModeTitle && this._lastGaugeTitle !== modeTitle) {
      this._lastGaugeTitle = modeTitle;
      this.elGaugeModeTitle.textContent = modeTitle;
    }
    if (this.elGaugeSpeedReadout && this._lastGaugeSpeed !== speedText) {
      this._lastGaugeSpeed = speedText;
      this.elGaugeSpeedReadout.textContent = speedText;
    }
  }

  updateAudioStatus({ playing, trackName }) {
    if (this.elAudioDot) this.elAudioDot.classList.toggle("music-on", !!playing);
    if (this.elAudioLabel) {
      this.elAudioLabel.textContent = playing ? `Lyria: ${trackName || "Sunny Rally"}` : "Lyria: Muted";
    }
  }

  updateCameraLabel(label) {
    if (this.elCameraLabel) this.elCameraLabel.textContent = label;
  }

  updateMotionStatus({ webcamActive = false, phoneConnected = false, p1Phone = false, p2Phone = false }) {
    if (this.elWebcamPip) this.elWebcamPip.classList.toggle("hidden", !webcamActive);
    if (this.elWebcamDot) this.elWebcamDot.classList.toggle("active", !!webcamActive);
    const anyPhone = phoneConnected || p1Phone || p2Phone;
    if (this.elPhoneDot) this.elPhoneDot.classList.toggle("active", !!anyPhone);
    if (this.elPhoneLabel) {
      if (p1Phone && p2Phone) this.elPhoneLabel.textContent = "P1 & P2 Rackets";
      else if (anyPhone) this.elPhoneLabel.textContent = "Racket Connected";
      else this.elPhoneLabel.textContent = "Pocket Racket";
    }
  }

  updateMultiplayerRoomInfo(info = {}) {
    const merged = { ...this._lastRoomStatus || {}, ...info };
    this._lastRoomStatus = merged;
    if (merged.roomId) this.currentRoomId = String(merged.roomId).toLowerCase();
    if (merged.role) this.playerRole = String(merged.role).toLowerCase() === "p2" ? "p2" : "p1";
    if (merged.tunnelUrl) this.currentTunnelUrl = String(merged.tunnelUrl).replace(/\/+$/, "");

    const isP2 = this.playerRole === "p2";
    const p1Card = document.getElementById("mp-card-p1");
    const p2Card = document.getElementById("mp-card-p2");
    if (p1Card) p1Card.classList.toggle("hidden", isP2);
    if (p2Card) p2Card.classList.toggle("hidden", !isP2);

    const mRoom = encodeURIComponent(this.currentRoomId);
    const origin = (this.currentTunnelUrl || window.location.origin).replace(/\/+$/, "");
    const compP1 = `${origin}/companion.html?room=${mRoom}&role=p1`;
    const compP2 = `${origin}/companion.html?room=${mRoom}&role=p2`;

    const linkP1 = document.getElementById("companion-link");
    if (linkP1) linkP1.href = compP1;
    const linkP2 = document.getElementById("companion-link-p2");
    if (linkP2) linkP2.href = compP2;

    const qrP1 = document.getElementById("companion-qr");
    if (qrP1) qrP1.src = "https://www.gstatic.com/aistudio/starter-apps/tennis/qr/player1_qr.png";
    const qrP2 = document.getElementById("companion-qr-p2");
    if (qrP2) qrP2.src = "https://www.gstatic.com/aistudio/starter-apps/tennis/qr/player2_qr.png";

    const p1Status = document.getElementById("mp-p1-status");
    if (p1Status) {
      const online = !!(merged.p1Phone || merged.p1Online);
      p1Status.textContent = merged.p1Phone ? "Connected ✓" : online ? "Court Ready" : "Scan QR";
      p1Status.classList.toggle("online", !!merged.p1Phone);
    }
    const p2Status = document.getElementById("mp-p2-status");
    if (p2Status) {
      const online = !!(merged.p2Phone || merged.p2Online);
      p2Status.textContent = merged.p2Phone ? "Connected ✓" : online ? "Court Ready" : "Scan QR";
      p2Status.classList.toggle("online", !!merged.p2Phone);
    }
    const activeStatus = document.getElementById("mp-active-status");
    if (activeStatus) {
      const online = isP2 ? !!merged.p2Phone : !!merged.p1Phone;
      activeStatus.textContent = online ? "Connected ✓" : "Scan QR";
      activeStatus.classList.toggle("online", online);
    }
    this.updateOpponentPresence(merged);
  }

  updateOpponentPresence(status = {}) {
    const isMultiplayer = !!(status.isMultiplayer || this.selectedDifficulty === "1v1" || (this.currentRoomId && this.currentRoomId !== "default"));
    const opponentAvatarBadge = document.querySelector(".mii-side-opponent .mii-avatar-badge:not(.secondary-mii)");
    if (!isMultiplayer) {
      if (this.elOpponentPresencePill) this.elOpponentPresencePill.classList.add("hidden");
      if (opponentAvatarBadge) opponentAvatarBadge.classList.remove("opponent-ready");
      this._lastOtherReady = false;
      return;
    }

    const hostName = status.hostName?.trim() || "Player 1";
    const guestName = status.guestName?.trim() || "Player 2";
    const isP2 = this.playerRole === "p2";

    let ready = false;
    let label = "";
    if (isP2) {
      ready = !!(status.p2Phone || status.p1Phone || status.p1Online);
      if (status.p2Phone) label = `Racket Ready • ${hostName} Joined`;
      else if (status.p1Phone || status.p1Online) label = `${hostName} Ready • Scan QR for Phone Racket`;
      else label = `Waiting for ${hostName}…`;
    } else {
      ready = !!(status.p2Phone || status.p2Online);
      if (status.p2Phone && status.p2Online) label = `${guestName} Connected • Ready to Serve!`;
      else if (status.p2Phone) label = `${guestName}'s Racket Ready • Ready to Serve!`;
      else if (status.p2Online) label = `${guestName} Joined • Ready to Serve!`;
      else label = `Waiting for ${guestName}…`;
    }

    if (this.elOpponentPresencePill) {
      this.elOpponentPresencePill.classList.remove("hidden");
      this.elOpponentPresencePill.classList.toggle("ready", ready);
      this.elOpponentPresencePill.classList.toggle("in-rally", !!status.inRally);
    }
    if (this.elOpponentPresenceText) this.elOpponentPresenceText.textContent = label;
    if (opponentAvatarBadge) opponentAvatarBadge.classList.toggle("opponent-ready", ready);
    this._lastOtherReady = ready;
  }
}

export default HudUI;
