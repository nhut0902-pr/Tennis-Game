export class MotionController {
  constructor(opts = {}) {
    this.onSwing = typeof opts.onSwing === "function" ? opts.onSwing : null;
    this.onToss = typeof opts.onToss === "function" ? opts.onToss : null;
    this.onP2Swing = typeof opts.onP2Swing === "function" ? opts.onP2Swing : null;
    this.onP2Toss = typeof opts.onP2Toss === "function" ? opts.onP2Toss : null;
    this.onRoomState = typeof opts.onRoomState === "function" ? opts.onRoomState : null;
    this.onStatusChange = typeof opts.onStatusChange === "function" ? opts.onStatusChange : null;
    this.onOrientation = typeof opts.onOrientation === "function" ? opts.onOrientation : null;

    this.roomId = (opts.roomId || "default").trim().toLowerCase() || "default";
    this.role = (opts.role || "p1").toLowerCase() === "p2" ? "p2" : "p1";

    // Webcam config & state
    this.webcamCanvasId = opts.webcamCanvasId || "webcam-canvas";
    this.webcamCanvas = opts.webcamCanvas || null;
    this.webcamCtx = null;
    this.flowWidth = 64;
    this.flowHeight = 48;
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenCanvas.width = this.flowWidth;
    this.offscreenCanvas.height = this.flowHeight;
    this.offscreenCtx = this.offscreenCanvas.getContext("2d", { willReadFrequently: true });
    this.prevLuma = new Float32Array(this.flowWidth * this.flowHeight);
    this.motionEnergyMap = new Float32Array(this.flowWidth * this.flowHeight);
    this.hasPrevFrame = false;
    this.videoElem = null;
    this.webcamStream = null;
    this.webcamActive = false;
    this.smoothedCentroid = { x: 0.5, y: 0.5 };
    this.motionVector = { vx: 0, vy: 0, mag: 0 };
    this.lastWebcamTriggerMs = 0;

    // Remote phone polling state
    this.phonePollIntervalMs = opts.phonePollIntervalMs || 50;
    this.phonePollTimer = null;
    this.phoneState = {
      connected: false,
      p2Connected: false,
      lastSeenMs: -1,
      orientation: { pitch: 0, roll: 0, yaw: 0, accelMag: 0, buttonB: false },
      lastSwing: null
    };
    this.p2PhoneState = {
      connected: false,
      lastSeenMs: -1,
      orientation: { pitch: 0, roll: 0, yaw: 0, accelMag: 0, buttonB: false },
      lastSwing: null
    };
    this.lastProcessedPhoneSeq = 0;
    this.phonePollInitialized = false;
    this.lastProcessedP2PhoneSeq = 0;
    this.p2PhonePollInitialized = false;

    // Movement & Aiming Inputs (PC Keyboard + Mobile Joystick)
    this.aimBiasX = 0;
    this.moveInput = { x: 0, z: 0 }; // x: -1 (left) to 1 (right), z: -1 (net/forward) to 1 (baseline/back)
    this.selectedShotType = "topspin";
    this.keysDown = new Set();
    this.pointerDrag = null;
    this.mouseTrail = [];
    this.lastVisualSwing = { timestamp: 0, dirX: 0, dirY: -0.5, speed: 0, shotType: "topspin", source: "ready" };

    // Mobile On-Screen Virtual Controls
    this.joystickState = {
      active: false,
      touchId: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      dx: 0,
      dy: 0,
      maxRadius: 44
    };

    // Device Motion (Mobile Gyroscope / Accelerometer Shake)
    this.deviceMotionActive = false;
    this.lastDeviceMotionSwingMs = 0;
    this.lastDeviceMotionAccel = { x: 0, y: 0, z: 0 };
    this.deviceOrientation = { gamma: 0, beta: 0, alpha: 0 };

    // User settings (persisted in localStorage)
    this.settings = this._loadSettings();

    this._listeners = { swing: [], toss: [], status: [], orientation: [] };
    this._rafId = null;
    this._disposed = false;

    this._initDOMBindings();
    this._initTouchGamepad();
    this.startPhonePolling();
    this._startHudRenderLoop();

    // Auto-enable touch controls if touch device or narrow screen
    const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024);
    if (isTouch && this.settings.touchGamepadEnabled !== false) {
      this.setTouchControlsVisible(true);
    }
  }

  _loadSettings() {
    try {
      const saved = localStorage.getItem("argon_tennis_controls_settings");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      touchGamepadEnabled: true,
      deviceMotionEnabled: false,
      hapticsEnabled: true,
      manualMovement: true,
      moveSpeedRatio: 1.0,
      moveSensitivity: 1.0
    };
  }

  saveSettings() {
    try {
      localStorage.setItem("argon_tennis_controls_settings", JSON.stringify(this.settings));
    } catch {}
  }

  getMoveInput() {
    return { ...this.moveInput };
  }

  setRoomConfig({ roomId, role } = {}) {
    if (roomId) {
      this.roomId = String(roomId).trim().toLowerCase() || "default";
      this.phonePollInitialized = false;
      this.p2PhonePollInitialized = false;
      this.lastProcessedPhoneSeq = 0;
      this.lastProcessedP2PhoneSeq = 0;
    }
    if (role) {
      this.role = String(role).toLowerCase() === "p2" ? "p2" : "p1";
    }
  }

  on(event, handler) {
    if (this._listeners[event] && typeof handler === "function") {
      this._listeners[event].push(handler);
    }
    return () => {
      if (this._listeners[event]) {
        this._listeners[event] = this._listeners[event].filter(h => h !== handler);
      }
    };
  }

  setShotType(type) {
    if (["topspin", "slice", "lob", "smash", "flat"].includes(type)) {
      this.selectedShotType = type;
      this._updateHudShotPills(type);
    }
  }

  _resolveSwingSide(side, dirX = 0) {
    if (side === "backhand" || side === "forehand" || side === "overhead") return side;
    return dirX > 0.12 ? "backhand" : dirX < -0.12 ? "forehand" : null;
  }

  _inferShotTypeFromKinematics({ shotType, dirY = -0.4, pitch = 0, roll = 0, speed = 1.1 } = {}) {
    if (shotType && ["topspin", "slice", "lob", "smash", "flat"].includes(shotType)) {
      return shotType;
    }
    if ((dirY > 0.35 && speed > 1.22) || speed >= 1.46 || (pitch < -18 && speed >= 1.25)) {
      return "smash";
    }
    if (dirY > 0.14 || (Math.abs(roll) > 26 && dirY > -0.15)) {
      return "slice";
    }
    if (dirY < -0.65 || pitch > 26) {
      return "lob";
    }
    return "topspin";
  }

  _emitSwing(raw = {}) {
    const now = performance.now();
    const speed = Math.max(0.5, Math.min(2.0, Number(raw.speed ?? 1.18)));
    const dirX = Math.max(-1.0, Math.min(1.0, Number(raw.dirX ?? raw.angleX ?? this.aimBiasX ?? 0)));
    const dirY = Math.max(-1.0, Math.min(1.0, Number(raw.dirY ?? -0.4)));
    const pitch = Number(raw.pitch ?? this.phoneState.orientation.pitch ?? 0);
    const roll = Number(raw.roll ?? this.phoneState.orientation.roll ?? 0);
    const side = this._resolveSwingSide(raw.side, dirX);
    const shotType = this._inferShotTypeFromKinematics({
      shotType: raw.shotType || this.selectedShotType,
      dirY,
      pitch,
      roll,
      speed
    });

    const evt = {
      type: "swing",
      role: raw.role || this.role,
      source: raw.source || "manual",
      side,
      shotType,
      speed,
      dirX,
      dirY,
      angleX: dirX,
      pitch,
      roll,
      timing: raw.timing || null,
      timestamp: raw.timestamp || Date.now()
    };

    this.lastVisualSwing = {
      timestamp: now,
      side,
      dirX,
      dirY,
      speed,
      shotType,
      source: evt.source
    };

    if (this.settings.hapticsEnabled && (evt.source === "touch_button" || evt.source === "device_motion")) {
      this.triggerHapticFeedback({ kind: "swing", intensity: 0.8 });
    }

    if (this.role === "p2" && raw.role !== "p1") {
      if (evt.source !== "phone" && !raw._fromPoll) {
        fetch(`/api/racket/swing?room=${encodeURIComponent(this.roomId)}&role=p2`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: this.roomId,
            role: "p2",
            type: "swing",
            side,
            shotType,
            speed,
            angleX: dirX,
            dirX,
            dirY,
            pitch,
            roll,
            source: evt.source
          })
        }).then(r => r.ok ? r.json() : null).then(r => {
          if (r?.swing && typeof r.swing.seq === "number") {
            this.p2PhonePollInitialized = true;
            this.lastProcessedP2PhoneSeq = Math.max(this.lastProcessedP2PhoneSeq, r.swing.seq);
          }
        }).catch(() => {});
      }
      return this._emitP2Swing(evt);
    }

    if (typeof this.onSwing === "function") this.onSwing(evt);
    for (const h of this._listeners.swing) {
      try { h(evt); } catch (e) { console.error(e); }
    }
    return evt;
  }

  _emitToss(raw = {}) {
    const now = performance.now();
    const dirX = Number(raw.dirX ?? raw.angleX ?? this.aimBiasX ?? 0);
    const dirY = Number(raw.dirY ?? -0.9);
    const side = this._resolveSwingSide(raw.side, dirX);
    const shotType = raw.shotType || "lob";
    const pitch = Number(raw.pitch ?? this.phoneState.orientation.pitch ?? 0);
    const roll = Number(raw.roll ?? this.phoneState.orientation.roll ?? 0);

    const evt = {
      type: "toss",
      role: raw.role || this.role,
      source: raw.source || "manual",
      side,
      shotType,
      speed: Number(raw.speed ?? 1.1),
      dirX,
      dirY,
      angleX: dirX,
      pitch,
      roll,
      timestamp: raw.timestamp || Date.now()
    };

    this.lastVisualSwing = {
      timestamp: now,
      side,
      dirX,
      dirY: -0.95,
      speed: 1.1,
      shotType: "toss",
      source: evt.source
    };

    if (this.settings.hapticsEnabled && (evt.source === "touch_button" || evt.source === "device_motion")) {
      this.triggerHapticFeedback({ kind: "toss", intensity: 0.6 });
    }

    if (this.role === "p2" && raw.role !== "p1") {
      if (evt.source !== "phone" && !raw._fromPoll) {
        fetch(`/api/racket/swing?room=${encodeURIComponent(this.roomId)}&role=p2`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: this.roomId,
            role: "p2",
            type: "toss",
            side: evt.side,
            shotType: evt.shotType,
            speed: evt.speed,
            angleX: evt.dirX,
            dirX: evt.dirX,
            dirY: evt.dirY,
            pitch: evt.pitch,
            roll: evt.roll,
            source: evt.source
          })
        }).then(r => r.ok ? r.json() : null).then(r => {
          if (r?.swing && typeof r.swing.seq === "number") {
            this.p2PhonePollInitialized = true;
            this.lastProcessedP2PhoneSeq = Math.max(this.lastProcessedP2PhoneSeq, r.swing.seq);
          }
        }).catch(() => {});
      }
      return this._emitP2Toss(evt);
    }

    let handled = false;
    if (typeof this.onToss === "function") {
      handled = this.onToss(evt) !== false;
    }
    for (const h of this._listeners.toss) {
      try { if (h(evt) !== false) handled = true; } catch (e) { console.error(e); }
    }
    if (!handled && typeof this.onSwing === "function") {
      this.onSwing(evt);
    }
    return evt;
  }

  _emitP2Swing(evt = {}) {
    const speed = Math.max(0.5, Math.min(2.0, Number(evt.speed ?? 1.15)));
    const dirX = Math.max(-1.0, Math.min(1.0, Number(evt.dirX ?? evt.angleX ?? 0)));
    const dirY = Math.max(-1.0, Math.min(1.0, Number(evt.dirY ?? -0.45)));
    const pitch = Number(evt.pitch ?? 0);
    const roll = Number(evt.roll ?? 0);
    const side = this._resolveSwingSide(evt.side, dirX);
    const shotType = this._inferShotTypeFromKinematics({
      shotType: evt.shotType,
      dirY,
      pitch,
      roll,
      speed
    });

    const s = {
      type: "swing",
      role: "p2",
      source: evt.source || "phone",
      side,
      shotType,
      speed,
      dirX,
      dirY,
      angleX: dirX,
      pitch,
      roll,
      timestamp: evt.timestamp || Date.now()
    };
    if (typeof this.onP2Swing === "function") this.onP2Swing(s);
    return s;
  }

  _emitP2Toss(evt = {}) {
    const dirX = Number(evt.dirX ?? evt.angleX ?? 0);
    const dirY = Number(evt.dirY ?? -0.9);
    const side = this._resolveSwingSide(evt.side, dirX);
    const s = {
      type: "toss",
      role: "p2",
      source: evt.source || "phone",
      side,
      shotType: evt.shotType || "lob",
      speed: Number(evt.speed ?? 1.1),
      dirX,
      dirY,
      angleX: dirX,
      pitch: Number(evt.pitch ?? 0),
      roll: Number(evt.roll ?? 0),
      timestamp: evt.timestamp || Date.now()
    };
    let handled = false;
    if (typeof this.onP2Toss === "function") {
      handled = this.onP2Toss(s) !== false;
    }
    if (!handled && typeof this.onP2Swing === "function") {
      this.onP2Swing(s);
    }
    return s;
  }

  triggerSyntheticSwing(opts = {}) {
    if ((opts.type || "swing") === "toss") {
      return this._emitToss({
        source: opts.source || "synthetic",
        side: opts.side || null,
        shotType: opts.shotType || "lob",
        speed: opts.speed ?? 1.05,
        dirX: opts.dirX ?? opts.angleX ?? 0,
        dirY: opts.dirY ?? -0.9
      });
    }
    return this._emitSwing({
      source: opts.source || "synthetic",
      side: opts.side || null,
      shotType: opts.shotType,
      speed: opts.speed ?? (opts.shotType === "smash" ? 1.48 : 1.18),
      dirX: opts.dirX ?? opts.angleX ?? this.aimBiasX ?? 0,
      dirY: opts.dirY ?? -0.45,
      pitch: opts.pitch,
      roll: opts.roll,
      timing: opts.timing || null
    });
  }

  // --- Mobile On-Screen Virtual Controls ---
  _initTouchGamepad() {
    const layer = document.getElementById("touch-gamepad-layer");
    if (!layer) return;

    const stickBase = document.getElementById("touch-joystick-base");
    const stickThumb = document.getElementById("touch-joystick-thumb");

    // Virtual Joystick Touch Handlers
    const handleJoystickStart = (e) => {
      const touch = e.changedTouches ? e.changedTouches[0] : e;
      const rect = stickBase.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      this.joystickState.active = true;
      this.joystickState.touchId = touch.identifier ?? "mouse";
      this.joystickState.startX = centerX;
      this.joystickState.startY = centerY;

      updateJoystickPos(touch.clientX, touch.clientY);
      e.preventDefault();
      e.stopPropagation();
    };

    const handleJoystickMove = (e) => {
      if (!this.joystickState.active) return;
      const touch = e.changedTouches
        ? Array.from(e.changedTouches).find(t => t.identifier === this.joystickState.touchId)
        : e;
      if (!touch) return;

      updateJoystickPos(touch.clientX, touch.clientY);
      e.preventDefault();
      e.stopPropagation();
    };

    const handleJoystickEnd = (e) => {
      if (!this.joystickState.active) return;
      if (e.changedTouches) {
        const found = Array.from(e.changedTouches).some(t => t.identifier === this.joystickState.touchId);
        if (!found) return;
      }
      this.joystickState.active = false;
      this.joystickState.touchId = null;
      this.joystickState.dx = 0;
      this.joystickState.dy = 0;

      // Re-evaluate movement based on keyboard keys if joystick was released
      this._updateKeyboardMovement();

      if (stickThumb) {
        stickThumb.style.transform = `translate(0px, 0px)`;
        stickThumb.classList.remove("active");
      }
      e.preventDefault();
      e.stopPropagation();
    };

    const updateJoystickPos = (clientX, clientY) => {
      const dx = clientX - this.joystickState.startX;
      const dy = clientY - this.joystickState.startY;
      const dist = Math.hypot(dx, dy);
      const maxR = this.joystickState.maxRadius;
      const clampedDist = Math.min(dist, maxR);
      const angle = Math.atan2(dy, dx);

      const thumbX = Math.cos(angle) * clampedDist;
      const thumbY = Math.sin(angle) * clampedDist;

      if (stickThumb) {
        stickThumb.style.transform = `translate(${thumbX.toFixed(1)}px, ${thumbY.toFixed(1)}px)`;
        stickThumb.classList.add("active");
      }

      const normX = thumbX / maxR;
      const normY = thumbY / maxR;

      this.joystickState.dx = normX;
      this.joystickState.dy = normY;

      // Update movement and aimBias
      this.moveInput.x = normX;
      this.moveInput.z = normY; // drag up (negative Y) = run to net (negative Z in ThreeJS)
      this.aimBiasX = Math.max(-1, Math.min(1, normX * 1.15));
    };

    if (stickBase) {
      stickBase.addEventListener("touchstart", handleJoystickStart, { passive: false });
      window.addEventListener("touchmove", handleJoystickMove, { passive: false });
      window.addEventListener("touchend", handleJoystickEnd, { passive: false });
      window.addEventListener("touchcancel", handleJoystickEnd, { passive: false });

      // Support mouse test for joystick
      stickBase.addEventListener("mousedown", (e) => {
        handleJoystickStart(e);
        const onMouseMove = (ev) => handleJoystickMove(ev);
        const onMouseUp = (ev) => {
          handleJoystickEnd(ev);
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      });
    }

    // Touch Action Buttons
    const bindTouchAction = (btnId, callback) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      const trigger = (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.add("btn-pressed");
        setTimeout(() => btn.classList.remove("btn-pressed"), 180);
        callback();
      };
      btn.addEventListener("touchstart", trigger, { passive: false });
      btn.addEventListener("click", trigger);
    };

    // Main Swing (Đánh bóng)
    bindTouchAction("btn-touch-swing", () => {
      this._emitSwing({
        source: "touch_button",
        shotType: this.selectedShotType,
        speed: 1.25,
        dirX: this.aimBiasX,
        dirY: -0.45
      });
    });

    // Toss / Serve (Tung bóng / Giao bóng)
    bindTouchAction("btn-touch-toss", () => {
      this._emitToss({
        source: "touch_button",
        dirX: this.aimBiasX,
        dirY: -0.9,
        speed: 1.1
      });
    });

    // Shot Modifiers
    bindTouchAction("btn-touch-topspin", () => {
      this.setShotType("topspin");
      this._emitSwing({
        source: "touch_button",
        shotType: "topspin",
        speed: 1.22,
        dirX: this.aimBiasX,
        dirY: -0.45
      });
    });

    bindTouchAction("btn-touch-slice", () => {
      this.setShotType("slice");
      this._emitSwing({
        source: "touch_button",
        shotType: "slice",
        speed: 1.05,
        dirX: this.aimBiasX,
        dirY: 0.45
      });
    });

    bindTouchAction("btn-touch-lob", () => {
      this.setShotType("lob");
      this._emitSwing({
        source: "touch_button",
        shotType: "lob",
        speed: 1.1,
        dirX: this.aimBiasX,
        dirY: -0.85
      });
    });

    bindTouchAction("btn-touch-smash", () => {
      this.setShotType("smash");
      this._emitSwing({
        source: "touch_button",
        shotType: "smash",
        speed: 1.5,
        dirX: this.aimBiasX,
        dirY: 0.65
      });
    });
  }

  setTouchControlsVisible(visible) {
    this.settings.touchGamepadEnabled = visible;
    this.saveSettings();
    const layer = document.getElementById("touch-gamepad-layer");
    if (layer) {
      layer.classList.toggle("visible-override", visible);
      layer.classList.toggle("hidden-override", !visible);
    }
    const toggleBtn = document.getElementById("btn-touch-toggle");
    if (toggleBtn) {
      toggleBtn.classList.toggle("active", visible);
    }
  }

  toggleTouchControls() {
    const isVisible = this.settings.touchGamepadEnabled;
    this.setTouchControlsVisible(!isVisible);
    return !isVisible;
  }

  // --- Mobile Device Motion (Gyro / Accelerometer Shake) ---
  async enableDeviceMotion() {
    if (this.deviceMotionActive) return true;

    // Check iOS 13+ permission request
    if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response !== "granted") {
          console.warn("[MotionController] DeviceMotion permission not granted:", response);
          return false;
        }
      } catch (err) {
        console.warn("[MotionController] DeviceMotionEvent permission error:", err);
        return false;
      }
    }

    this._onDeviceMotion = (e) => {
      if (this._disposed || !this.deviceMotionActive) return;
      const acc = e.acceleration || e.accelerationIncludingGravity;
      if (!acc) return;

      const ax = acc.x || 0;
      const ay = acc.y || 0;
      const az = acc.z || 0;
      const totalMag = Math.hypot(ax, ay, az);

      const now = performance.now();
      // Detect strong swing forward/down (accel > 17 m/s² and cooldown > 380ms)
      if (totalMag > 17 && now - this.lastDeviceMotionSwingMs > 380) {
        this.lastDeviceMotionSwingMs = now;
        const speed = Math.min(1.85, Math.max(0.95, totalMag / 14));
        const dirX = Math.max(-1, Math.min(1, -ax / 10 + this.aimBiasX));
        let shotType = this.selectedShotType;
        if (ay > 14) shotType = "smash";
        else if (ay < -8) shotType = "lob";

        this._emitSwing({
          source: "device_motion",
          shotType,
          speed,
          dirX,
          dirY: -0.45
        });
      }
      this.lastDeviceMotionAccel = { x: ax, y: ay, z: az };
    };

    this._onDeviceOrientation = (e) => {
      if (this._disposed || !this.deviceMotionActive) return;
      const gamma = e.gamma || 0; // tilt left/right (-90 to 90)
      const beta = e.beta || 0;
      this.deviceOrientation = { gamma, beta, alpha: e.alpha || 0 };

      // Gentle tilt biases the aim
      this.aimBiasX = Math.max(-1, Math.min(1, gamma / 35));
    };

    window.addEventListener("devicemotion", this._onDeviceMotion);
    window.addEventListener("deviceorientation", this._onDeviceOrientation);
    this.deviceMotionActive = true;
    this.settings.deviceMotionEnabled = true;
    this.saveSettings();

    const gyroBtn = document.getElementById("btn-gyro-toggle");
    if (gyroBtn) gyroBtn.classList.add("active");
    return true;
  }

  disableDeviceMotion() {
    if (this._onDeviceMotion) window.removeEventListener("devicemotion", this._onDeviceMotion);
    if (this._onDeviceOrientation) window.removeEventListener("deviceorientation", this._onDeviceOrientation);
    this.deviceMotionActive = false;
    this.settings.deviceMotionEnabled = false;
    this.saveSettings();

    const gyroBtn = document.getElementById("btn-gyro-toggle");
    if (gyroBtn) gyroBtn.classList.remove("active");
  }

  async toggleDeviceMotion() {
    return this.deviceMotionActive ? (this.disableDeviceMotion(), false) : this.enableDeviceMotion();
  }

  // --- Webcam Motion & MediaPipe ---
  async _ensureMediaPipeHands() {
    if (this.mpHands || this._mpLoading) return;
    this._mpLoading = true;
    const loadScript = src => new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement("script");
      s.src = src;
      s.crossOrigin = "anonymous";
      s.onload = () => res();
      s.onerror = e => rej(e);
      document.head.appendChild(s);
    });

    try {
      if (!window.Hands) {
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
      }
      if (window.Hands) {
        const hands = new window.Hands({
          locateFile: file => file.endsWith(".js")
            ? `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            : `/assets/mediapipe/hands/${file}`
        });
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.4,
          minTrackingConfidence: 0.4
        });
        hands.onResults(results => {
          this._mpBusy = false;
          if (results?.multiHandLandmarks?.length > 0) {
            this.latestHandLandmarks = results.multiHandLandmarks[0];
            this.latestHandSeenAt = performance.now();
            this._hasNewHandResult = true;
          } else {
            this.latestHandLandmarks = null;
          }
        });
        await hands.initialize();
        this.mpHands = hands;
      }
    } catch (err) {
      console.warn("[MotionController] MediaPipe Hands CDN fallback to Optical Flow:", err);
    } finally {
      this._mpLoading = false;
    }
  }

  async enableWebcam() {
    if (this.webcamActive) return true;
    if (!navigator.mediaDevices?.getUserMedia) {
      this._notifyStatus({ webcam: false, error: "HTTPS required for browser camera access" });
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false
      });
      this.webcamStream = stream;
      if (!this.videoElem) {
        this.videoElem = document.createElement("video");
        this.videoElem.playsInline = true;
        this.videoElem.muted = true;
      }
      this.videoElem.srcObject = stream;
      await this.videoElem.play();
      this.webcamActive = true;
      this.hasPrevFrame = false;
      this.latestHandLandmarks = null;
      this._mpBusy = false;
      this._ensureMediaPipeHands();
      this._notifyStatus({ webcam: true, phone: this.phoneState.connected });
      this._updateWebcamBadgeUI(true);
      return true;
    } catch (err) {
      console.warn("[MotionController] Webcam access denied or unavailable:", err);
      this.webcamActive = false;
      this._notifyStatus({ webcam: false, error: err.message || "Camera permission denied" });
      this._updateWebcamBadgeUI(false);
      return false;
    }
  }

  disableWebcam() {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(t => t.stop());
      this.webcamStream = null;
    }
    if (this.videoElem) this.videoElem.srcObject = null;
    this.webcamActive = false;
    this.hasPrevFrame = false;
    this.latestHandLandmarks = null;
    this._notifyStatus({ webcam: false, phone: this.phoneState.connected });
    this._updateWebcamBadgeUI(false);
  }

  async toggleWebcam() {
    return this.webcamActive ? (this.disableWebcam(), false) : this.enableWebcam();
  }

  _processWebcamFrame() {
    if (!this.webcamActive || !this.videoElem || this.videoElem.readyState < 2) return;
    const now = performance.now();
    const frameChanged = this.videoElem.currentTime !== this._lastVideoTime;
    if (frameChanged) {
      this._lastVideoTime = this.videoElem.currentTime;
      if (this.mpHands && !this._mpBusy) {
        this._mpBusy = true;
        this.mpHands.send({ image: this.videoElem }).catch(() => { this._mpBusy = false; });
      }
    }

    if (this.latestHandLandmarks && (now - (this.latestHandSeenAt || 0) < 240)) {
      if (!this._hasNewHandResult) return;
      this._hasNewHandResult = false;
      const lm = this.latestHandLandmarks;
      const wrist = lm[0];
      const middleMcp = lm[9];
      const cx = 1 - (wrist.x * 0.45 + middleMcp.x * 0.55);
      const cy = wrist.y * 0.45 + middleMcp.y * 0.55;
      this.smoothedCentroid.x = cx;
      this.smoothedCentroid.y = cy;

      if (!this._webcamTrail || this._lastWebcamSource !== "mediapipe") this._webcamTrail = [];
      this._lastWebcamSource = "mediapipe";
      this._webcamTrail.push({ x: cx, y: cy, t: now });
      while (this._webcamTrail.length > 5 || (this._webcamTrail.length > 2 && (now - this._webcamTrail[0].t > 160))) {
        this._webcamTrail.shift();
      }
      this._evaluateHandTrail(now, true);
      return;
    }

    if (!frameChanged) return;
    const w = this.flowWidth;
    const h = this.flowHeight;
    const ctx = this.offscreenCtx;
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(this.videoElem, -w, 0, w, h);
    ctx.restore();

    const imgData = ctx.getImageData(0, 0, w, h).data;
    let totalE = 0;
    const numCols = 8;
    const numRows = 6;
    const cellW = w / numCols;
    const cellH = h / numRows;
    const cellEnergy = new Float32Array(numCols * numRows);
    const cellPosX = new Float32Array(numCols * numRows);
    const cellPosY = new Float32Array(numCols * numRows);

    for (let r = 0; r < h; r++) {
      const cr = Math.min(numRows - 1, Math.floor(r / cellH));
      for (let c = 0; c < w; c++) {
        const idx = r * w + c;
        const p = idx * 4;
        const lum = (imgData[p] * 0.299 + imgData[p + 1] * 0.587 + imgData[p + 2] * 0.114) / 255;
        if (this.hasPrevFrame) {
          const diff = Math.abs(lum - this.prevLuma[idx]);
          const mot = diff > 0.11 ? diff : 0;
          this.motionEnergyMap[idx] = this.motionEnergyMap[idx] * 0.45 + mot * 0.55;
          if (mot > 0.13) {
            totalE += mot;
            const cc = Math.min(numCols - 1, Math.floor(c / cellW));
            const cIdx = cr * numCols + cc;
            cellEnergy[cIdx] += mot;
            cellPosX[cIdx] += (c / w) * mot;
            cellPosY[cIdx] += (r / h) * mot;
          }
        }
        this.prevLuma[idx] = lum;
      }
    }

    if (!this.hasPrevFrame) {
      this.hasPrevFrame = true;
      this._webcamTrail = [];
      return;
    }

    let maxE = 0, bestX = 0, bestY = 0;
    for (let cr = 0; cr < numRows; cr++) {
      for (let cc = 0; cc < numCols; cc++) {
        let eSum = 0, xSum = 0, ySum = 0;
        for (let dr = -1; dr <= 1; dr++) {
          const nr = cr + dr;
          if (nr < 0 || nr >= numRows) continue;
          for (let dc = -1; dc <= 1; dc++) {
            const nc = cc + dc;
            if (nc < 0 || nc >= numCols) continue;
            const nIdx = nr * numCols + nc;
            eSum += cellEnergy[nIdx];
            xSum += cellPosX[nIdx];
            ySum += cellPosY[nIdx];
          }
        }
        if (eSum > maxE) {
          maxE = eSum;
          bestX = xSum;
          bestY = ySum;
        }
      }
    }

    const peakRatio = totalE > 0.001 ? maxE / totalE : 0;
    if (maxE > 3.2 && peakRatio >= 0.45) {
      const cx = bestX / maxE;
      const cy = bestY / maxE;
      this.smoothedCentroid.x = this.smoothedCentroid.x * 0.35 + cx * 0.65;
      this.smoothedCentroid.y = this.smoothedCentroid.y * 0.35 + cy * 0.65;

      if (!this._webcamTrail || this._lastWebcamSource !== "flow") this._webcamTrail = [];
      this._lastWebcamSource = "flow";
      this._webcamTrail.push({ x: this.smoothedCentroid.x, y: this.smoothedCentroid.y, t: now });
      while (this._webcamTrail.length > 5 || (this._webcamTrail.length > 2 && (now - this._webcamTrail[0].t > 160))) {
        this._webcamTrail.shift();
      }
      this._evaluateHandTrail(now, false);
    } else {
      this.motionVector.vx *= 0.72;
      this.motionVector.vy *= 0.72;
      this.motionVector.mag *= 0.72;
      if (this._webcamTrail?.length > 0 && (now - this._webcamTrail[this._webcamTrail.length - 1].t > 150)) {
        this._webcamTrail = [];
      }
    }
  }

  _evaluateHandTrail(now, isMediaPipe) {
    if (!this._webcamTrail || this._webcamTrail.length < 2) return;
    const first = this._webcamTrail[0];
    const last = this._webcamTrail[this._webcamTrail.length - 1];
    const dt = Math.max(0.025, (last.t - first.t) / 1000);
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const disp = Math.hypot(dx, dy);

    let pathLen = 0;
    for (let i = 1; i < this._webcamTrail.length; i++) {
      pathLen += Math.hypot(this._webcamTrail[i].x - this._webcamTrail[i - 1].x, this._webcamTrail[i].y - this._webcamTrail[i - 1].y);
    }
    const linearity = pathLen > 0.001 ? disp / pathLen : 0;
    const minDisp = isMediaPipe ? 0.065 : 0.10;
    const minLinear = isMediaPipe ? 0.62 : 0.70;
    const minSpeed = isMediaPipe ? 0.62 : 0.85;

    const vx = dx / dt;
    const vy = dy / dt;
    this.motionVector.vx = vx * 0.65;
    this.motionVector.vy = vy * 0.65;
    this.motionVector.mag = linearity >= minLinear ? Math.hypot(this.motionVector.vx, this.motionVector.vy) : 0;

    if (disp >= minDisp && linearity >= minLinear && this.motionVector.mag >= minSpeed && (now - this.lastWebcamTriggerMs > 320)) {
      this.lastWebcamTriggerMs = now;
      this._webcamTrail = [last];

      const swingSpeed = Math.min(1.65, Math.max(0.85, 0.75 + this.motionVector.mag * 0.45));
      const swingDirX = Math.max(-1, Math.min(1, this.motionVector.vx * 0.85));
      const swingDirY = Math.max(-1, Math.min(1, this.motionVector.vy * 0.85));

      let side = null;
      if (vx > 0.15) side = "backhand";
      else if (vx < -0.15) side = "forehand";

      if ((last.y < 0.35 && dy < -0.045 && vy < -0.45) || (vy < -0.85 && Math.abs(vy) > Math.abs(vx) * 1.15)) {
        this._emitToss({ source: "webcam", side, shotType: "lob", speed: swingSpeed, dirX: swingDirX, dirY: -0.9 });
      } else {
        let shot = "topspin";
        if ((vy > 0.85 && swingSpeed > 1.18) || swingSpeed >= 1.46) shot = "smash";
        else if (vy > 0.32) shot = "slice";
        else if (vy < -0.58) shot = "lob";

        this._emitSwing({ source: "webcam", side, shotType: shot, speed: swingSpeed, dirX: swingDirX, dirY: swingDirY });
      }
    }
  }

  // --- Remote Phone Companion Polling ---
  startPhonePolling() {
    if (this.phonePollTimer) return;
    const poll = async () => {
      if (this._disposed) return;
      try {
        const query = `?room=${encodeURIComponent(this.roomId || "default")}&role=${encodeURIComponent(this.role || "p1")}&touch=1`;
        const res = await fetch(`/api/match/state${query}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (typeof this.onRoomState === "function") this.onRoomState(data);

          const p1 = data.p1 || data;
          const p2 = data.p2 || null;
          const wasConnected = this.phoneState.connected;
          const wasP2Connected = this.p2PhoneState.connected;

          this.phoneState.connected = !!p1.connected;
          this.phoneState.lastSeenMs = Number(p1.lastSeenMs ?? -1);
          if (p2) {
            this.p2PhoneState.connected = !!p2.connected;
            this.p2PhoneState.lastSeenMs = Number(p2.lastSeenMs ?? -1);
          }

          const myPhone = this.role === "p2" && p2 ? p2 : p1;
          if (myPhone?.orientation) {
            this.phoneState.orientation = {
              pitch: Number(myPhone.orientation.pitch || 0),
              roll: Number(myPhone.orientation.roll || 0),
              yaw: Number(myPhone.orientation.yaw || 0),
              accelMag: Number(myPhone.orientation.accelMag || 0),
              buttonB: !!myPhone.orientation.buttonB
            };
            if (typeof this.onOrientation === "function") this.onOrientation(this.phoneState.orientation);
          }

          const anyPhone = this.phoneState.connected || this.p2PhoneState.connected;
          if (wasConnected !== this.phoneState.connected || wasP2Connected !== this.p2PhoneState.connected) {
            this._notifyStatus({
              webcam: this.webcamActive,
              phone: anyPhone,
              p1Phone: this.phoneState.connected,
              p2Phone: this.p2PhoneState.connected
            });
            this._updatePhoneBadgeUI(anyPhone);
          }

          if (p1?.lastSwing && typeof p1.lastSwing.seq === "number") {
            const seq = p1.lastSwing.seq;
            if (!this.phonePollInitialized) {
              this.phonePollInitialized = true;
              const age = Date.now() - Number(p1.lastSwing.serverTimeMs || 0);
              this.lastProcessedPhoneSeq = age < 1200 ? seq - 1 : seq;
            }
            if (seq > this.lastProcessedPhoneSeq) {
              this.lastProcessedPhoneSeq = seq;
              this.phoneState.lastSwing = p1.lastSwing;
              const sw = p1.lastSwing;
              if (sw.type === "toss") {
                this._emitToss({
                  source: "phone",
                  role: "p1",
                  side: sw.side,
                  shotType: sw.shotType || "lob",
                  speed: sw.speed || 1.1,
                  dirX: sw.angleX ?? sw.dirX ?? 0,
                  dirY: sw.dirY ?? -0.9,
                  pitch: sw.pitch,
                  roll: sw.roll
                });
              } else {
                this._emitSwing({
                  source: "phone",
                  role: "p1",
                  side: sw.side,
                  shotType: sw.shotType,
                  speed: sw.speed || 1.15,
                  dirX: sw.angleX ?? sw.dirX ?? 0,
                  dirY: sw.dirY ?? -0.45,
                  pitch: sw.pitch,
                  roll: sw.roll
                });
              }
            }
          }

          if (p2?.lastSwing && typeof p2.lastSwing.seq === "number") {
            const seq = p2.lastSwing.seq;
            if (!this.p2PhonePollInitialized) {
              this.p2PhonePollInitialized = true;
              const age = Date.now() - Number(p2.lastSwing.serverTimeMs || 0);
              this.lastProcessedP2PhoneSeq = age < 1200 ? seq - 1 : seq;
            }
            if (seq > this.lastProcessedP2PhoneSeq) {
              this.lastProcessedP2PhoneSeq = seq;
              this.p2PhoneState.lastSwing = p2.lastSwing;
              const sw = p2.lastSwing;
              if (sw.type === "toss") {
                this._emitP2Toss({
                  source: "phone",
                  role: "p2",
                  side: sw.side,
                  shotType: sw.shotType || "lob",
                  speed: sw.speed || 1.1,
                  dirX: sw.angleX ?? sw.dirX ?? 0,
                  dirY: sw.dirY ?? -0.9,
                  pitch: sw.pitch,
                  roll: sw.roll
                });
              } else {
                this._emitP2Swing({
                  source: "phone",
                  role: "p2",
                  side: sw.side,
                  shotType: sw.shotType,
                  speed: sw.speed || 1.15,
                  dirX: sw.angleX ?? sw.dirX ?? 0,
                  dirY: sw.dirY ?? -0.45,
                  pitch: sw.pitch,
                  roll: sw.roll
                });
              }
            }
          }
        }
      } catch {}
    };
    poll();
    this.phonePollTimer = setInterval(poll, this.phonePollIntervalMs);
  }

  stopPhonePolling() {
    if (this.phonePollTimer) {
      clearInterval(this.phonePollTimer);
      this.phonePollTimer = null;
    }
  }

  triggerHapticFeedback({ kind = "hit", grade = "PERFECT", shotType = "TOPSPIN", speedKmh = 165, intensity = 1, role = null } = {}) {
    const targetRole = role || this.role || "p1";
    if (this.settings.hapticsEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        if (kind === "whiff" || kind === "fault") navigator.vibrate([18, 35, 18]);
        else if (intensity >= 1.25 || /PERFECT|POWER|SMASH/i.test(grade)) navigator.vibrate([45, 28, 65]);
        else navigator.vibrate([28]);
      } catch {}
    }
    fetch("/api/racket/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: this.roomId || "default",
        role: targetRole,
        kind,
        grade,
        shotType,
        speedKmh: Math.round(Number(speedKmh || 150)),
        intensity: Number(intensity || 1)
      })
    }).catch(() => {});
  }

  // --- PC Keyboard, Mouse & Screen Swipe ---
  _updateKeyboardMovement() {
    // If joystick is active, joystick takes priority for movement
    if (this.joystickState.active) return;

    let mx = 0;
    let mz = 0;

    // Left / Right (A / D or ArrowLeft / ArrowRight)
    if (this.keysDown.has("KeyA") || this.keysDown.has("ArrowLeft") || this.keysDown.has("KeyQ")) mx -= 1;
    if (this.keysDown.has("KeyD") || this.keysDown.has("ArrowRight") || this.keysDown.has("KeyE")) mx += 1;

    // Forward / Backward (W / S or ArrowUp / ArrowDown)
    // Forward to net = -Z in Three.js court coordinates
    if (this.keysDown.has("KeyW") || this.keysDown.has("ArrowUp")) mz -= 1;
    if (this.keysDown.has("KeyS") || this.keysDown.has("ArrowDown")) mz += 1;

    const len = Math.hypot(mx, mz);
    if (len > 1) {
      mx /= len;
      mz /= len;
    }

    this.moveInput.x = mx;
    this.moveInput.z = mz;

    if (mx !== 0) {
      this.aimBiasX = mx * 0.65;
    } else {
      this.aimBiasX = 0;
    }
  }

  _isModalOpen() {
    if (typeof document === "undefined") return false;
    const modalIds = ["title-modal", "firebase-lobby-modal", "controls-modal", "victory-modal", "companion-modal"];
    return modalIds.some((id) => {
      const el = document.getElementById(id);
      return el && !el.classList.contains("hidden") && el.style.display !== "none";
    });
  }

  _initDOMBindings() {
    this._onKeyDown = (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) return;
      if (this._isModalOpen()) return;
      const code = e.code;
      this.keysDown.add(code);

      // Movement & Aiming update
      this._updateKeyboardMovement();

      // Number keys 1-4 for shot types
      if (code === "Digit1") {
        this.setShotType("topspin");
        this._emitSwing({ source: "keyboard", shotType: "topspin", speed: 1.18, dirX: this.aimBiasX, dirY: -0.45 });
      } else if (code === "Digit2") {
        this.setShotType("slice");
        this._emitSwing({ source: "keyboard", shotType: "slice", speed: 1.05, dirX: this.aimBiasX, dirY: 0.45 });
      } else if (code === "Digit3") {
        this.setShotType("lob");
        this._emitSwing({ source: "keyboard", shotType: "lob", speed: 1.08, dirX: this.aimBiasX, dirY: -0.85 });
      } else if (code === "Digit4") {
        this.setShotType("smash");
        this._emitSwing({ source: "keyboard", shotType: "smash", speed: 1.48, dirX: this.aimBiasX, dirY: 0.65 });
      }
      // Action shortcut keys: J/Z (Topspin), K/X (Slice), L/C (Lob), I/V (Smash)
      else if (code === "KeyJ" || code === "KeyZ") {
        this.setShotType("topspin");
        this._emitSwing({ source: "keyboard", shotType: "topspin", speed: 1.2, dirX: this.aimBiasX, dirY: -0.45 });
      } else if (code === "KeyK" || code === "KeyX") {
        this.setShotType("slice");
        this._emitSwing({ source: "keyboard", shotType: "slice", speed: 1.08, dirX: this.aimBiasX, dirY: 0.45 });
      } else if (code === "KeyL") {
        this.setShotType("lob");
        this._emitSwing({ source: "keyboard", shotType: "lob", speed: 1.12, dirX: this.aimBiasX, dirY: -0.85 });
      } else if (code === "KeyI" || code === "KeyV") {
        this.setShotType("smash");
        this._emitSwing({ source: "keyboard", shotType: "smash", speed: 1.48, dirX: this.aimBiasX, dirY: 0.65 });
      }
      // Toss / Serve with W / T / ArrowUp
      else if (code === "KeyT") {
        this._emitToss({ source: "keyboard", shotType: "lob", speed: 1.1, dirX: this.aimBiasX, dirY: -0.9 });
      }
      // Universal Swing with Space or Enter
      else if (code === "Space" || code === "Enter") {
        e.preventDefault();
        this._emitSwing({ source: "keyboard", shotType: this.selectedShotType, speed: 1.22, dirX: this.aimBiasX, dirY: -0.45 });
      }
    };

    this._onKeyUp = (e) => {
      const code = e.code;
      this.keysDown.delete(code);
      this._updateKeyboardMovement();
    };

    // Mouse Right Click for Toss / Serve
    this._onContextMenu = (e) => {
      if (this._isModalOpen()) return;
      // If clicking inside game canvas or main viewport, prevent default menu and trigger toss!
      if (!e.target.closest("button, a, input, select, .wii-modal-backdrop, .hud-corner-dock")) {
        e.preventDefault();
        this._emitToss({ source: "mouse_right_click", dirX: this.aimBiasX, dirY: -0.9, speed: 1.1 });
      }
    };

    // Mouse Wheel to cycle shot types
    this._onWheel = (e) => {
      if (this._isModalOpen() || e.target.closest(".wii-modal-backdrop, .touch-gamepad-layer")) return;
      const shots = ["topspin", "slice", "lob", "smash"];
      const currIdx = shots.indexOf(this.selectedShotType);
      const nextIdx = e.deltaY > 0 ? (currIdx + 1) % shots.length : (currIdx - 1 + shots.length) % shots.length;
      this.setShotType(shots[nextIdx]);
    };

    // Pointer (Mouse / Touch Swipe) on court
    this._onPointerDown = (e) => {
      if (this._isModalOpen()) return;
      if (e.target && e.target.closest("button, a, input, select, .wii-modal-backdrop, .hud-interactive, .control-btn, .touch-gamepad-layer, .touch-shot-btn, .touch-action-btn, #touch-joystick-base")) {
        return;
      }
      this.pointerDrag = {
        startX: e.clientX,
        startY: e.clientY,
        startTime: performance.now(),
        lastX: e.clientX,
        lastY: e.clientY
      };
      this.mouseTrail = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    };

    this._onPointerMove = (e) => {
      if (!this.pointerDrag) return;
      this.pointerDrag.lastX = e.clientX;
      this.pointerDrag.lastY = e.clientY;
      this.mouseTrail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (this.mouseTrail.length > 20) this.mouseTrail.shift();
    };

    this._onPointerUp = (e) => {
      if (!this.pointerDrag) return;
      const drag = this.pointerDrag;
      this.pointerDrag = null;

      const clientX = e.clientX ?? drag.lastX;
      const clientY = e.clientY ?? drag.lastY;
      const dx = clientX - drag.startX;
      const dy = clientY - drag.startY;
      const dt = Math.max(16, performance.now() - drag.startTime);
      const dist = Math.hypot(dx, dy);

      // Tap on screen (distance < 18px): Quick Swing!
      if (dist < 18) {
        if (e.button === 2) return; // Right click handled by contextmenu
        this._emitSwing({
          source: "mouse_tap",
          shotType: this.selectedShotType,
          speed: 1.18,
          dirX: this.aimBiasX,
          dirY: -0.45
        });
        return;
      }

      // Drag / Flick gesture
      const speedNorm = dist / dt;
      const swingSpeed = Math.min(1.7, Math.max(0.85, 0.78 + speedNorm * 0.45));

      let side = null;
      if (dx > 14) side = "backhand";
      else if (dx < -14) side = "forehand";

      const dirX = Math.max(-1, Math.min(1, dx / 180));
      const finalDirX = side === "backhand" ? Math.max(0.2, dirX) : side === "forehand" ? Math.min(-0.2, dirX) : dirX;
      const dirY = Math.max(-1, Math.min(1, dy / 150));

      // Fast upward flick: Toss or Lob
      if (dy < -55 && Math.abs(dy) > Math.abs(dx) * 1.3) {
        this._emitToss({
          source: "mouse_flick",
          side,
          shotType: "lob",
          speed: swingSpeed,
          dirX: finalDirX,
          dirY: -0.9
        });
      } else {
        let shot = this.selectedShotType;
        if ((dy > 38 && swingSpeed > 1.22) || swingSpeed > 1.48) shot = "smash";
        else if (dy > 14) shot = "slice";
        else if (dy < -32) shot = "lob";

        this._emitSwing({
          source: "mouse_flick",
          side,
          shotType: shot,
          speed: swingSpeed,
          dirX: finalDirX,
          dirY
        });
      }
    };

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
    window.addEventListener("contextmenu", this._onContextMenu);
    window.addEventListener("wheel", this._onWheel, { passive: true });
    window.addEventListener("pointerdown", this._onPointerDown);
    window.addEventListener("pointermove", this._onPointerMove);
    window.addEventListener("pointerup", this._onPointerUp);
  }

  // --- HUD Canvas & Renders ---
  _startHudRenderLoop() {
    const loop = () => {
      if (this._disposed) return;
      if (this.webcamActive) this._processWebcamFrame();
      if (!this.webcamCanvas) {
        this.webcamCanvas = document.getElementById(this.webcamCanvasId);
        if (this.webcamCanvas) this.webcamCtx = this.webcamCanvas.getContext("2d");
      }
      if (this.webcamCanvas && this.webcamCtx) {
        this._drawHudCanvas(this.webcamCtx, this.webcamCanvas.width, this.webcamCanvas.height);
      }
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  _drawHudCanvas(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    if (this.webcamActive && this.videoElem && this.videoElem.readyState >= 2) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(this.videoElem, -w, 0, w, h);
      ctx.restore();

      const now = performance.now();
      if (this.latestHandLandmarks && (now - (this.latestHandSeenAt || 0) < 240)) {
        const lm = this.latestHandLandmarks;
        const conns = [
          [0,1],[1,2],[2,3],[3,4],
          [0,5],[5,6],[6,7],[7,8],
          [0,9],[9,10],[10,11],[11,12],
          [0,13],[13,14],[14,15],[15,16],
          [0,17],[17,18],[18,19],[19,20],
          [5,9],[9,13],[13,17]
        ];
        ctx.strokeStyle = "#00e436";
        ctx.lineWidth = 2;
        for (const [a, b] of conns) {
          const p1 = lm[a], p2 = lm[b];
          ctx.beginPath();
          ctx.moveTo((1 - p1.x) * w, p1.y * h);
          ctx.lineTo((1 - p2.x) * w, p2.y * h);
          ctx.stroke();
        }
        for (let i = 0; i < lm.length; i++) {
          const p = lm[i];
          ctx.fillStyle = (i === 0 || i === 8 || i === 9) ? "#dfff00" : "#ffffff";
          ctx.beginPath();
          ctx.arc((1 - p.x) * w, p.y * h, (i === 0 || i === 9) ? 3.5 : 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        const cw = w / this.flowWidth;
        const ch = h / this.flowHeight;
        ctx.fillStyle = "rgba(223, 255, 0, 0.35)";
        for (let r = 0; r < this.flowHeight; r += 2) {
          for (let c = 0; c < this.flowWidth; c += 2) {
            if (this.motionEnergyMap[r * this.flowWidth + c] > 0.14) {
              ctx.fillRect(c * cw, r * ch, cw * 1.8, ch * 1.8);
            }
          }
        }
      }
    } else {
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 6, w * 0.5, h * 0.5, w * 0.65);
      grad.addColorStop(0, "rgba(24, 68, 42, 0.92)");
      grad.addColorStop(1, "rgba(10, 24, 36, 0.96)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.5);
      ctx.lineTo(w, h * 0.5);
      ctx.moveTo(w * 0.5, 0);
      ctx.lineTo(w * 0.5, h);
      ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.32, 0, Math.PI * 2);
      ctx.stroke();
    }

    const elapsed = performance.now() - this.lastVisualSwing.timestamp;
    const isRecent = elapsed < 550;
    const cx = this.webcamActive ? this.smoothedCentroid.x * w : w * 0.5;
    const cy = this.webcamActive ? this.smoothedCentroid.y * h : h * 0.52;

    ctx.save();
    const rot = ((this.phoneState.orientation.roll || this.aimBiasX * 28) * Math.PI) / 180;
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = isRecent ? "#dfff00" : "#00c8ff";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(0, 28);
    ctx.stroke();
    ctx.restore();

    let vx = this.webcamActive ? this.motionVector.vx * 26 : 0;
    let vy = this.webcamActive ? this.motionVector.vy * 26 : 0;
    if (isRecent) {
      const decay = 1 - elapsed / 550;
      vx = this.lastVisualSwing.dirX * 36 * decay;
      vy = this.lastVisualSwing.dirY * 32 * decay;
    }
    if (Math.hypot(vx, vy) > 3) {
      const tx = cx + vx;
      const ty = cy + vy;
      const ang = Math.atan2(vy, vx);
      ctx.save();
      ctx.strokeStyle = "#dfff00";
      ctx.fillStyle = "#dfff00";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - 7 * Math.cos(ang - 0.5), ty - 7 * Math.sin(ang - 0.5));
      ctx.lineTo(tx - 7 * Math.cos(ang + 0.5), ty - 7 * Math.sin(ang + 0.5));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    const magNorm = isRecent
      ? Math.min(1, (this.lastVisualSwing.speed / 1.6) * (1 - elapsed / 650))
      : Math.min(1, this.motionVector.mag / 1.4);
    const barH = 5;
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(6, h - barH - 5, w - 12, barH);
    ctx.fillStyle = magNorm > 0.75 ? "#dfff00" : "#00d2ff";
    ctx.fillRect(6, h - barH - 5, (w - 12) * magNorm, barH);

    ctx.fillStyle = isRecent ? "#dfff00" : "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 9px sans-serif";
    let statusLabel = this.webcamActive
      ? "CAM OPTICAL FLOW"
      : this.deviceMotionActive
      ? "PHONE GYRO ACTIVE"
      : this.phoneState.connected
      ? "POCKET RACKET LIVE"
      : "MOTION RADAR";

    if (isRecent) {
      const sidePrefix = this.lastVisualSwing.side === "backhand" ? "BH" : this.lastVisualSwing.side === "forehand" ? "FH" : "";
      const shotLabel = (this.lastVisualSwing.shotType || "topspin").toUpperCase();
      statusLabel = sidePrefix ? `${sidePrefix} • ${shotLabel}` : shotLabel;
    }
    ctx.fillText(statusLabel, 6, 12);
  }

  _updateWebcamBadgeUI(active) {
    const b = document.getElementById("webcam-status-badge") || document.getElementById("btn-webcam");
    if (b) b.classList.toggle("active", active);
  }

  _updatePhoneBadgeUI(connected) {
    const b = document.getElementById("phone-status-badge") || document.getElementById("phone-racket-status");
    if (b) {
      b.classList.toggle("connected", connected);
      b.textContent = connected ? "Pocket Racket: Connected" : "Pocket Racket: Ready";
    }
  }

  _updateHudShotPills(shotType) {
    if (typeof document === "undefined") return;
    const pills = document.querySelectorAll("[data-shot-type]");
    if (!pills || pills.length === 0) return;
    pills.forEach(p => {
      p.classList.toggle("active", p.dataset.shotType === shotType);
    });
  }

  _notifyStatus(status) {
    if (typeof this.onStatusChange === "function") this.onStatusChange(status);
    for (const h of this._listeners.status) {
      try { h(status); } catch (e) { console.error(e); }
    }
  }

  dispose() {
    this._disposed = true;
    this.disableWebcam();
    this.disableDeviceMotion();
    this.stopPhonePolling();
    if (this._rafId) cancelAnimationFrame(this._rafId);
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    window.removeEventListener("contextmenu", this._onContextMenu);
    window.removeEventListener("wheel", this._onWheel);
    window.removeEventListener("pointerdown", this._onPointerDown);
    window.removeEventListener("pointermove", this._onPointerMove);
    window.removeEventListener("pointerup", this._onPointerUp);
  }
}

export default MotionController;
