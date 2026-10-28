export const LYRIA_TRACKS = {
  menu_theme: {
    id: "menu_theme",
    title: "Argon Club Plaza Breeze (Lyria 3)",
    subtitle: "Title & Club Select Theme",
    src: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/menu_theme.mp3",
    loop: true,
    baseVolume: 0.42
  },
  court_intro: {
    id: "court_intro",
    title: "Center Court Flyover (Lyria 3)",
    subtitle: "Stadium Intro Fanfare",
    src: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/court_intro.mp3",
    loop: false,
    baseVolume: 0.48
  },
  match_rally: {
    id: "match_rally",
    title: "Sunny Baseline Rally (Lyria 3)",
    subtitle: "Active Match Atmosphere",
    src: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/match_rally.mp3",
    loop: true,
    baseVolume: 0.34
  },
  victory_fanfare: {
    id: "victory_fanfare",
    title: "Grand Slam Trophy (Lyria 3)",
    subtitle: "Match Victory Celebration",
    src: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/victory_fanfare.mp3",
    loop: false,
    baseVolume: 0.5
  }
};

const STATE_TO_TRACK = {
  title: "menu_theme",
  menu: "menu_theme",
  select: "menu_theme",
  intro: "court_intro",
  court_intro: "court_intro",
  flyover: "court_intro",
  start: "court_intro",
  serve: "match_rally",
  serve_wait: "match_rally",
  serve_toss: "match_rally",
  rally: "match_rally",
  playing: "match_rally",
  match: "match_rally",
  point: "match_rally",
  gamepoint: "match_rally",
  replay: "match_rally",
  victory: "victory_fanfare",
  win: "victory_fanfare",
  game_won: "victory_fanfare",
  match_over: "victory_fanfare",
  celebration: "victory_fanfare",
  menu_theme: "menu_theme",
  match_rally: "match_rally",
  victory_fanfare: "victory_fanfare"
};

export const GEMINI_TTS_CLIPS = {
  start: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/match_start.mp3",
  match_start: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/match_start.mp3",
  "game point": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/game_point.mp3",
  game_point: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/game_point.mp3",
  "break point": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/break_point.mp3",
  break_point: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/break_point.mp3",
  "match point": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/match_point.mp3",
  match_point: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/match_point.mp3",
  game: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/game_won.mp3",
  "game!": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/game_won.mp3",
  game_won: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/game_won.mp3",
  "game set and match": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/game_set_match.mp3",
  game_set_match: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/game_set_match.mp3",
  out: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_out.mp3",
  call_out: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_out.mp3",
  net: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_net.mp3",
  call_net: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_net.mp3",
  "nice shot!": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_nice_shot.mp3",
  "nice shot": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_nice_shot.mp3",
  call_nice_shot: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_nice_shot.mp3",
  "power serve": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_power_serve.mp3",
  "power serve!": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_power_serve.mp3",
  call_power_serve: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_power_serve.mp3",
  smash: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_power_smash.mp3",
  call_power_smash: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_power_smash.mp3",
  replay: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_replay.mp3",
  call_replay: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/call_replay.mp3",
  "15 - 00": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_15_00.mp3",
  "30 - 00": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_30_00.mp3",
  "40 - 00": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_40_00.mp3",
  "00 - 15": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_00_15.mp3",
  "00 - 30": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_00_30.mp3",
  "00 - 40": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_00_40.mp3",
  "15 - 15": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_15_15.mp3",
  "30 - 15": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_30_15.mp3",
  "40 - 15": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_40_15.mp3",
  "15 - 30": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_15_30.mp3",
  "30 - 30": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_30_30.mp3",
  "40 - 30": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_40_30.mp3",
  "15 - 40": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_15_40.mp3",
  "30 - 40": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_30_40.mp3",
  deuce: "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_deuce.mp3",
  "ad in": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_ad_in.mp3",
  "ad out": "https://www.gstatic.com/aistudio/starter-apps/tennis/audio/tts/score_ad_out.mp3"
};

