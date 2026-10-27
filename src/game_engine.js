import * as o from "three";
import { GLTFLoader as D } from "../assets/vendor/GLTFLoader.js";
import { HudUI as Y } from "./hud_ui.js";
import * as z from "./motion_controls.js";
import { triggerPhysicalHardwareVibration } from "./motion_controls.js";
import * as U from "./audio_engine.js";
import { RacketKinematicsController as Z } from "./racket_kinematics.js";
import {
  upgradeMiiCharacterMaterials as $,
  upgradeRacketMaterials as q,
  updateCharacterContactShadow as j,
} from "./mii_model_overhaul.js";
import { MiiBodyAnimator as Q } from "./mii_body_animation.js";
import { MiiFacialFXController as J } from "./mii_facial_fx.js";
import { SwingVFXManager as ee } from "./swing_vfx.js";
import { onlineMatchmaker } from "./online_matchmaker.js";
import { FirebaseLobbyUI } from "./firebase_lobby_ui.js";
import { pwaOfflineManager } from "./pwa_offline_manager.ts";
import {
  characterShopManager,
  applyCharacter3DUpgradesToActor,
  CharacterShopUI,
  ACCESSORY_CATALOG,
  getCharacterActiveMechanics,
} from "./character_shop.js";
import { CourtMapManager } from "./court_maps.js";
import { addictiveFeaturesManager } from "./addictive_features.js";
const S = {
    BASELINE_Z: 11.89,
    SERVICE_LINE_Z: 6.4,
    SINGLES_X: 4.115,
    DOUBLES_X: 5.485,
    NET_HEIGHT_CENTER: 0.914,
    NET_HEIGHT_POST: 1.07,
    NET_POST_X: 6.4,
  },
  L = {
    FIXED_DT: 1 / 120,
    GRAVITY: 9.15,
    AIR_DRAG: 0.012,
    BOUNCE_RESTITUTION: 0.77,
    SURFACE_FRICTION: 0.86,
  },
  W = ["00", "15", "30", "40"];
