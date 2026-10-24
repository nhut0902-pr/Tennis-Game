import { registerSW } from "virtual:pwa-register";

export interface PWAOfflineStatus {
  isOnline: boolean;
  isStandalone: boolean;
  canPromptInstall: boolean;
  isIOS: boolean;
}

type StatusListener = (status: PWAOfflineStatus) => void;

const CRITICAL_OFFLINE_ASSETS = [
  "./assets/models/stadium_court.glb?v=argon4_kinetic",
  "./assets/models/tennis_net.glb?v=argon4_kinetic",
  "./assets/models/mii_player.glb?v=argon4_kinetic",
  "./assets/models/mii_opponent.glb?v=argon4_kinetic",
  "./assets/models/tennis_racket.glb?v=argon4_kinetic",
  "./assets/models/tennis_ball.glb?v=argon4_kinetic",
  "./assets/models/mii_crowd.glb?v=argon4_kinetic",
  "./assets/textures/court/tns_sky_a.png",
  "./assets/textures/court/cloud01.png",
  "./assets/textures/court/cloud02.png",
  "./assets/textures/court/tns_BG_c1.png"
];

class PWAOfflineManager {
  private deferredPrompt: any = null;
  private isOnline: boolean = typeof navigator !== "undefined" ? navigator.onLine !== false : true;
  private isStandalone: boolean = false;
  private isIOS: boolean = false;
  private listeners = new Set<StatusListener>();
  private initialized = false;

  init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    this.isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    const ua = window.navigator.userAgent || "";
    this.isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

    // Register Service Worker for offline play & asset caching
    try {
      registerSW({
        immediate: true,
        onOfflineReady() {
          console.info("[ArgonTennis PWA] Đã lưu bộ nhớ đệm. Sẵn sàng chơi Offline không cần mạng.");
        },
        onRegisteredSW() {
          // Warm up 3D models & court textures in background when online
          if (navigator.onLine) {
            setTimeout(() => {
              CRITICAL_OFFLINE_ASSETS.forEach((url) => {
                fetch(url, { mode: "cors", credentials: "same-origin" }).catch(() => {});
              });
            }, 2500);
          }
        }
      });
    } catch {
      // Service worker registration optional in restricted contexts
    }

    // Listen for install prompt
    window.addEventListener("beforeinstallprompt", (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this._syncDOM();
      this._notify();
    });

    window.addEventListener("appinstalled", () => {
      this.deferredPrompt = null;
      this.isStandalone = true;
      this._syncDOM();
      this._notify();
    });

    // Listen for online / offline transitions
    window.addEventListener("online", () => {
      this.isOnline = true;
      this._syncDOM();
      this._notify();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this._syncDOM();
      this._notify();
    });

    this._bindUIButtons();
    this._syncDOM();
  }

  getStatus(): PWAOfflineStatus {
    return {
      isOnline: this.isOnline,
      isStandalone: this.isStandalone,
      canPromptInstall: Boolean(this.deferredPrompt),
      isIOS: this.isIOS
    };
  }

  subscribe(cb: StatusListener): () => void {
    this.listeners.add(cb);
    cb(this.getStatus());
    return () => {
      this.listeners.delete(cb);
    };
  }

  private _notify() {
    const status = this.getStatus();
    for (const cb of this.listeners) {
      try {
        cb(status);
      } catch {}
    }
  }

  async promptInstall(): Promise<boolean> {
    if (this.deferredPrompt) {
      try {
        this.deferredPrompt.prompt();
        const choice = await this.deferredPrompt.userChoice;
        if (choice && choice.outcome === "accepted") {
          this.deferredPrompt = null;
          this._syncDOM();
          this._notify();
          return true;
        }
      } catch {
        // Fallback to manual guide modal
      }
      return false;
    }

    // Open manual / iOS / browser install guide modal
    this.openInstallModal();
    return false;
  }

  openInstallModal() {
    const modal = document.getElementById("pwa-install-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  }

  closeInstallModal() {
    const modal = document.getElementById("pwa-install-modal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.style.display = "";
  }

  private _bindUIButtons() {
    const installBtnIds = ["btn-title-install-pwa", "btn-hud-install-pwa", "btn-lobby-install-pwa"];
    installBtnIds.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.promptInstall();
        });
      }
    });

    const closeBtnIds = ["btn-close-pwa-modal", "btn-close-pwa-modal-x"];
    closeBtnIds.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.closeInstallModal();
        });
      }
    });

    const btnPlayOfflineNow = document.getElementById("btn-play-offline-now");
    if (btnPlayOfflineNow) {
      btnPlayOfflineNow.addEventListener("click", (e) => {
        e.stopPropagation();
        const tabBot = document.getElementById("tab-mode-bot");
        if (tabBot) tabBot.click();
        const btnStart = document.getElementById("btn-start-match");
        if (btnStart) btnStart.click();
      });
    }
  }

  private _syncDOM() {
    if (typeof document === "undefined") return;

    document.body.classList.toggle("is-offline", !this.isOnline);
    document.body.classList.toggle("is-standalone", this.isStandalone);

    // Update network status pill on Title modal & HUD
    const netBadges = document.querySelectorAll("[data-network-badge]");
    netBadges.forEach((el) => {
      if (this.isOnline) {
        el.textContent = "TRỰC TUYẾN • CHƠI OFFLINE & ONLINE";
        el.classList.remove("offline");
        el.classList.add("online");
      } else {
        el.textContent = "KHÔNG CÓ MẠNG • CHẾ ĐỘ CHƠI OFFLINE VỚI MÁY";
        el.classList.remove("online");
        el.classList.add("offline");
      }
    });

    const offlineBanner = document.getElementById("offline-ready-banner");
    if (offlineBanner) {
      offlineBanner.classList.toggle("hidden", this.isOnline);
    }

    // Hide install buttons if already running as installed standalone app
    const installBtns = document.querySelectorAll(".pwa-install-trigger");
    installBtns.forEach((btn) => {
      if (this.isStandalone) {
        btn.classList.add("hidden");
      } else {
        btn.classList.remove("hidden");
      }
    });
  }
}

export const pwaOfflineManager = new PWAOfflineManager();