export class AudioEngine {
  constructor(options = {}) {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.reverbSend = null;
    this.muted = Boolean(options.muted ?? false);
    this.musicVolume = Number(options.musicVolume ?? 0.65);
    this.sfxVolume = Number(options.sfxVolume ?? 0.85);
    this.audioElements = new Map();
    this.ttsAudioElements = new Map();
    this._activeVoiceAudio = null;
    this._voiceTimers = [];
    this.currentTrackId = null;
    this.desiredTrackId = "menu_theme";
    this.unlocked = false;
    this.onTrackChange = typeof options.onTrackChange === "function" ? options.onTrackChange : null;
    this._noiseBuffer = null;
    this._pinkNoiseBuffer = null;
    this._fadeTimers = new Map();
    this._lastHoverSoundAt = 0;

    this._preloadTracks();
    this._preloadTtsClips();
    this._attachAutoplayUnlock();
    this._attachGlobalUiSoundListeners();
  }

  _preloadTracks() {
    for (const [key, track] of Object.entries(LYRIA_TRACKS)) {
      const audio = new Audio();
      audio.src = track.src;
      audio.loop = track.loop;
      audio.preload = "auto";
      audio.volume = 0;
      audio.crossOrigin = "anonymous";
      if (key === "court_intro") {
        audio.addEventListener("ended", () => {
          if (this.currentTrackId === "court_intro") {
            this.playMusicForState("rally");
          }
        });
      }
      this.audioElements.set(key, audio);
    }
  }

  _preloadTtsClips() {
    const urls = new Set(Object.values(GEMINI_TTS_CLIPS));
    for (const url of urls) {
      const audio = new Audio();
      audio.src = url;
      audio.preload = "auto";
      audio.volume = Math.min(1, this.sfxVolume);
      this.ttsAudioElements.set(url, audio);
    }
  }

  _attachAutoplayUnlock() {
    const unlockHandler = () => {
      this.unlock();
    };
    window.addEventListener("pointerdown", unlockHandler, { passive: true });
    window.addEventListener("keydown", unlockHandler, { passive: true });
    window.addEventListener("touchstart", unlockHandler, { passive: true });
  }

  _attachGlobalUiSoundListeners() {
    if (typeof document === "undefined") return;

    // Global delegated click sound for buttons across the entire game
    document.addEventListener(
      "pointerdown",
      (e) => {
        if (this.muted) return;
        const btn = e.target?.closest?.(
          "button, [role='button'], .wii-btn, .mode-card, .camera-pill, .shot-btn"
        );
        if (!btn || btn.disabled) return;
        // Skip if button has its own specialized shop sound handler
        if (
          btn.hasAttribute("data-upgrade-stat") ||
          btn.hasAttribute("data-upgrade-skill") ||
          btn.hasAttribute("data-upgrade-partner-ai") ||
          btn.hasAttribute("data-char-action") ||
          btn.hasAttribute("data-outfit-action") ||
          btn.hasAttribute("data-racket-action") ||
          btn.hasAttribute("data-acc-action") ||
          btn.hasAttribute("data-vfx-action") ||
          btn.id === "btn-shop-claim-coins"
        ) {
          return;
        }

        if (btn.hasAttribute("data-shop-tab") || btn.hasAttribute("data-loadout-slot")) {
          this.playUiClick("tab");
        } else if (btn.hasAttribute("data-shop-unit")) {
          this.playUiClick("unit");
        } else if (btn.hasAttribute("data-shop-pose") || btn.id === "btn-shop-cam-zoom") {
          this.playUiClick("camera");
        } else {
          this.playUiClick("default");
        }
      },
      { passive: true }
    );

    // Subtle hover tick on desktop pointer devices
    document.addEventListener(
      "pointerover",
      (e) => {
        if (this.muted || e.pointerType === "touch") return;
        const target = e.target?.closest?.(
          "button:not(:disabled), .shop-item-card, .upgrade-stat-row, .loadout-slot-btn"
        );
        if (!target) return;
        const related = e.relatedTarget;
        if (related && target.contains(related)) return;
        const now = performance.now();
        if (now - this._lastHoverSoundAt < 55) return;
        this._lastHoverSoundAt = now;
        this.playUiHover();
      },
      { passive: true }
    );
  }