class te {
  constructor(e, t = 28) {
    ((this.scene = e),
      (this.maxPoints = t),
      (this.points = []),
      (this._pool = Array.from({ length: t + 2 }, () => new o.Vector3())),
      (this._poolIdx = 0),
      (this._tmpA = new o.Vector3()),
      (this._tmpB = new o.Vector3()),
      (this._tmpC = new o.Vector3()),
      (this._tmpColor = new o.Color()),
      (this.color = new o.Color(16777215)),
      (this.accentColor = new o.Color(16773494)),
      (this.baseWidth = 0.28));
    const i = t * 2;
    ((this.positions = new Float32Array(i * 3)),
      (this.colors = new Float32Array(i * 4)));
    const a = [];
    for (let s = 0; s < t - 1; s++) {
      const n = s * 2,
        h = n + 1,
        r = n + 2,
        l = n + 3;
      a.push(n, h, r, h, l, r);
    }
    ((this.geometry = new o.BufferGeometry()),
      this.geometry.setAttribute(
        "position",
        new o.BufferAttribute(this.positions, 3),
      ),
      this.geometry.setAttribute(
        "color",
        new o.BufferAttribute(this.colors, 4),
      ),
      this.geometry.setIndex(a),
      (this.material = new o.MeshBasicMaterial({
        vertexColors: !0,
        transparent: !0,
        opacity: 0.95,
        side: o.DoubleSide,
        depthWrite: !1,
        blending: o.NormalBlending,
      })),
      (this.mesh = new o.Mesh(this.geometry, this.material)),
      (this.mesh.frustumCulled = !1),
      (this.mesh.renderOrder = 6),
      this.scene.add(this.mesh));
  }
  setStyle(e = "TOPSPIN", t = !1, hitterActor = null) {
    const cv = hitterActor?.customStrikeVfx;
    if (cv && cv.id && cv.id !== "vfx_default") {
      (this.color.setHex(cv.ballMainHex || 16777215),
        this.accentColor.setHex(cv.ballAccentHex || 16748544),
        (this.baseWidth = t ? 0.35 : 0.31));
      return;
    }
    const trItem = hitterActor ? hitterActor.customTrailAccessory : null;
    if (trItem && trItem.trailAccentHex) {
      (this.color.setHex(trItem.trailMainHex || 16777215),
        this.accentColor.setHex(trItem.trailAccentHex),
        (this.baseWidth = t ? 0.33 : 0.29));
      return;
    }
    if (!hitterActor) {
      const trId =
          characterShopManager?.state?.units?.player?.equippedAccessories
            ?.trail || characterShopManager?.state?.equippedAccessories?.trail,
        locTr = trId && ACCESSORY_CATALOG.find((a) => a.id === trId);
      if (locTr && locTr.trailAccentHex) {
        (this.color.setHex(locTr.trailMainHex || 16777215),
          this.accentColor.setHex(locTr.trailAccentHex),
          (this.baseWidth = t ? 0.33 : 0.29));
        return;
      }
    }
    const i = String(e || "TOPSPIN").toUpperCase();
    t || i === "SMASH" || i === "POWER"
      ? (this.color.setHex(16777215),
        this.accentColor.setHex(5432831),
        (this.baseWidth = 0.3))
      : i === "SLICE"
        ? (this.color.setHex(16777215),
          this.accentColor.setHex(8974591),
          (this.baseWidth = 0.28))
        : i === "LOB"
          ? (this.color.setHex(16777215),
            this.accentColor.setHex(15661311),
            (this.baseWidth = 0.25))
          : (this.color.setHex(16777215),
            this.accentColor.setHex(16771925),
            (this.baseWidth = 0.28));
  }
  clear() {
    ((this.points.length = 0), (this.mesh.visible = !1));
  }
  pushPoint(e) {
    const v = this._pool[this._poolIdx];
    ((this._poolIdx = (this._poolIdx + 1) % this._pool.length),
      v.copy(e),
      this.points.unshift(v),
      this.points.length > this.maxPoints && this.points.pop());
  }
  seedArc(e, t, i = 0.85) {
    this.points.length = 0;
    for (let a = 0; a < this.maxPoints; a++) {
      const n = 1 - a / (this.maxPoints - 1),
        h = this._pool[a].lerpVectors(e, t, n);
      ((h.y += Math.sin(n * Math.PI) * i), this.points.push(h));
    }
    this.mesh.visible = !0;
  }
  updateGeometry(e) {
    const t = this.points.length;
    if (t < 2) {
      this.mesh.visible = !1;
      return;
    }
    this.mesh.visible = !0;
    const i = e.position,
      a = this._tmpA,
      s = this._tmpB,
      n = this._tmpC,
      h = this._tmpColor;
    for (let r = 0; r < this.maxPoints; r++) {
      const l = Math.min(r, t - 1),
        p = this.points[l],
        g = Math.min(l + 1, t - 1),
        c = Math.max(l - 1, 0);
      (a.subVectors(this.points[c], this.points[g]),
        a.lengthSq() < 1e-6 ? a.set(0, 0, 1) : a.normalize(),
        s.subVectors(i, p).normalize(),
        n.crossVectors(a, s).normalize(),
        n.lengthSq() < 1e-4 && n.set(1, 0, 0));
      const y = 1 - l / Math.max(1, t - 1),
        f = this.baseWidth * (0.24 + 0.76 * Math.pow(y, 0.65)) * 0.5,
        m = Math.pow(y, 0.9) * 0.92;
      h.copy(this.color).lerp(this.accentColor, (1 - y) * 0.65);
      const d = r * 2,
        b = d + 1;
      ((this.positions[d * 3 + 0] = p.x + n.x * f),
        (this.positions[d * 3 + 1] = p.y + n.y * f),
        (this.positions[d * 3 + 2] = p.z + n.z * f),
        (this.positions[b * 3 + 0] = p.x - n.x * f),
        (this.positions[b * 3 + 1] = p.y - n.y * f),
        (this.positions[b * 3 + 2] = p.z - n.z * f),
        (this.colors[d * 4 + 0] = h.r),
        (this.colors[d * 4 + 1] = h.g),
        (this.colors[d * 4 + 2] = h.b),
        (this.colors[d * 4 + 3] = m),
        (this.colors[b * 4 + 0] = h.r),
        (this.colors[b * 4 + 1] = h.g),
        (this.colors[b * 4 + 2] = h.b),
        (this.colors[b * 4 + 3] = m));
    }
    ((this.geometry.attributes.position.needsUpdate = !0),
      (this.geometry.attributes.color.needsUpdate = !0));
  }
}
function se() {
  const P = new o.RingGeometry(
      0.22,
      0.72,
      28,
      1,
      -Math.PI * 0.28,
      Math.PI * 0.56,
    ),
    e = P.attributes.position,
    t = new Float32Array(e.count * 4);
  for (let s = 0; s < e.count; s++) {
    const n = e.getX(s),
      h = e.getY(s),
      l = (Math.atan2(h, n) + Math.PI * 0.28) / (Math.PI * 0.56),
      g = (Math.hypot(n, h) - 0.22) / (0.72 - 0.22),
      c = Math.max(0, Math.min(1, l * (0.35 + 0.65 * g)));
    ((t[s * 4 + 0] = 0.97),
      (t[s * 4 + 1] = 0.99),
      (t[s * 4 + 2] = 1),
      (t[s * 4 + 3] = c * 0.85));
  }
  P.setAttribute("color", new o.BufferAttribute(t, 4));
  const i = new o.MeshBasicMaterial({
      vertexColors: !0,
      transparent: !0,
      opacity: 0.88,
      side: o.DoubleSide,
      depthWrite: !1,
    }),
    a = new o.Mesh(P, i);
  return ((a.visible = !1), (a.renderOrder = 7), a);
}
function ie() {
  const P = document.createElement("canvas");
  ((P.width = 128), (P.height = 128));
  const e = P.getContext("2d"),
    t = e.createRadialGradient(64, 64, 6, 64, 64, 60);
  return (
    t.addColorStop(0, "rgba(10, 24, 8, 0.78)"),
    t.addColorStop(0.55, "rgba(10, 24, 8, 0.46)"),
    t.addColorStop(1, "rgba(10, 24, 8, 0.0)"),
    (e.fillStyle = t),
    e.fillRect(0, 0, 128, 128),
    new o.CanvasTexture(P)
  );
}
function ae() {
  const P = document.createElement("canvas");
  ((P.width = 1024), (P.height = 512));
  const e = P.getContext("2d"),
    t = e.createLinearGradient(0, 0, 0, 320);
  (t.addColorStop(0, "#2e86e6"),
    t.addColorStop(0.42, "#5cb2ff"),
    t.addColorStop(0.78, "#a6dcff"),
    t.addColorStop(1, "#def4ff"),
    (e.fillStyle = t),
    e.fillRect(0, 0, 1024, 512),
    [
      [120, 185, 95, 38],
      [180, 175, 110, 44],
      [250, 188, 85, 34],
      [460, 168, 120, 45],
      [535, 160, 130, 50],
      [610, 174, 95, 36],
      [820, 180, 115, 42],
      [895, 170, 125, 48],
      [960, 184, 90, 35],
    ].forEach(([s, n, h, r]) => {
      const l = e.createRadialGradient(s, n - r * 0.2, h * 0.1, s, n, h);
      (l.addColorStop(0, "rgba(255, 255, 255, 0.92)"),
        l.addColorStop(0.6, "rgba(245, 252, 255, 0.55)"),
        l.addColorStop(1, "rgba(255, 255, 255, 0.0)"),
        (e.fillStyle = l),
        e.beginPath(),
        e.ellipse(s, n, h, r, 0, 0, Math.PI * 2),
        e.fill());
    }));
  const a = new o.CanvasTexture(P);
  return ((a.colorSpace = o.SRGBColorSpace), a);
}
export class ArgonTennisEngine {
  constructor() {
    ((this.params = new URLSearchParams(window.location.search)),
      (this.urlState = (this.params.get("state") || "").toLowerCase()),
      (this.urlRoom = (this.params.get("room") || "").trim().toUpperCase()),
      (this.urlRole =
        (this.params.get("role") || "p1").trim().toLowerCase() === "p2"
          ? "p2"
          : "p1"),
      (this.urlMode = (
        this.params.get("mode") ||
        this.params.get("difficulty") ||
        ""
      ).toLowerCase()),
      (this.urlAutoPlay = this.params.has("play") || !!this.urlState),
      (this.roomId = this.urlRoom || "default"),
      (this.playerRole = this.urlRole));
    if (typeof window !== "undefined")
      window.__CURRENT_PLAYER_ROLE = this.playerRole;
    ((this.isMultiplayer =
      !!(this.urlRoom && this.urlRoom !== "DEFAULT") || this.urlMode === "1v1"),
      (this.roomStatus = {
        roomId: this.roomId,
        p1Online: !0,
        p2Online: !1,
        p1Phone: !1,
        p2Phone: !1,
        tunnelUrl: "",
        urls: null,
      }),
      (this.lastAppliedSnapshotSeq = 0),
      (this.lastSyncSentAt = 0),
      (this.lastGuestMoveSentAt = 0),
      (this.bannerSeq = 0),
      (this.lastBannerBroadcast = null),
      (this.canvas = document.getElementById("game-canvas")),
      (this.renderer = new o.WebGLRenderer({
        canvas: this.canvas,
        antialias: window.innerWidth >= 900,
        powerPreference: "high-performance",
      })),
      this.renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio || 1,
          window.innerWidth < 900 ? 1.25 : 1.5,
        ),
      ),
      this.renderer.setSize(window.innerWidth, window.innerHeight),
      (this.renderer.shadowMap.enabled = !0),
      (this.renderer.shadowMap.type = o.PCFShadowMap),
      (this.renderer.outputColorSpace = o.SRGBColorSpace),
      (this.renderer.toneMapping = o.ACESFilmicToneMapping),
      (this.renderer.toneMappingExposure = 1.12),
      (this.scene = new o.Scene()),
      (this.scene.background = new o.Color(7914239)),
      (this.scene.fog = new o.FogExp2(12313855, 0.0038)),
      (this.camera = new o.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        260,
      )),
      (this.cameraMode = "RALLY_CAM"),
      (this.manualCameraOverride = null),
      (this.cameraPosSmooth = new o.Vector3(0, 7.8, 22.8)),
      (this.cameraLookSmooth = new o.Vector3(0, 0.35, 1.8)),
      (this._tmpCamPos = new o.Vector3()),
      (this._tmpCamLook = new o.Vector3()),
      (this._tmpProjVec = new o.Vector3()),
      (this._tmpServerVec = new o.Vector3()),
      (this.cameraTrauma = 0));
    const e = this.isMultiplayer
      ? "1v1"
      : ["casual", "pro", "1v1"].includes(this.urlMode)
        ? this.urlMode
        : "casual";
    ((this.matchConfig = {
      gamesToWin: e === "1v1" ? 1 : 2,
      inputMode: "mouse",
      difficulty: e,
    }),
      (this.score = {
        playerPoints: 0,
        opponentPoints: 0,
        playerGames: 0,
        opponentGames: 0,
        server: "player",
        deuceSide: !0,
      }),
      (this.phase = "TITLE"),
      (this.phaseTimer = 0),
      (this.selectedShotType = "TOPSPIN"),
      (this.p2SelectedShotType = "TOPSPIN"),
      (this.autoPlayMode = this.urlAutoPlay),
      (this.userHasInteracted = !1),
      (this.persistentStateLock = !1),
      (this.pendingUserSwing = null),
      (this.pendingP2Swing = null),
      (this.pendingServeSwing = null),
      (this.ball = {
        mesh: null,
        pos: new o.Vector3(0.85, 1.15, 11.6),
        vel: new o.Vector3(0, 0, 0),
        spin: new o.Vector3(0, 0, 0),
        inPlay: !1,
        lastHitter: "player",
        bounceCountOnCurrentSide: 0,
        shotType: "TOPSPIN",
        isPowerShot: !1,
        rallyStrokeCount: 0,
        targetLanding: new o.Vector3(0, 0, -8.5),
      }),
      (this.player = this._createActorState(
        "player",
        1,
        new o.Vector3(1.15, 0, S.BASELINE_Z),
      )),
      (this.playerPartner = this._createActorState(
        "player_partner",
        1,
        new o.Vector3(-2.1, 0, 5.4),
      )),
      (this.opponent = this._createActorState(
        "opponent",
        -1,
        new o.Vector3(-1.35, 0, -S.BASELINE_Z),
      )),
      (this.opponentPartner = this._createActorState(
        "opponent_partner",
        -1,
        new o.Vector3(2.1, 0, -5.4),
      )),
      this._applyDifficultyTuning(this.matchConfig.difficulty),
      (this.crowdScene = null),
      (this.cheerEnergy = 0.25),
      (this.ballTrail = new te(this.scene, 45)),
      (this.bounceRings = []),
      (this.starParticles = []),
      (this.racketKinematics = new Z()),
      (this.bodyAnimator = new Q()),
      (this.facialFX = new J(this.scene)),
      (this.swingVfx = new ee(this.scene)),
      this._setupLightingAndSky(),
      this._setupEffectsPools(),
      this._initHudAndControllers(),
      (this.clock = new o.Clock()),
      (this.physicsAccumulator = 0),
      (this.elapsedTime = 0),
      window.addEventListener("resize", () => this._onResize()));
  }
  _createActorState(e, t, i) {
    const a = {
      player: 4.8,
      player_partner: 4.2,
      opponent: 4.2,
      opponent_partner: 3.9,
    };
    return {
      role: e,
      sideSign: t,
      root: new o.Group(),
      model: null,
      parts: {},
      racketPivot: new o.Group(),
      racketMesh: null,
      swingArcMesh: null,
      shadowBlob: null,
      pos: i.clone(),
      vel: new o.Vector3(),
      targetPos: i.clone(),
      maxSpeed: a[e] || 4.5,
      stridePhase: 0,
      swingTimer: 0,
      swingDuration: 0.34,
      swingCooldown: 0,
      swingType: "forehand",
      arcVisibleTimer: 0,
    };
  }
  _applyDifficultyTuning(e = "casual") {
    const t = String(e || "casual").toLowerCase(),
      p1Mods =
        t === "1v1" && this.hostLoadout
          ? characterShopManager.getPlayerModifiersFromLoadout(this.hostLoadout)
          : characterShopManager.getEffectivePlayerModifiers(),
      p1PartMods =
        t === "1v1" && this.hostLoadout
          ? characterShopManager.getPartnerModifiersFromLoadout(
              this.hostLoadout,
            )
          : characterShopManager.getEffectivePartnerModifiers(),
      p2Mods =
        t === "1v1" && this.guestLoadout
          ? characterShopManager.getPlayerModifiersFromLoadout(
              this.guestLoadout,
            )
          : null,
      p2PartMods =
        t === "1v1" && this.guestLoadout
          ? characterShopManager.getPartnerModifiersFromLoadout(
              this.guestLoadout,
            )
          : null;
    this.matchConfig.difficulty = t;
    if (t === "1v1") {
      this.isMultiplayer = true;
      this.matchConfig.gamesToWin = this.matchConfig.gamesToWin || 1;
      this.player.maxSpeed = p1Mods.maxSpeed;
      this.playerPartner.maxSpeed = p1PartMods.maxSpeed;
      this.opponent.maxSpeed = p2Mods ? p2Mods.maxSpeed : 5.0;
      this.opponentPartner.maxSpeed = p2PartMods ? p2PartMods.maxSpeed : 4.4;
      this.opponent.reachBonus = 0;
      this.opponentPartner.reachBonus = 0;
    } else if (t === "x2") {
      // FIFA LEVEL 20 MAX GOD: Siêu mạnh, tốc độ ánh sáng, phản xạ tức thì!
      this.isMultiplayer = !!(this.urlRoom && this.urlRoom !== "DEFAULT");
      this.player.maxSpeed = p1Mods.maxSpeed;
      this.playerPartner.maxSpeed = p1PartMods.maxSpeed;
      this.opponent.maxSpeed = 13.8;
      this.opponentPartner.maxSpeed = 12.5;
      this.opponent.reachBonus = 3.2;
      this.opponentPartner.reachBonus = 2.8;
    } else if (t === "cuc_cao") {
      // Level 18 Cực Cao
      this.isMultiplayer = !!(this.urlRoom && this.urlRoom !== "DEFAULT");
      this.player.maxSpeed = p1Mods.maxSpeed;
      this.playerPartner.maxSpeed = p1PartMods.maxSpeed;
      this.opponent.maxSpeed = 9.5;
      this.opponentPartner.maxSpeed = 8.5;
      this.opponent.reachBonus = 2.0;
      this.opponentPartner.reachBonus = 1.8;
    } else if (t === "sieu_cao") {
      // Level 16 Siêu Cao
      this.isMultiplayer = !!(this.urlRoom && this.urlRoom !== "DEFAULT");
      this.player.maxSpeed = p1Mods.maxSpeed;
      this.playerPartner.maxSpeed = p1PartMods.maxSpeed;
      this.opponent.maxSpeed = 6.8;
      this.opponentPartner.maxSpeed = 6.2;
      this.opponent.reachBonus = 1.4;
      this.opponentPartner.reachBonus = 1.2;
    } else if (t === "cao" || t === "pro") {
      // Level 12 Cao
      this.isMultiplayer = !!(this.urlRoom && this.urlRoom !== "DEFAULT");
      this.player.maxSpeed = p1Mods.maxSpeed + 0.2;
      this.playerPartner.maxSpeed = p1PartMods.maxSpeed + 0.15;
      this.opponent.maxSpeed = 5.2;
      this.opponentPartner.maxSpeed = 4.6;
      this.opponent.reachBonus = 0.8;
      this.opponentPartner.reachBonus = 0.6;
    } else if (t === "thap") {
      // Level 4 Thấp
      this.isMultiplayer = !!(this.urlRoom && this.urlRoom !== "DEFAULT");
      this.player.maxSpeed = p1Mods.maxSpeed;
      this.playerPartner.maxSpeed = p1PartMods.maxSpeed;
      this.opponent.maxSpeed = 4.0;
      this.opponentPartner.maxSpeed = 3.7;
      this.opponent.reachBonus = 0;
      this.opponentPartner.reachBonus = 0;
    } else if (t === "de") {
      // Level 1 Dễ
      this.isMultiplayer = !!(this.urlRoom && this.urlRoom !== "DEFAULT");
      this.player.maxSpeed = p1Mods.maxSpeed;
      this.playerPartner.maxSpeed = p1PartMods.maxSpeed;
      this.opponent.maxSpeed = 3.5;
      this.opponentPartner.maxSpeed = 3.2;
      this.opponent.reachBonus = 0;
      this.opponentPartner.reachBonus = 0;
    } else {
      // Level 8 Trung Bình
      this.isMultiplayer = !!(this.urlRoom && this.urlRoom !== "DEFAULT");
      this.player.maxSpeed = p1Mods.maxSpeed;
      this.playerPartner.maxSpeed = p1PartMods.maxSpeed;
      this.opponent.maxSpeed = 4.4;
      this.opponentPartner.maxSpeed = 4.0;
      this.opponent.reachBonus = 0.3;
      this.opponentPartner.reachBonus = 0.2;
    }
  }
  _setupLightingAndSky() {
    const e = new o.TextureLoader(),
      t = new o.SphereGeometry(185, 36, 20),
      i = new o.MeshBasicMaterial({
        map: ae(),
        side: o.BackSide,
        depthWrite: !1,
        fog: !1,
      });
    ((this.skyDome = new o.Mesh(t, i)),
      this.scene.add(this.skyDome),
      e.load("./assets/textures/court/tns_sky_a.png", (c) => {
        ((c.colorSpace = o.SRGBColorSpace),
          (c.wrapS = o.RepeatWrapping),
          (c.wrapT = o.ClampToEdgeWrapping),
          c.repeat.set(8, 1),
          (i.map = c),
          (i.needsUpdate = !0));
      }));
    const a = (c, y, f, m, d) => {
      const b = new o.CylinderGeometry(c, c, y, 48, 1, !0),
        u = new o.MeshBasicMaterial({
          transparent: !0,
          opacity: 0.92,
          side: o.BackSide,
          depthWrite: !1,
          fog: !1,
        }),
        w = new o.Mesh(b, u);
      return (
        (w.position.y = f),
        (w.renderOrder = d),
        (w.visible = !1),
        this.scene.add(w),
        e.load(m, (x) => {
          ((x.colorSpace = o.SRGBColorSpace),
            (x.wrapS = o.RepeatWrapping),
            (x.wrapT = o.ClampToEdgeWrapping),
            x.repeat.set(8, 1),
            (u.map = x),
            (u.needsUpdate = !0),
            (w.visible = !0));
        }),
        w
      );
    };
    ((this.cloudRing2 = a(
      152,
      54,
      24,
      "./assets/textures/court/cloud02.png",
      -2,
    )),
      (this.cloudRing1 = a(
        138,
        46,
        19,
        "./assets/textures/court/cloud01.png",
        -1,
      )));
    const s = new o.CylinderGeometry(96, 96, 15.5, 64, 1, !0),
      n = new o.MeshBasicMaterial({
        transparent: !0,
        alphaTest: 0.15,
        side: o.BackSide,
        depthWrite: !1,
      });
    ((this.horizonRing = new o.Mesh(s, n)),
      (this.horizonRing.position.y = 7.2),
      (this.horizonRing.visible = !1),
      this.scene.add(this.horizonRing),
      e.load("./assets/textures/court/tns_BG_c1.png", (c) => {
        ((c.colorSpace = o.SRGBColorSpace),
          (c.wrapS = o.RepeatWrapping),
          (c.wrapT = o.ClampToEdgeWrapping),
          c.repeat.set(8, 1),
          (n.map = c),
          (n.needsUpdate = !0),
          (this.horizonRing.visible = !0));
      }));
    const h = new o.HemisphereLight(10935551, 5612068, 1.22);
    (h.position.set(0, 40, 0),
      this.scene.add(h),
      (this.sunLight = new o.DirectionalLight(16775660, 2.55)),
      this.sunLight.position.set(14.5, 25, 15),
      (this.sunLight.castShadow = !0),
      (this.sunLight.shadow.mapSize.width = 1024),
      (this.sunLight.shadow.mapSize.height = 1024),
      (this.sunLight.shadow.camera.near = 5),
      (this.sunLight.shadow.camera.far = 55));
    const r = 16;
    ((this.sunLight.shadow.camera.left = -r),
      (this.sunLight.shadow.camera.right = r),
      (this.sunLight.shadow.camera.top = r),
      (this.sunLight.shadow.camera.bottom = -r),
      (this.sunLight.shadow.bias = -4e-4),
      this.scene.add(this.sunLight));
    const l = new o.DirectionalLight(13362943, 0.72);
    (l.position.set(-15, 16, -12), this.scene.add(l));
    const p = ie(),
      g = (c, y) => {
        const f = new o.PlaneGeometry(c * 2, c * 2);
        f.rotateX(-Math.PI / 2);
        const m = new o.MeshBasicMaterial({
            map: p,
            transparent: !0,
            opacity: y,
            depthWrite: !1,
          }),
          d = new o.Mesh(f, m);
        return (
          (d.position.y = 0.018),
          (d.renderOrder = 2),
          this.scene.add(d),
          d
        );
      };
    ((this.player.shadowBlob = g(0.56, 0.82)),
      (this.playerPartner.shadowBlob = g(0.54, 0.78)),
      (this.opponent.shadowBlob = g(0.56, 0.82)),
      (this.opponentPartner.shadowBlob = g(0.54, 0.78)),
      (this.ballShadowBlob = g(0.34, 0.88)));
  }
  _setupEffectsPools() {
    for (let t = 0; t < 6; t++) {
      const i = new o.RingGeometry(0.12, 0.24, 28);
      i.rotateX(-Math.PI / 2);
      const a = new o.MeshBasicMaterial({
          color: 16777215,
          transparent: !0,
          opacity: 0,
          side: o.DoubleSide,
          depthWrite: !1,
        }),
        s = new o.Mesh(i, a);
      ((s.visible = !1),
        (s.position.y = 0.024),
        (s.renderOrder = 3),
        this.scene.add(s),
        this.bounceRings.push({ mesh: s, age: 0, active: !1 }));
    }
    const e = new o.OctahedronGeometry(0.085, 0);
    for (let t = 0; t < 36; t++) {
      const i = new o.MeshBasicMaterial({
          color: t % 2 === 0 ? 16771624 : 4777471,
          transparent: !0,
          opacity: 0,
          depthWrite: !1,
        }),
        a = new o.Mesh(e, i);
      ((a.visible = !1),
        (a.renderOrder = 8),
        this.scene.add(a),
        this.starParticles.push({
          mesh: a,
          vel: new o.Vector3(),
          age: 0,
          maxAge: 0.42,
          active: !1,
        }));
    }
  }
  _initHudAndControllers() {
    this.hud = new Y({
      onSelectMatchLength: (i) => {
        this.matchConfig.gamesToWin = i;
      },
      onSelectDifficulty: (i) => {
        this._applyDifficultyTuning(i);
      },
      onCreateMultiplayerRoom: async (i = {}) =>
        await this.createMultiplayerRoom(i),
      onSelectInputMode: (i) => {
        ((this.matchConfig.inputMode = i),
          i === "webcam" &&
            this.motionController &&
            this.motionController.enableWebcam());
      },
      onStartMatch: ({ gamesToWin: i, inputMode: a, difficulty: s }) => {
        ((this.matchConfig.gamesToWin = i),
          (this.matchConfig.pointsToWinGame = 4),
          (this.matchConfig.inputMode = a),
          (this.isMultiplayer = !1),
          s && this._applyDifficultyTuning(s),
          (this.autoPlayMode = !1),
          (this.userHasInteracted = !0),
          (this.persistentStateLock = !1),
          a === "webcam" &&
            this.motionController &&
            this.motionController.enableWebcam(),
          this.startNewMatch({ showStartBanner: !0 }));
      },
      onSelectShotType: (i) => {
        (this.playerRole === "p2"
          ? (this.p2SelectedShotType = i)
          : (this.selectedShotType = i),
          this.motionController &&
            this.motionController.setShotType &&
            this.motionController.setShotType(i.toLowerCase()));
      },
      onToggleAudio: () => {
        if (this.audioEngine) {
          const i = this.audioEngine.toggleMute(),
            a = this.audioEngine.getCurrentTrackInfo();
          this.hud.updateAudioStatus({ playing: !i, trackName: a.title });
        }
      },
      onCycleCamera: () => {
        const i = [null, "RALLY_CAM", "SERVE_CAM", "REPLAY_CAM", "INTRO_PAN"],
          a = i.indexOf(this.manualCameraOverride);
        this.manualCameraOverride = i[(a + 1) % i.length];
        const s = {
          null: "Auto",
          RALLY_CAM: "Rally",
          SERVE_CAM: "Serve",
          REPLAY_CAM: "Net Close",
          INTRO_PAN: "Aerial",
        };
        (this.hud.updateCameraLabel(s[this.manualCameraOverride] || "Auto"),
          this.hud.setReplayMode(this.manualCameraOverride === "REPLAY_CAM"));
      },
      onToggleReplay: () => {
        this.phase === "REPLAY"
          ? ((this.persistentStateLock = !1),
            this.hud.setReplayMode(!1),
            this._setupPointServe({ showBanner: !1 }))
          : this._enterInstantReplayState({ persistent: !1 });
      },
      onToggleWebcam: async () => {
        if (this.motionController)
          if (
            ((this.autoPlayMode = !1),
            (this.userHasInteracted = !0),
            (this.persistentStateLock = !1),
            this.motionController.webcamActive)
          )
            (this.motionController.disableWebcam &&
              this.motionController.disableWebcam(),
              this.hud.updateMotionStatus({
                webcamActive: !1,
                phoneConnected: this.motionController.phoneState?.connected,
              }));
          else {
            const i = await this.motionController.enableWebcam();
            (this.hud.updateMotionStatus({
              webcamActive: i,
              phoneConnected: this.motionController.phoneState?.connected,
            }),
              this.phase === "TITLE" &&
                (this.hud.hideTitleModal(),
                this.startNewMatch({ showStartBanner: !0 })));
          }
      },
      onPlayAgain: () => {
        ((this.autoPlayMode = !1),
          (this.userHasInteracted = !0),
          (this.persistentStateLock = !1),
          this.startNewMatch({ showStartBanner: !0 }));
      },
      onReturnTitle: () => {
        if (this.isMultiplayer && this.onlineMatchmaker) {
          this.onlineMatchmaker.leaveRoom?.().catch?.(() => {});
        }
        this.isMultiplayer = !1;
        this.autoPlayMode = !0;
        this.persistentStateLock = !1;
        this.phase = "TITLE";
        this.cameraMode = "INTRO_PAN";
        this.manualCameraOverride = null;
        this.hud?.hideVersusIntro?.();
        this.hud?.hideVictoryModal?.();
        this.hud?.closePauseModal?.();
        this.hud?.showTitleModal?.();
      },
      onToggleControlsGuide: () => {
        this.hud && this.hud.openControlsModal && this.hud.openControlsModal();
      },
      onToggleTouchControls: () => {
        if (this.motionController) {
          const v = this.motionController.toggleTouchControls();
          this.hud &&
            this.hud.setTouchToggleActive &&
            this.hud.setTouchToggleActive(v);
        }
      },
      onToggleDeviceMotion: async () => {
        if (this.motionController) {
          const v = await this.motionController.toggleDeviceMotion();
          this.hud &&
            this.hud.setGyroToggleActive &&
            this.hud.setGyroToggleActive(v);
        }
      },
      onUpdateSettings: (s) => {
        if (this.motionController) {
          ((this.motionController.settings = {
            ...this.motionController.settings,
            ...s,
          }),
            this.motionController.saveSettings(),
            typeof s.touchGamepadEnabled == "boolean" &&
              (this.motionController.setTouchControlsVisible(
                s.touchGamepadEnabled,
              ),
              this.hud &&
                this.hud.setTouchToggleActive &&
                this.hud.setTouchToggleActive(s.touchGamepadEnabled)),
            typeof s.deviceMotionEnabled == "boolean" &&
              (s.deviceMotionEnabled
                ? this.motionController.enableDeviceMotion()
                : this.motionController.disableDeviceMotion(),
              this.hud &&
                this.hud.setGyroToggleActive &&
                this.hud.setGyroToggleActive(
                  this.motionController.deviceMotionActive,
                )));
        }
      },
    });
    const e = U.AudioEngine || U.default;
    e &&
      (this.audioEngine = new e({
        onTrackChange: (i) => {
          this.hud.updateAudioStatus({
            playing: !i.muted,
            trackName: i.title.replace(/\s*\(Lyria 3\)/i, ""),
          });
        },
      }));
    const t = z.MotionController || z.default;
    t &&
      (this.motionController = new t({
        webcamCanvasId: "webcam-canvas",
        roomId: this.roomId,
        role: this.playerRole,
        onSwing: (i) => this._handleUserSwingInput(i),
        onToss: (i) => this._handleUserTossInput(i),
        onP2Swing: (i) => this._handleP2SwingInput(i),
        onP2Toss: (i) => this._handleP2TossInput(i),
        onRoomState: (i) => this._handleRoomStateUpdate(i),
        onStatusChange: (i) => {
          this.hud.updateMotionStatus({
            webcamActive: !!i.webcam,
            phoneConnected: !!i.phone,
            p1Phone: !!i.p1Phone,
            p2Phone: !!i.p2Phone,
          });
        },
      }));
    this.onlineMatchmaker = onlineMatchmaker;
    this.hostLoadout = null;
    this.guestLoadout = null;
    this.onlineLobbyUI = new FirebaseLobbyUI({
      onStartOnlineMatch: ({
        roomId: e,
        role: i,
        gamesToWin: a,
        pointsToWinGame: pts,
        mapId: mId,
        weatherId: wId,
        customCoinReward: cCoins,
        isHost: s,
        hostName: n,
        guestName: h,
        hostLoadout: r,
        guestLoadout: l,
      }) => {
        ((this.roomId = e), (this.playerRole = i));
        if (typeof window !== "undefined") window.__CURRENT_PLAYER_ROLE = i;
        if (mId && mId !== "auto" && this.courtMapManager?.selectMap) {
          this.courtMapManager.selectMap(mId);
        }
        if (wId && wId !== "auto" && this.courtMapManager?.selectWeather) {
          this.courtMapManager.selectWeather(wId);
        }
        ((this.isMultiplayer = !0),
          this._applyDifficultyTuning("1v1"),
          (this.matchConfig.gamesToWin = Number(a || 1)),
          (this.matchConfig.pointsToWinGame = Number(pts || 4)),
          (this.matchConfig.customCoinReward = Math.max(1000, Number(cCoins || 50000))),
          this.syncOnlineSquadLoadouts({ hostLoadout: r, guestLoadout: l }),
          (this.autoPlayMode = !1),
          (this.userHasInteracted = !0),
          (this.persistentStateLock = !1),
          this.hud.hideTitleModal(),
          this.startNewMatch({ showStartBanner: !0 }),
          this.hud.updateOpponentPresence({
            isMultiplayer: !0,
            hostName: n,
            guestName: h,
            p1Online: !0,
            p2Online: !0,
          }));
      },
    });
    this.characterShop = characterShopManager;
    this.characterShopUI = new CharacterShopUI({ engine: this });
    this.lobbyUI = this.onlineLobbyUI;
    this.courtMapManager = new CourtMapManager(this);
    this.courtMapManager.initUiBindings();
    this.addictiveFeatures = addictiveFeaturesManager;
    this.addictiveFeatures.attachEngine(this);
    this.onlineMatchmaker.callbacks.onLoadoutSync = ({
      hostLoadout: e,
      guestLoadout: i,
    }) => {
      this.syncOnlineSquadLoadouts({ hostLoadout: e, guestLoadout: i });
    };
    this.onlineMatchmaker.callbacks.onHostSnapshot = (e, i) => {
      this.playerRole === "p2" &&
        this._handleRoomStateUpdate({
          snapshot: e,
          snapshotSeq: i,
          p1Online: !0,
          p2Online: !0,
        });
    };
    this.onlineMatchmaker.callbacks.onGuestAction = (e) => {
      this.playerRole === "p1" &&
        (e.type === "toss"
          ? this._handleP2TossInput(e)
          : this._handleP2SwingInput(e));
    };
    this.onlineMatchmaker.callbacks.onGuestInput = (e) => {
      this.playerRole === "p1" &&
        ((this.opponent.targetPos.x = o.MathUtils.clamp(
          e.x * 4,
          -S.DOUBLES_X + 0.45,
          S.DOUBLES_X - 0.45,
        )),
        (this.opponent.targetPos.z = o.MathUtils.clamp(
          -S.BASELINE_Z + e.z * 3.5,
          -S.BASELINE_Z - 0.5,
          -2.5,
        )));
    };
    this.onlineMatchmaker.callbacks.onPlayerJoined = ({
      guestName: e,
      guestLoadout: i,
    }) => {
      (i && this.syncOnlineSquadLoadouts({ guestLoadout: i }),
        this.playerRole === "p1" &&
          !this.autoPlayMode &&
          (this.hud.showCenterBanner(`${e} ĐÃ VÀO SÂN!`, {
            style: "style-gold",
            durationMs: 2200,
          }),
          this.hud.updateOpponentPresence({
            isMultiplayer: !0,
            p1Online: !0,
            p2Online: !0,
            guestName: e,
          }),
          this.audioEngine &&
            this.audioEngine.playServeToss &&
            this.audioEngine.playServeToss()));
    };
    window.addEventListener("keydown", (i) => {
      if (i.target && (i.target.tagName === "INPUT" || i.target.tagName === "TEXTAREA")) {
        return;
      }
      if ((i.code === "Escape" || i.code === "KeyP") && !this.autoPlayMode && this.phase !== "TITLE") {
        const pauseModal = document.getElementById("pause-game-modal");
        if (pauseModal && !pauseModal.classList.contains("hidden")) {
          this.hud?.closePauseModal?.();
          return;
        } else if (!this._isAnyModalOpen()) {
          this.hud?.openPauseModal?.();
          return;
        }
      }
      if (this._isAnyModalOpen()) {
        return;
      }
      if (i.code === "Digit1" || i.code === "KeyZ") {
        this._triggerVipMechanic(0);
      } else if (i.code === "Digit2" || i.code === "KeyX") {
        this._triggerVipMechanic(1);
      } else if (i.code === "Digit3" || i.code === "KeyV") {
        this._triggerVipMechanic(2);
      } else if (i.code === "KeyC") {
        this.hud.callbacks.onCycleCamera();
      } else if (i.code === "KeyM") {
        this.courtMapManager && this.courtMapManager.cycleNextMap();
      } else if (i.code === "KeyR") {
        this.hud.callbacks.onToggleReplay();
      } else if (
        this.isMultiplayer &&
        (i.code === "ShiftRight" || i.code === "KeyK" || i.code === "Numpad0")
      ) {
        this._handleP2SwingInput({
          source: "keyboard_p2",
          shotType: this.p2SelectedShotType,
          speed: 1.18,
        });
      }
    });
  }
  syncOnlineSquadLoadouts({
    hostLoadout: e = null,
    guestLoadout: t = null,
  } = {}) {
    (e && (this.hostLoadout = e), t && (this.guestLoadout = t));
    const i =
        this.hostLoadout ||
        this.onlineMatchmaker?.hostLoadout ||
        characterShopManager.getCompactOnlineLoadout(),
      a =
        this.guestLoadout ||
        this.onlineMatchmaker?.guestLoadout ||
        (this.playerRole === "p2"
          ? characterShopManager.getCompactOnlineLoadout({
              avoidCloningHostLoadout:
                characterShopManager.isFreshDefaultProfile() ? i : null,
            })
          : null);
    ((this.hostLoadout = i), a && (this.guestLoadout = a));
    const s = characterShopManager.getPlayerModifiersFromLoadout(i),
      n = characterShopManager.getPartnerModifiersFromLoadout(i);
    (this.player &&
      ((this.player.maxSpeed = s.maxSpeed),
      applyCharacter3DUpgradesToActor(this.player, characterShopManager, {
        unitRole: "player",
        customLoadout: i,
      })),
      this.playerPartner &&
        ((this.playerPartner.maxSpeed = n.maxSpeed),
        applyCharacter3DUpgradesToActor(
          this.playerPartner,
          characterShopManager,
          { unitRole: "partner", customLoadout: i },
        )),
      characterShopManager.syncMiiProfileSlotFromLoadout(
        "player1",
        i,
        "player",
      ),
      characterShopManager.syncMiiProfileSlotFromLoadout(
        "player2",
        i,
        "partner",
      ));
    if (a) {
      const h = characterShopManager.getPlayerModifiersFromLoadout(a),
        r = characterShopManager.getPartnerModifiersFromLoadout(a);
      (this.opponent &&
        ((this.opponent.maxSpeed = h.maxSpeed),
        applyCharacter3DUpgradesToActor(this.opponent, characterShopManager, {
          unitRole: "player",
          customLoadout: a,
        })),
        this.opponentPartner &&
          ((this.opponentPartner.maxSpeed = r.maxSpeed),
          applyCharacter3DUpgradesToActor(
            this.opponentPartner,
            characterShopManager,
            { unitRole: "partner", customLoadout: a },
          )),
        characterShopManager.syncMiiProfileSlotFromLoadout(
          "opponent1",
          a,
          "player",
        ),
        characterShopManager.syncMiiProfileSlotFromLoadout(
          "opponent2",
          a,
          "partner",
        ));
    }
    this.hud &&
      this.hud._renderAllMiiPortraits &&
      this.hud._renderAllMiiPortraits();
  }
  _isAnyModalOpen() {
    const e = [
      "title-modal",
      "firebase-lobby-modal",
      "controls-modal",
      "victory-modal",
      "pause-game-modal",
      "companion-modal",
      "pwa-install-modal",
      "character-shop-modal",
      "addictive-hub-modal",
    ];
    return e.some((t) => {
      const i = document.getElementById(t);
      return i && !i.classList.contains("hidden") && i.style.display !== "none";
    });
  }
  _buildOfflineFallbackMesh(c) {
    const g = new o.Group();
    if (c.includes("stadium_court")) {
      const turf = new o.Mesh(
        new o.PlaneGeometry(36, 48),
        new o.MeshStandardMaterial({ color: 3579948, roughness: 0.85 }),
      );
      ((turf.rotation.x = -Math.PI / 2),
        (turf.receiveShadow = !0),
        g.add(turf));
      const inner = new o.Mesh(
        new o.PlaneGeometry(10.97, 23.77),
        new o.MeshStandardMaterial({ color: 2995502, roughness: 0.8 }),
      );
      ((inner.rotation.x = -Math.PI / 2),
        (inner.position.y = 0.005),
        (inner.receiveShadow = !0),
        g.add(inner));
      const lm = new o.MeshBasicMaterial({ color: 16777215 }),
        addLine = (w, h, x, z) => {
          const m = new o.Mesh(new o.PlaneGeometry(w, h), lm);
          ((m.rotation.x = -Math.PI / 2),
            m.position.set(x, 0.012, z),
            g.add(m));
        };
      (addLine(10.97, 0.08, 0, 11.89),
        addLine(10.97, 0.08, 0, -11.89),
        addLine(0.08, 23.77, -5.485, 0),
        addLine(0.08, 23.77, 5.485, 0),
        addLine(0.08, 23.77, -4.115, 0),
        addLine(0.08, 23.77, 4.115, 0),
        addLine(8.23, 0.06, 0, 6.4),
        addLine(8.23, 0.06, 0, -6.4),
        addLine(0.06, 12.8, 0, 0));
    } else if (c.includes("tennis_net")) {
      const net = new o.Mesh(
        new o.BoxGeometry(12.8, 0.92, 0.06),
        new o.MeshStandardMaterial({
          color: 15658734,
          transparent: !0,
          opacity: 0.75,
        }),
      );
      ((net.position.y = 0.46), g.add(net));
      const tape = new o.Mesh(
        new o.BoxGeometry(12.8, 0.07, 0.08),
        new o.MeshBasicMaterial({ color: 16777215 }),
      );
      ((tape.position.y = 0.92), g.add(tape));
    } else if (c.includes("mii_player") || c.includes("mii_opponent")) {
      const isP1 = c.includes("mii_player"),
        torso = new o.Mesh(
          new o.CapsuleGeometry(0.26, 0.52, 8, 12),
          new o.MeshStandardMaterial({ color: isP1 ? 16069428 : 3044095 }),
        );
      ((torso.name = "torso"), (torso.position.y = 0.78), g.add(torso));
      const head = new o.Mesh(
        new o.SphereGeometry(0.28, 16, 16),
        new o.MeshStandardMaterial({ color: 16766902 }),
      );
      ((head.name = "head"), (head.position.y = 1.42), g.add(head));
    } else if (c.includes("tennis_racket")) {
      const handle = new o.Mesh(
        new o.CylinderGeometry(0.025, 0.025, 0.35, 8),
        new o.MeshStandardMaterial({ color: 3355443 }),
      );
      ((handle.position.y = 0.18), g.add(handle));
      const rim = new o.Mesh(
        new o.TorusGeometry(0.18, 0.02, 8, 20),
        new o.MeshStandardMaterial({ color: 15658734 }),
      );
      ((rim.position.y = 0.52), g.add(rim));
    } else if (c.includes("tennis_ball")) {
      const ball = new o.Mesh(
        new o.SphereGeometry(0.068, 14, 14),
        new o.MeshStandardMaterial({
          color: 13631232,
          emissive: 3368448,
          emissiveIntensity: 0.25,
        }),
      );
      g.add(ball);
    }
    return g;
  }
  async createMultiplayerRoom({
    p1Name: e = "Player 1",
    p2Name: t = "Player 2",
  } = {}) {
    try {
      const i = await fetch("/api/match/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ p1Name: e, p2Name: t }),
      });
      if (i.ok) {
        const a = await i.json();
        if (a.roomId)
          return (
            (this.roomId = a.roomId),
            (this.isMultiplayer = !0),
            this._applyDifficultyTuning("1v1"),
            this.motionController &&
              this.motionController.setRoomConfig &&
              this.motionController.setRoomConfig({
                roomId: this.roomId,
                role: this.playerRole,
              }),
            (this.roomStatus = {
              ...this.roomStatus,
              roomId: a.roomId,
              tunnelUrl: a.tunnelUrl || "",
              urls: a.urls || null,
              gchatCard: a.gchatCard || null,
            }),
            this.hud &&
              this.hud.updateMultiplayerRoomInfo &&
              this.hud.updateMultiplayerRoomInfo(this.roomStatus),
            a
          );
      }
    } catch (i) {
      console.warn("[ArgonTennisEngine] Failed to create multiplayer room:", i);
    }
    return null;
  }
  async loadAssetsAndStart() {
    if (
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        navigator.standalone)
    ) {
      const pb = document.getElementById("morph-pwa-badge");
      if (pb) pb.textContent = "📱 PWA APP ACTIVE";
    }
    const updateMorphProgress = (pct, txt) => {
      const bar = document.getElementById("morph-progress-bar"),
        pl = document.getElementById("morph-percent-label"),
        sl = document.getElementById("morph-status-label");
      if (bar) bar.style.width = `${pct}%`;
      if (pl) pl.textContent = `${pct}%`;
      if (sl && txt) sl.textContent = txt;
    };
    let loadedModels = 0;
    const stepTxts = [
      "Dựng sân vận động Melbourne...",
      "Căng lưới thi đấu...",
      "Nạp nhân vật chính...",
      "Nạp đối thủ thi đấu...",
      "Nạp vợt & bóng Kinetic...",
      "Nạp hiệu ứng 120 FPS...",
      "Hoàn tất cấu hình sân đấu...",
    ];
    const e = new D(),
      t = async (y, f = 2) => {
        const c =
          y.startsWith("http") || y.startsWith("./") || y.startsWith("/")
            ? y.replace(
                "https://www.gstatic.com/aistudio/starter-apps/tennis/",
                "./assets/",
              )
            : `./assets/models/${y}?v=argon4_kinetic`;
        const maxRetries =
          typeof navigator !== "undefined" && !navigator.onLine ? 0 : f;
        let res = null;
        for (let m = 0; m <= maxRetries; m++)
          try {
            res = await new Promise((b, u) => {
              e.load(
                c,
                (w) => b(w.scene),
                void 0,
                (w) => u(w),
              );
            });
            break;
          } catch (d) {
            if (m === maxRetries) {
              res = this._buildOfflineFallbackMesh(c);
              break;
            }
            await new Promise((b) => setTimeout(b, 250));
          }
        if (!res) res = this._buildOfflineFallbackMesh(c);
        loadedModels++;
        updateMorphProgress(
          Math.min(95, 12 + Math.round((loadedModels / 7) * 83)),
          stepTxts[loadedModels - 1] || "Nạp dữ liệu 3D...",
        );
        return res;
      },
      [i, a, s, n, h, r, l] = await Promise.all([
        t(
          "https://www.gstatic.com/aistudio/starter-apps/tennis/models/stadium_court.glb?v=argon4_kinetic",
        ),
        t(
          "https://www.gstatic.com/aistudio/starter-apps/tennis/models/tennis_net.glb?v=argon4_kinetic",
        ),
        t(
          "https://www.gstatic.com/aistudio/starter-apps/tennis/models/mii_player.glb?v=argon4_kinetic",
        ),
        t(
          "https://www.gstatic.com/aistudio/starter-apps/tennis/models/mii_opponent.glb?v=argon4_kinetic",
        ),
        t(
          "https://www.gstatic.com/aistudio/starter-apps/tennis/models/tennis_racket.glb?v=argon4_kinetic",
        ),
        t(
          "https://www.gstatic.com/aistudio/starter-apps/tennis/models/tennis_ball.glb?v=argon4_kinetic",
        ),
        t(
          "https://www.gstatic.com/aistudio/starter-apps/tennis/models/mii_crowd.glb?v=argon4_kinetic",
        ),
      ]),
      p = s.clone(!0),
      g = n.clone(!0);
    (this._prepareStadiumAndNet(i, a),
      this._prepareCrowd(l),
      this._prepareMiiActor(this.player, s, h),
      this._prepareMiiActor(this.playerPartner, p, h),
      this._prepareMiiActor(this.opponent, n, h),
      this._prepareMiiActor(this.opponentPartner, g, h),
      (this.isMultiplayer ||
        this.hostLoadout ||
        this.guestLoadout ||
        this.onlineMatchmaker?.currentRoomId) &&
        this.syncOnlineSquadLoadouts({
          hostLoadout: this.hostLoadout || this.onlineMatchmaker?.hostLoadout,
          guestLoadout:
            this.guestLoadout || this.onlineMatchmaker?.guestLoadout,
        }),
      this._prepareTennisBall(r),
      this._bootInitialStateFromURL(),
      this._initVipMechanicsUI(),
      characterShopManager.subscribe(() => this._initVipMechanicsUI()),
      updateMorphProgress(100, "SẴN SÀNG VÀO SÂN!"),
      (() => {
        const mo = document.getElementById("startup-morph-overlay");
        if (mo) {
          setTimeout(() => {
            triggerPhysicalHardwareVibration("serve_go");
            mo.classList.add("morph-dismissing");
            setTimeout(() => {
              mo.style.display = "none";
            }, 650);
          }, 400);
          mo.addEventListener(
            "click",
            () => {
              mo.classList.add("morph-dismissing");
              setTimeout(() => {
                mo.style.display = "none";
              }, 650);
            },
            { once: !0 },
          );
        }
      })(),
      this.clock.start(),
      (this._staticModalFrameRendered = !1));
    const c = () => {
      requestAnimationFrame(c);
      const y = Math.min(this.clock.getDelta(), 0.08);
      if (this._isAnyModalOpen()) {
        this._staticModalFrameRendered ||
          (this.update(0.016),
          this.render(),
          (this._staticModalFrameRendered = !0));
        return;
      }
      ((this._staticModalFrameRendered = !1), this.update(y), this.render());
    };
    requestAnimationFrame(c);
  }
  _prepareStadiumAndNet(e, t) {
    const i = this.renderer.capabilities.getMaxAnisotropy
        ? this.renderer.capabilities.getMaxAnisotropy()
        : 8,
      a = (s) => {
        if (!s) return;
        const n = s.name || "";
        (s.map &&
          ((s.map.anisotropy = i),
          (s.map.wrapS = o.RepeatWrapping),
          (s.map.wrapT = o.RepeatWrapping),
          (s.map.needsUpdate = !0)),
          /TreeSprite/i.test(n)
            ? ((s.alphaTest = 0.35),
              (s.transparent = !0),
              (s.side = o.DoubleSide),
              (s.depthWrite = !0))
            : /Shadow|LogoArgonBanner/i.test(n)
              ? ((s.transparent = !0),
                (s.depthWrite = !1),
                (s.polygonOffset = !0),
                (s.polygonOffsetFactor = -2),
                (s.polygonOffsetUnits = -2))
              : /NetMesh/i.test(n) &&
                ((s.transparent = !0),
                (s.alphaTest = 0.08),
                (s.side = o.DoubleSide),
                (s.depthWrite = !1)),
          (s.needsUpdate = !0));
      };
    (e.traverse((s) => {
      if (s.isMesh) {
        const n = s.name || "";
        ((Array.isArray(s.material) ? s.material : [s.material]).forEach(a),
          /Shadow/i.test(n)
            ? ((s.castShadow = !1), (s.receiveShadow = !1), (s.renderOrder = 1))
            : ((s.castShadow = /Umpire|Bench/i.test(n)),
              (s.receiveShadow =
                /Court|Turf|Ground|Floor/i.test(n) || !/Tree/i.test(n))));
      }
    }),
      this.scene.add(e),
      t.traverse((s) => {
        if (s.isMesh) {
          const n = s.name || "";
          ((Array.isArray(s.material) ? s.material : [s.material]).forEach(a),
            /Shadow/i.test(n)
              ? ((s.castShadow = !1),
                (s.receiveShadow = !1),
                (s.renderOrder = 1))
              : /Mesh/i.test(n)
                ? ((s.castShadow = !0),
                  (s.receiveShadow = !1),
                  (s.renderOrder = 2))
                : ((s.castShadow = !0), (s.receiveShadow = !1)));
        }
      }),
      this.scene.add(t),
      this.courtMapManager && this.courtMapManager.applyToScene());
  }
  _prepareCrowd(e) {
    (e.position.set(0, 0, 0),
      e.traverse((t) => {
        t.isMesh && ((t.castShadow = !1), (t.receiveShadow = !0));
      }),
      (this.crowdScene = e),
      this.scene.add(e));
  }
  _prepareMiiActor(e, t, i) {
    ((e.model = t),
      t.traverse((s) => {
        (s.isMesh && ((s.castShadow = !0), (s.receiveShadow = !0)),
          (s.userData.basePos = s.position.clone()),
          (s.userData.baseRot = s.rotation.clone()));
        const n = (s.name || "").trim();
        /^head(\.?0*\d+)?$/i.test(n) && (!e.parts.head || !s.isMesh)
          ? (e.parts.head = s)
          : /^torso(\.?0*\d+)?$/i.test(n) && (!e.parts.torso || !s.isMesh)
            ? (e.parts.torso = s)
            : /^hand_l(\.?0*\d+)?$/i.test(n) && (!e.parts.handL || !s.isMesh)
              ? (e.parts.handL = s)
              : /^hand_r(\.?0*\d+)?$/i.test(n) && (!e.parts.handR || !s.isMesh)
                ? (e.parts.handR = s)
                : /^foot_l(\.?0*\d+)?$/i.test(n) &&
                    (!e.parts.footL || !s.isMesh)
                  ? (e.parts.footL = s)
                  : /^foot_r(\.?0*\d+)?$/i.test(n) &&
                    (!e.parts.footR || !s.isMesh) &&
                    (e.parts.footR = s);
      }),
      t.scale.setScalar(1.16),
      e.root.add(t),
      $(e, e.sideSign > 0 ? "p1" : "p2"),
      this.facialFX && this.facialFX.attachFacialRig(e),
      this.bodyAnimator && this.bodyAnimator.setupArticulatedMiiRig(e));
    const a = i.clone(!0);
    (a.traverse((s) => {
      s.isMesh && ((s.castShadow = !0), (s.receiveShadow = !0));
    }),
      q(a),
      a.scale.setScalar(1.22),
      (e.racketMesh = a),
      e.racketPivot.position.set(-0.36, 0.9, 0.16),
      e.racketMesh.rotation.set(0, 0, 0),
      e.racketPivot.add(e.racketMesh),
      (e.swingArcMesh = se()),
      (e.swingArcMesh.visible = !1),
      e.root.add(e.swingArcMesh),
      e.root.add(e.racketPivot),
      (e.root.rotation.y = e.sideSign > 0 ? Math.PI : 0),
      e.root.position.copy(e.pos),
      this.scene.add(e.root),
      this.racketKinematics && this.racketKinematics.initActor(e),
      this.swingVfx && this.swingVfx.registerActor(e),
      e === this.player
        ? applyCharacter3DUpgradesToActor(e, characterShopManager, {
            unitRole: "player",
          })
        : e === this.playerPartner &&
          applyCharacter3DUpgradesToActor(e, characterShopManager, {
            unitRole: "partner",
          }));
  }
  _prepareTennisBall(e) {
    (e.traverse((t) => {
      t.isMesh && ((t.castShadow = !0), (t.receiveShadow = !1));
    }),
      e.scale.setScalar(1.65),
      (this.ball.mesh = e),
      this.ball.mesh.position.copy(this.ball.pos),
      this.scene.add(this.ball.mesh));
  }
  _bootInitialStateFromURL() {
    if (this.urlRoom && this.urlRoom !== "DEFAULT") {
      ((this.score.playerPoints = 0),
        (this.score.opponentPoints = 0),
        this._syncScoreboardHUD(),
        this._setupMidRallyShowcase({ scorePlayer: 0, scoreOpponent: 0 }),
        (this.autoPlayMode = !0),
        (this.roomId = this.urlRoom),
        (this.playerRole = this.urlRole || "p2"),
        (this.isMultiplayer = !0),
        this._applyDifficultyTuning("1v1"),
        this.onlineLobbyUI && this.onlineLobbyUI.open());
      return;
    }
    if (!this.urlAutoPlay) {
      ((this.score.playerPoints = 0),
        (this.score.opponentPoints = 0),
        this._syncScoreboardHUD(),
        this._setupMidRallyShowcase({ scorePlayer: 0, scoreOpponent: 0 }),
        (this.autoPlayMode = !0),
        this.audioEngine && this.audioEngine.playMusicForState("title"));
      return;
    }
    if (
      (this.hud.hideTitleModal(),
      this.urlState === "gamepoint" || this.urlState === "serve")
    ) {
      ((this.score.playerPoints = 3),
        (this.score.opponentPoints = 0),
        (this.score.playerGames = 0),
        (this.score.opponentGames = 0),
        (this.score.server = "player"),
        (this.score.deuceSide = !1),
        this._syncScoreboardHUD(),
        (this.persistentStateLock = !0),
        this._setupPointServe({
          showBanner: !0,
          bannerText: "Game Point",
          bannerStyle: "style-gold",
          persistentBanner: !0,
        }),
        this._snapCameraImmediate(),
        this.audioEngine && this.audioEngine.playMusicForState("gamepoint"));
      return;
    }
    if (this.urlState === "start") {
      ((this.score.playerPoints = 0),
        (this.score.opponentPoints = 0),
        (this.score.server = "player"),
        (this.score.deuceSide = !0),
        this._syncScoreboardHUD(),
        (this.persistentStateLock = !0),
        this._setupPointServe({
          showBanner: !0,
          bannerText: "Start",
          bannerStyle: "style-start",
          persistentBanner: !0,
        }),
        this._snapCameraImmediate());
      return;
    }
    if (this.urlState === "replay") {
      ((this.score.playerPoints = 3),
        (this.score.opponentPoints = 0),
        this._syncScoreboardHUD(),
        (this.persistentStateLock = !0),
        this._enterInstantReplayState({ persistent: !0 }),
        this._snapCameraImmediate(),
        this.audioEngine && this.audioEngine.playMusicForState("replay"));
      return;
    }
    if (this.urlState && this.urlState.startsWith("showcase")) {
      ((this.score.playerPoints = 2),
        (this.score.opponentPoints = 1),
        this._syncScoreboardHUD(),
        (this.persistentStateLock = !0),
        (this.autoPlayMode = !1),
        this._setupKineticShowcaseState(this.urlState),
        this._snapCameraImmediate());
      return;
    }
    ((this.score.playerPoints = 1),
      (this.score.opponentPoints = 0),
      (this.score.playerGames = 0),
      (this.score.opponentGames = 0),
      this._syncScoreboardHUD(),
      this.hud.hideCenterBanner(),
      this.hud.setReplayMode(!1),
      (this.autoPlayMode = !0),
      (this.persistentStateLock = !1),
      this._setupMidRallyShowcase({ scorePlayer: 1, scoreOpponent: 0 }),
      this._snapCameraImmediate(),
      this.audioEngine && this.audioEngine.playMusicForState("rally"));
  }
  _setupKineticShowcaseState(e = "showcase_topspin") {
    ((this.phase = "SHOWCASE"),
      (this.showcaseModeName = e),
      (this.phaseTimer = 0),
      (this.cameraMode = "SHOWCASE_CAM"),
      this.hud.setReplayMode(!1),
      this.hud.hideCenterBanner(),
      this.player.pos.set(1.15, 0, 11.2),
      this.player.targetPos.copy(this.player.pos),
      (this.player.root.rotation.y = Math.PI + 0.18),
      this.opponent.pos.set(-1.25, 0, -10.2),
      this.opponent.targetPos.copy(this.opponent.pos),
      this.playerPartner.pos.set(-2.35, 0, 5.2),
      this.opponentPartner.pos.set(2.35, 0, -5.2),
      this._refreshShowcasePose());
  }
  _refreshShowcasePose() {
    const e = this.showcaseModeName || "showcase_topspin",
      t = (i) => {
        for (let a = 0; a < 10; a++)
          ((this.player.racketKinematics.swingActive = !0),
            (this.player.racketKinematics.swingElapsed = i),
            this.racketKinematics.update(this.player, 0.016, {
              ball: this.ball,
              phase: this.phase,
            }),
            (this.player.racketKinematics.swingActive = !0),
            (this.player.racketKinematics.swingElapsed = i),
            this.bodyAnimator.updateMiiBodyAnimation(this.player, 0.016, this));
        this.player.root.updateMatrixWorld(!0);
      };
    if (e === "showcase_slice" || e === "showcase_backhand") {
      ((this.player.swingType = "backhand"),
        (this.player.swingDuration = 0.36),
        (this.player.swingTimer = 0.26),
        this.racketKinematics.triggerSwing(this.player, {
          shotType: e === "showcase_backhand" ? "topspin" : "slice",
          side: "backhand",
          speed: 1.32,
          timing: "sweet",
        }),
        t(0.072),
        this.swingVfx.seedActorSwingArc(this.player, {
          shotType: "SLICE",
          isPower: !1,
          whipSpeed: 28,
          swingType: "backhand",
        }),
        this.facialFX.setExpression(this.player, "focused_squint", 10));
      const a = this.racketKinematics
        .getRacketRimWorldPoints(this.player)
        .centerWorld.clone();
      (this.ball.pos.copy(a).add(new o.Vector3(0.06, 0.03, -0.22)),
        this.ball.vel.set(1.4, 0.9, -15.2),
        this.ballTrail.setStyle("SLICE", !1),
        this.ballTrail.seedArc(a, this.ball.pos, 0.05),
        this.swingVfx.triggerBallDeformation(
          this.ball,
          "racket_hit",
          this.ball.vel,
          26,
        ),
        this.swingVfx.spawnImpactBurst(a, {
          shotType: "SLICE",
          isPower: !1,
          count: 16,
        }));
    } else if (e === "showcase_smash") {
      ((this.player.swingType = "smash"),
        (this.player.swingDuration = 0.36),
        (this.player.swingTimer = 0.26),
        this.racketKinematics.triggerSwing(this.player, {
          shotType: "smash",
          side: "overhead",
          speed: 1.45,
          timing: "sweet",
        }),
        t(0.058),
        this.swingVfx.seedActorSwingArc(this.player, {
          shotType: "SMASH",
          isPower: !0,
          whipSpeed: 34,
          swingType: "smash",
        }),
        this.facialFX.setExpression(this.player, "effort_shout", 10));
      const a = this.racketKinematics
        .getRacketRimWorldPoints(this.player)
        .centerWorld.clone();
      (this.ball.pos.copy(a).add(new o.Vector3(-0.04, -0.04, -0.22)),
        this.ball.vel.set(-1.5, -2.8, -22),
        this.ballTrail.setStyle("SMASH", !0),
        this.ballTrail.seedArc(a, this.ball.pos, 0.05),
        this.swingVfx.triggerBallDeformation(
          this.ball,
          "racket_hit",
          this.ball.vel,
          32,
        ),
        this.swingVfx.spawnImpactBurst(a, {
          shotType: "SMASH",
          isPower: !0,
          count: 22,
        }));
    } else if (e === "showcase_panic")
      (this.player.vel.set(-6.8, 0, 1.2),
        (this.player.stridePhase += 0.35),
        this.facialFX.setExpression(this.player, "wide_eyed_panic", 10),
        this.facialFX.spawnSweatDrops(this.player, 6),
        this.facialFX.triggerEmoteBurst(this.player, "panic"),
        this.ball.pos.set(0.78, 2.15, 9.85),
        this.ballTrail.setStyle("LOB", !1),
        this.ballTrail.seedArc(
          new o.Vector3(-0.8, 2.75, 5.2),
          this.ball.pos,
          0.72,
        ));
    else if (e === "showcase_win")
      (this.player.rig?.reaction?.type ||
        this.bodyAnimator.triggerPointReaction(this.player, "win"),
        this.player.rig?.reaction && (this.player.rig.reaction.timer = 0.16),
        this.facialFX.setExpression(this.player, "happy_grin", 10),
        this.facialFX.triggerEmoteBurst(this.player, "win"),
        this.opponent.rig?.reaction?.type ||
          this.bodyAnimator.triggerPointReaction(this.opponent, "loss"),
        this.facialFX.setExpression(this.opponent, "shocked_loss", 10),
        this.ball.pos.set(-2.5, 0.12, -11.5));
    else {
      ((this.player.swingType = "forehand"),
        (this.player.swingDuration = 0.36),
        (this.player.swingTimer = 0.26),
        this.racketKinematics.triggerSwing(this.player, {
          shotType: "topspin",
          side: "forehand",
          speed: 1.35,
          timing: "sweet",
        }),
        t(0.068),
        this.swingVfx.seedActorSwingArc(this.player, {
          shotType: "TOPSPIN",
          isPower: !0,
          whipSpeed: 29,
          swingType: "forehand",
        }),
        this.facialFX.setExpression(this.player, "effort_shout", 10));
      const a = this.racketKinematics
        .getRacketRimWorldPoints(this.player)
        .centerWorld.clone();
      (this.ball.pos.copy(a).add(new o.Vector3(-0.06, 0.04, -0.22)),
        this.ball.vel.set(-1.8, 2.2, -18.5),
        this.ballTrail.setStyle("TOPSPIN", !0),
        this.ballTrail.seedArc(a, this.ball.pos, 0.05),
        this.swingVfx.triggerBallDeformation(
          this.ball,
          "racket_hit",
          this.ball.vel,
          28,
        ),
        this.swingVfx.spawnImpactBurst(a, {
          shotType: "TOPSPIN",
          isPower: !0,
          count: 18,
        }));
    }
  }
  _createEmptySideAnalytics() {
    return {
      totalSwings: 0,
      sweetSpot: 0,
      good: 0,
      earlyLate: 0,
      whiff: 0,
      powerShots: 0,
      totalSpeedKmh: 0,
      hitCountForSpeed: 0,
      maxSpeedKmh: 0,
      byShotType: {
        TOPSPIN: 0,
        SLICE: 0,
        FLAT: 0,
        LOB: 0,
        SMASH: 0,
        SERVE: 0,
      },
      placements: [],
    };
  }
  _initMatchAnalytics() {
    this.matchAnalytics = {
      startedAt: Date.now(),
      player: this._createEmptySideAnalytics(),
      opponent: this._createEmptySideAnalytics(),
    };
  }
  _recordMatchSwing(
    side = "player",
    {
      timing = "GOOD",
      shotType = "TOPSPIN",
      speedKmh = 140,
      isPower = !1,
      whiff = !1,
    } = {},
  ) {
    if (this.autoPlayMode && !this.userHasInteracted) return;
    if (!this.matchAnalytics) this._initMatchAnalytics();
    const bucket =
      side === "opponent"
        ? this.matchAnalytics.opponent
        : this.matchAnalytics.player;
    bucket.totalSwings += 1;
    if (whiff) {
      bucket.whiff += 1;
      return;
    }
    const tUp = String(timing || "GOOD").toUpperCase();
    if (tUp.includes("PERFECT") || tUp.includes("SWEET")) {
      bucket.sweetSpot += 1;
    } else if (tUp.includes("EARLY") || tUp.includes("LATE")) {
      bucket.earlyLate += 1;
    } else {
      bucket.good += 1;
    }
    if (isPower) bucket.powerShots += 1;
    const spd = Math.round(Number(speedKmh) || 0);
    if (spd > 0) {
      bucket.totalSpeedKmh += spd;
      bucket.hitCountForSpeed += 1;
      if (spd > bucket.maxSpeedKmh) bucket.maxSpeedKmh = spd;
    }
    const normType = String(shotType || "TOPSPIN").toUpperCase();
    const key =
      normType === "POWER"
        ? "SMASH"
        : bucket.byShotType[normType] !== undefined
          ? normType
          : "TOPSPIN";
    bucket.byShotType[key] = (bucket.byShotType[key] || 0) + 1;
  }
  _recordMatchPlacement(
    side = "player",
    { x = 0, z = 0, shotType = "TOPSPIN", isPower = !1, inBounds = !0 } = {},
  ) {
    if (this.autoPlayMode && !this.userHasInteracted) return;
    if (!this.matchAnalytics) this._initMatchAnalytics();
    const bucket =
      side === "opponent"
        ? this.matchAnalytics.opponent
        : this.matchAnalytics.player;
    bucket.placements.push({
      x: +Number(x).toFixed(2),
      z: +Number(z).toFixed(2),
      shotType: String(shotType || "TOPSPIN").toUpperCase(),
      isPower: !!isPower,
      inBounds: !!inBounds,
    });
    if (bucket.placements.length > 90) {
      bucket.placements.shift();
    }
  }
  startNewMatch({ showStartBanner: e = !0, skipIntro: sIntro = !1, difficulty: customDiff = null, gamesToWin: customGames = null } = {}) {
    this._initMatchAnalytics();
    if (customDiff) {
      this.matchConfig.difficulty = customDiff;
      this._applyDifficultyTuning(customDiff);
    }
    if (customGames) {
      this.matchConfig.gamesToWin = Number(customGames) || 1;
    }
    if (
      !sIntro &&
      !this.autoPlayMode &&
      this.hud &&
      typeof this.hud.showVersusIntro === "function"
    ) {
      ((this.score.playerPoints = 0),
        (this.score.opponentPoints = 0),
        (this.score.playerGames = 0),
        (this.score.opponentGames = 0),
        (this.score.server = "player"),
        (this.score.deuceSide = !0),
        (this.matchCoinsEarned = 0),
        this._syncScoreboardHUD(),
        this.hud.setReplayMode(!1));
      const hostProfile =
          this.hostLoadout ||
          characterShopManager?.getProfileSlot?.("player1") ||
          characterShopManager?.state?.units?.player ||
          {},
        guestProfile =
          this.guestLoadout ||
          characterShopManager?.getProfileSlot?.("opponent1") ||
          characterShopManager?.state?.units?.partner ||
          {},
        p1Name =
          this.roomStatus?.hostName ||
          (this.playerRole === "p2" ? "Đối Thủ" : "Bạn (P1)"),
        p2Name =
          this.roomStatus?.guestName ||
          (this.isMultiplayer
            ? "Challenger (P2)"
            : this.matchConfig?.difficulty === "x2"
              ? "TRÙM CUỐI BOT LV.20 (X2 GOD)"
              : this.matchConfig?.difficulty === "cuc_cao"
                ? "Bot Lv.18 (Cực Cao)"
                : this.matchConfig?.difficulty === "sieu_cao"
                  ? "Bot Lv.16 (Siêu Cao)"
                  : this.matchConfig?.difficulty === "cao" || this.matchConfig?.difficulty === "pro"
                    ? "Bot Lv.12 (Cao)"
                    : this.matchConfig?.difficulty === "thap"
                      ? "Bot Lv.4 (Thấp)"
                      : this.matchConfig?.difficulty === "de"
                        ? "Bot Lv.1 (Dễ)"
                        : "Bot Lv.8 (Trung Bình)");
      this.hud.showVersusIntro({
        p1Name,
        p2Name,
        p1MiiData: hostProfile,
        p2MiiData: guestProfile,
        isOnline: this.isMultiplayer,
        onComplete: () => {
          (this.audioEngine &&
            (this.audioEngine.playMusicForState("start"),
            this.audioEngine.announceScore("Start")),
            this._setupPointServe({
              showBanner: e,
              bannerText: "Start",
              bannerStyle: "style-start",
              persistentBanner: !1,
            }));
        },
      });
      return;
    }
    ((this.score.playerPoints = 0),
      (this.score.opponentPoints = 0),
      (this.score.playerGames = 0),
      (this.score.opponentGames = 0),
      (this.score.server = "player"),
      (this.score.deuceSide = !0),
      (this.matchCoinsEarned = 0),
      this._syncScoreboardHUD(),
      this.hud.setReplayMode(!1),
      this.audioEngine &&
        (this.audioEngine.playMusicForState("start"),
        this.audioEngine.announceScore("Start")),
      this._setupPointServe({
        showBanner: e,
        bannerText: "Start",
        bannerStyle: "style-start",
        persistentBanner: !1,
      }));
  }
  triggerCameraShake(intensity = 0.42) {
    this.cameraTrauma = Math.min(
      1.1,
      Math.max(this.cameraTrauma || 0, intensity),
    );
    const shell = document.getElementById("app-shell");
    if (shell && intensity >= 0.28) {
      (shell.classList.remove("court-shake-active"),
        void shell.offsetWidth,
        shell.classList.add("court-shake-active"),
        clearTimeout(this._shakeCssTimer),
        (this._shakeCssTimer = setTimeout(
          () => shell.classList.remove("court-shake-active"),
          280,
        )));
    }
    if (
      typeof navigator !== "undefined" &&
      navigator.vibrate &&
      this.motionController?.settings?.hapticsEnabled !== !1
    ) {
      try {
        navigator.vibrate(intensity >= 0.45 ? [28, 30, 45] : 18);
      } catch {}
    }
  }
  _rewardMatchCoins(amount, reason = "") {
    if (!amount || amount <= 0) return;
    const mapBonus =
        this.courtMapManager?.getTotalCoinBonusPct?.() ??
        (this.courtMapManager?.getSelectedMap?.()?.coinBonusPct || 0),
      wCfg = this.courtMapManager?.getSelectedWeather?.(),
      hasStormBonus = wCfg && wCfg.id !== "calm",
      cMult =
        Math.max(
          characterShopManager.getEffectivePlayerModifiers()?.coinBonusMult ||
            1,
          characterShopManager.getEffectivePartnerModifiers()?.coinBonusMult ||
            1,
        ) + mapBonus,
      finalAmt = Math.round(amount * cMult);
    (characterShopManager.addCoins(finalAmt),
      (this.matchCoinsEarned = (this.matchCoinsEarned || 0) + finalAmt),
      this.characterShopUI &&
        this.characterShopUI._refreshCoinsBadges &&
        this.characterShopUI._refreshCoinsBadges(),
      this.characterShopUI &&
        this.characterShopUI._playSfx &&
        this.characterShopUI._playSfx("buy"),
      this._spawnFloatingCoinToast(
        finalAmt,
        cMult > 1.01 && reason
          ? `${reason} (+${Math.round((cMult - 1) * 100)}% ${hasStormBonus ? "MAP GIÓ BÃO" : "THƯỞNG"})`
          : reason,
      ));
  }
  _spawnFloatingCoinToast(amount, reason = "") {
    if (typeof document === "undefined") return;
    let layer = document.getElementById("coin-reward-float-layer");
    if (!layer) {
      ((layer = document.createElement("div")),
        (layer.id = "coin-reward-float-layer"),
        (layer.className = "coin-reward-float-layer"),
        document.body.appendChild(layer));
    }
    const pill = document.createElement("div");
    ((pill.className = "coin-reward-float-pill"),
      (pill.innerHTML = `<span class="coin-float-amount">+${amount.toLocaleString("vi-VN")} XU</span>${reason ? `<span class="coin-float-reason">${reason}</span>` : ""}`),
      layer.appendChild(pill),
      setTimeout(() => {
        (pill.classList.add("fade-out"), setTimeout(() => pill.remove(), 420));
      }, 1850));
  }
  _setupPointServe({
    showBanner: e = !0,
    bannerText: t = null,
    bannerStyle: i = "style-gold",
    persistentBanner: a = !1,
  } = {}) {
    ((this.phase = "SERVE_STANCE"),
      (this.phaseTimer = 0),
      (this.cameraMode = "SERVE_CAM"),
      this.hud.setReplayMode(!1),
      this.ballTrail.clear(),
      this.swingVfx && this.swingVfx.clearAllTrails());
    const s = this.score.deuceSide ? 1.35 : -0.55,
      n = this.score.deuceSide ? -2.35 : 2.15;
    this.score.server === "player"
      ? (this.player.pos.set(s, 0, S.BASELINE_Z + 0.12),
        this.player.targetPos.copy(this.player.pos),
        this.opponent.pos.set(n, 0, -S.BASELINE_Z + 0.35),
        this.opponent.targetPos.copy(this.opponent.pos),
        this.ball.pos.set(s - 0.28, 1.12, S.BASELINE_Z - 0.15))
      : (this.opponent.pos.set(-s, 0, -S.BASELINE_Z - 0.12),
        this.opponent.targetPos.copy(this.opponent.pos),
        this.player.pos.set(-n, 0, S.BASELINE_Z - 0.35),
        this.player.targetPos.copy(this.player.pos),
        this.ball.pos.set(-s + 0.28, 1.12, -S.BASELINE_Z + 0.15));
    const h = this.score.deuceSide ? -2.05 : 2.05;
    (this.playerPartner.pos.set(h, 0, 5.2),
      this.playerPartner.targetPos.copy(this.playerPartner.pos),
      (this.playerPartner.root.visible = !0),
      this.playerPartner.shadowBlob &&
        (this.playerPartner.shadowBlob.visible = !0),
      this.opponentPartner.pos.set(-h, 0, -5.2),
      this.opponentPartner.targetPos.copy(this.opponentPartner.pos),
      (this.opponentPartner.root.visible = !0),
      this.opponentPartner.shadowBlob &&
        (this.opponentPartner.shadowBlob.visible = !0),
      this.ball.vel.set(0, 0, 0),
      this.ball.spin.set(0, 0, 0),
      (this.ball.inPlay = !1),
      (this.ball.bounceCountOnCurrentSide = 0),
      (this.ball.rallyStrokeCount = 0),
      (this.pendingUserSwing = null),
      (this.pendingP2Swing = null),
      (this.pendingServeSwing = null),
      (this.player.swingArcMesh.visible = !1),
      (this.opponent.swingArcMesh.visible = !1),
      this.playerPartner.swingArcMesh &&
        (this.playerPartner.swingArcMesh.visible = !1),
      this.opponentPartner.swingArcMesh &&
        (this.opponentPartner.swingArcMesh.visible = !1),
      (this.player.swingCooldown = 0),
      (this.playerPartner.swingCooldown = 0),
      (this.opponent.swingCooldown = 0),
      (this.opponentPartner.swingCooldown = 0),
      this.facialFX &&
        (this.facialFX.setExpression(this.player, "neutral", 2),
        this.facialFX.setExpression(this.opponent, "neutral", 2),
        this.facialFX.setExpression(this.playerPartner, "neutral", 2),
        this.facialFX.setExpression(this.opponentPartner, "neutral", 2)));
    let r = t,
      l = i;
    if (!r && e) {
      const p = this._getHighStakesPointLabel();
      p &&
        ((r = p),
        (l = "style-gold"),
        this.audioEngine &&
          this.audioEngine.announceScore(p, { delayMs: 180 }));
    }
    (r && e
      ? (this._recordBannerBroadcast(r, l, ""),
        this.hud.showCenterBanner(r, {
          style: l,
          durationMs: 1800,
          persistent: a,
        }))
      : a || this.hud.hideCenterBanner(),
      this.hud.updateTimingGauge({
        cursorNormalized: 0.5,
        modeTitle: "SERVE TOSS",
        speedText: "UPWARD FLICK / SPACE",
      }));
  }
  _setupMidRallyShowcase({ scorePlayer: e = 1, scoreOpponent: t = 0 } = {}) {
    ((this.phase = "RALLY"),
      (this.phaseTimer = 0),
      (this.cameraMode = "RALLY_CAM"),
      this.hud.setReplayMode(!1),
      this.hud.hideCenterBanner(),
      this.player.pos.set(1.35, 0, 11.4),
      this.player.targetPos.set(1.15, 0, 11.4),
      (this.player.swingType = "forehand"),
      (this.player.swingTimer = 0.25),
      (this.player.arcVisibleTimer = 1.2),
      (this.player.swingArcMesh.visible = !0),
      this.racketKinematics &&
        (this.racketKinematics.triggerSwing(this.player, {
          shotType: "topspin",
          side: "forehand",
          speed: 1.35,
          timing: "sweet",
        }),
        (this.player.racketKinematics.swingElapsed = 0.13)),
      this.swingVfx &&
        this.swingVfx.seedActorSwingArc(this.player, {
          shotType: "TOPSPIN",
          isPower: !0,
          whipSpeed: 28,
          swingType: "forehand",
        }),
      this.facialFX &&
        (this.facialFX.setExpression(this.player, "effort_shout", 1.2),
        this.facialFX.setExpression(this.opponent, "focused_squint", 1.2)),
      this.playerPartner.pos.set(-2.1, 0, 5.4),
      this.playerPartner.targetPos.copy(this.playerPartner.pos),
      (this.playerPartner.root.visible = !0),
      this.playerPartner.shadowBlob &&
        (this.playerPartner.shadowBlob.visible = !0),
      this.opponentPartner.pos.set(2.1, 0, -5.4),
      this.opponentPartner.targetPos.copy(this.opponentPartner.pos),
      (this.opponentPartner.root.visible = !0),
      this.opponentPartner.shadowBlob &&
        (this.opponentPartner.shadowBlob.visible = !0),
      this.opponent.pos.set(-1.65, 0, -10.5),
      this.opponent.targetPos.set(-1.95, 0, -10.8));
    const i = new o.Vector3(1.42, 1.25, 10.85),
      a = new o.Vector3(-0.18, 1.88, 0.65);
    (this.ball.pos.copy(a),
      this.ball.vel.set(-1.85, 2.15, -14.8),
      this.ball.spin.set(18, 0, 0),
      (this.ball.inPlay = !0),
      (this.ball.lastHitter = "player"),
      (this.ball.bounceCountOnCurrentSide = 0),
      (this.ball.rallyStrokeCount = 2),
      (this.ball.shotType = "TOPSPIN"),
      (this.ball.isPowerShot = !0),
      this.ballTrail.setStyle("TOPSPIN", !1),
      this.ballTrail.seedArc(i, a, 0.72),
      this.swingVfx &&
        this.swingVfx.spawnImpactBurst(i, {
          shotType: "TOPSPIN",
          isPower: !0,
          count: 14,
        }),
      this._predictBallIntercept(this.opponent));
  }
  _enterInstantReplayState({ persistent: e = !1 } = {}) {
    ((this.phase = "REPLAY"),
      (this.phaseTimer = 0),
      (this.cameraMode = "REPLAY_CAM"),
      (this.persistentStateLock = e),
      this.hud.hideCenterBanner(),
      this.hud.setReplayMode(!0),
      (this.cheerEnergy = 0.85),
      this.audioEngine && !e && this.audioEngine.playVoiceCallout("replay"),
      this._resetReplayNetExchangePose());
  }
  _resetReplayNetExchangePose() {
    (this.player.pos.set(1.55, 0, 0.95),
      this.player.targetPos.copy(this.player.pos),
      (this.player.root.rotation.y = Math.PI + 0.22),
      (this.player.swingType = "forehand"),
      (this.player.swingTimer = 0.08),
      (this.player.arcVisibleTimer = 1.5),
      (this.player.swingArcMesh.visible = !0),
      this.opponent.pos.set(-1.25, 0, -1.35),
      this.opponent.targetPos.copy(this.opponent.pos),
      (this.opponent.root.rotation.y = -0.18),
      (this.opponent.swingType = "forehand"),
      (this.opponent.swingTimer = 0.12),
      (this.opponent.arcVisibleTimer = 1.5),
      (this.opponent.swingArcMesh.visible = !0),
      this.racketKinematics &&
        (this.racketKinematics.triggerSwing(this.player, {
          shotType: "topspin",
          side: "forehand",
          speed: 1.32,
          timing: "sweet",
        }),
        (this.player.racketKinematics.swingElapsed = 0.14),
        this.racketKinematics.triggerSwing(this.opponent, {
          shotType: "slice",
          side: "forehand",
          speed: 1.25,
          timing: "sweet",
        }),
        (this.opponent.racketKinematics.swingElapsed = 0.11)),
      this.swingVfx &&
        (this.swingVfx.seedActorSwingArc(this.player, {
          shotType: "TOPSPIN",
          isPower: !0,
          whipSpeed: 28,
          swingType: "forehand",
        }),
        this.swingVfx.seedActorSwingArc(this.opponent, {
          shotType: "SLICE",
          isPower: !1,
          whipSpeed: 25,
          swingType: "forehand",
        })),
      this.facialFX &&
        (this.facialFX.setExpression(this.player, "effort_shout", 2),
        this.facialFX.setExpression(this.opponent, "wide_eyed_panic", 2),
        this.facialFX.spawnSweatDrops(this.opponent, 5)),
      this.playerPartner.pos.set(-4.2, 0, 9.5),
      this.opponentPartner.pos.set(4.2, 0, -9.5));
    const e = new o.Vector3(-1.12, 1.22, -1.08),
      t = new o.Vector3(-0.08, 1.34, 0.05);
    (this.ball.pos.copy(t),
      this.ball.vel.set(0.95, 0.85, 3.6),
      (this.ball.inPlay = !0),
      this.ballTrail.setStyle("SLICE", !0),
      this.ballTrail.seedArc(e, t, 0.24));
  }
  _handleUserTossInput(e = {}) {
    if (this._isAnyModalOpen()) return !1;
    this.userHasInteracted = !0;
    if (this.isMultiplayer && this.playerRole === "p2") {
      this.onlineMatchmaker &&
        this.onlineMatchmaker.currentRoomId &&
        this.onlineMatchmaker.sendGuestAction({ type: "toss", ...e });
      return this._handleP2TossInput(e);
    }
    return this.phase === "TITLE"
      ? (this.hud.hideTitleModal(),
        (this.autoPlayMode = !1),
        (this.persistentStateLock = !1),
        this.startNewMatch({ showStartBanner: !0 }),
        !0)
      : this.phase === "SERVE_STANCE" && this.score.server === "player"
        ? ((this.persistentStateLock = !1),
          this.hud.hideCenterBanner(),
          this._startServeToss(this.player),
          !0)
        : !1;
  }
  _handleUserSwingInput(e = {}) {
    if (this._isAnyModalOpen()) return;
    this.userHasInteracted = !0;
    if (this.isMultiplayer && this.playerRole === "p2") {
      this.onlineMatchmaker &&
        this.onlineMatchmaker.currentRoomId &&
        this.onlineMatchmaker.sendGuestAction({
          type: "swing",
          shotType: this.p2SelectedShotType || this.selectedShotType,
          ...e,
        });
      this._handleP2SwingInput(e);
      return;
    }
    if (this.phase === "TITLE") {
      (this.hud.hideTitleModal(),
        (this.autoPlayMode = !1),
        (this.persistentStateLock = !1),
        this.startNewMatch({ showStartBanner: !0 }));
      return;
    }
    if (e.shotType && e.shotType !== "toss") {
      const t = String(e.shotType).toUpperCase();
      ["TOPSPIN", "SLICE", "LOB", "SMASH", "FLAT"].includes(t) &&
        (this.selectedShotType = t === "SMASH" ? "FLAT" : t);
    }
    if (this.phase === "SERVE_STANCE" && this.score.server === "player") {
      ((this.persistentStateLock = !1),
        this.hud.hideCenterBanner(),
        this._startServeToss(this.player));
      return;
    }
    if (this.phase === "SERVE_TOSS" && this.score.server === "player") {
      if (this.phaseTimer < 0.16) return;
      if (
        this.ball.pos.y >= 1.45 &&
        this.ball.pos.y < 2.25 &&
        this.ball.vel.y > 0.5
      ) {
        this.pendingServeSwing = {
          actor: this.player,
          evt: { ...e, speed: Math.max(1.22, Number(e.speed || 1.22)) },
        };
        return;
      }
      this._executeServeHit(this.player, e);
      return;
    }
    if (this.phase === "RALLY") {
      this.autoPlayMode = !1;
      if (this.player.swingCooldown > 0) return;
      const t =
          e.side === "backhand" ||
          (Number(e.dirX || 0) > 0.12 && e.side !== "forehand")
            ? "backhand"
            : e.side === "forehand" || Number(e.dirX || 0) < -0.12
              ? "forehand"
              : this.ball.pos.x < this.player.pos.x - 0.05 ||
                  this.ball.targetLanding.x < -0.15
                ? "backhand"
                : "forehand",
        i = String(
          e.shotType || this.selectedShotType || "topspin",
        ).toLowerCase();
      // Do NOT queue pendingUserSwing! Every swing press is evaluated immediately.
      // If the ball is not within reach right now, it whiffs and locks cooldown so spamming fails.
      this.pendingUserSwing = null;
      if (!this._attemptPlayerRallyStrike({ ...e, side: t }, !1)) {
        this.player.swingCooldown = 0.48;
        this.racketKinematics &&
          this.racketKinematics.triggerSwing(this.player, {
            shotType: i,
            side: t,
            speed: Number(e.speed || 1.2),
            timing: "late",
            dirX: Number(e.dirX || 0),
          });
        this.audioEngine &&
          this.audioEngine.playSwingWhoosh(Number(e.speed || 1.15));
      }
    }
  }
  _handleP2TossInput(e = {}) {
    if (this._isAnyModalOpen()) return !1;
    return (
      (this.userHasInteracted = !0),
      (this.isMultiplayer = !0),
      this.phase === "TITLE"
        ? (this.hud.hideTitleModal(),
          (this.autoPlayMode = !1),
          (this.persistentStateLock = !1),
          this.startNewMatch({ showStartBanner: !0 }),
          !0)
        : this.phase === "SERVE_STANCE" && this.score.server === "opponent"
          ? ((this.persistentStateLock = !1),
            this.hud.hideCenterBanner(),
            this._startServeToss(this.opponent),
            !0)
          : !1
    );
  }
  _handleP2SwingInput(e = {}) {
    if (this._isAnyModalOpen()) return;
    if (
      ((this.userHasInteracted = !0),
      (this.isMultiplayer = !0),
      this._applyDifficultyTuning("1v1"),
      this.phase === "TITLE")
    ) {
      (this.hud.hideTitleModal(),
        (this.autoPlayMode = !1),
        (this.persistentStateLock = !1),
        this.startNewMatch({ showStartBanner: !0 }));
      return;
    }
    if (e.shotType && e.shotType !== "toss") {
      const t = String(e.shotType).toUpperCase();
      ["TOPSPIN", "SLICE", "LOB", "SMASH", "FLAT"].includes(t) &&
        (this.p2SelectedShotType = t === "SMASH" ? "FLAT" : t);
    }
    if (this.phase === "SERVE_STANCE" && this.score.server === "opponent") {
      ((this.persistentStateLock = !1),
        this.hud.hideCenterBanner(),
        this._startServeToss(this.opponent));
      return;
    }
    if (this.phase === "SERVE_TOSS" && this.score.server === "opponent") {
      if (this.phaseTimer < 0.16) return;
      if (
        this.ball.pos.y >= 1.45 &&
        this.ball.pos.y < 2.25 &&
        this.ball.vel.y > 0.5
      ) {
        this.pendingServeSwing = {
          actor: this.opponent,
          evt: { ...e, speed: Math.max(1.22, Number(e.speed || 1.22)) },
        };
        return;
      }
      this._executeServeHit(this.opponent, e);
      return;
    }
    if (this.phase === "RALLY") {
      this.autoPlayMode = !1;
      const t =
          e.side === "backhand" ||
          (Number(e.dirX || 0) > 0.12 && e.side !== "forehand")
            ? "backhand"
            : e.side === "forehand" || Number(e.dirX || 0) < -0.12
              ? "forehand"
              : this.ball.pos.x > this.opponent.pos.x + 0.05 ||
                  this.ball.targetLanding.x > 0.15
                ? "backhand"
                : "forehand",
        i = String(
          e.shotType || this.p2SelectedShotType || "topspin",
        ).toLowerCase();
      if (this.ball.lastHitter === "player") {
        const s = this.opponent.pos.z - this.ball.pos.z;
        if (s < -0.95 && s >= -7.8) {
          (this.racketKinematics &&
            this.racketKinematics.triggerSwing(this.opponent, {
              shotType: i,
              side: t,
              speed: Number(e.speed || 1.2),
              timing: "early",
              dirX: Number(e.dirX || 0),
            }),
            (this.pendingP2Swing = {
              evt: { ...e, side: t, sweetSpotAssisted: !0 },
              expiresAt: this.elapsedTime + 0.48,
              waitForSweetSpot: !0,
            }));
          return;
        }
      }
      this._attemptP2RallyStrike({ ...e, side: t }) ||
        (this.racketKinematics &&
          this.racketKinematics.triggerSwing(this.opponent, {
            shotType: i,
            side: t,
            speed: Number(e.speed || 1.2),
            timing: "sweet",
            dirX: Number(e.dirX || 0),
          }),
        this.ball.lastHitter === "player" &&
          (this.pendingP2Swing = {
            evt: { ...e, side: t, sweetSpotAssisted: !0 },
            expiresAt: this.elapsedTime + 0.48,
            waitForSweetSpot: !0,
          }));
    }
  }
  _startServeToss(e) {
    ((this.phase = "SERVE_TOSS"),
      (this.phaseTimer = 0),
      (this.pendingServeSwing = null));
    const t = e.sideSign > 0 ? -0.32 : 0.32;
    (this.ball.pos.set(e.pos.x + t, 1.18, e.pos.z - e.sideSign * 0.22),
      this.ball.vel.set(0, 6.32, 0),
      (this.ball.inPlay = !1),
      this.facialFX && this.facialFX.setExpression(e, "focused_squint", 1.4),
      this.audioEngine && this.audioEngine.playServeToss(),
      triggerPhysicalHardwareVibration("toss", {
        role: e.role === "player" ? "p1" : "p2",
      }));
  }
  _executeServeHit(e, t = {}) {
    const i = this.ball.pos.y;
    if (i < 1.25) return;
    this.pendingServeSwing = null;
    const pMods =
        e.role === "player"
          ? this.isMultiplayer && this.hostLoadout
            ? characterShopManager.getPlayerModifiersFromLoadout(
                this.hostLoadout,
              )
            : characterShopManager.getEffectivePlayerModifiers()
          : this.isMultiplayer && e.role === "opponent"
            ? characterShopManager.getPlayerModifiersFromLoadout(
                this.guestLoadout,
              )
            : null,
      swBonus = pMods?.sweetSpotAdd || 0,
      pMult = (pMods?.powerMult || 1) * (pMods?.servePowerMult || 1),
      spMult = pMods?.spinMult || 1,
      a = o.MathUtils.clamp(Number(t.speed || 1.18) * pMult, 0.78, 2.15),
      s = i >= 2.05 - swBonus && i <= 3.55 + swBonus,
      n = i < 1.72;
    ((e.swingType = "serve"),
      (e.swingDuration = 0.38),
      (e.swingTimer = 0.38),
      (e.arcVisibleTimer = 0.36),
      (e.swingArcMesh.visible = !0),
      this.racketKinematics &&
        (this.racketKinematics.triggerSwing(e, {
          shotType: "serve",
          side: "overhead",
          speed: a,
          timing: s ? "sweet" : n ? "early" : "sweet",
          isServe: !0,
          dirX: Number(t.dirX || 0),
        }),
        this.racketKinematics.triggerImpactRecoil(e, s ? 1.45 : 0.95)));
    const h = this.score.deuceSide ? -1 : 1,
      r = o.MathUtils.clamp(Number(t.dirX || 0), -1, 1) * 1.15,
      l = e.sideSign * h * (1.75 + Math.random() * 0.85),
      p = o.MathUtils.clamp(l + r, -S.SINGLES_X + 0.45, S.SINGLES_X - 0.45),
      c =
        e.role === "opponent" && !this.isMultiplayer
          ? this.matchConfig.difficulty === "pro"
            ? 1
            : 1.24
          : 1 / Math.max(1, (pMult - 1) * 0.55 + 1);
    let y = -e.sideSign * (4.4 + Math.random() * 1.35),
      f = s
        ? Math.max(0.52, 0.66 / Math.min(1.24, a * 0.92)) * c
        : n
          ? 0.94 * c
          : 0.8 * c,
      m = (s ? 22 : n ? 8 : 15) * spMult,
      d = Number(t.dirX || 0) * -8 * spMult;
    const b = !1,
      u = this.ball.pos.clone();
    this._launchBallToTarget(this.ball.pos, new o.Vector3(p, 0, y), f, {
      topspin: m,
      sidespin: d,
      allowNetFault: b,
    });
    const w = Math.round(
      (s
        ? 188 + Math.min(22, (a - 1) * 32)
        : n
          ? 128 + Math.random() * 14
          : 158 + Math.min(22, (a - 0.9) * 28)) * Math.min(1.32, pMult),
    );
    if (
      ((this.ball.inPlay = !0),
      (this.ball.lastHitter = e.role === "player" ? "player" : "opponent"),
      (this.ball.lastHitterRole = e.role),
      (this.ball.bounceCountOnCurrentSide = 0),
      (this.ball.rallyStrokeCount = 1),
      (this.ball.isPowerShot = s),
      (this.ball.shotType = s ? "POWER" : "TOPSPIN"),
      this.ballTrail.clear(),
      this.ballTrail.setStyle(this.ball.shotType, s, e),
      this.ballTrail.pushPoint(this.ball.pos),
      (this.phase = "RALLY"),
      (this.cameraMode = "RALLY_CAM"),
      this.swingVfx &&
        this.swingVfx.onRacketContact({
          actor: e,
          ball: this.ball,
          contactPos: u,
          shotType: s ? "SMASH" : "SERVE",
          isPower: s,
          isServe: !0,
          timingQuality: s ? "PERFECT" : "GOOD",
          speed: this.ball.vel.length(),
        }),
      this.facialFX && this.facialFX.setExpression(e, "effort_shout", 0.55),
      this.triggerCameraShake(s ? 0.52 : 0.22),
      s && this._spawnStarBurst(this.ball.pos, 14),
      this.audioEngine &&
        (this.audioEngine.playSwingWhoosh(s ? 1.5 : 1.1),
        this.audioEngine.playRacketHit(
          s ? "smash" : "topspin",
          s ? "perfect" : "good",
        ),
        (e.role === "player" || this.isMultiplayer) &&
          s &&
          !this.autoPlayMode &&
          this.audioEngine.playVoiceCallout("power serve")),
      e.role === "player" || (e.role === "opponent" && this.isMultiplayer))
    ) {
      const _ = e.role === "player" ? "p1" : "p2",
        T = s ? "POWER SERVE!" : n ? "EARLY SERVE" : "GOOD SERVE",
        M = `${w} KM/H \u2022 ${s ? "SWEET SPOT APEX" : n ? "LOW CONTACT" : "SERVICE BOX"}`,
        R = this._projectToScreen(e.pos.clone().add(new o.Vector3(0, 2.35, 0)));
      (this.hud.showTimingPopup({ grade: T, detail: M, screenPos: R }),
        this.hud.updateTimingGauge({
          cursorNormalized: s ? 0.5 : n ? 0.22 : 0.42,
          modeTitle: "SERVE IMPACT",
          speedText: `${w} KM/H`,
        }),
        this.motionController &&
          this.motionController.triggerHapticFeedback &&
          !this.autoPlayMode &&
          this.motionController.triggerHapticFeedback({
            role: _,
            kind: "hit",
            grade: T,
            shotType: s ? "SMASH" : "TOPSPIN",
            speedKmh: w,
            intensity: s ? 1.5 : n ? 0.75 : 1.05,
          }),
        triggerPhysicalHardwareVibration(s ? "sweet_spot" : "hit", {
          role: _,
        }));
    }
    this._recordMatchSwing(e.role === "player" ? "player" : "opponent", {
      timing: s ? "PERFECT" : n ? "EARLY" : "GOOD",
      shotType: "SERVE",
      speedKmh: w,
      isPower: s,
      whiff: !1,
    });
    const x = e.role === "player" ? this.opponent : this.player;
    this._predictBallIntercept(x);
  }
  _attemptPlayerRallyStrike(e = {}, t = !1) {
    if (this.ball.lastHitter === "player") return !1;
    const pMods =
        this.isMultiplayer && this.hostLoadout
          ? characterShopManager.getPlayerModifiersFromLoadout(this.hostLoadout)
          : characterShopManager.getEffectivePlayerModifiers(),
      partMods =
        this.isMultiplayer && this.hostLoadout
          ? characterShopManager.getPartnerModifiersFromLoadout(
              this.hostLoadout,
            )
          : characterShopManager.getEffectivePartnerModifiers(),
      vipReach = Math.min(0.45, Number(this.player?.activeVipReachBoost || 0) * 0.15),
      hasVipActive =
        vipReach > 0 ||
        (this.player?.activeVipSmashBuff || 1) > 1.05 ||
        (this.player?.activeVipSpeedBuff || 1) > 1.05 ||
        !!this.player?.activeVipDomain,
      charReach = Math.min(0.35, (pMods.reachAdd || 0) * 0.22),
      reachBonus = charReach + vipReach,
      swBonus =
        Math.min(0.25, pMods.sweetSpotAdd || 0) + (vipReach > 0 ? 0.2 : 0),
      pMult = (pMods.powerMult || 1) * (this.player?.activeVipSmashBuff || 1),
      spMult = pMods.spinMult || 1,
      i = this.ball.pos.z - this.player.pos.z,
      a = Math.abs(this.ball.pos.x - this.player.pos.x),
      s = Math.hypot(a, i),
      n = this.ball.pos.z - this.playerPartner.pos.z,
      h = Math.abs(this.ball.pos.x - this.playerPartner.pos.x),
      r = Math.hypot(h, n),
      partReach = Math.min(0.85, partMods.reachAdd || 0),
      l =
        !t &&
        (partMods.isUpgradedOrSpecial || (partMods.aiIqLevel || 1) >= 3) &&
        this.ball.pos.z > 0.8 &&
        this.ball.pos.z <= 7.6 &&
        h <= (partMods.interceptReachX || 1.35) &&
        Math.abs(n) <= (partMods.interceptReachZ || 1.15) &&
        r < s,
      p = l ? this.playerPartner : this.player,
      g = l ? n : i,
      c = l ? h : a,
      y = l ? r : s;
    if (!t && p.swingCooldown > 0) return !1;
    const maxReachX = l ? partMods.interceptReachX || 1.35 : 1.55 + reachBonus,
      maxReachZ = l
        ? partMods.interceptReachZ || 1.15
        : 1.45 + reachBonus * 0.5,
      maxDist = l
        ? Math.hypot(maxReachX, maxReachZ)
        : 1.78 + reachBonus;
    if (
      !t &&
      (this.ball.pos.z <= 0.6 ||
        c > maxReachX ||
        g < -maxReachZ ||
        g > 1.05 ||
        y > maxDist)
    ) {
      this.player.swingCooldown = 0.48;
      const A =
          this.ball.pos.z <= 0.6
            ? "ĐÁNH QUÁ SỚM! \u2022 KHÓA VỢT"
            : g > 1.05
              ? "QUÁ TRỄ! \u2022 HỤT BÓNG"
              : c > maxReachX
                ? "ĐỨNG QUÁ XA! \u2022 HỤT BÓNG"
                : "ĐÁNH QUÁ SỚM! \u2022 HỤT BÓNG",
        G = this._projectToScreen(
          this.player.pos.clone().add(new o.Vector3(0, 2.35, 0)),
        );
      (this.hud.showTimingPopup({
        grade: A,
        detail:
          c > maxReachX
            ? "DÙNG CẦN GẠT DI CHUYỂN TỚI BÓNG!"
            : "KHÔNG SPAM ĐÁNH SỚM!",
        screenPos: G,
        durationMs: 750,
      }),
        this.hud.updateTimingGauge({
          cursorNormalized: g > 1.05 ? 0.92 : 0.12,
          modeTitle: "HỤT BÓNG!",
          speedText: c > maxReachX ? "ĐỨNG XA" : g > 1.05 ? "TRỄ" : "SỚM",
        }),
        this.motionController &&
          this.motionController.triggerHapticFeedback &&
          this.motionController.triggerHapticFeedback({
            role: "p1",
            kind: "whiff",
            grade: A,
            shotType: this.selectedShotType || "TOPSPIN",
            speedKmh: 0,
            intensity: 0.65,
          }),
        triggerPhysicalHardwareVibration("fault", {
          role: "p1",
          intensity: 0.65,
        }));
      this._recordMatchSwing("player", {
        timing: "WHIFF",
        shotType: this.selectedShotType || "TOPSPIN",
        speedKmh: 0,
        isPower: !1,
        whiff: !0,
      });
      return !1;
    }
    p.swingCooldown = 0.32;
    const d =
        e.side === "overhead" ||
        hasVipActive ||
        ((this.selectedShotType === "FLAT" || e.shotType === "smash") &&
          this.ball.pos.y > 1.45) ||
        this.ball.pos.y > 1.75,
      activeMult = l
        ? partMods.volleyPowerMult || 1
        : pMult * (d ? pMods.smashPowerMult || 1 : 1),
      f = o.MathUtils.clamp(
        Number(e.speed || 1.18) * activeMult,
        0.8,
        hasVipActive ? 3.5 : 2.15,
      );
    if (e.shotType) {
      const A = String(e.shotType).toUpperCase();
      this.selectedShotType = A === "SMASH" || A === "POWER" ? "FLAT" : A;
    }
    const m =
      e.side === "backhand"
        ? !0
        : e.side === "forehand"
          ? !1
          : Number(e.dirX || 0) > 0.14
            ? !0
            : Number(e.dirX || 0) < -0.14
              ? !1
              : this.ball.pos.x < p.pos.x - 0.04 ||
                this.ball.targetLanding.x < -0.12;
    if (
      ((p.swingType = d ? "smash" : m ? "backhand" : "forehand"),
      (p.swingDuration = 0.36),
      (p.swingTimer = 0.36),
      (p.arcVisibleTimer = this.autoPlayMode ? 0.85 : 0.36),
      p.swingArcMesh && (p.swingArcMesh.visible = !1),
      this.racketKinematics)
    ) {
      const A = String(
          e.shotType || this.selectedShotType || "topspin",
        ).toLowerCase(),
        G = d || A === "power" ? "smash" : A;
      this.racketKinematics.triggerSwing(p, {
        shotType: G,
        side: d ? "overhead" : m ? "backhand" : "forehand",
        speed: f,
        timing: "sweet",
        dirX: Number(e.dirX || 0),
      });
    }
    this.audioEngine && this.audioEngine.playSwingWhoosh(f);
    let u = "PERFECT",
      w = 0.5;
    const x = c > 1.85 + reachBonus * 0.35;
    e.timing
      ? (u = String(e.timing).toUpperCase())
      : hasVipActive ||
          (e.sweetSpotAssisted && g >= -1.45 - swBonus && g <= 0.72 + swBonus)
        ? ((u = "PERFECT"), (w = 0.5))
        : g < -1.75 - swBonus
          ? ((u = "VERY EARLY"), (w = 0.14))
          : g < -1.05 - swBonus || (e.dirX && e.dirX < -0.52)
            ? ((u = "EARLY"), (w = 0.28))
            : g > 1.05 + swBonus
              ? ((u = "VERY LATE"), (w = 0.88))
              : g > 0.58 + swBonus || (e.dirX && e.dirX > 0.52)
                ? ((u = "LATE"), (w = 0.72))
                : x &&
                  this.matchConfig.difficulty !== "de" &&
                  this.matchConfig.difficulty !== "thap" &&
                  ((u = g < 0 ? "EARLY" : "LATE"), (w = g < 0 ? 0.3 : 0.7));
    const _ = !hasVipActive && (u === "VERY EARLY" || u === "VERY LATE"),
      T = hasVipActive ? "FLAT" : this.selectedShotType || "TOPSPIN",
      M =
        hasVipActive ||
        (!_ && (u === "PERFECT" || T === "FLAT" || d) && f >= 0.98),
      R = p.pos.x >= 0 ? 1 : -1,
      v = o.MathUtils.clamp(Number(e.dirX || 0), -1, 1);
    let E = 0;
    if (u === "EARLY" || u === "VERY EARLY")
      E = -R * (2.35 + Math.random() * 1.15) + v * 0.95;
    else if (u === "LATE" || u === "VERY LATE")
      E = R * (2.35 + Math.random() * 1.05) + v * 0.95;
    else {
      const A = this.opponent.pos.x >= 0 ? -1 : 1;
      Math.abs(v) > 0.22
        ? (E = v * (2.75 + Math.random() * 1.05))
        : (E = A * (2.45 + Math.random() * 1.25));
    }
    let k = !1,
      O = !1;
    (_ &&
      !t &&
      !this.autoPlayMode &&
      this.matchConfig.difficulty !== "de" &&
      f > 1.45 &&
      Math.random() < 0.28 &&
      (k = !0),
      k
        ? (E = (E >= 0 ? 1 : -1) * (S.SINGLES_X + 0.48 + Math.random() * 0.45))
        : _
          ? (E = o.MathUtils.clamp(
              E * 0.65,
              -S.SINGLES_X + 0.65,
              S.SINGLES_X - 0.65,
            ))
          : (E = o.MathUtils.clamp(
              E,
              -S.SINGLES_X + 0.25,
              S.SINGLES_X - 0.25,
            )));
    let N = -(8.2 + Math.random() * 2.6),
      I = 0.84,
      C = 16,
      V = 0;
    if (hasVipActive) {
      const vipPowerBoost = Math.max(1.35, this.player?.activeVipSmashBuff || 1.55);
      I = Math.max(0.32, 0.52 / Math.min(1.65, vipPowerBoost * 0.82));
      N = -(10.2 + Math.random() * 1.3);
      C = 38 * spMult;
      V = (this.opponent.pos.x >= 0 ? -1 : 1) * 14;
    } else if (_ && !k && !O) {
      I = 1.04;
      N = -(6.2 + Math.random() * 2.2);
      C = 6;
    } else if (l) {
      I = M ? 0.54 : 0.66;
      N = -(5.6 + Math.random() * 3.4);
      C = 12;
    } else if (T === "LOB") {
      I = 1.32;
      N = -(9 + Math.random() * 2);
      C = 4;
    } else if (T === "SLICE") {
      I = 0.96;
      N = -(6.8 + Math.random() * 2.6);
      C = -6.5 * spMult;
      V = -R * 11 * spMult;
    } else if (T === "FLAT" || M) {
      I = Math.max(0.46, 0.72 / Math.min(1.52, f * 0.94));
      N = -(9.2 + Math.random() * 2.2);
      C = 22 * spMult;
    } else {
      I = Math.max(0.58, 0.84 / Math.min(1.38, f * 0.92));
      C *= spMult;
    }
    const K = Math.max(
      0.84,
      1 - Math.min(8, this.ball.rallyStrokeCount) * 0.015,
    );
    I *= K;
    const B = this.ball.pos.clone();
    ((B.y = Math.max(0.78, Math.min(2.15, B.y))),
      this.ball.pos.copy(B),
      this._launchBallToTarget(B, new o.Vector3(E, 0, N), I, {
        topspin: C,
        sidespin: V,
        allowNetFault: O,
      }),
      (this.ball.inPlay = !0),
      (this.ball.lastHitter = "player"),
      (this.ball.lastHitterRole = p.role),
      (this.ball.bounceCountOnCurrentSide = 0),
      (this.ball.rallyStrokeCount += 1),
      (this.ball.shotType = T),
      (this.ball.isPowerShot = M),
      this.ballTrail.setStyle(T, M, p),
      this.racketKinematics &&
        this.racketKinematics.triggerImpactRecoil(p, M ? 1.4 : 1),
      this.swingVfx &&
        this.swingVfx.onRacketContact({
          actor: p,
          ball: this.ball,
          contactPos: B,
          shotType: d ? "SMASH" : T,
          isPower: M,
          isServe: !1,
          timingQuality: u,
          speed: this.ball.vel.length(),
        }),
      this.facialFX &&
        this.facialFX.setExpression(
          p,
          M ? "effort_shout" : "focused_squint",
          0.55,
        ),
      this.triggerCameraShake(d ? 0.55 : M ? 0.44 : 0.18),
      M &&
        pMods.knockbackImpulse > 0.05 &&
        ((this.opponent.pos.z = Math.max(
          -13.8,
          this.opponent.pos.z - pMods.knockbackImpulse * 0.42,
        )),
        this.triggerCameraShake(0.62)),
      M && this._spawnStarBurst(B, 11),
      this.audioEngine &&
        (this.audioEngine.playRacketHit(
          T === "FLAT" || d ? "smash" : T.toLowerCase(),
          u === "PERFECT" ? "perfect" : "good",
        ),
        p.swingType === "smash" &&
          !this.autoPlayMode &&
          this.audioEngine.playVoiceCallout("smash")));
    const F = Math.round(this.ball.vel.length() * 6.8),
      H = d ? "SMASH" : m ? "BACKHAND" : "FOREHAND",
      X = l
        ? "NET VOLLEY"
        : _
          ? "DEFENSIVE"
          : u === "EARLY"
            ? `${H} CROSS`
            : u === "LATE"
              ? `${H} LINE`
              : `${H} ${T}`;
    if (!this.autoPlayMode) {
      const A = this._projectToScreen(
        p.pos.clone().add(new o.Vector3(0, 2.35, 0)),
      );
      (this.hud.showTimingPopup({
        grade: `${u} \u2022 ${X}!`,
        detail: `${F} KM/H`,
        screenPos: A,
      }),
        this.motionController &&
          this.motionController.triggerHapticFeedback &&
          this.motionController.triggerHapticFeedback({
            role: "p1",
            kind: _ ? "fault" : "hit",
            grade: `${u} \u2022 ${X}`,
            shotType: d ? "SMASH" : T,
            speedKmh: F,
            intensity: M ? 1.45 : _ ? 0.75 : 1.1,
          }),
        triggerPhysicalHardwareVibration(
          M ? "sweet_spot" : _ ? "fault" : "hit",
          { role: "p1", intensity: M ? 1.45 : _ ? 0.75 : 1.1 },
        ));
    }
    this.addictiveFeatures?.onPlayerStroke?.({
      shotType: d ? "SMASH" : T,
      timing: u,
      isPower: M,
      speedKmh: F,
    });
    this._recordMatchSwing("player", {
      timing: u,
      shotType: d ? "SMASH" : T,
      speedKmh: F,
      isPower: M,
      whiff: !1,
    });
    return (
      this.hud.updateTimingGauge({
        cursorNormalized: w,
        modeTitle: `${u} (${X})`,
        speedText: `${F} KM/H`,
      }),
      this.autoPlayMode && !this.userHasInteracted
        ? this.player.targetPos.set(
            o.MathUtils.clamp(-E * 0.22, -1.6, 1.6),
            0,
            S.BASELINE_Z - 0.15,
          )
        : this.player.targetPos.copy(this.player.pos),
      this.playerPartner.targetPos.set(
        o.MathUtils.clamp(
          E * 0.35 + (this.score.deuceSide ? -1.4 : 1.4),
          -2.8,
          2.8,
        ),
        0,
        5.1,
      ),
      this._predictBallIntercept(this.opponent),
      !0
    );
  }
  _executePartnerBotReturn(e = this.playerPartner) {
    const isP2Partner = e === this.opponentPartner,
      teamName = isP2Partner ? "opponent" : "player";
    if (this.ball.lastHitter === teamName || e.swingCooldown > 0) return !1;
    const partMods = isP2Partner
      ? characterShopManager.getPartnerModifiersFromLoadout(this.guestLoadout)
      : this.isMultiplayer && this.hostLoadout
        ? characterShopManager.getPartnerModifiersFromLoadout(this.hostLoadout)
        : characterShopManager.getEffectivePartnerModifiers();
    e.swingCooldown = 0.32;
    const isHighBall =
        (this.ball.pos.y > 1.42 && partMods.aiIqLv >= 3) ||
        (this.ball.pos.y > 1.16 &&
          Math.random() < (partMods.autoSmashChance || 0)),
      isBackhand = isP2Partner
        ? this.ball.pos.x > e.pos.x + 0.04
        : this.ball.pos.x < e.pos.x - 0.04,
      isPower = isHighBall || partMods.powerLv >= 4 || Math.random() < 0.45,
      shotType = isHighBall
        ? "SMASH"
        : partMods.powerLv >= 3
          ? "TOPSPIN"
          : "SLICE";
    ((e.swingType = isHighBall
      ? "smash"
      : isBackhand
        ? "backhand"
        : "forehand"),
      (e.swingDuration = 0.36),
      (e.swingTimer = 0.36),
      (e.arcVisibleTimer = 0.38),
      e.swingArcMesh && (e.swingArcMesh.visible = !1));
    const oppActor = isP2Partner ? this.player : this.opponent,
      openDir = oppActor.pos.x >= 0 ? -1 : 1,
      acc = partMods.smartPlacementAccuracy || 0.55,
      targetX = o.MathUtils.clamp(
        openDir * (1.85 + acc * 1.45 + (Math.random() - 0.5) * 0.65),
        -S.SINGLES_X + 0.42,
        S.SINGLES_X - 0.42,
      ),
      zDir = isP2Partner ? 1 : -1,
      targetZ = zDir * (6.2 + acc * 3.2 + Math.random() * 1.8),
      flightTime = Math.max(
        0.52,
        (isHighBall ? 0.62 : 0.72) /
          Math.min(1.32, partMods.volleyPowerMult || 1),
      ),
      contactPos = this.ball.pos.clone();
    ((contactPos.y = Math.max(0.82, Math.min(1.88, contactPos.y))),
      this.ball.pos.copy(contactPos),
      this._launchBallToTarget(
        contactPos,
        new o.Vector3(targetX, 0, targetZ),
        flightTime,
        {
          topspin: isHighBall
            ? 22
            : shotType === "SLICE"
              ? -6
              : 15 * (partMods.spinMult || 1),
          sidespin: openDir * 6,
          allowNetFault: !1,
        },
      ),
      (this.ball.inPlay = !0),
      (this.ball.lastHitter = teamName),
      (this.ball.lastHitterRole = e.role),
      (this.ball.bounceCountOnCurrentSide = 0),
      (this.ball.rallyStrokeCount += 1),
      (this.ball.shotType = shotType),
      (this.ball.isPowerShot = isPower),
      this.ballTrail.setStyle(shotType, isPower, e),
      this.racketKinematics &&
        (this.racketKinematics.triggerSwing(e, {
          shotType: isHighBall ? "smash" : shotType.toLowerCase(),
          side: isHighBall ? "overhead" : isBackhand ? "backhand" : "forehand",
          speed: 1.28 * (partMods.volleyPowerMult || 1),
          timing: "sweet",
        }),
        this.racketKinematics.triggerImpactRecoil(e, isPower ? 1.35 : 1)),
      this.swingVfx &&
        this.swingVfx.onRacketContact({
          actor: e,
          ball: this.ball,
          contactPos,
          shotType,
          isPower,
          isServe: !1,
          timingQuality: "PERFECT",
          speed: this.ball.vel.length(),
        }),
      this.facialFX && this.facialFX.setExpression(e, "effort_shout", 0.6),
      isPower &&
        ((this.cameraTrauma = 0.22), this._spawnStarBurst(contactPos, 12)),
      this.audioEngine &&
        (this.audioEngine.playSwingWhoosh(1.25),
        this.audioEngine.playRacketHit(
          isHighBall ? "smash" : "topspin",
          isPower ? "perfect" : "good",
        )),
      triggerPhysicalHardwareVibration(isPower ? "sweet_spot" : "hit", {
        role: isP2Partner ? "p2" : "p1",
        intensity: isPower ? 1.35 : 1,
      }));
    const speedKmh = Math.round(this.ball.vel.length() * 6.8);
    this._recordMatchSwing(isP2Partner ? "opponent" : "player", {
      timing: isPower ? "PERFECT" : "GOOD",
      shotType,
      speedKmh,
      isPower,
      whiff: !1,
    });
    if (!this.autoPlayMode) {
      const screenPos = this._projectToScreen(
        e.pos.clone().add(new o.Vector3(0, 2.35, 0)),
      );
      this.hud.showTimingPopup({
        grade: isHighBall ? "BOT SMASH!" : "BOT AI VOLLEY!",
        detail: `AI LV.${partMods.aiIqLv} \u2022 ${speedKmh} KM/H`,
        screenPos,
      });
    }
    return (
      e.targetPos.set(
        o.MathUtils.clamp(
          targetX * 0.32 +
            (this.score.deuceSide
              ? isP2Partner
                ? 1.35
                : -1.35
              : isP2Partner
                ? -1.35
                : 1.35),
          -2.8,
          2.8,
        ),
        0,
        isP2Partner ? -5 : 5,
      ),
      this._predictBallIntercept(oppActor),
      !0
    );
  }
  _attemptP2RallyStrike(e = {}) {
    if (this.ball.lastHitter === "opponent") return !1;
    const p2Mods = characterShopManager.getPlayerModifiersFromLoadout(
        this.guestLoadout,
      ),
      p2PartMods = characterShopManager.getPartnerModifiersFromLoadout(
        this.guestLoadout,
      ),
      reachBonus = p2Mods.reachAdd || 0,
      swBonus = p2Mods.sweetSpotAdd || 0,
      pMult = p2Mods.powerMult || 1,
      spMult = p2Mods.spinMult || 1,
      t = this.opponent.pos.z - this.ball.pos.z,
      i = Math.abs(this.ball.pos.x - this.opponent.pos.x),
      a = Math.hypot(i, t),
      s = this.opponentPartner.pos.z - this.ball.pos.z,
      n = Math.abs(this.ball.pos.x - this.opponentPartner.pos.x),
      h = Math.hypot(n, s),
      r =
        this.ball.pos.z < -0.3 &&
        this.ball.pos.z >= -7.6 &&
        h <= 3.95 + (p2PartMods.reachAdd || 0) &&
        h < a,
      l = r ? this.opponentPartner : this.opponent,
      p = r ? s : t,
      g = r ? n : i,
      c = r ? h : a;
    if (l.swingCooldown > 0) return !1;
    if (e.shotType) {
      const C = String(e.shotType).toUpperCase();
      this.p2SelectedShotType = C === "SMASH" || C === "POWER" ? "FLAT" : C;
    }
    const f =
        e.side === "backhand"
          ? !0
          : e.side === "forehand"
            ? !1
            : Number(e.dirX || 0) > 0.14
              ? !0
              : Number(e.dirX || 0) < -0.14
                ? !1
                : this.ball.pos.x > l.pos.x + 0.04 ||
                  this.ball.targetLanding.x > 0.12,
      m = this.p2SelectedShotType || "TOPSPIN",
      d =
        e.side === "overhead" ||
        ((m === "FLAT" || e.shotType === "smash") && this.ball.pos.y > 1.5) ||
        this.ball.pos.y > 1.78,
      activeMult = r
        ? p2PartMods.volleyPowerMult || 1
        : pMult * (d ? p2Mods.smashPowerMult || 1 : 1),
      y = o.MathUtils.clamp(Number(e.speed || 1.18) * activeMult, 0.8, 2.15);
    if (
      ((l.swingType = d ? "smash" : f ? "backhand" : "forehand"),
      (l.swingDuration = 0.36),
      (l.swingTimer = 0.36),
      (l.arcVisibleTimer = 0.36),
      l.swingArcMesh && (l.swingArcMesh.visible = !1),
      this.racketKinematics)
    ) {
      const C = String(e.shotType || m || "topspin").toLowerCase(),
        V = d || C === "power" ? "smash" : C;
      this.racketKinematics.triggerSwing(l, {
        shotType: V,
        side: d ? "overhead" : f ? "backhand" : "forehand",
        speed: y,
        timing: "sweet",
        dirX: Number(e.dirX || 0),
      });
    }
    if (
      (this.audioEngine && this.audioEngine.playSwingWhoosh(y),
      c > (r ? 4.05 + (p2PartMods.reachAdd || 0) : 4.85 + reachBonus))
    )
      return (
        p > 1.45 &&
          ((l.swingCooldown = 0.16),
          this.motionController &&
            this.motionController.triggerHapticFeedback &&
            this.motionController.triggerHapticFeedback({
              role: "p2",
              kind: "whiff",
              grade: "TOO LATE! \u2022 WHIFF",
              shotType: m,
              speedKmh: 0,
              intensity: 0.65,
            }),
          triggerPhysicalHardwareVibration("fault", {
            role: "p2",
            intensity: 0.65,
          })),
        !1
      );
    let u = "PERFECT";
    e.sweetSpotAssisted && p >= -1.85 - swBonus && p <= 0.78 + swBonus
      ? (u = "PERFECT")
      : p < -1.45 - swBonus || (e.dirX && e.dirX < -0.52)
        ? (u = "EARLY")
        : (p > 0.68 + swBonus || (e.dirX && e.dirX > 0.52)) && (u = "LATE");
    const w = (u === "PERFECT" || m === "FLAT" || d) && y >= 0.98,
      x = l.pos.x >= 0 ? 1 : -1,
      _ = o.MathUtils.clamp(Number(e.dirX || 0), -1, 1);
    let T = 0;
    if (u === "EARLY") T = -x * (2.25 + Math.random() * 1.1) - _ * 0.95;
    else if (u === "LATE") T = x * (2.25 + Math.random() * 1.05) - _ * 0.95;
    else {
      const C = this.player.pos.x >= 0 ? -1 : 1;
      T =
        Math.abs(_) > 0.22
          ? -_ * (2.65 + Math.random() * 0.95)
          : C * (2.35 + Math.random() * 1.25);
    }
    T = o.MathUtils.clamp(T, -S.SINGLES_X + 0.38, S.SINGLES_X - 0.38);
    let M = 8 + Math.random() * 2.6,
      R = w
        ? Math.max(0.52, 0.72 / Math.min(1.26, y * 0.94))
        : Math.max(0.62, 0.86 / Math.min(1.22, y * 0.92)),
      v = (w ? 20 : 15) * spMult,
      E = 0;
    r
      ? ((R = w ? 0.58 : 0.7), (M = 5.6 + Math.random() * 3.2))
      : m === "LOB"
        ? ((R = 1.3), (M = 9 + Math.random() * 2), (v = 4))
        : m === "SLICE" &&
          ((R = 0.98),
          (M = 6.8 + Math.random() * 2.5),
          (v = -6 * spMult),
          (E = x * 10 * spMult));
    const k = this.ball.pos.clone();
    ((k.y = Math.max(0.78, Math.min(1.92, k.y))),
      this.ball.pos.copy(k),
      this._launchBallToTarget(k, new o.Vector3(T, 0, M), R, {
        topspin: v,
        sidespin: E,
        allowNetFault: !1,
      }),
      (this.ball.inPlay = !0),
      (this.ball.lastHitter = "opponent"),
      (this.ball.lastHitterRole = l.role),
      (this.ball.bounceCountOnCurrentSide = 0),
      (this.ball.rallyStrokeCount += 1),
      (this.ball.shotType = m),
      (this.ball.isPowerShot = w),
      this.ballTrail.setStyle(m, w, l),
      this.racketKinematics &&
        this.racketKinematics.triggerImpactRecoil(l, w ? 1.4 : 1),
      this.swingVfx &&
        this.swingVfx.onRacketContact({
          actor: l,
          ball: this.ball,
          contactPos: k,
          shotType: d ? "SMASH" : m,
          isPower: w,
          isServe: !1,
          timingQuality: u,
          speed: this.ball.vel.length(),
        }),
      this.facialFX &&
        this.facialFX.setExpression(
          l,
          w ? "effort_shout" : "focused_squint",
          0.55,
        ),
      w && ((this.cameraTrauma = 0.24), this._spawnStarBurst(k, 10)),
      this.audioEngine &&
        this.audioEngine.playRacketHit(
          m === "FLAT" || d ? "smash" : m.toLowerCase(),
          u === "PERFECT" ? "perfect" : "good",
        ));
    const O = Math.round(this.ball.vel.length() * 6.8),
      N = r
        ? "NET VOLLEY"
        : u === "EARLY"
          ? "CROSS-COURT"
          : u === "LATE"
            ? "DOWN THE LINE"
            : `SWEET SPOT ${m}`,
      I = this._projectToScreen(l.pos.clone().add(new o.Vector3(0, 2.35, 0)));
    this._recordMatchSwing("opponent", {
      timing: u,
      shotType: d ? "SMASH" : m,
      speedKmh: O,
      isPower: w,
      whiff: !1,
    });
    return (
      this.hud.showTimingPopup({
        grade: `P2 ${u} \u2022 ${N}!`,
        detail: `${O} KM/H`,
        screenPos: I,
      }),
      this.motionController &&
        this.motionController.triggerHapticFeedback &&
        this.motionController.triggerHapticFeedback({
          role: "p2",
          kind: "hit",
          grade: `${u} \u2022 ${N}`,
          shotType: d ? "SMASH" : m,
          speedKmh: O,
          intensity: w ? 1.45 : 1.1,
        }),
      triggerPhysicalHardwareVibration(w ? "sweet_spot" : "hit", {
        role: "p2",
        intensity: w ? 1.45 : 1.1,
      }),
      this.opponent.targetPos.set(
        o.MathUtils.clamp(-T * 0.22, -1.6, 1.6),
        0,
        -S.BASELINE_Z + 0.25,
      ),
      this.opponentPartner.targetPos.set(
        o.MathUtils.clamp(
          T * 0.35 + (this.score.deuceSide ? 1.4 : -1.4),
          -2.8,
          2.8,
        ),
        0,
        -5.1,
      ),
      this._predictBallIntercept(this.player),
      !0
    );
  }
  _executeOpponentReturn(e = this.opponent) {
    const t = e === this.opponentPartner,
      diff = this.matchConfig.difficulty,
      isX2 = diff === "x2",
      isCucCao = diff === "cuc_cao",
      isSieuCao = diff === "sieu_cao",
      isCao = diff === "cao" || diff === "pro",
      isThap = diff === "thap",
      isDe = diff === "de",
      isHigh = isX2 || isCucCao || isSieuCao || isCao,
      isCasual = !isHigh,
      a = Math.abs(this.ball.pos.x - e.pos.x),
      s = !!this.ball.isPowerShot,
      h =
        !isX2 &&
        !isCucCao &&
        (a > (isCasual ? 1.08 : 1.75) || (s && a > (isCasual ? 0.75 : 1.45))),
      r = this.ball.pos.x > e.pos.x + 0.05;

    // On X2 / Cực Cao, snap bot closer to ball at contact so it never looks like hitting air
    if ((isX2 || isCucCao) && a > 1.2) {
      e.pos.x = o.MathUtils.lerp(e.pos.x, this.ball.pos.x, isX2 ? 0.85 : 0.65);
    }

    e.swingType = r ? "backhand" : "forehand";
    e.swingDuration = isX2 ? 0.16 : isCucCao ? 0.24 : 0.36;
    e.swingTimer = e.swingDuration;
    e.arcVisibleTimer = this.autoPlayMode ? 0.85 : 0.36;
    if (e.swingArcMesh) e.swingArcMesh.visible = false;

    const l = this.player.pos.x >= 0 ? -1 : 1;
    let p = isX2
      ? 3.75
      : isCucCao
        ? 3.25
        : isSieuCao
          ? 2.65
          : isCao
            ? 2.15
            : isThap
              ? 0.9
              : isDe
                ? 0.7
                : 1.35;
    let g = isX2
      ? l * (S.SINGLES_X - 0.18 - Math.random() * 0.35)
      : isCucCao
        ? l * (S.SINGLES_X - 0.32 - Math.random() * 0.45)
        : o.MathUtils.clamp(l * p, -S.SINGLES_X + 0.45, S.SINGLES_X - 0.45);

    let c = isX2
      ? t
        ? 5.2 + Math.random() * 2.5
        : 10.6 + Math.random() * 0.85
      : isCucCao
        ? 9.8 + Math.random() * 1.4
        : isSieuCao
          ? 8.8 + Math.random() * 1.8
          : isCao
            ? 7.8 + Math.random() * 2.2
            : isThap
              ? 6.0 + Math.random() * 2.0
              : isDe
                ? 5.4 + Math.random() * 1.8
                : 6.8 + Math.random() * 2.2;

    let y = "TOPSPIN";
    let f = isX2
      ? 0.34
      : isCucCao
        ? 0.48
        : isSieuCao
          ? 0.62
          : isCao
            ? 0.76
            : isThap
              ? 1.18
              : isDe
                ? 1.34
                : 1.02;
    let m = false;

    if (this.autoPlayMode && !this.userHasInteracted) {
      y = "TOPSPIN";
      f = 0.84;
    } else if (isX2) {
      if (this.ball.pos.y > 1.35 || t) {
        y = "SMASH";
        f = 0.31;
      } else {
        y = this.ball.rallyStrokeCount % 3 === 0 ? "SLICE" : "FLAT";
        f = 0.35;
      }
    } else if (isCucCao) {
      if (this.ball.pos.y > 1.5 || t) {
        y = "SMASH";
        f = 0.44;
      } else {
        y = "FLAT";
        f = 0.5;
      }
    } else if (h && this.ball.rallyStrokeCount >= 2) {
      const b = isCasual ? (a > 1.45 || s ? 0.42 : 0.28) : a > 1.92 ? 0.12 : 0.06;
      Math.random() < b
        ? Math.random() < 0.48
          ? ((m = true), (c = 1.2), (f = 0.76))
          : ((g = (Math.random() < 0.5 ? 1 : -1) * (S.SINGLES_X + 0.48 + Math.random() * 0.45)), (c = 9.5 + Math.random() * 2.8), (f = 0.88))
        : ((y = a > 1.35 || s ? "LOB" : "SLICE"), (g = o.MathUtils.clamp((Math.random() - 0.5) * 2.4, -S.SINGLES_X + 1.1, S.SINGLES_X - 1.1)), (c = 5.6 + Math.random() * 2.2), (f = y === "LOB" ? 1.36 : 1.18));
    } else if (t) {
      y = isHigh ? "FLAT" : "SLICE";
      c = 5.8 + Math.random() * 2.6;
      f = isCasual ? 0.96 : 0.64;
    } else {
      const b = isHigh
        ? ["FLAT", "TOPSPIN", "SLICE", "FLAT", "TOPSPIN"]
        : ["TOPSPIN", "TOPSPIN", "SLICE", "TOPSPIN", "LOB"];
      y = b[this.ball.rallyStrokeCount % b.length];
      f =
        y === "LOB"
          ? isCasual
            ? 1.36
            : 1.18
          : y === "SLICE"
            ? isCasual
              ? 1.18
              : 0.82
            : isCasual
              ? 1.08
              : f;
    }
    const d = this.ball.pos.clone();
    d.y = Math.max(0.82, Math.min(2.15, d.y));
    this.ball.pos.copy(d);
    this._launchBallToTarget(d, new o.Vector3(g, 0, c), f, {
      topspin: isX2 ? 52 : isCucCao ? 34 : y === "SLICE" ? -5 : y === "LOB" ? 5 : 16,
      sidespin: isX2 ? l * 18 : isCucCao ? l * 10 : 0,
      allowNetFault: m,
    });
    this.ball.inPlay = true;
    this.ball.lastHitter = "opponent";
    this.ball.bounceCountOnCurrentSide = 0;
    this.ball.rallyStrokeCount += 1;
    this.ball.shotType = y;
    this.ball.isPowerShot = isX2 || isCucCao || y === "SMASH";
    this.ballTrail.setStyle(y, this.ball.isPowerShot);
    if (this.racketKinematics) {
      this.racketKinematics.triggerSwing(e, {
        shotType: y.toLowerCase(),
        side: r ? "backhand" : "forehand",
        speed: isX2 ? 1.55 : 1.2,
        timing: "sweet",
      });
      this.racketKinematics.triggerImpactRecoil(e, isX2 ? 1.35 : 0.95);
    }
    if (this.swingVfx) {
      this.swingVfx.onRacketContact({
        actor: e,
        ball: this.ball,
        contactPos: d,
        shotType: y,
        isPower: this.ball.isPowerShot,
        isServe: false,
        timingQuality: isX2 || isCucCao ? "PERFECT" : "GOOD",
        speed: this.ball.vel.length(),
      });
    }
    if (this.facialFX) {
      this.facialFX.setExpression(
        e,
        h ? "wide_eyed_panic" : "effort_shout",
        0.65,
      );
      if (h) this.facialFX.spawnSweatDrops(e, 4);
    }
    if (this.audioEngine) {
      this.audioEngine.playSwingWhoosh(isX2 ? 1.35 : 1);
      this.audioEngine.playRacketHit(y.toLowerCase(), isX2 ? "perfect" : "good");
    }
    this._recordMatchSwing("opponent", {
      timing: isX2 || isCucCao ? "PERFECT" : h ? "LATE" : isHigh ? "PERFECT" : "GOOD",
      shotType: y,
      speedKmh: Math.round(this.ball.vel.length() * 6.8),
      isPower: !!this.ball.isPowerShot,
      whiff: !1,
    });
    this.opponent.targetPos.set(
      o.MathUtils.clamp(-g * 0.25, -1.6, 1.6),
      0,
      -S.BASELINE_Z + 0.35,
    );
    this._predictBallIntercept(this.player);
  }
  _launchBallToTarget(
    e,
    t,
    i,
    { topspin: a = 14, sidespin: s = 0, allowNetFault: n = !1 } = {},
  ) {
    const h = Math.max(0.28, i),
      r = t.x - e.x,
      l = t.z - e.z,
      p = 0.08 - e.y,
      g = L.GRAVITY + a * 0.14,
      c = r / h - 0.5 * (s * 0.12) * h,
      y = l / h,
      f = (p + 0.5 * g * h * h) / h;
    (this.ball.vel.set(c, f, y),
      this.ball.spin.set(a, s, 0),
      this.ball.targetLanding.copy(t));
    const m = Math.abs(e.z) / Math.max(1, Math.abs(y));
    if (m > 0 && m < h) {
      const d = e.y + f * m - 0.5 * g * m * m;
      if (n) {
        const u = (S.NET_HEIGHT_CENTER - 0.12 - d) / m;
        this.ball.vel.y += u;
      } else {
        const b = S.NET_HEIGHT_CENTER + 0.34;
        if (d < b) {
          const u = (b - d) / m;
          this.ball.vel.y += u;
        }
      }
    }
  }
  _predictBallIntercept(e) {
    const t = this.ball.targetLanding,
      i = o.MathUtils.clamp(
        t.z + e.sideSign * 2.15,
        e.sideSign > 0 ? 3.2 : -13.6,
        e.sideSign > 0 ? 13.4 : -3.2,
      ),
      a = t.x < -0.12 ? 0.38 : -0.38,
      s = o.MathUtils.clamp(t.x + a, -S.DOUBLES_X + 0.4, S.DOUBLES_X - 0.4);
    if (e === this.player) {
      // ONLY auto-move the player in background demo / autoPlayMode when manualMovement is explicitly disabled!
      if (
        (this.autoPlayMode && !this.userHasInteracted) ||
        this.motionController?.settings?.manualMovement === !1
      ) {
        e.targetPos.set(s, 0, i);
      } else {
        e.targetPos.copy(e.pos);
      }
      if (this.playerPartner) {
        const partMods = characterShopManager.getEffectivePartnerModifiers();
        const stanceZ = this.playerPartner.customStanceZ || 4.8;
        this.playerPartner.maxSpeed = partMods.maxSpeed || 5.2;
        if (partMods.isUpgradedOrSpecial && t.z > 0) {
          this.playerPartner.targetPos.set(
            o.MathUtils.clamp(t.x, -S.DOUBLES_X + 0.45, S.DOUBLES_X - 0.45),
            0,
            o.MathUtils.clamp(t.z * 0.56, Math.max(2.0, stanceZ - 2.0), stanceZ + 2.2),
          );
        } else {
          this.playerPartner.targetPos.set(
            o.MathUtils.clamp(
              t.x * 0.45 + (this.score.deuceSide ? -1.2 : 1.2),
              -3.2,
              3.2,
            ),
            0,
            stanceZ,
          );
        }
      }
      return;
    }
    e.targetPos.set(s, 0, i);
    if (e === this.opponent && this.opponentPartner) {
      this.isMultiplayer &&
      t.z < 0 &&
      t.z > -6.6 &&
      Math.abs(t.x - this.opponentPartner.pos.x) < 2.9
        ? this.opponentPartner.targetPos.set(
            o.MathUtils.clamp(t.x, -S.SINGLES_X + 0.4, S.SINGLES_X - 0.4),
            0,
            o.MathUtils.clamp(t.z - 0.85, -6.2, -2.8),
          )
        : this.opponentPartner.targetPos.set(
            o.MathUtils.clamp(
              t.x * 0.45 + (this.score.deuceSide ? 1.35 : -1.35),
              -2.9,
              2.9,
            ),
            0,
            -5.1,
          );
    }
  }
  _initVipMechanicsUI() {
    const dock = document.getElementById("vip-mechanics-dock");
    if (!dock) return;
    const pChar = characterShopManager.getSelectedCharacter("player");
    const mechs = getCharacterActiveMechanics(pChar.id);
    this.activeVipMechanics = mechs;
    if (!this.vipMechanicState) this.vipMechanicState = {};

    mechs.forEach((m) => {
      if (!this.vipMechanicState[m.id]) {
        this.vipMechanicState[m.id] = { activeUntil: 0, cooldownUntil: 0 };
      }
    });

    const hotkeys = ["1", "2", "3"];
    dock.innerHTML = `
      <div class="vip-mechanics-strip">
        ${mechs
          .map((m, idx) => {
            const hotkeyLabel = hotkeys[idx] || `${idx + 1}`;
            return `
              <button type="button" class="vip-mech-btn ready" id="btn-vip-mech-${idx}" data-mech-idx="${idx}" title="${m.name}: ${m.desc}" style="--mech-color:${m.color};">
                <div class="mech-btn-glow"></div>
                <div class="mech-btn-content">
                  <span class="mech-key-badge">PHÍM ${hotkeyLabel}</span>
                  <span class="mech-short-label">${m.shortLabel}</span>
                  <span class="mech-status-text" id="mech-status-${idx}">SẴN SÀNG</span>
                  <span class="mech-timer-badge hidden" id="mech-timer-${idx}">20s</span>
                </div>
                <div class="mech-cd-progress" id="mech-prog-${idx}"></div>
              </button>
            `;
          })
          .join("")}
      </div>
    `;

    mechs.forEach((_, idx) => {
      const btn = document.getElementById(`btn-vip-mech-${idx}`);
      if (btn) {
        btn.addEventListener("click", (evt) => {
          evt.stopPropagation();
          this._triggerVipMechanic(idx);
        });
      }
    });
  }

  _triggerVipMechanic(idx) {
    if (!this.activeVipMechanics || !this.activeVipMechanics[idx]) return;
    if (this._isAnyModalOpen()) return;
    const m = this.activeVipMechanics[idx];
    if (!this.vipMechanicState) this.vipMechanicState = {};
    const s =
      this.vipMechanicState[m.id] ||
      (this.vipMechanicState[m.id] = { activeUntil: 0, cooldownUntil: 0 });
    const now = Date.now();
    if (now < s.activeUntil || now < s.cooldownUntil) {
      return;
    }

    s.activeUntil = now + (m.durationMs || 20000);
    s.cooldownUntil = s.activeUntil + (m.cooldownMs || 60000);

    // Sync buffs immediately so any immediate strike uses the full power
    this._updateVipMechanics(0.016);

    this.hud?.showCenterBanner(`KÍCH HOẠT: ${m.name.toUpperCase()}`, {
      style: "style-gold",
      subText: `HIỆU LỰC 20 GIÂY \u2022 ${m.desc}`,
      durationMs: 1850,
    });
    this.triggerCameraShake(0.75);
    triggerPhysicalHardwareVibration("match_won");
    this.audioEngine?.playSwingWhoosh?.(1.65);
    this.audioEngine?.playVoiceCallout?.("smash");

    if (this.player) {
      const burstPos = this.player.pos.clone().add(new o.Vector3(0, 1.15, 0));
      this._spawnStarBurst(burstPos, 28);
      this._spawnBounceRing(this.player.pos.x, this.player.pos.z);

      // Immediate 3D Character Animation + VFX Burst on Activation!
      this.player.swingType = "smash";
      this.player.swingDuration = 0.48;
      this.player.swingTimer = 0.48;
      if (this.player.rig) {
        this.player.rig.verticalHopOffset = 0.52;
      }
      if (this.racketKinematics) {
        this.racketKinematics.triggerSwing(this.player, {
          shotType: "smash",
          side: "overhead",
          speed: 1.85,
          timing: "sweet",
        });
      }
      if (this.swingVfx) {
        this.swingVfx.spawnImpactBurst?.(burstPos, new o.Color(m.color), 1.8);
        this.swingVfx.seedActorSwingArc?.(this.player, "SMASH", true);
      }
      if (this.facialFX) {
        this.facialFX.setExpression(this.player, "effort_shout", 2.5);
      }
    }
  }

  _updateVipMechanics(dt) {
    if (!this.activeVipMechanics || !this.player) return;
    const now = Date.now();
    let anySpeedBuff = 1.0;
    let anySmashBuff = 1.0;
    let anyReachBoost = 0;
    let anyTimeSlow = 1.0;
    let anyDomain = false;
    let activeColor = null;

    this.activeVipMechanics.forEach((m, idx) => {
      const s = this.vipMechanicState?.[m.id];
      if (!s) return;
      const btn = document.getElementById(`btn-vip-mech-${idx}`);
      const timerBadge = document.getElementById(`mech-timer-${idx}`);
      const statusText = document.getElementById(`mech-status-${idx}`);
      const prog = document.getElementById(`mech-prog-${idx}`);

      if (now < s.activeUntil) {
        const remainSec = Math.max(1, Math.ceil((s.activeUntil - now) / 1000));
        activeColor = m.color;
        if (m.type === "speed")
          anySpeedBuff = Math.max(anySpeedBuff, m.speedMult || 2.1);
        if (m.type === "smash")
          anySmashBuff = Math.max(anySmashBuff, m.powerMult || 2.2);
        if (m.type === "magnet")
          anyReachBoost = Math.max(anyReachBoost, m.reachBoost || 3.5);
        if (m.type === "time")
          anyTimeSlow = Math.min(anyTimeSlow, m.slowEnemy || 0.42);
        if (m.type === "domain") {
          anyDomain = true;
          anyReachBoost = Math.max(anyReachBoost, m.reachBoost || 3.2);
          anySmashBuff = Math.max(anySmashBuff, m.powerMult || 1.9);
          anySpeedBuff = Math.max(anySpeedBuff, m.speedMult || 1.75);
        }

        if (btn) {
          btn.classList.add("active");
          btn.classList.remove("cooldown", "ready");
        }
        if (statusText) {
          statusText.textContent = "ĐANG BẬT";
        }
        if (timerBadge) {
          timerBadge.classList.remove("hidden");
          timerBadge.textContent = `${remainSec}s`;
          timerBadge.style.color = "#fef08a";
        }
        if (prog) {
          const pct = Math.max(
            0,
            Math.min(
              100,
              ((s.activeUntil - now) / (m.durationMs || 20000)) * 100,
            ),
          );
          prog.style.width = `${pct}%`;
          prog.style.background = m.color;
        }
      } else if (now < s.cooldownUntil) {
        const cdRemainSec = Math.max(
          1,
          Math.ceil((s.cooldownUntil - now) / 1000),
        );
        if (btn) {
          btn.classList.add("cooldown");
          btn.classList.remove("active", "ready");
        }
        if (statusText) {
          statusText.textContent = "HỒI CHIÊU";
        }
        if (timerBadge) {
          timerBadge.classList.remove("hidden");
          timerBadge.textContent = `${cdRemainSec}s`;
          timerBadge.style.color = "#94a3b8";
        }
        if (prog) {
          const totalCd = m.cooldownMs || 60000;
          const passed = totalCd - (s.cooldownUntil - now);
          const pct = Math.max(0, Math.min(100, (passed / totalCd) * 100));
          prog.style.width = `${pct}%`;
          prog.style.background = "rgba(148, 163, 184, 0.45)";
        }
      } else {
        if (btn) {
          btn.classList.add("ready");
          btn.classList.remove("active", "cooldown");
        }
        if (statusText) {
          statusText.textContent = "SẴN SÀNG";
        }
        if (timerBadge) {
          timerBadge.classList.add("hidden");
        }
        if (prog) {
          prog.style.width = "0%";
        }
      }
    });

    this.player.activeVipSpeedBuff = anySpeedBuff;
    this.player.activeVipSmashBuff = anySmashBuff;
    this.player.activeVipReachBoost = anyReachBoost;
    this.player.activeVipDomain = anyDomain;

    if (this.opponent) {
      this.opponent.activeVipSlowBuff = anyTimeSlow;
    }

    if (activeColor) {
      if (!this.playerVipAuraGroup && this.player.root) {
        const grp = new o.Group();
        const outerGeo = new o.TorusGeometry(1.15, 0.055, 12, 42);
        const outerMat = new o.MeshBasicMaterial({
          color: new o.Color(activeColor),
          transparent: true,
          opacity: 0.9,
        });
        const outerRing = new o.Mesh(outerGeo, outerMat);
        outerRing.rotation.x = Math.PI / 2;
        outerRing.position.y = 0.1;

        const innerGeo = new o.TorusGeometry(0.75, 0.04, 12, 32);
        const innerMat = new o.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.75,
        });
        const innerRing = new o.Mesh(innerGeo, innerMat);
        innerRing.rotation.x = Math.PI / 2;
        innerRing.position.y = 0.65;

        const pillarGeo = new o.CylinderGeometry(0.95, 1.15, 2.2, 24, 1, true);
        const pillarMat = new o.MeshBasicMaterial({
          color: new o.Color(activeColor),
          transparent: true,
          opacity: 0.22,
          side: o.DoubleSide,
        });
        const pillar = new o.Mesh(pillarGeo, pillarMat);
        pillar.position.y = 1.1;

        grp.add(outerRing, innerRing, pillar);
        grp.userData = { outerMat, innerRing, pillarMat };
        this.playerVipAuraGroup = grp;
        this.player.root.add(grp);
      }
      if (this.playerVipAuraGroup) {
        this.playerVipAuraGroup.visible = true;
        this.playerVipAuraGroup.rotation.y += dt * 5.2;
        const { outerMat, innerRing, pillarMat } =
          this.playerVipAuraGroup.userData;
        outerMat.color.set(activeColor);
        pillarMat.color.set(activeColor);
        innerRing.position.y = 0.4 + Math.abs(Math.sin(this.elapsedTime * 5.5)) * 1.1;
        const pulse = 0.92 + Math.sin(this.elapsedTime * 8.0) * 0.14;
        this.playerVipAuraGroup.scale.set(pulse, 1, pulse);
      }
    } else if (this.playerVipAuraGroup) {
      this.playerVipAuraGroup.visible = false;
    }
  }
  update(e) {
    ((this.elapsedTime += e),
      this._updateVipMechanics(e),
      this.courtMapManager?.updateWeather?.(e, this.elapsedTime),
      this.addictiveFeatures?.update?.(e),
      (this.cameraTrauma = Math.max(0, this.cameraTrauma - e * 1.4)));
    if (
      this.motionController &&
      this.motionController.settings?.manualMovement !== !1
    ) {
      const m = this.motionController.getMoveInput(),
        inLen = Math.hypot(m.x, m.z);
      if (inLen > 0.02) {
        this.userHasInteracted = !0;
        const a = this.playerRole === "p2" ? this.opponent : this.player,
          ratio = o.MathUtils.clamp(
            Number(
              this.motionController.settings?.moveSpeedRatio ??
                this.motionController.settings?.moveSensitivity ??
                1,
            ),
            0.4,
            1.6,
          ),
          sp =
            4.6 *
            ratio *
            (a === this.player ? this.player?.activeVipSpeedBuff || 1 : 1),
          clamped = Math.min(1, inLen),
          nx = (m.x / inLen) * clamped,
          nz = (m.z / inLen) * clamped,
          zSign = this.playerRole === "p2" ? -1 : 1,
          xSign = this.playerRole === "p2" ? -1 : 1,
          dx = nx * sp * e * xSign,
          dz = nz * sp * e * zSign;
        if (this.phase === "SERVE_STANCE" || this.phase === "SERVE_TOSS") {
          a.pos.x = o.MathUtils.clamp(
            a.pos.x + dx,
            -S.SINGLES_X + 1.2,
            S.SINGLES_X - 1.2,
          );
        } else {
          ((a.pos.x = o.MathUtils.clamp(
            a.pos.x + dx,
            -S.DOUBLES_X + 0.45,
            S.DOUBLES_X - 0.45,
          )),
            (a.pos.z = o.MathUtils.clamp(
              a.pos.z + dz,
              this.playerRole === "p2" ? -S.BASELINE_Z - 0.5 : 2.5,
              this.playerRole === "p2" ? -2.5 : S.BASELINE_Z + 0.5,
            )));
        }
        (a.targetPos.copy(a.pos),
          a.vel.set(dx / Math.max(0.001, e), 0, dz / Math.max(0.001, e)),
          (a.stridePhase += Math.hypot(dx, dz) * 3.6));
        if (
          this.isMultiplayer &&
          this.playerRole === "p2" &&
          this.onlineMatchmaker &&
          this.onlineMatchmaker.currentRoomId &&
          this.elapsedTime - this.lastGuestMoveSentAt >= 0.06
        ) {
          this.lastGuestMoveSentAt = this.elapsedTime;
          this.onlineMatchmaker.sendGuestMovement({
            x: a.pos.x / 4,
            z: (a.pos.z + S.BASELINE_Z) / 3.5,
          });
        }
      }
    }
    const t = this.swingVfx ? this.swingVfx.consumeHitStop(e) : e,
      i = this.phase === "REPLAY" ? 0.38 : 1;
    for (
      this.physicsAccumulator = Math.min(
        this.physicsAccumulator + t * i,
        L.FIXED_DT * 3,
      );
      this.physicsAccumulator >= L.FIXED_DT;
    )
      (this._stepPhysics(L.FIXED_DT), (this.physicsAccumulator -= L.FIXED_DT));
    if (
      (this.isMultiplayer &&
        this.roomId &&
        this.roomId !== "default" &&
        this.playerRole === "p1" &&
        this.elapsedTime - this.lastSyncSentAt >= 0.095 &&
        ((this.lastSyncSentAt = this.elapsedTime),
        this._broadcastMultiplayerSnapshot()),
      this._updateMiiAnimation(this.player, e),
      this._updateMiiAnimation(this.playerPartner, e),
      this._updateMiiAnimation(this.opponent, e),
      this._updateMiiAnimation(this.opponentPartner, e),
      this._updateCrowdAnimation(e),
      this.swingVfx)
    )
      if (
        (this.swingVfx.update(e, {
          actors: [
            this.player,
            this.playerPartner,
            this.opponent,
            this.opponentPartner,
          ],
          ball: this.ball,
          camera: this.camera,
        }),
        this.phase === "SHOWCASE")
      ) {
        const a = this.showcaseModeName || "showcase_topspin";
        a === "showcase_slice" || a === "showcase_backhand"
          ? this.swingVfx.seedActorSwingArc(this.player, {
              shotType: "SLICE",
              isPower: !1,
              whipSpeed: 26,
              swingType: "backhand",
            })
          : a === "showcase_smash"
            ? this.swingVfx.seedActorSwingArc(this.player, {
                shotType: "SMASH",
                isPower: !0,
                whipSpeed: 34,
                swingType: "smash",
              })
            : a === "showcase_topspin" &&
              this.swingVfx.seedActorSwingArc(this.player, {
                shotType: "TOPSPIN",
                isPower: !0,
                whipSpeed: 29,
                swingType: "forehand",
              });
      } else
        this.phase === "REPLAY" &&
        this.persistentStateLock &&
        !this.userHasInteracted
          ? (this.swingVfx.seedActorSwingArc(this.player, {
              shotType: "TOPSPIN",
              isPower: !0,
              whipSpeed: 28,
              swingType: "forehand",
            }),
            this.swingVfx.seedActorSwingArc(this.opponent, {
              shotType: "SLICE",
              isPower: !1,
              whipSpeed: 25,
              swingType: "forehand",
            }))
          : this.phase === "RALLY" &&
            this.autoPlayMode &&
            !this.userHasInteracted &&
            this.swingVfx.seedActorSwingArc(this.player, {
              shotType: "TOPSPIN",
              isPower: !0,
              whipSpeed: 28,
              swingType: "forehand",
            });
    (this._updateEffects(e),
      this._updateCameraRig(e),
      this._updateProjectedHUD());
  }
  _stepPhysics(e) {
    if (
      ((this.phaseTimer += e),
      this.player.swingCooldown > 0 &&
        (this.player.swingCooldown = Math.max(
          0,
          this.player.swingCooldown - e,
        )),
      this.playerPartner.swingCooldown > 0 &&
        (this.playerPartner.swingCooldown = Math.max(
          0,
          this.playerPartner.swingCooldown - e,
        )),
      this.opponent.swingCooldown > 0 &&
        (this.opponent.swingCooldown = Math.max(
          0,
          this.opponent.swingCooldown - e,
        )),
      this.opponentPartner.swingCooldown > 0 &&
        (this.opponentPartner.swingCooldown = Math.max(
          0,
          this.opponentPartner.swingCooldown - e,
        )),
      this.phase === "SHOWCASE")
    ) {
      if (this.phaseTimer >= 0.34)
        ((this.phaseTimer = 0), this._refreshShowcasePose());
      else {
        const t = this.showcaseModeName || "showcase_topspin";
        (t === "showcase_slice" || t === "showcase_backhand") &&
        this.player.racketKinematics
          ? ((this.player.racketKinematics.swingActive = !0),
            (this.player.racketKinematics.swingElapsed = 0.072),
            (this.player.swingTimer = 0.26))
          : t === "showcase_smash" && this.player.racketKinematics
            ? ((this.player.racketKinematics.swingActive = !0),
              (this.player.racketKinematics.swingElapsed = 0.058),
              (this.player.swingTimer = 0.26))
            : t === "showcase_topspin" && this.player.racketKinematics
              ? ((this.player.racketKinematics.swingActive = !0),
                (this.player.racketKinematics.swingElapsed = 0.068),
                (this.player.swingTimer = 0.26))
              : t === "showcase_panic"
                ? (this.player.vel.set(-6.8, 0, 1.2),
                  (this.player.stridePhase += e * 15))
                : t === "showcase_win" &&
                  this.player.rig?.reaction &&
                  (this.player.rig.reaction.timer = 0.16);
      }
      return;
    }
    if (this.phase === "REPLAY") {
      if (this.persistentStateLock && !this.userHasInteracted) {
        const t = 0.5 + 0.5 * Math.sin(this.elapsedTime * 2.2),
          i = new o.Vector3(-1.12, 1.22, -1.08),
          a = new o.Vector3(
            -0.18 + t * 0.22,
            1.32 + t * 0.08,
            -0.05 + t * 0.22,
          );
        (this.ball.pos.copy(a),
          this.ballTrail.seedArc(i, a, 0.24),
          (this.player.swingTimer = 0.22),
          (this.player.arcVisibleTimer = 0.9),
          (this.opponent.swingTimer = 0.2),
          (this.opponent.arcVisibleTimer = 0.9),
          this.player.racketKinematics &&
            ((this.player.racketKinematics.swingActive = !0),
            (this.player.racketKinematics.swingShotType = "topspin"),
            (this.player.racketKinematics.swingSide = "forehand"),
            (this.player.racketKinematics.swingElapsed = 0.13)),
          this.opponent.racketKinematics &&
            ((this.opponent.racketKinematics.swingActive = !0),
            (this.opponent.racketKinematics.swingShotType = "slice"),
            (this.opponent.racketKinematics.swingSide = "forehand"),
            (this.opponent.racketKinematics.swingElapsed = 0.11)));
        return;
      }
      (this.ball.pos.addScaledVector(this.ball.vel, e),
        (this.ball.vel.y -= L.GRAVITY * 0.65 * e),
        this.ballTrail.pushPoint(this.ball.pos),
        this.phaseTimer > 1.45 &&
          (this.hud.setReplayMode(!1),
          this._setupPointServe({ showBanner: !0 })));
      return;
    }
    if (
      (this.phase === "SERVE_STANCE" &&
        !this.persistentStateLock &&
        (this.score.server === "opponent" &&
        !this.isMultiplayer &&
        this.phaseTimer > 1.25
          ? this._startServeToss(this.opponent)
          : this.autoPlayMode &&
            this.score.server === "player" &&
            this.phaseTimer > 1.4 &&
            this._startServeToss(this.player)),
      this.phase === "SERVE_TOSS")
    ) {
      const tossWind = this.courtMapManager?.getCurrentWindVector?.(this.elapsedTime);
      if (tossWind && tossWind.strength > 0.05) {
        this.ball.vel.x += tossWind.x * e * 0.65;
        this.ball.vel.z += tossWind.z * e * 0.28;
      }
      (this.ball.pos.addScaledVector(this.ball.vel, e),
        (this.ball.vel.y -= L.GRAVITY * e));
      const t = o.MathUtils.clamp(
        (this.ball.pos.y - 1.15) / (3.35 - 1.15),
        0,
        1,
      );
      if (
        (this.hud.updateTimingGauge({
          cursorNormalized: t * 0.52,
          modeTitle: "SERVE APEX TIMING",
          speedText:
            this.ball.pos.y >= 2.05 ? "SWEET SPOT! (198 KM/H)" : "RISING...",
        }),
        this.pendingServeSwing &&
          (this.ball.pos.y >= 2.68 || this.ball.vel.y <= 0.35))
      ) {
        const { actor: i, evt: a } = this.pendingServeSwing;
        ((this.pendingServeSwing = null), this._executeServeHit(i, a));
        return;
      }
      if (
        ((this.score.server === "opponent" && !this.isMultiplayer) ||
          this.autoPlayMode) &&
        this.ball.vel.y <= 0.25 &&
        this.ball.pos.y >= 2.75
      ) {
        const i = this.score.server === "player" ? this.player : this.opponent;
        this._executeServeHit(i, { timing: "PERFECT" });
        return;
      }
      this.ball.pos.y <= 0.95 &&
        this.ball.vel.y < 0 &&
        ((this.phase = "SERVE_STANCE"),
        (this.phaseTimer = 0),
        this.ball.vel.set(0, 0, 0),
        (this.pendingServeSwing = null));
      return;
    }
    if (this.phase === "POINT_OVER") {
      this.phaseTimer > 2.15 && this._setupPointServe({ showBanner: !0 });
      return;
    }
    if (this.phase === "RALLY" && this.ball.inPlay) {
      if (this.autoPlayMode && !this.userHasInteracted) {
        const s = (this.elapsedTime * 0.85) % 1,
          n = 0.42 + 0.34 * Math.sin(s * Math.PI * 2),
          previewWind = this.courtMapManager?.getCurrentWindVector?.(this.elapsedTime),
          windCurveX = previewWind ? previewWind.x * Math.sin(n * Math.PI) * 0.55 : 0,
          h = new o.Vector3(1.42, 1.24, 10.85),
          r = new o.Vector3(-1.35 + windCurveX, 0.25, -8.5),
          l = new o.Vector3().lerpVectors(h, r, n);
        ((l.x += windCurveX * 0.65),
          (l.y += Math.sin(n * Math.PI) * 1.45),
          this.ball.pos.copy(l),
          this.ball.mesh && (this.ball.mesh.rotation.x -= e * 16),
          this.ballTrail.setStyle("TOPSPIN", !1),
          this.ballTrail.seedArc(h, l, 0.78 * n),
          this.player.pos.set(
            1.35 + Math.sin(this.elapsedTime * 2.2) * 0.18,
            0,
            11.4,
          ),
          (this.player.stridePhase += e * 4.2),
          (this.player.swingType = "forehand"),
          (this.player.swingTimer = 0.24),
          (this.player.arcVisibleTimer = 0.85),
          this.player.racketKinematics &&
            ((this.player.racketKinematics.swingActive = !0),
            (this.player.racketKinematics.swingShotType = "topspin"),
            (this.player.racketKinematics.swingSide = "forehand"),
            (this.player.racketKinematics.swingElapsed = 0.12)),
          this.opponent.pos.set(
            -1.35 + windCurveX * 0.7 + Math.cos(this.elapsedTime * 2.2) * 0.35,
            0,
            -10.5,
          ),
          (this.opponent.stridePhase += e * 4.2));
        return;
      }
      const t = this.ball.pos.z,
        i = this.ball.vel.length(),
        a = Math.max(0, 1 - L.AIR_DRAG * i * e),
        mapWind = this.courtMapManager?.getCurrentWindVector?.(this.elapsedTime);
      if (mapWind && mapWind.strength > 0.05) {
        const airborneFactor = this.ball.pos.y > 0.32 ? 2.15 : 0.75;
        this.ball.vel.x += mapWind.x * e * airborneFactor;
        this.ball.vel.z += mapWind.z * e * (airborneFactor * 0.42);
        if (this.ball.targetLanding && this.ball.bounces === 0) {
          this.ball.targetLanding.x = o.MathUtils.clamp(
            this.ball.targetLanding.x + mapWind.x * e * 0.92,
            -S.SINGLES_HALF_WIDTH - 1.15,
            S.SINGLES_HALF_WIDTH + 1.15,
          );
        }
      }
      if (
        (this.ball.vel.multiplyScalar(a),
        (this.ball.vel.y -= (L.GRAVITY + this.ball.spin.x * 0.14) * e),
        (this.ball.vel.x += this.ball.spin.y * 0.12 * e),
        this.ball.pos.addScaledVector(this.ball.vel, e),
        this.ball.mesh &&
          ((this.ball.mesh.rotation.x += this.ball.vel.z * e * 1.8),
          (this.ball.mesh.rotation.z -= this.ball.vel.x * e * 1.8)),
        this.ballTrail.pushPoint(this.ball.pos),
        this.ball.isPowerShot &&
          Math.random() < 0.45 &&
          this._spawnStarBurst(this.ball.pos, 1),
        ((t > 0 && this.ball.pos.z <= 0) || (t < 0 && this.ball.pos.z >= 0)) &&
          this.ball.pos.y < S.NET_HEIGHT_CENTER + 0.04)
      ) {
        ((this.ball.vel.z *= -0.25),
          (this.ball.vel.x *= 0.45),
          (this.ball.vel.y = 1.2),
          this.audioEngine && this.audioEngine.playNetCord());
        if (!(this.isMultiplayer && this.playerRole === "p2"))
          this._awardPoint(
            this.ball.lastHitter === "player" ? "opponent" : "player",
            "Net",
          );
        return;
      }
      if (this.ball.pos.y <= 0.075 && this.ball.vel.y < 0) {
        const s = Math.abs(this.ball.vel.y),
          mCfg = this.courtMapManager?.getSelectedMap?.(),
          bRest = mCfg?.bounceRestitution || L.BOUNCE_RESTITUTION,
          sFric = mCfg?.surfaceFriction || L.SURFACE_FRICTION;
        ((this.ball.pos.y = 0.075),
          (this.ball.vel.y = -this.ball.vel.y * bRest),
          (this.ball.vel.x *= sFric),
          (this.ball.vel.z *= sFric),
          this._spawnBounceRing(this.ball.pos.x, this.ball.pos.z),
          this.swingVfx &&
            this.swingVfx.spawnTurfBounce(
              this.ball.pos.x,
              this.ball.pos.z,
              this.ball,
              s,
            ),
          this.audioEngine &&
            this.audioEngine.playBallBounce(Math.min(1.2, s / 5)));
        this.addictiveFeatures?.onBallBounceOnCourt?.(
          this.ball.pos.x,
          this.ball.pos.z,
          this.ball.lastHitter,
        );
        const n = this.ball.pos.z > 0,
          h = this.ball.lastHitter === "player";
        if (this.ball.bounceCountOnCurrentSide === 0) {
          const isOut =
            (h && n) ||
            (!h && !n) ||
            Math.abs(this.ball.pos.x) > S.SINGLES_X + 0.22 ||
            Math.abs(this.ball.pos.z) > S.BASELINE_Z + 0.28;
          this._recordMatchPlacement(h ? "player" : "opponent", {
            x: this.ball.pos.x,
            z: this.ball.pos.z,
            shotType: this.ball.shotType || "TOPSPIN",
            isPower: !!this.ball.isPowerShot,
            inBounds: !isOut,
          });
        }
        if ((h && n) || (!h && !n)) {
          if (!(this.isMultiplayer && this.playerRole === "p2"))
            this._awardPoint(h ? "opponent" : "player", "Out");
          return;
        }
        if (
          ((this.ball.bounceCountOnCurrentSide += 1),
          this.ball.bounceCountOnCurrentSide === 1)
        ) {
          const r = Math.abs(this.ball.pos.x) > S.SINGLES_X + 0.22,
            l = Math.abs(this.ball.pos.z) > S.BASELINE_Z + 0.28;
          if (r || l) {
            if (!(this.isMultiplayer && this.playerRole === "p2"))
              this._awardPoint(h ? "opponent" : "player", "Out");
            return;
          }
        }
        if (this.ball.bounceCountOnCurrentSide >= 2) {
          if (!(this.isMultiplayer && this.playerRole === "p2"))
            this._awardPoint(this.ball.lastHitter, "Nice Shot!");
          return;
        }
      }
      if (
        (this._stepActorFootwork(this.player, e),
        this._stepActorFootwork(this.playerPartner, e),
        this._stepActorFootwork(this.opponent, e),
        this._stepActorFootwork(this.opponentPartner, e),
        this.ball.lastHitter === "player" && this.ball.pos.z < -1.2)
      )
        if (this.isMultiplayer) {
          const p2PartMods =
              characterShopManager.getPartnerModifiersFromLoadout(
                this.guestLoadout,
              ),
            p2Dz = Math.abs(this.ball.pos.z - this.opponentPartner.pos.z),
            p2Dx = Math.abs(this.ball.pos.x - this.opponentPartner.pos.x);
          if (
            !this.pendingP2Swing &&
            this.opponentPartner.swingCooldown <= 0 &&
            this.ball.pos.z >= -6.8 &&
            p2Dz < (p2PartMods.interceptReachZ || 1.05) &&
            p2Dx < (p2PartMods.interceptReachX || 1.45) &&
            this.ball.pos.y < 1.95 &&
            (!this.ball.isPowerShot || p2PartMods.canInterceptPowerShot)
          ) {
            if (
              !this._p2PartnerInterceptRolledForStroke ||
              this._p2PartnerInterceptRolledForStroke !==
                this.ball.rallyStrokeCount
            ) {
              this._p2PartnerInterceptRolledForStroke =
                this.ball.rallyStrokeCount;
              this._p2PartnerInterceptApproved =
                Math.random() < (p2PartMods.autoInterceptChance || 0.35);
            }
            if (
              this._p2PartnerInterceptApproved &&
              this._executePartnerBotReturn(this.opponentPartner)
            )
              return;
          }
          const s = Math.hypot(
              this.ball.pos.x - this.opponent.pos.x,
              this.opponent.pos.z - this.ball.pos.z,
            ),
            n = Math.hypot(
              this.ball.pos.x - this.opponentPartner.pos.x,
              this.opponentPartner.pos.z - this.ball.pos.z,
            ),
            h =
              this.ball.pos.z >= -7.2 && n < s && n <= 3.9
                ? this.opponentPartner
                : this.opponent,
            r = h.pos.z - this.ball.pos.z,
            l = Math.abs(this.ball.pos.x - h.pos.x);
          if (this.playerRole === "p2") {
            const p = o.MathUtils.clamp(0.5 + r * 0.16, 0.06, 0.94);
            this.hud.updateTimingGauge({
              cursorNormalized: p,
              modeTitle:
                h === this.opponentPartner
                  ? "P2 NET TIMING"
                  : "P2 SWING TIMING",
              speedText:
                r >= -1.45 && r <= 0.68
                  ? "SWEET SPOT!"
                  : r < -1.45
                    ? "EARLY (CROSS)"
                    : "LATE (LINE)",
            });
          }
          if (this.pendingP2Swing)
            if (this.elapsedTime > this.pendingP2Swing.expiresAt)
              this.pendingP2Swing = null;
            else {
              const p = h === this.opponentPartner ? 3.95 : 4.65;
              if (
                r >= -0.85 &&
                r <= 0.65 &&
                Math.hypot(l, r) <= p &&
                this.ball.pos.y < 2.35
              ) {
                const c = this.pendingP2Swing.evt;
                ((this.pendingP2Swing = null), this._attemptP2RallyStrike(c));
                return;
              }
            }
          if (this.ball.pos.z < -15.6) {
            if (!(this.isMultiplayer && this.playerRole === "p2"))
              this._awardPoint("player", "Nice Shot!");
            return;
          }
        } else {
          const diff = this.matchConfig.difficulty,
            isX2 = diff === "x2",
            isCucCao = diff === "cuc_cao",
            isSieuCao = diff === "sieu_cao",
            isCao = diff === "cao" || diff === "pro",
            isHighDiff = isX2 || isCucCao || isSieuCao || isCao,
            s = !isHighDiff,
            botReachBonus = Number(this.opponent.reachBonus || 0),
            n = isX2 ? 3.2 : isCucCao ? 2.2 : isSieuCao ? 1.7 : isCao ? 1.45 : 0.85,
            h = (s ? 1.85 : 2.55) + botReachBonus,
            zWindow = isX2 ? 2.85 : isCucCao ? 2.15 : isSieuCao ? 1.75 : 1.45,
            maxY = isX2 ? 3.6 : isCucCao ? 3.1 : isSieuCao ? 2.65 : 2.35;

          // Continuously track the incoming ball in real-time so the bot never stands still waiting
          this.opponent.targetPos.x = o.MathUtils.clamp(
            o.MathUtils.lerp(
              this.ball.targetLanding.x,
              this.ball.pos.x,
              isX2 || isCucCao ? 0.88 : 0.65,
            ),
            -S.DOUBLES_X + 0.3,
            S.DOUBLES_X - 0.3,
          );
          if (this.ball.pos.z < -2.2) {
            this.opponent.targetPos.z = o.MathUtils.clamp(
              this.ball.pos.z - (isX2 ? 0.25 : 0.45),
              -14.2,
              -2.5,
            );
          }
          if (this.opponentPartner && isHighDiff && this.ball.pos.z > -7.2) {
            this.opponentPartner.targetPos.x = o.MathUtils.clamp(
              this.ball.pos.x,
              -S.SINGLES_X + 0.3,
              S.SINGLES_X - 0.3,
            );
          }

          if (
            (isX2 ||
              isCucCao ||
              (!this.ball.isPowerShot &&
                this.ball.shotType !== "LOB" &&
                this.ball.rallyStrokeCount > 1)) &&
            Math.abs(this.ball.pos.z - this.opponentPartner.pos.z) <
              (isX2 ? 1.75 : 1.05) &&
            Math.abs(this.ball.pos.x - this.opponentPartner.pos.x) < n &&
            this.ball.pos.y < (isX2 ? 2.85 : 2.05) &&
            (!s || Math.random() < 0.55)
          ) {
            this._executeOpponentReturn(this.opponentPartner);
            return;
          }
          const r = Math.abs(this.ball.pos.z - this.opponent.pos.z),
            l = Math.abs(this.ball.pos.x - this.opponent.pos.x);
          if (r < zWindow && this.ball.pos.y < maxY) {
            if (l <= h) {
              this._executeOpponentReturn(this.opponent);
              return;
            } else if (l <= 3.65 && this.opponent.swingTimer <= 0) {
              const p =
                this.ball.pos.x < this.opponent.pos.x ? "backhand" : "forehand";
              ((this.opponent.swingType = p),
                (this.opponent.swingDuration = 0.36),
                (this.opponent.swingTimer = 0.36),
                (this.opponent.arcVisibleTimer = 0.32),
                this.racketKinematics &&
                  this.racketKinematics.triggerSwing(this.opponent, {
                    shotType: "slice",
                    side: p,
                    speed: 1.2,
                    timing: "late",
                  }),
                this.facialFX &&
                  (this.facialFX.setExpression(
                    this.opponent,
                    "wide_eyed_panic",
                    0.9,
                  ),
                  this.facialFX.spawnSweatDrops(this.opponent, 5)),
                this.audioEngine && this.audioEngine.playSwingWhoosh(0.95));
            }
          } else if (this.ball.pos.z < -15.2) {
            if (!(this.isMultiplayer && this.playerRole === "p2"))
              this._awardPoint("player", "Nice Shot!");
            return;
          }
        }
      if (this.ball.lastHitter === "opponent" && this.ball.pos.z > 0.8) {
        const partMods =
          this.isMultiplayer && this.hostLoadout
            ? characterShopManager.getPartnerModifiersFromLoadout(
                this.hostLoadout,
              )
            : characterShopManager.getEffectivePartnerModifiers();
        this.playerPartner.maxSpeed = partMods.maxSpeed || 5.2;
        if (partMods.isUpgradedOrSpecial && this.ball.pos.z <= 8.2) {
          this.playerPartner.targetPos.set(
            o.MathUtils.clamp(
              this.ball.pos.x,
              -S.DOUBLES_X + 0.4,
              S.DOUBLES_X - 0.4,
            ),
            0,
            o.MathUtils.clamp(this.ball.pos.z, 2.2, 6.8),
          );
        }
        const partnerDz = Math.abs(this.ball.pos.z - this.playerPartner.pos.z),
          partnerDx = Math.abs(this.ball.pos.x - this.playerPartner.pos.x),
          maxPartnerZ = partMods.isUpgradedOrSpecial ? 7.8 : 5.8,
          maxPartnerY = partMods.isUpgradedOrSpecial ? 2.45 : 1.85;
        if (
          (partMods.isUpgradedOrSpecial || (partMods.aiIqLevel || 1) >= 2) &&
          this.playerPartner.swingCooldown <= 0 &&
          this.ball.pos.z <= maxPartnerZ &&
          partnerDz < (partMods.interceptReachZ || 1.05) &&
          partnerDx < (partMods.interceptReachX || 1.15) &&
          this.ball.pos.y < maxPartnerY &&
          (!this.ball.isPowerShot || partMods.canInterceptPowerShot)
        ) {
          if (
            !this._partnerInterceptRolledForStroke ||
            this._partnerInterceptRolledForStroke !== this.ball.rallyStrokeCount
          ) {
            this._partnerInterceptRolledForStroke = this.ball.rallyStrokeCount;
            this._partnerInterceptApproved =
              Math.random() < (partMods.autoInterceptChance || 0);
          }
          if (this._partnerInterceptApproved) {
            if (partMods.isUpgradedOrSpecial && partnerDx > 0.85) {
              this.playerPartner.pos.x = o.MathUtils.lerp(
                this.playerPartner.pos.x,
                this.ball.pos.x,
                0.72,
              );
            }
            if (this._executePartnerBotReturn(this.playerPartner)) return;
          }
        }
        const r = this.ball.pos.z - this.player.pos.z,
          l = Math.abs(this.ball.pos.x - this.player.pos.x);
        if (this.playerRole !== "p2") {
          const p = o.MathUtils.clamp(0.5 + r * 0.16, 0.06, 0.94);
          this.hud.updateTimingGauge({
            cursorNormalized: p,
            modeTitle: "SWING TIMING",
            speedText:
              l > 1.65
                ? "DI CHUYỂN TỚI BÓNG!"
                : r >= -1.25 && r <= 0.65
                  ? "SWEET SPOT!"
                  : r < -2.25
                    ? "VERY EARLY"
                    : r < -1.25
                      ? "EARLY (CROSS)"
                      : r > 1.25
                        ? "TOO LATE!"
                        : "LATE (LINE)",
          });
        }
        if (
          this.autoPlayMode &&
          !this.userHasInteracted &&
          Math.abs(r) < 0.55 &&
          l < 1.45 &&
          this.ball.pos.y < 1.75
        )
          this._attemptPlayerRallyStrike({ timing: "PERFECT" }, !0);
        else if (this.ball.pos.z > 15.6) {
          if (!(this.isMultiplayer && this.playerRole === "p2"))
            this._awardPoint(
              "opponent",
              this.isMultiplayer ? "Nice Shot!" : "Point",
            );
          return;
        }
      }
    }
  }
  _stepActorFootwork(e, t) {
    // If manualMovement is active and this is the human-controlled player, do not auto-walk to targetPos
    if (
      e === this.player &&
      this.playerRole !== "p2" &&
      !(this.autoPlayMode && !this.userHasInteracted) &&
      this.motionController?.settings?.manualMovement !== !1
    ) {
      e.targetPos.copy(e.pos);
      e.vel.set(0, 0, 0);
      return;
    }
    const i = e.targetPos.x - e.pos.x,
      a = e.targetPos.z - e.pos.z,
      s = Math.hypot(i, a);
    if (s > 0.08) {
      let spd = e.maxSpeed;
      if (e === this.player && this.player.activeVipSpeedBuff) {
        spd *= this.player.activeVipSpeedBuff;
      }
      if (e === this.opponent && this.opponent.activeVipSlowBuff) {
        spd *= this.opponent.activeVipSlowBuff;
      }
      const n = Math.min(s, spd * t),
        h = (i / s) * (n / t),
        r = (a / s) * (n / t);
      (e.vel.set(h, 0, r),
        (e.pos.x += (i / s) * n),
        (e.pos.z += (a / s) * n),
        (e.stridePhase += n * 3.6));
    } else e.vel.set(0, 0, 0);
  }
  _awardPoint(e, t = "") {
    if (this.isMultiplayer && this.playerRole === "p2") return;
    ((this.phase = "POINT_OVER"),
      (this.phaseTimer = 0),
      (this.ball.inPlay = !1),
      (this.cheerEnergy = 1),
      (this.pendingUserSwing = null),
      (this.pendingP2Swing = null),
      (this.pendingServeSwing = null),
      (this.pointAwardSeq = (this.pointAwardSeq || 0) + 1),
      (this.lastPointAward = {
        seq: this.pointAwardSeq,
        winner: e,
        reason: t,
      }));
    const i = e === "player",
      y = this.playerRole === "p2" ? e === "opponent" : i;
    triggerPhysicalHardwareVibration(y ? "point_won" : "point_lost");
    this.addictiveFeatures?.onPointFinished?.(e);
    if (!this.autoPlayMode) {
      if (y) {
        const x = this.isMultiplayer
          ? 120
          : t === "Nice Shot!" || this.ball.isPowerShot
            ? 95
            : 70;
        (this._rewardMatchCoins(
          x,
          this.isMultiplayer ? "Ăn Điểm Online" : "Ăn Điểm Trực Tiếp",
        ),
          this.triggerCameraShake(0.38));
      } else if (this.ball.rallyStrokeCount >= 3) {
        (this._rewardMatchCoins(45, "Thưởng Đôi Công"),
          this.triggerCameraShake(0.22));
      }
    }
    (this.bodyAnimator &&
      (this.bodyAnimator.triggerPointReaction(this.player, i ? "win" : "loss"),
      this.bodyAnimator.triggerPointReaction(
        this.playerPartner,
        i ? "win" : "loss",
      ),
      this.bodyAnimator.triggerPointReaction(this.opponent, i ? "loss" : "win"),
      this.bodyAnimator.triggerPointReaction(
        this.opponentPartner,
        i ? "loss" : "win",
      )),
      this.facialFX &&
        (this.facialFX.setExpression(
          this.player,
          i ? "happy_grin" : "shocked_loss",
          1.8,
        ),
        this.facialFX.setExpression(
          this.playerPartner,
          i ? "happy_grin" : "shocked_loss",
          1.8,
        ),
        this.facialFX.setExpression(
          this.opponent,
          i ? "shocked_loss" : "happy_grin",
          1.8,
        ),
        this.facialFX.setExpression(
          this.opponentPartner,
          i ? "shocked_loss" : "happy_grin",
          1.8,
        ),
        this.facialFX.triggerEmoteBurst(
          i ? this.player : this.opponent,
          "win",
        )),
      this.audioEngine &&
        this.audioEngine.playCrowdReaction(e === "player" ? "cheer" : "ooh"),
      this.motionController &&
        this.motionController.triggerHapticFeedback &&
        !this.autoPlayMode &&
        (this.motionController.triggerHapticFeedback({
          role: "p1",
          kind: e === "player" ? "point_won" : "fault",
          grade: t || (e === "player" ? "POINT WON!" : "POINT LOST"),
          shotType: "TOPSPIN",
          speedKmh: 0,
          intensity: e === "player" ? 1.4 : 0.75,
        }),
        this.isMultiplayer &&
          this.motionController.triggerHapticFeedback({
            role: "p2",
            kind: e === "opponent" ? "point_won" : "fault",
            grade: t || (e === "opponent" ? "POINT WON!" : "POINT LOST"),
            shotType: "TOPSPIN",
            speedKmh: 0,
            intensity: e === "opponent" ? 1.4 : 0.75,
          })),
      e === "player"
        ? (this.score.playerPoints += 1)
        : (this.score.opponentPoints += 1),
      (this.score.deuceSide = !this.score.deuceSide));
    const a = this.score.playerPoints,
      s = this.score.opponentPoints,
      ptsTarget = Number(this.matchConfig.pointsToWinGame || 4),
      winBy = ptsTarget === 4 ? 2 : 1;
    if ((a >= ptsTarget || s >= ptsTarget) && Math.abs(a - s) >= winBy) {
      const w = this.playerRole === "p2" ? s > a : a > s;
      if (w && !this.autoPlayMode)
        this._rewardMatchCoins(
          this.isMultiplayer ? 380 : 260,
          this.isMultiplayer ? "Thắng Game Online" : "Thắng Game",
        );
      if (
        (a > s
          ? (this.score.playerGames += 1)
          : (this.score.opponentGames += 1),
        (this.score.playerPoints = 0),
        (this.score.opponentPoints = 0),
        (this.score.deuceSide = !0),
        (this.score.server =
          this.score.server === "player" ? "opponent" : "player"),
        this._syncScoreboardHUD(),
        this.score.playerGames >= this.matchConfig.gamesToWin ||
          this.score.opponentGames >= this.matchConfig.gamesToWin)
      ) {
        const p = this.score.playerGames > this.score.opponentGames,
          v = this.playerRole === "p2" ? !p : p;
        triggerPhysicalHardwareVibration(v ? "match_won" : "point_lost");
        if (!this.autoPlayMode) {
          const customOnlinePool = Math.max(1400, Number(this.matchConfig.customCoinReward || 50000));
          let matchBonus = v
            ? this.isMultiplayer
              ? customOnlinePool
              : 950
            : this.isMultiplayer
              ? Math.max(500, Math.round(customOnlinePool * 0.2))
              : 280;

          let vipBonus = 0;
          if (v && !this.isMultiplayer) {
            const diff = this.matchConfig.difficulty;
            if (diff === "x2") {
              matchBonus = 250000;
              vipBonus = 1000000;
            } else if (diff === "cuc_cao") {
              matchBonus = 50000;
              vipBonus = 350000;
            } else if (diff === "sieu_cao") {
              matchBonus = 15000;
              vipBonus = 100000;
            } else if (diff === "cao" || diff === "pro") {
              matchBonus = 3500;
              vipBonus = 25000;
            } else if (diff === "thap") {
              matchBonus = 750;
              vipBonus = 3000;
            } else if (diff === "de") {
              matchBonus = 450;
              vipBonus = 1000;
            } else {
              matchBonus = 1200;
              vipBonus = 8000;
            }
          }

          // VIP membership multiplier: x2 - x5 xu bonus if VIP subscription active!
          const vipMult = characterShopManager?.getVipCoinMultiplier?.() || 1.0;
          if (vipMult > 1.0) {
            matchBonus = Math.round(matchBonus * vipMult);
          }

          if (vipBonus > 0) {
            characterShopManager.addVipCoins(vipBonus, `Thắng Độ Khó FIFA: ${this.matchConfig.difficulty}`);
            this.matchVipCoinsEarned = vipBonus;
          } else {
            this.matchVipCoinsEarned = 0;
          }

          this._rewardMatchCoins(
            matchBonus,
            v
              ? this.isMultiplayer
                ? "Thắng Trận Online 1v1!"
                : this.matchConfig.difficulty === "x2"
                  ? "HẠ GỤC TRÙM CUỐI FIFA BOT LV.20 (X2 GOD)!"
                  : "Thắng Trận Chung Cuộc!"
              : "Thưởng Hoàn Thành Trận",
          );
          this.triggerCameraShake(this.matchConfig.difficulty === "x2" ? 1.5 : 0.68);
          if (this.clubTournamentUI && this.clubTournamentUI.onMatchFinished) {
            const tRes = this.clubTournamentUI.onMatchFinished(v);
            tRes &&
              tRes.coinsRewarded > 0 &&
              ((this.matchCoinsEarned =
                (this.matchCoinsEarned || 0) + tRes.coinsRewarded),
              this._spawnFloatingCoinToast(
                tRes.coinsRewarded,
                tRes.title || "Thưởng Giải Đấu CLB!",
              ));
          }
          this.addictiveFeatures?.onMatchFinished?.(v);
        }
        this.phase = "MATCH_OVER";
        const g = this.isMultiplayer
            ? p
              ? "P1 WINS!"
              : "P2 WINS!"
            : p
              ? "CHIẾN THẮNG!"
              : "KẾT THÚC TRẬN!",
          c = `Tỷ Số Set: ${this.score.playerGames} - ${this.score.opponentGames} \u2022 +${(this.matchCoinsEarned || 0).toLocaleString("vi-VN")} XU${(this.matchVipCoinsEarned || 0) > 0 ? ` \u2022 +${(this.matchVipCoinsEarned || 0).toLocaleString("vi-VN")} VIP` : ""}`;
        this._recordBannerBroadcast(g, "style-gold", c);
        this.hud.showCenterBanner(g, {
          style: "style-gold",
          subText: c,
          durationMs: 2600,
        });
        if (this.audioEngine) {
          this.audioEngine.playMusicForState("victory");
          this.audioEngine.announceScore(p ? "Game Set and Match" : "Game");
        }
        setTimeout(() => {
          if (this.isMultiplayer && this.onlineMatchmaker && this.onlineMatchmaker.finishAndCleanRoom) {
            this.onlineMatchmaker.finishAndCleanRoom();
          }
          const sInfo = v
            ? characterShopManager.recordMatchWin()
            : characterShopManager.recordMatchLoss();
          this.hud.showVictoryModal({
            playerWon: v,
            playerGames: this.score.playerGames,
            opponentGames: this.score.opponentGames,
            coinsEarned: this.matchCoinsEarned || 0,
            vipEarned: this.matchVipCoinsEarned || 0,
            isOnline: this.isMultiplayer,
            winnerRole: p ? "p1" : "p2",
            winnerName: p
              ? this.roomStatus?.hostName || "Player 1"
              : this.roomStatus?.guestName || "Player 2",
            winStreak: sInfo.winStreak,
            bestWinStreak: sInfo.bestWinStreak,
            isNewBest: !!sInfo.isNewBest,
            streakBonusCoins: sInfo.streakBonusCoins || 0,
            matchAnalytics: this.matchAnalytics,
          });
        }, 1800);
        return;
      }
      const l = `Games: ${this.score.playerGames} - ${this.score.opponentGames}`;
      (this._recordBannerBroadcast("Game!", "style-gold", l),
        this.hud.showCenterBanner("Game!", {
          style: "style-gold",
          subText: l,
          durationMs: 1650,
        }),
        this.audioEngine && this.audioEngine.announceScore("Game"));
      return;
    }
    this._syncScoreboardHUD();
    const { bannerScoreText: n } = this._formatCurrentScore(),
      h = t === "Out" || t === "Net" ? "style-fault" : "style-score";
    (this._recordBannerBroadcast(n, h, t || ""),
      this.hud.showCenterBanner(n, {
        style: h,
        subText: t || "",
        durationMs: 1450,
      }),
      this.audioEngine &&
        (t === "Out" || t === "Net" || t === "Nice Shot!"
          ? (this.audioEngine.playVoiceCallout(t, { clearQueue: !0 }),
            this.audioEngine.announceScore(n, { delayMs: 680 }))
          : this.audioEngine.announceScore(n)));
  }
  _recordBannerBroadcast(e, t = "style-score", i = "") {
    ((this.bannerSeq += 1),
      (this.lastBannerBroadcast = {
        seq: this.bannerSeq,
        text: e,
        style: t,
        subText: i,
      }));
  }
  _broadcastMultiplayerSnapshot() {
    const e = (i) => ({
        px: Number(i.pos.x.toFixed(2)),
        pz: Number(i.pos.z.toFixed(2)),
        tx: Number(i.targetPos.x.toFixed(2)),
        tz: Number(i.targetPos.z.toFixed(2)),
        st: i.swingType,
        sw: Number(i.swingTimer.toFixed(2)),
        av: Number(i.arcVisibleTimer.toFixed(2)),
      }),
      t = {
        phase: this.phase,
        phaseTimer: Number(this.phaseTimer.toFixed(2)),
        cameraMode: this.cameraMode,
        score: { ...this.score },
        lastPointAward: this.lastPointAward || null,
        ball: {
          px: Number(this.ball.pos.x.toFixed(2)),
          py: Number(this.ball.pos.y.toFixed(2)),
          pz: Number(this.ball.pos.z.toFixed(2)),
          vx: Number(this.ball.vel.x.toFixed(2)),
          vy: Number(this.ball.vel.y.toFixed(2)),
          vz: Number(this.ball.vel.z.toFixed(2)),
          inPlay: this.ball.inPlay,
          lastHitter: this.ball.lastHitter,
          lastHitterRole: this.ball.lastHitterRole || this.ball.lastHitter,
          shotType: this.ball.shotType,
          isPowerShot: this.ball.isPowerShot,
          rallyStrokeCount: this.ball.rallyStrokeCount,
        },
        actors: {
          player: e(this.player),
          playerPartner: e(this.playerPartner),
          opponent: e(this.opponent),
          opponentPartner: e(this.opponentPartner),
        },
        banner: this.lastBannerBroadcast,
      };
    if (
      this.onlineMatchmaker &&
      this.onlineMatchmaker.currentRoomId &&
      this.playerRole === "p1"
    ) {
      this.onlineMatchmaker.broadcastSnapshot(t);
    }
    if (
      this.motionController &&
      (this.motionController.phoneState?.connected ||
        this.motionController.p2PhoneState?.connected) &&
      (typeof navigator === "undefined" || navigator.onLine)
    ) {
      fetch("/api/match/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: this.roomId, snapshot: t }),
      }).catch(() => {});
    }
  }
  _handleRoomStateUpdate(e = {}) {
    if (!e) return;
    const t = !!(this.roomStatus.p2Online || this.roomStatus.p2Phone),
      i = !!(this.roomStatus.p1Online || this.roomStatus.p1Phone),
      a = !!(e.p2Online || e.p2?.connected),
      s = !!(e.p1Online || e.p1?.connected);
    if (
      (a && !t
        ? ((this.isMultiplayer = !0),
          this._applyDifficultyTuning("1v1"),
          this.playerRole !== "p2" &&
            this.audioEngine &&
            this.audioEngine.playServeToss &&
            this.audioEngine.playServeToss())
        : s &&
          !i &&
          this.playerRole === "p2" &&
          this.audioEngine &&
          this.audioEngine.playServeToss &&
          this.audioEngine.playServeToss(),
      (this.roomStatus = {
        roomId: e.roomId || this.roomId,
        hostName: e.hostName || this.roomStatus.hostName || "Player 1",
        guestName: e.guestName || this.roomStatus.guestName || "Player 2",
        p1Online: !!e.p1Online,
        p2Online: !!e.p2Online,
        p1Phone: !!e.p1?.connected,
        p2Phone: !!e.p2?.connected,
        isMultiplayer: !!(
          this.isMultiplayer ||
          (this.roomId && this.roomId !== "default")
        ),
        inRally: this.phase === "RALLY",
        tunnelUrl: e.tunnelUrl || this.roomStatus.tunnelUrl || "",
        urls: e.urls || this.roomStatus.urls || null,
      }),
      this.hud &&
        this.hud.updateMultiplayerRoomInfo &&
        this.hud.updateMultiplayerRoomInfo(this.roomStatus),
      this.playerRole === "p2" &&
        e.snapshot &&
        typeof e.snapshotSeq == "number" &&
        e.snapshotSeq > this.lastAppliedSnapshotSeq)
    ) {
      this.lastAppliedSnapshotSeq = e.snapshotSeq;
      const n = e.snapshot,
        prevPhase = this.phase,
        prevP2Pts = this.score.opponentPoints,
        prevP2Games = this.score.opponentGames;
      n.phase &&
        n.phase !== "TITLE" &&
        (this.phase === "TITLE" && this.hud.hideTitleModal(),
        (this.phase = n.phase),
        (this.cameraMode = n.cameraMode || this.cameraMode));
      if (n.score) {
        if (n.score.opponentPoints > prevP2Pts) {
          (this._rewardMatchCoins(50, "Ăn Điểm Online"),
            this.triggerCameraShake(0.38));
        }
        if (n.score.opponentGames > prevP2Games) {
          (this._rewardMatchCoins(150, "Thắng Game Online"),
            this.triggerCameraShake(0.45));
        }
        ((this.score = { ...this.score, ...n.score }),
          this._syncScoreboardHUD());
      }
      if (
        n.lastPointAward &&
        n.lastPointAward.seq &&
        n.lastPointAward.seq !== (this.lastReceivedPointSeq || 0)
      ) {
        this.lastReceivedPointSeq = n.lastPointAward.seq;
        const isP1Pt = n.lastPointAward.winner === "player",
          p2WonPt = !isP1Pt;
        (this.bodyAnimator &&
          (this.bodyAnimator.triggerPointReaction(
            this.opponent,
            p2WonPt ? "win" : "loss",
          ),
          this.bodyAnimator.triggerPointReaction(
            this.opponentPartner,
            p2WonPt ? "win" : "loss",
          ),
          this.bodyAnimator.triggerPointReaction(
            this.player,
            p2WonPt ? "loss" : "win",
          ),
          this.bodyAnimator.triggerPointReaction(
            this.playerPartner,
            p2WonPt ? "loss" : "win",
          )),
          this.facialFX &&
            (this.facialFX.setExpression(
              this.opponent,
              p2WonPt ? "happy_grin" : "shocked_loss",
              1.8,
            ),
            this.facialFX.setExpression(
              this.opponentPartner,
              p2WonPt ? "happy_grin" : "shocked_loss",
              1.8,
            ),
            this.facialFX.setExpression(
              this.player,
              p2WonPt ? "shocked_loss" : "happy_grin",
              1.8,
            ),
            this.facialFX.setExpression(
              this.playerPartner,
              p2WonPt ? "shocked_loss" : "happy_grin",
              1.8,
            ),
            this.facialFX.triggerEmoteBurst(
              p2WonPt ? this.opponent : this.player,
              "win",
            )),
          this.audioEngine &&
            this.audioEngine.playCrowdReaction(p2WonPt ? "cheer" : "ooh"),
          triggerPhysicalHardwareVibration(
            p2WonPt ? "point_won" : "point_lost",
          ));
      }
      if (n.phase === "MATCH_OVER" && prevPhase !== "MATCH_OVER") {
        const p2Won = this.score.opponentGames >= this.score.playerGames,
          customOnlinePool = Math.max(1400, Number(this.matchConfig.customCoinReward || 50000)),
          bonus = p2Won ? customOnlinePool : Math.max(500, Math.round(customOnlinePool * 0.2));
        (this._rewardMatchCoins(
          bonus,
          p2Won ? "Thắng Trận Online 1v1!" : "Thưởng Hoàn Thành Online",
        ),
          this.triggerCameraShake(0.68),
          triggerPhysicalHardwareVibration(p2Won ? "match_won" : "point_lost"),
          this.bodyAnimator &&
            (this.bodyAnimator.triggerPointReaction(
              this.opponent,
              p2Won ? "win" : "loss",
            ),
            this.bodyAnimator.triggerPointReaction(
              this.opponentPartner,
              p2Won ? "win" : "loss",
            ),
            this.bodyAnimator.triggerPointReaction(
              this.player,
              p2Won ? "loss" : "win",
            ),
            this.bodyAnimator.triggerPointReaction(
              this.playerPartner,
              p2Won ? "loss" : "win",
            )),
          this.facialFX &&
            (this.facialFX.setExpression(
              this.opponent,
              p2Won ? "happy_grin" : "shocked_loss",
              3.5,
            ),
            this.facialFX.setExpression(
              this.opponentPartner,
              p2Won ? "happy_grin" : "shocked_loss",
              3.5,
            ),
            this.facialFX.setExpression(
              this.player,
              p2Won ? "shocked_loss" : "happy_grin",
              3.5,
            ),
            this.facialFX.setExpression(
              this.playerPartner,
              p2Won ? "shocked_loss" : "happy_grin",
              3.5,
            ),
            this.facialFX.triggerEmoteBurst(
              p2Won ? this.opponent : this.player,
              "win",
            )),
          this.audioEngine && this.audioEngine.playMusicForState("victory"),
          setTimeout(() => {
            const sInfo = p2Won
              ? characterShopManager.recordMatchWin()
              : characterShopManager.recordMatchLoss();
            this.hud.showVictoryModal({
              playerWon: p2Won,
              playerGames: this.score.opponentGames,
              opponentGames: this.score.playerGames,
              coinsEarned: this.matchCoinsEarned || bonus,
              isOnline: !0,
              winnerRole: p2Won ? "p2" : "p1",
              winnerName: p2Won
                ? this.roomStatus?.guestName || "Player 2"
                : this.roomStatus?.hostName || "Player 1",
              winStreak: sInfo.winStreak,
              bestWinStreak: sInfo.bestWinStreak,
              isNewBest: !!sInfo.isNewBest,
              streakBonusCoins: sInfo.streakBonusCoins || 0,
            });
          }, 1650));
      }
      if (n.ball) {
        (this.ball.pos.set(n.ball.px, n.ball.py, n.ball.pz),
          this.ball.vel.set(n.ball.vx, n.ball.vy, n.ball.vz),
          (this.ball.inPlay = !!n.ball.inPlay),
          (this.ball.lastHitter = n.ball.lastHitter || this.ball.lastHitter),
          (this.ball.lastHitterRole =
            n.ball.lastHitterRole || this.ball.lastHitter),
          (this.ball.shotType = n.ball.shotType || "TOPSPIN"),
          (this.ball.isPowerShot = !!n.ball.isPowerShot),
          (this.ball.rallyStrokeCount = Number(n.ball.rallyStrokeCount || 0)));
        const hr = this.ball.lastHitterRole,
          ha =
            hr === "player_partner"
              ? this.playerPartner
              : hr === "opponent_partner"
                ? this.opponentPartner
                : hr === "opponent"
                  ? this.opponent
                  : this.player;
        this.ballTrail.setStyle(this.ball.shotType, this.ball.isPowerShot, ha);
      }
      const h = (r, l) => {
        l &&
          ((r.pos.x = o.MathUtils.lerp(r.pos.x, l.px, 0.65)),
          (r.pos.z = o.MathUtils.lerp(r.pos.z, l.pz, 0.65)),
          r.targetPos.set(l.tx, 0, l.tz),
          l.sw > 0 &&
            r.swingTimer <= 0.05 &&
            ((r.swingType = l.st || "forehand"),
            (r.swingTimer = l.sw),
            (r.arcVisibleTimer = l.av || 0.32),
            this.racketKinematics &&
              this.racketKinematics.triggerSwing(r, {
                shotType: (n.ball?.shotType || "topspin").toLowerCase(),
                side:
                  l.st === "backhand"
                    ? "backhand"
                    : l.st === "smash"
                      ? "overhead"
                      : "forehand",
                speed: 1.2,
                timing: "sweet",
              })));
      };
      if (
        (n.actors &&
          (h(this.player, n.actors.player),
          h(this.playerPartner, n.actors.playerPartner),
          h(this.opponent, n.actors.opponent),
          h(this.opponentPartner, n.actors.opponentPartner)),
        n.banner &&
          n.banner.seq &&
          n.banner.seq !== this.bannerSeq &&
          ((this.bannerSeq = n.banner.seq),
          this.hud.showCenterBanner(n.banner.text, {
            style: n.banner.style || "style-score",
            subText: n.banner.subText || "",
            durationMs: 1550,
          }),
          this.audioEngine))
      ) {
        const r = n.banner.subText || "";
        r === "Out" || r === "Net" || r === "Nice Shot!"
          ? (this.audioEngine.playVoiceCallout(r, { clearQueue: !0 }),
            this.audioEngine.announceScore(n.banner.text, { delayMs: 680 }))
          : this.audioEngine.announceScore(n.banner.text);
      }
    }
  }
  _formatCurrentScore() {
    const e = this.score.playerPoints,
      t = this.score.opponentPoints,
      ptsTarget = Number(this.matchConfig.pointsToWinGame || 4);
    if (ptsTarget !== 4) {
      return {
        playerScoreText: String(e),
        opponentScoreText: String(t),
        deuceLabel: `Chạm ${ptsTarget}`,
        bannerScoreText: `${e} - ${t}`,
      };
    }
    if (e >= 3 && t >= 3) {
      if (e === t)
        return {
          playerScoreText: "40",
          opponentScoreText: "40",
          deuceLabel: "Deuce",
          bannerScoreText: "Deuce",
        };
      const s = e > t,
        n = s ? "Ad In" : "Ad Out";
      return {
        playerScoreText: s ? "Ad" : "40",
        opponentScoreText: s ? "40" : "Ad",
        deuceLabel: n,
        bannerScoreText: n,
      };
    }
    const i = W[Math.min(3, e)],
      a = W[Math.min(3, t)];
    return {
      playerScoreText: i,
      opponentScoreText: a,
      deuceLabel: null,
      bannerScoreText: `${i} - ${a}`,
    };
  }
  _getHighStakesPointLabel() {
    const e = this.score.playerPoints,
      t = this.score.opponentPoints,
      ptsTarget = Number(this.matchConfig.pointsToWinGame || 4),
      threshold = Math.max(1, ptsTarget - 1),
      i = e >= threshold && e - t >= 1,
      a = t >= threshold && t - e >= 1;
    return i
      ? this.score.playerGames + 1 >= this.matchConfig.gamesToWin
        ? "Match Point"
        : "Game Point"
      : a
        ? this.score.opponentGames + 1 >= this.matchConfig.gamesToWin
          ? "Match Point"
          : this.score.server === "player"
            ? "Break Point"
            : "Game Point"
        : null;
  }
  _syncScoreboardHUD() {
    const e = this._formatCurrentScore();
    this.hud.updateScoreboard({
      playerScoreText: e.playerScoreText,
      opponentScoreText: e.opponentScoreText,
      deuceLabel: e.deuceLabel,
      playerGames: this.score.playerGames,
      opponentGames: this.score.opponentGames,
      gamesToWin: this.matchConfig.gamesToWin,
    });
  }
  _updateMiiAnimation(e, t) {
    if (!e.model) return;
    (e.swingTimer > 0 && (e.swingTimer = Math.max(0, e.swingTimer - t)),
      e.arcVisibleTimer > 0 &&
        (e.arcVisibleTimer = Math.max(0, e.arcVisibleTimer - t)),
      e.swingArcMesh && (e.swingArcMesh.visible = !1));
    let i = null;
    if (
      this.motionController &&
      this.motionController.phoneState?.connected &&
      ((this.playerRole !== "p2" && e === this.player) ||
        (this.playerRole === "p2" && e === this.opponent))
    ) {
      const s = this.motionController.phoneState.orientation || {};
      i = {
        tiltPitch: ((Number(s.pitch) || 0) * Math.PI) / 180,
        tiltRoll: ((Number(s.roll) || 0) * Math.PI) / 180,
        tiltYaw: ((Number(s.yaw) || 0) * Math.PI) / 180,
        accelMag: Number(this.motionController.phoneState.accelMag) || 0,
      };
    }
    if (this.racketKinematics) {
      let a = t;
      if (
        this.phase === "SHOWCASE" &&
        e === this.player &&
        e.racketKinematics
      ) {
        const s = this.showcaseModeName || "showcase_topspin";
        ((a = 1e-4),
          s === "showcase_slice" || s === "showcase_backhand"
            ? ((e.racketKinematics.swingActive = !0),
              (e.racketKinematics.swingElapsed = 0.072))
            : s === "showcase_smash"
              ? ((e.racketKinematics.swingActive = !0),
                (e.racketKinematics.swingElapsed = 0.058))
              : s === "showcase_topspin" &&
                ((e.racketKinematics.swingActive = !0),
                (e.racketKinematics.swingElapsed = 0.068)));
      }
      this.racketKinematics.update(e, a, {
        phase: this.phase,
        score: this.score,
        ball: this.ball,
        elapsedTime: this.elapsedTime,
        liveInput: i,
      });
    }
    (this.bodyAnimator
      ? this.bodyAnimator.updateMiiBodyAnimation(e, t, this)
      : e.root.position.set(e.pos.x, e.pos.y, e.pos.z),
      j(e, e.rig?.verticalHopOffset || 0));
    const u =
      e.customAuraRing ||
      (e.customAuraRing =
        e.root?.getObjectByName("CustomCharacterAuraRing") || null);
    (u && (u.rotation.y += t * 1.25),
      this.facialFX &&
        this.facialFX.update(e, t, {
          phase: this.phase,
          ball: this.ball,
          score: this.score,
          rallyCount: this.ball.rallyStrokeCount,
          camera: this.camera,
          lastPointWinner: this.lastPointAward?.winner,
          lastPointAward: this.lastPointAward,
          lastBannerBroadcast: this.lastBannerBroadcast,
        }));
  }
  _updateCrowdAnimation(e) {
    if (
      ((this.cheerEnergy = Math.max(0.22, this.cheerEnergy - e * 0.35)),
      this.crowdScene)
    ) {
      const t = 5.5 + this.cheerEnergy * 4.5,
        i = 0.025 + this.cheerEnergy * 0.055;
      this.crowdScene.position.y = Math.abs(Math.sin(this.elapsedTime * t)) * i;
    }
  }
  _spawnBounceRing(e, t) {
    const i = this.bounceRings.find((a) => !a.active) || this.bounceRings[0];
    ((i.active = !0),
      (i.age = 0),
      i.mesh.position.set(e, 0.024, t),
      i.mesh.scale.setScalar(0.6),
      (i.mesh.material.opacity = 0.9),
      (i.mesh.visible = !0));
  }
  _spawnStarBurst(e, t = 8) {
    let i = 0;
    for (let a = 0; a < this.starParticles.length && i < t; a++) {
      const s = this.starParticles[a];
      s.active ||
        ((s.active = !0),
        (s.age = 0),
        (s.maxAge = 0.32 + Math.random() * 0.22),
        s.mesh.position.copy(e),
        s.vel.set(
          (Math.random() - 0.5) * 4.2,
          (Math.random() - 0.2) * 3.8,
          (Math.random() - 0.5) * 4.2,
        ),
        s.mesh.scale.setScalar(0.9 + Math.random() * 0.6),
        (s.mesh.material.opacity = 1),
        (s.mesh.visible = !0),
        i++);
    }
  }
  _updateEffects(e) {
    if (
      (this.ball.mesh && this.ball.mesh.position.copy(this.ball.pos),
      this.ballShadowBlob)
    ) {
      ((this.ballShadowBlob.position.x = this.ball.pos.x),
        (this.ballShadowBlob.position.z = this.ball.pos.z));
      const t = o.MathUtils.clamp(1.15 - this.ball.pos.y * 0.16, 0.45, 1.15);
      (this.ballShadowBlob.scale.setScalar(t),
        (this.ballShadowBlob.material.opacity = o.MathUtils.clamp(
          0.88 - this.ball.pos.y * 0.14,
          0.28,
          0.88,
        )));
    }
    for (const t of this.bounceRings) {
      if (!t.active) continue;
      t.age += e;
      const i = t.age / 0.48;
      i >= 1
        ? ((t.active = !1), (t.mesh.visible = !1))
        : (t.mesh.scale.setScalar(0.6 + i * 2.4),
          (t.mesh.material.opacity = (1 - i) * 0.85));
    }
    for (const t of this.starParticles) {
      if (!t.active) continue;
      t.age += e;
      const i = t.age / t.maxAge;
      i >= 1
        ? ((t.active = !1), (t.mesh.visible = !1))
        : (t.mesh.position.addScaledVector(t.vel, e),
          (t.mesh.rotation.y += e * 9),
          (t.mesh.rotation.z += e * 7),
          t.mesh.scale.setScalar((1 - i * 0.65) * 1.15),
          (t.mesh.material.opacity = 1 - i));
    }
    (this.cloudRing1 && (this.cloudRing1.rotation.y += e * 0.0065),
      this.cloudRing2 && (this.cloudRing2.rotation.y += e * 0.0035),
      this.ballTrail.updateGeometry(this.camera));
  }
  _computeTargetCameraPose() {
    const e = this.manualCameraOverride || this.cameraMode,
      t = this._tmpCamPos,
      i = this._tmpCamLook;
    if (this.phase === "MATCH_OVER") {
      const winActor =
          this.score.playerGames >= this.score.opponentGames
            ? this.player
            : this.opponent,
        ang = this.elapsedTime * 0.85;
      (t.set(
        winActor.pos.x + Math.sin(ang) * 3.2,
        2.15,
        winActor.pos.z + (winActor.sideSign > 0 ? -3.8 : 3.8),
      ),
        i.set(winActor.pos.x, 1.05, winActor.pos.z));
      return { targetPos: t, targetLook: i };
    }
    if (e === "INTRO_PAN") {
      const a = this.elapsedTime * 0.42;
      (t.set(Math.sin(a) * 9.5, 8.2, 16.5 + Math.cos(a) * 3.5),
        i.set(0, 0.8, -1.5));
    } else if (e === "SHOWCASE_CAM")
      (t.set(1.15, 1.54, 7.55), i.set(1.15, 1.12, 11.2));
    else if (e === "SERVE_CAM")
      if (this.playerRole === "p2") {
        const a = this.opponent.pos.x;
        (t.set(a * 0.16, 7.8, -22.8), i.set(a * 0.08, 0.35, -1.8));
      } else {
        const a = this.player.pos.x;
        (t.set(a * 0.16, 7.8, 22.8), i.set(a * 0.08, 0.35, 1.8));
      }
    else
      e === "REPLAY_CAM"
        ? (t.set(2.35, 1.48, 4.15), i.set(-1.45, 0.95, -1.35))
        : this.playerRole === "p2"
          ? (t.set(this.opponent.pos.x * 0.16, 7.8, -22.8),
            i.set(this.ball.pos.x * 0.12, 0.35, -1.8))
          : (t.set(this.player.pos.x * 0.16, 7.8, 22.8),
            i.set(this.ball.pos.x * 0.12, 0.35, 1.8));
    return { targetPos: t, targetLook: i };
  }
  _snapCameraImmediate() {
    const { targetPos: e, targetLook: t } = this._computeTargetCameraPose();
    (this.cameraPosSmooth.copy(e),
      this.cameraLookSmooth.copy(t),
      this.camera.position.copy(e),
      this.camera.lookAt(t),
      this.camera.updateMatrixWorld(),
      this.ballTrail.updateGeometry(this.camera),
      this._updateProjectedHUD());
  }
  _updateCameraRig(e) {
    const { targetPos: t, targetLook: i } = this._computeTargetCameraPose(),
      a = 1 - Math.exp(-6.5 * e);
    (this.cameraPosSmooth.lerp(t, a),
      this.cameraLookSmooth.lerp(i, a),
      this.camera.position.copy(this.cameraPosSmooth));
    let rollZ = 0;
    if (this.cameraTrauma > 0.001) {
      const s = this.cameraTrauma * this.cameraTrauma * 0.38,
        tm = this.elapsedTime * 58;
      ((this.camera.position.x +=
        Math.sin(tm) * s + (Math.random() - 0.5) * s * 0.5),
        (this.camera.position.y +=
          Math.cos(tm * 1.23) * s * 0.85 + (Math.random() - 0.5) * s * 0.4),
        (this.camera.position.z += Math.sin(tm * 0.85) * s * 0.35),
        (rollZ = Math.sin(tm * 1.1) * this.cameraTrauma * 0.028));
    }
    (this.camera.lookAt(this.cameraLookSmooth),
      rollZ !== 0 && (this.camera.rotation.z += rollZ));
  }
  _projectToScreen(e) {
    const t = this._tmpProjVec.copy(e).project(this.camera),
      i = t.z >= -1 && t.z <= 1,
      a = (t.x * 0.5 + 0.5) * window.innerWidth,
      s = (-t.y * 0.5 + 0.5) * window.innerHeight;
    return { x: a, y: s, visible: i };
  }
  _updateProjectedHUD() {
    if (
      (this.phase === "SERVE_STANCE" || this.phase === "SERVE_TOSS") &&
      this.cameraMode !== "REPLAY_CAM"
    ) {
      const srv = this.score.server === "player" ? this.player : this.opponent,
        i = this._tmpServerVec.set(srv.pos.x, srv.pos.y + 2.25, srv.pos.z),
        a = this._projectToScreen(i);
      this.hud.updateServerTag(a, !0);
    } else this.hud.updateServerTag(null, !1);
  }
  _onResize() {
    ((this.camera.aspect = window.innerWidth / window.innerHeight),
      this.camera.updateProjectionMatrix(),
      this.renderer.setSize(window.innerWidth, window.innerHeight),
      (this._staticModalFrameRendered = !1));
  }
  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
window.addEventListener("DOMContentLoaded", () => {
  pwaOfflineManager.init();
  const P = new ArgonTennisEngine();
  ((window.__argonTennis = P), P.loadAssetsAndStart());
});