  _ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      const delay = this.ctx.createDelay(0.5);
      delay.delayTime.value = 0.095;
      const feedback = this.ctx.createGain();
      feedback.gain.value = 0.24;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 3200;

      this.reverbSend = this.ctx.createGain();
      this.reverbSend.gain.value = 0.22;
      this.reverbSend.connect(delay);
      delay.connect(filter);
      filter.connect(feedback);
      feedback.connect(delay);
      filter.connect(this.masterGain);

      this._buildNoiseBuffers();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  _buildNoiseBuffers() {
    if (!this.ctx) return;
    const sr = this.ctx.sampleRate;
    const len = sr * 2;
    this._noiseBuffer = this.ctx.createBuffer(1, len, sr);
    const white = this._noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      white[i] = Math.random() * 2 - 1;
    }

    this._pinkNoiseBuffer = this.ctx.createBuffer(1, len, sr);
    const pink = this._pinkNoiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      pink[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.045;
      b6 = w * 0.115926;
    }
  }

  unlock() {
    this._ensureContext();
    this.unlocked = true;
    if (this.desiredTrackId && !this.muted) {
      const currentAudio = this.audioElements.get(this.currentTrackId || this.desiredTrackId);
      if (!currentAudio || currentAudio.paused) {
        this._crossfadeToTrack(this.desiredTrackId);
      }
    }
  }

  playMusicForState(stateName) {
    const key = String(stateName || "rally").toLowerCase().trim();
    const targetTrack = STATE_TO_TRACK[key] || "match_rally";
    this.desiredTrackId = targetTrack;
    if (this.currentTrackId === targetTrack) {
      const audio = this.audioElements.get(targetTrack);
      if (audio && audio.paused && !this.muted) {
        audio.play().catch(() => {});
      }
      return this.getCurrentTrackInfo();
    }
    this._crossfadeToTrack(targetTrack);
    return this.getCurrentTrackInfo();
  }

  _crossfadeToTrack(nextTrackId) {
    const prevTrackId = this.currentTrackId;
    this.currentTrackId = nextTrackId;
    if (prevTrackId && prevTrackId !== nextTrackId) {
      const prevAudio = this.audioElements.get(prevTrackId);
      if (prevAudio) this._fadeAudio(prevAudio, 0, 420, true);
    }
    const nextAudio = this.audioElements.get(nextTrackId);
    const meta = LYRIA_TRACKS[nextTrackId];
    if (nextAudio && meta) {
      const targetVol = this.muted ? 0 : Math.min(1, meta.baseVolume * this.musicVolume);
      if (!meta.loop) {
        try {
          nextAudio.currentTime = 0;
        } catch {}
      }
      nextAudio
        .play()
        .then(() => {
          this._fadeAudio(nextAudio, targetVol, 480, false);
        })
        .catch(() => {});
    }
    const info = this.getCurrentTrackInfo();
    this._updateHudMusicBadge(info);
    if (typeof this.onTrackChange === "function") {
      this.onTrackChange(info);
    }
  }

  _fadeAudio(audioEl, targetVol, durationMs, pauseOnZero = false) {
    if (this._fadeTimers.has(audioEl)) {
      clearInterval(this._fadeTimers.get(audioEl));
    }
    const steps = 12;
    const stepMs = Math.max(16, Math.floor(durationMs / steps));
    const startVol = audioEl.volume;
    let count = 0;
    const timer = setInterval(() => {
      count++;
      const t = count / steps;
      audioEl.volume = Math.max(0, Math.min(1, startVol + (targetVol - startVol) * t));
      if (count >= steps) {
        clearInterval(timer);
        this._fadeTimers.delete(audioEl);
        audioEl.volume = Math.max(0, Math.min(1, targetVol));
        if (pauseOnZero && targetVol <= 0.001) {
          audioEl.pause();
        }
      }
    }, stepMs);
    this._fadeTimers.set(audioEl, timer);
  }

  getCurrentTrackInfo() {
    const id = this.currentTrackId || this.desiredTrackId || "menu_theme";
    return {
      ...(LYRIA_TRACKS[id] || LYRIA_TRACKS.menu_theme),
      muted: this.muted,
      musicVolume: this.musicVolume
    };
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);
    }
    const activeId = this.currentTrackId || this.desiredTrackId;
    const audio = this.audioElements.get(activeId);
    const meta = LYRIA_TRACKS[activeId];
    if (audio && meta) {
      if (this.muted) {
        audio.volume = 0;
      } else {
        audio.volume = Math.min(1, meta.baseVolume * this.musicVolume);
        if (audio.paused) audio.play().catch(() => {});
      }
    }
    this._updateHudMusicBadge(this.getCurrentTrackInfo());
    return this.muted;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, Number(vol)));
    if (!this.muted && this.currentTrackId) {
      const audio = this.audioElements.get(this.currentTrackId);
      const meta = LYRIA_TRACKS[this.currentTrackId];
      if (audio && meta) {
        audio.volume = Math.min(1, meta.baseVolume * this.musicVolume);
      }
    }
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, Number(vol)));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  _updateHudMusicBadge(info) {
    const el = document.getElementById("hud-music-title") || document.getElementById("music-track-label");
    if (el && info) {
      el.textContent = info.muted ? `Tắt tiếng: ${info.title}` : `♪ ${info.title}`;
    }
  }

  playSwingWhoosh(intensity = 1) {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx || !this._pinkNoiseBuffer) return;
    const now = ctx.currentTime;
    const mult = Math.max(0.6, Math.min(1.8, Number(intensity || 1)));
    const dur = 0.16;
    const src = ctx.createBufferSource();
    src.buffer = this._pinkNoiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(1.6, now);
    filter.frequency.setValueAtTime(320 * mult, now);
    filter.frequency.exponentialRampToValueAtTime(1380 * mult, now + dur * 0.55);
    filter.frequency.exponentialRampToValueAtTime(420, now + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11 * Math.min(1.2, mult), now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(filter).connect(gain).connect(this.sfxGain);
    src.start(now, Math.random() * 0.5, dur + 0.02);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(175 * mult, now);
    osc.frequency.exponentialRampToValueAtTime(92, now + dur);
    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(0.055, now + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(oscGain).connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  }

  playRacketHit(shotType = "topspin", timing = "good") {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx || !this._noiseBuffer) return;
    const now = ctx.currentTime;
    const type = String(shotType || "topspin").toLowerCase();
    const isSmash = type === "smash" || type === "power_smash";
    const isSweet = timing === "perfect" || timing === "sweet_spot" || isSmash;

    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(type === "slice" ? 3600 : 2450, now);
    filter.Q.setValueAtTime(1.75, now);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.001, now);
    nGain.gain.linearRampToValueAtTime(isSmash ? 0.14 : 0.1, now + 0.004);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
    src.connect(filter).connect(nGain).connect(this.sfxGain);
    src.start(now, Math.random() * 0.5, 0.035);

    let fStart = 320, fEnd = 132, dur = 0.14;
    if (type === "slice") {
      fStart = 460;
      fEnd = 185;
      dur = 0.16;
    } else if (type === "lob") {
      fStart = 250;
      fEnd = 165;
      dur = 0.19;
    } else if (isSmash) {
      fStart = 395;
      fEnd = 98;
      dur = 0.21;
    }

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = "triangle";
    osc2.type = "sine";
    osc2.detune.setValueAtTime(12, now);
    osc1.frequency.setValueAtTime(fStart, now);
    osc1.frequency.exponentialRampToValueAtTime(fEnd, now + dur);
    osc2.frequency.setValueAtTime(fStart * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(fEnd, now + dur * 0.85);

    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.001, now);
    bodyGain.gain.linearRampToValueAtTime(isSmash ? 0.13 : 0.095, now + 0.006);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc1.connect(bodyGain);
    osc2.connect(bodyGain);
    bodyGain.connect(this.sfxGain);
    if (this.reverbSend) bodyGain.connect(this.reverbSend);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.01);
    osc2.stop(now + dur + 0.01);

    if (isSweet) {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const t0 = now + idx * 0.026;
        const c1 = ctx.createOscillator();
        const c2 = ctx.createOscillator();
        c1.type = "sine";
        c2.type = "triangle";
        c2.detune.setValueAtTime(10, t0);
        c1.frequency.setValueAtTime(freq, t0);
        c2.frequency.setValueAtTime(freq, t0);
        const cg = ctx.createGain();
        cg.gain.setValueAtTime(0.001, t0);
        cg.gain.linearRampToValueAtTime(0.048, t0 + 0.006);
        cg.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.24);
        c1.connect(cg);
        c2.connect(cg);
        cg.connect(this.sfxGain);
        if (this.reverbSend) cg.connect(this.reverbSend);
        c1.start(t0);
        c2.start(t0);
        c1.stop(t0 + 0.25);
        c2.stop(t0 + 0.25);
      });
    }
  }

  playBallBounce(intensity = 1) {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const mult = Math.max(0.4, Math.min(1.2, Number(intensity || 1)));
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.095);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11 * mult, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.11);

    if (this._pinkNoiseBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = this._pinkNoiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(950, now);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.001, now);
      nGain.gain.linearRampToValueAtTime(0.045 * mult, now + 0.004);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      src.connect(filter).connect(nGain).connect(this.sfxGain);
      src.start(now, Math.random() * 0.4, 0.05);
    }
  }

  playNetCord() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(98, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.13);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(360, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(filter).connect(gain).connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playServeToss() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 0.22;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = "sine";
    osc2.type = "sine";
    osc2.detune.setValueAtTime(9, now);
    osc1.frequency.setValueAtTime(290, now);
    osc1.frequency.exponentialRampToValueAtTime(680, now + dur);
    osc2.frequency.setValueAtTime(290, now);
    osc2.frequency.exponentialRampToValueAtTime(680, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.075, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.01);
    osc2.stop(now + dur + 0.01);
  }

  playCrowdReaction(type = "cheer") {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx || !this._pinkNoiseBuffer) return;
    const now = ctx.currentTime;
    const kind = String(type || "cheer").toLowerCase();
    if (kind === "gasp" || kind === "ooh") {
      const src = ctx.createBufferSource();
      src.buffer = this._pinkNoiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.setValueAtTime(2.4, now);
      filter.frequency.setValueAtTime(720, now);
      filter.frequency.exponentialRampToValueAtTime(410, now + 0.55);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      src.connect(filter).connect(gain).connect(this.sfxGain);
      if (this.reverbSend) gain.connect(this.reverbSend);
      src.start(now, 0, 0.6);
      return;
    }

    const dur = kind === "polite_clap" ? 0.85 : 1.35;
    const src = ctx.createBufferSource();
    src.buffer = this._pinkNoiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(1.1, now);
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(1250, now + dur * 0.35);
    filter.frequency.exponentialRampToValueAtTime(780, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(kind === "polite_clap" ? 0.075 : 0.115, now + 0.14);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(filter).connect(gain).connect(this.sfxGain);
    if (this.reverbSend) gain.connect(this.reverbSend);
    src.start(now, 0, dur + 0.05);
  }

  announceScore(text, { delayMs = 0, playChime = true } = {}) {
    if (this.muted || !text) return;
    const clean = String(text).trim();
    const ctx = this._ensureContext();
    if (ctx && playChime) {
      const t0 = ctx.currentTime + delayMs / 1000;
      const notes = /game|match|deuce|win|nice|power|smash/i.test(clean)
        ? [587.33, 739.99, 880]
        : [523.25, 659.25];
      notes.forEach((freq, idx) => {
        const start = t0 + idx * 0.065;
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        o1.type = "sine";
        o2.type = "triangle";
        o2.detune.setValueAtTime(10, start);
        o1.frequency.setValueAtTime(freq, start);
        o2.frequency.setValueAtTime(freq, start);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.001, start);
        g.gain.linearRampToValueAtTime(0.055, start + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0008, start + 0.24);
        o1.connect(g);
        o2.connect(g);
        g.connect(this.sfxGain);
        if (this.reverbSend) g.connect(this.reverbSend);
        o1.start(start);
        o2.start(start);
        o1.stop(start + 0.26);
        o2.stop(start + 0.26);
      });
    }
    this.playVoiceCallout(clean, { delayMs, clearQueue: delayMs === 0 });
  }

  playVoiceCallout(text, { delayMs = 0, clearQueue = false } = {}) {
    if (this.muted || !text) return;
    const key = String(text).trim().toLowerCase();
    const clipUrl = GEMINI_TTS_CLIPS[key];
    if (clearQueue && this._voiceTimers.length > 0) {
      this._voiceTimers.forEach((t) => clearTimeout(t));
      this._voiceTimers = [];
    }
    const trigger = () => {
      if (this.muted) return;
      if (clipUrl) {
        try {
          if (this._activeVoiceAudio && !this._activeVoiceAudio.paused) {
            this._activeVoiceAudio.pause();
            this._activeVoiceAudio.currentTime = 0;
          }
          let audio = this.ttsAudioElements.get(clipUrl);
          if (!audio) {
            audio = new Audio(clipUrl);
            this.ttsAudioElements.set(clipUrl, audio);
          }
          audio.currentTime = 0;
          audio.volume = Math.min(1, this.sfxVolume * 0.98);
          this._activeVoiceAudio = audio;
          audio.play().catch(() => {});
          return;
        } catch {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
          const spoken = String(text)
            .replace(/\b00\b/g, "Love")
            .replace(/\s*-\s*/g, " ")
            .replace(/!/g, "");
          const utter = new SpeechSynthesisUtterance(spoken);
          utter.rate = 1.06;
          utter.pitch = 1.04;
          utter.volume = Math.min(1, this.sfxVolume * 0.9);
          window.speechSynthesis.speak(utter);
        } catch {}
      }
    };
    if (delayMs > 0) {
      const timer = setTimeout(trigger, delayMs);
      this._voiceTimers.push(timer);
    } else {
      trigger();
    }
  }

  /* =====================================================================
     PRO GAME UI & SHOP SYNTHESIZER SOUND EFFECTS (WEB AUDIO API)
     ===================================================================== */

  playUiHover() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1420, now);
    osc.frequency.exponentialRampToValueAtTime(1880, now + 0.018);
    gain.gain.setValueAtTime(0.0005, now);
    gain.gain.linearRampToValueAtTime(0.016, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.02);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.022);
  }

  playUiClick(variant = "default") {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    let fStart = 640;
    let fEnd = 920;
    let dur = 0.048;
    let wave = "triangle";

    if (variant === "tab") {
      fStart = 520;
      fEnd = 780;
      dur = 0.055;
      wave = "sine";
    } else if (variant === "unit") {
      fStart = 440;
      fEnd = 880;
      dur = 0.065;
      wave = "triangle";
    } else if (variant === "camera") {
      fStart = 760;
      fEnd = 1140;
      dur = 0.045;
      wave = "sine";
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(fStart, now);
    osc.frequency.exponentialRampToValueAtTime(fEnd, now + dur);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + dur + 0.008);
  }

  playShopOpen() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Broadcast studio chime + subtle air whoosh
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const t0 = now + idx * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.045, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.26);
      osc.connect(gain).connect(this.sfxGain);
      if (this.reverbSend) gain.connect(this.reverbSend);
      osc.start(t0);
      osc.stop(t0 + 0.28);
    });
  }

  playShopClose() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [659.25, 880].forEach((freq, idx) => {
      const t0 = now + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.05, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.18);
      osc.connect(gain).connect(this.sfxGain);
      osc.start(t0);
      osc.stop(t0 + 0.2);
    });
  }

  playCoinClaim() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Shimmering gold coin cascade (B5 -> E6 -> G#6 -> B6)
    [987.77, 1318.51, 1661.22, 1975.53].forEach((freq, idx) => {
      const t0 = now + idx * 0.052;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = "sine";
      osc2.type = "triangle";
      osc2.detune.setValueAtTime(14, t0);
      osc1.frequency.setValueAtTime(freq, t0);
      osc2.frequency.setValueAtTime(freq * 2, t0);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.065, t0 + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.32);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);
      if (this.reverbSend) gain.connect(this.reverbSend);
      osc1.start(t0);
      osc2.start(t0);
      osc1.stop(t0 + 0.34);
      osc2.stop(t0 + 0.34);
    });
  }

  playStatUpgrade(level = 1) {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const lvFactor = 1 + Math.min(10, Math.max(1, level)) * 0.045;
    const baseNotes = [392.0, 493.88, 587.33, 783.99];
    baseNotes.forEach((freq, idx) => {
      const t0 = now + idx * 0.042;
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      osc.type = "sawtooth";
      sub.type = "sine";
      osc.frequency.setValueAtTime(freq * lvFactor, t0);
      sub.frequency.setValueAtTime(freq * 0.5 * lvFactor, t0);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2600, t0);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.055, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.22);

      osc.connect(filter).connect(gain);
      sub.connect(gain);
      gain.connect(this.sfxGain);
      if (this.reverbSend) gain.connect(this.reverbSend);
      osc.start(t0);
      sub.start(t0);
      osc.stop(t0 + 0.24);
      sub.stop(t0 + 0.24);
    });
  }

  playItemUnlock() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Grand Slam Pro Unlock Fanfare (C5 -> E5 -> G5 -> B5 -> C6)
    [523.25, 659.25, 783.99, 987.77, 1046.5].forEach((freq, idx) => {
      const t0 = now + idx * 0.058;
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      o1.type = "triangle";
      o2.type = "sine";
      o2.detune.setValueAtTime(12, t0);
      o1.frequency.setValueAtTime(freq, t0);
      o2.frequency.setValueAtTime(freq * 1.5, t0);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(idx === 4 ? 0.08 : 0.058, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0008, t0 + (idx === 4 ? 0.48 : 0.28));
      o1.connect(gain);
      o2.connect(gain);
      gain.connect(this.sfxGain);
      if (this.reverbSend) gain.connect(this.reverbSend);
      o1.start(t0);
      o2.start(t0);
      o1.stop(t0 + 0.5);
      o2.stop(t0 + 0.5);
    });
  }

  playItemEquip() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Crisp lock-in mechanical double-click + harmonic confirmation
    [360, 720].forEach((freq, idx) => {
      const t0 = now + idx * 0.038;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t0);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, t0 + 0.055);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.06, t0 + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.07);
      osc.connect(gain).connect(this.sfxGain);
      osc.start(t0);
      osc.stop(t0 + 0.075);
    });
  }

  playErrorBuzz() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [155, 122].forEach((freq, idx) => {
      const t0 = now + idx * 0.085;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t0);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(480, t0);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.06, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.075);
      osc.connect(filter).connect(gain).connect(this.sfxGain);
      osc.start(t0);
      osc.stop(t0 + 0.08);
    });
  }

  playBroadcastReplayWipeSfx() {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Cinematic Broadcast Swoosh (White Noise Bandpass Sweep)
    if (this._noiseBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = this._noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.setValueAtTime(1.8, now);
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.22);
      filter.frequency.exponentialRampToValueAtTime(340, now + 0.52);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.001, now);
      nGain.gain.linearRampToValueAtTime(0.14, now + 0.14);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.54);
      src.connect(filter).connect(nGain).connect(this.sfxGain);
      if (this.reverbSend) nGain.connect(this.reverbSend);
      src.start(now, 0, 0.56);
    }

    // 2. TV Sports Broadcast Stinger Brass/Synth Fanfare (D4 -> A4 -> D5 -> F#5 -> A5)
    const stingerNotes = [293.66, 440.0, 587.33, 739.99, 880.0];
    stingerNotes.forEach((freq, idx) => {
      const t0 = now + 0.05 + idx * 0.042;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc2.type = "triangle";
      osc2.detune.setValueAtTime(12, t0);
      osc1.frequency.setValueAtTime(freq, t0);
      osc2.frequency.setValueAtTime(freq * 0.5, t0);

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(3200, t0);
      lp.frequency.exponentialRampToValueAtTime(1200, t0 + 0.45);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(idx === 4 ? 0.085 : 0.055, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0008, t0 + (idx === 4 ? 0.55 : 0.34));

      osc1.connect(lp).connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);
      if (this.reverbSend) gain.connect(this.reverbSend);
      osc1.start(t0);
      osc2.start(t0);
      osc1.stop(t0 + 0.58);
      osc2.stop(t0 + 0.58);
    });
  }

  playBroadcastReplayStinger({
    winner = "player",
    scorerName = "Đội Bạn",
    shotType = "SMASH",
    speedKmh = 185,
    scoreText = "15 - 00",
    reason = "Nice Shot!"
  } = {}) {
    if (this.muted) return;

    // 1. Play Broadcast Logo Wipe Swoosh + Stinger Chime
    this.playBroadcastReplayWipeSfx();

    // 2. Play Umpire / Broadcast "Replay!" preloaded voice clip immediately
    this.playVoiceCallout("replay", { delayMs: 90, clearQueue: true });

    // 3. Speak excited TV Football / Sports Commentator Voice Callout
    if (this._replaySpeechTimer) {
      clearTimeout(this._replaySpeechTimer);
      this._replaySpeechTimer = null;
    }

    this._replaySpeechTimer = setTimeout(() => {
      if (this.muted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
        const viVoice = voices.find((v) => /vi(-|_)?vn|vietnam/i.test(`${v.lang} ${v.name}`));
        const enVoice =
          voices.find((v) => /en(-|_)?(gb|us|au)/i.test(v.lang) && /male|google|natural|daniel|david/i.test(v.name)) ||
          voices.find((v) => /^en/i.test(v.lang));

        const isPlayerGoal = winner === "player";
        let speechText = "";
        if (viVoice) {
          speechText = isPlayerGoal
            ? `Vàooo! Ghi điểm tuyệt đẹp cho ${scorerName}! Cú đánh ${shotType} tốc độ ${speedKmh} ki lô mét trên giờ! Hãy cùng xem lại pha quay chậm!`
            : `Điểm số cho ${scorerName}! Hãy cùng xem lại tình huống ghi điểm vừa rồi!`;
        } else {
          const cleanShot = String(shotType || "power shot").toLowerCase();
          speechText = isPlayerGoal
            ? `Instant Replay! What a spectacular ${cleanShot} winner at ${speedKmh} kilometers per hour! Score is ${String(scoreText).replace(/\b00\b/g, "Love")}!`
            : `Instant Replay! Let's take another look at that winning point!`;
        }

        const utter = new SpeechSynthesisUtterance(speechText);
        if (viVoice) {
          utter.voice = viVoice;
          utter.lang = "vi-VN";
          utter.rate = 1.12;
          utter.pitch = 1.08;
        } else if (enVoice) {
          utter.voice = enVoice;
          utter.lang = enVoice.lang || "en-US";
          utter.rate = 1.08;
          utter.pitch = 1.05;
        }
        utter.volume = Math.min(1, this.sfxVolume * 0.98);
        window.speechSynthesis.speak(utter);
      } catch {}
    }, 620);
  }

  stopReplayCommentary() {
    if (this._replaySpeechTimer) {
      clearTimeout(this._replaySpeechTimer);
      this._replaySpeechTimer = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export default AudioEngine;

