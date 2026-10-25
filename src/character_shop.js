import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  upgradeMiiCharacterMaterials,
  upgradeRacketMaterials,
  updateCharacterContactShadow
} from "./mii_model_overhaul.js";
import { MiiBodyAnimator } from "./mii_body_animation.js";
import { RacketKinematicsController } from "./racket_kinematics.js";
import { MiiFacialFXController } from "./mii_facial_fx.js";
import {
  MII_PROFILES,
  getMiiAvatarSVG,
  renderAllHudMiiAvatars,
  renderMiiAvatar,
  registerRosterMiiProfiles
} from "./mii_avatars.js";
import { SVG_ICONS } from "./svg_icons.js";
import { db, auth, setFirebaseNetworkEnabled } from "./firebase.ts";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

const SHOP_STORAGE_KEY = "argon_tennis_character_shop_v2";
const SHOP_STORAGE_KEY_V3 = "argon_tennis_character_shop_v3";
const SHOP_STORAGE_KEY_V1 = "argon_tennis_character_shop_v1";
const CLOUD_MASTER_VAULT_DOC_ID = "argon_cloud_vault_v1";
const IDB_DB_NAME = "ArgonTennisVaultDB";
const IDB_STORE_NAME = "shop_vault";
const IDB_RECORD_KEY = "primary_shop_state_v3";

const LEGACY_CHAR_ID_MAP = {
  ryu: "blaze",
  dragon_ryu: "blaze",
  frost: "freya",
  volt: "raiden",
  rx01: "mecha_volt",
  aegis: "aegis_bot",
  titan: "titan_x9",
  valkyrie: "cyber_valkyrie",
  omega: "omega_droid",
  chronos: "chronos_mk4",
  nexus: "nexus_prime",
  solaris: "solaris_rex",
  nyx: "nyx_shadow",
  odin: "odin_gold",
  malakor: "void_emperor",
  archon: "archon_zero"
};

export const CHARACTER_ROSTER = [
  // ============================================================================
  // GROUP 1: PRO & CLUB TOUR ATHLETES (8 CHARACTERS · OVR ~88 -> 134)
  // ============================================================================
  {
    id: "ammaar",
    name: "Ammaar",
    title: "Tay Vợt Toàn Diện",
    roleTag: "ALL-ROUNDER",
    rarity: "PRO",
    accentCss: "#ef4444",
    price: 0,
    unlockedByDefault: true,
    baseStats: { speed: 4, power: 4, spin: 4, reflex: 4 },
    passiveName: "Nhịp Độ Chuẩn Xác",
    passiveDesc: "Cơ chế: Cân bằng công thủ • Mở rộng +8% khung căn giờ PERFECT • +10% Xu thưởng",
    mechanic: { id: "sweet_rhythm", sweetSpotBonus: 0.08, serveSpeedBonus: 0.03, coinBonusPct: 0.1 },
    appearance: {
      shirtHex: 0xf64a35,
      shirtDarkHex: 0xc22515,
      shortsHex: 0xf8fafc,
      shoeHex: 0xe83b28,
      hairHex: 0x4a2812,
      headbandHex: 0xffffff,
      stripeHex: 0xf64a35,
      skinHex: 0xffdfc4,
      hairStyle: "swept_puffs",
      browTilt: "confident",
      mouthStyle: "happy_grin",
      glasses: false,
      lashes: false,
      defaultAccessories: []
    }
  },
  {
    id: "maya",
    name: "Maya",
    title: "Tia Chớp Bắt Lưới",
    roleTag: "SPEEDSTER",
    rarity: "PRO",
    accentCss: "#10b981",
    price: 0,
    unlockedByDefault: true,
    baseStats: { speed: 6, power: 3, spin: 4, reflex: 5 },
    passiveName: "Bước Chạy Tốc Biến",
    passiveDesc: "Cơ chế: Bứt tốc ngang +10% & tăng +8% tỷ lệ Bot bắt lưới tự động • +12% Xu thưởng",
    mechanic: { id: "net_sprinter", speedBurstMult: 0.1, botInterceptBonus: 0.08, coinBonusPct: 0.12 },
    appearance: {
      shirtHex: 0x10b981,
      shirtDarkHex: 0x047857,
      shortsHex: 0x0f172a,
      shoeHex: 0x10b981,
      hairHex: 0x2a1810,
      headbandHex: 0xfef08a,
      stripeHex: 0x10b981,
      skinHex: 0xf5cba7,
      hairStyle: "round_cap",
      browTilt: "calm",
      mouthStyle: "gentle_smile",
      glasses: false,
      lashes: true,
      defaultAccessories: []
    }
  },
  {
    id: "carlos",
    name: "Carlos Vega",
    title: "Vua Sân Đất Nện",
    roleTag: "TOPSPIN PRO",
    rarity: "PRO",
    accentCss: "#f59e0b",
    price: 350,
    unlockedByDefault: false,
    baseStats: { speed: 5, power: 5, spin: 6, reflex: 5 },
    passiveName: "Vòng Xoáy Nảy Cao",
    passiveDesc: "Cơ chế: Bóng Topspin nảy cao và xoáy cắm góc +14% lực Magnus • +18% Xu thưởng",
    mechanic: { id: "heavy_topspin", spinCurveMult: 0.14, reachBonus: 0.08, coinBonusPct: 0.18 },
    appearance: {
      shirtHex: 0xd97706,
      shirtDarkHex: 0x92400e,
      shortsHex: 0x1e293b,
      shoeHex: 0xfacc15,
      hairHex: 0x1f2937,
      headbandHex: 0xfacc15,
      stripeHex: 0xfef08a,
      skinHex: 0xe6b89c,
      hairStyle: "spiky_pro",
      browTilt: "determined",
      mouthStyle: "happy_grin",
      glasses: false,
      lashes: false,
      defaultAccessories: ["power_wristbands"]
    }
  },
  {
    id: "elena",
    name: "Elena Rostova",
    title: "Đại Pháo Cuối Sân",
    roleTag: "BASELINER",
    rarity: "PRO",
    accentCss: "#ec4899",
    price: 520,
    unlockedByDefault: false,
    baseStats: { speed: 5, power: 7, spin: 5, reflex: 6 },
    passiveName: "Đường Bóng Sấm Sét",
    passiveDesc: "Cơ chế: Cú đánh Flat & Giao bóng tăng +12% tốc độ bay thẳng sát lưới • +22% Xu thưởng",
    mechanic: { id: "flat_cannon", serveSpeedBonus: 0.12, smashSpeedBonus: 0.1, coinBonusPct: 0.22 },
    appearance: {
      shirtHex: 0xdb2777,
      shirtDarkHex: 0x9d174d,
      shortsHex: 0xf8fafc,
      shoeHex: 0xf472b6,
      hairHex: 0xfde047,
      headbandHex: 0xffffff,
      stripeHex: 0xfbcfe8,
      skinHex: 0xffe8d6,
      hairStyle: "parted_waves",
      browTilt: "confident",
      mouthStyle: "gentle_smile",
      glasses: false,
      lashes: true,
      defaultAccessories: []
    }
  },
  {
    id: "kaito",
    name: "Kaito",
    title: "Kiếm Khách Sấm Sét",
    roleTag: "SPIN MASTER",
    rarity: "PRO",
    accentCss: "#3b82f6",
    price: 700,
    unlockedByDefault: false,
    baseStats: { speed: 6, power: 5, spin: 8, reflex: 6 },
    passiveName: "Xoáy Điện Quang",
    passiveDesc: "Cơ chế: Quỹ đạo Slice & Topspin cong gắt +18% • Kính Cyber 3D • +26% Xu thưởng",
    mechanic: { id: "electro_curve", spinCurveMult: 0.18, sweetSpotBonus: 0.06, coinBonusPct: 0.26 },
    appearance: {
      shirtHex: 0x2563eb,
      shirtDarkHex: 0x1d4ed8,
      shortsHex: 0x0f172a,
      shoeHex: 0x38bdf8,
      hairHex: 0x111827,
      headbandHex: 0x38bdf8,
      stripeHex: 0x38bdf8,
      skinHex: 0xffe4c8,
      hairStyle: "spiky_pro",
      browTilt: "focused",
      mouthStyle: "confident_smirk",
      glasses: true,
      lashes: false,
      defaultAccessories: ["visor_cyber"]
    }
  },
  {
    id: "lucas",
    name: "Lucas Moretti",
    title: "Bậc Thầy Phản Công",
    roleTag: "DEFENDER",
    rarity: "PRO",
    accentCss: "#0ea5e9",
    price: 880,
    unlockedByDefault: false,
    baseStats: { speed: 7, power: 5, spin: 6, reflex: 9 },
    passiveName: "Lá Chắn Phản Đòn",
    passiveDesc: "Cơ chế: Mở rộng +0.35m tầm cứu bóng xa & tự động trả bóng sâu • +30% Xu thưởng",
    mechanic: { id: "counter_wall", reachBonus: 0.35, botInterceptBonus: 0.1, coinBonusPct: 0.3 },
    appearance: {
      shirtHex: 0x0284c7,
      shirtDarkHex: 0x075985,
      shortsHex: 0xf8fafc,
      shoeHex: 0x38bdf8,
      hairHex: 0x451a03,
      headbandHex: 0x38bdf8,
      stripeHex: 0xffffff,
      skinHex: 0xf5cba7,
      hairStyle: "swept_puffs",
      browTilt: "focused",
      mouthStyle: "happy_grin",
      glasses: false,
      lashes: false,
      defaultAccessories: ["power_wristbands"]
    }
  },
  {
    id: "hana",
    name: "Hana Minami",
    title: "Cơn Lốc Bỏ Nhỏ",
    roleTag: "TACTICIAN",
    rarity: "PRO",
    accentCss: "#14b8a6",
    price: 1080,
    unlockedByDefault: false,
    baseStats: { speed: 8, power: 6, spin: 9, reflex: 8 },
    passiveName: "Cắt Bóng Lông Vũ",
    passiveDesc: "Cơ chế: Cú cắt Slice xoáy sát lưới khiến bóng nảy thấp khó đỡ (+16% Xoáy) • +35% Xu thưởng",
    mechanic: { id: "feather_drop", spinCurveMult: 0.16, speedBurstMult: 0.08, coinBonusPct: 0.35 },
    appearance: {
      shirtHex: 0x0d9488,
      shirtDarkHex: 0x115e59,
      shortsHex: 0x0f172a,
      shoeHex: 0x2dd4bf,
      hairHex: 0x1e1b4b,
      headbandHex: 0x5eead4,
      stripeHex: 0x99f6e4,
      skinHex: 0xffedd5,
      hairStyle: "round_cap",
      browTilt: "calm",
      mouthStyle: "happy_grin",
      glasses: false,
      lashes: true,
      defaultAccessories: []
    }
  },
  {
    id: "serena",
    name: "Serena",
    title: "Nữ Hoàng Grand Slam",
    roleTag: "POWER STRIKER",
    rarity: "PRO",
    accentCss: "#a855f7",
    price: 1320,
    unlockedByDefault: false,
    baseStats: { speed: 7, power: 10, spin: 8, reflex: 9 },
    passiveName: "Cú Đập Hoàng Gia",
    passiveDesc: "Cơ chế: Tăng +14% tốc độ giao bóng & Smash • Vương Miện 3D • +42% Xu thưởng",
    mechanic: { id: "royal_smash", serveSpeedBonus: 0.14, smashSpeedBonus: 0.14, coinBonusPct: 0.42 },
    appearance: {
      shirtHex: 0x9333ea,
      shirtDarkHex: 0x6b21a8,
      shortsHex: 0xfef08a,
      shoeHex: 0xa855f7,
      hairHex: 0x3b1d11,
      headbandHex: 0xfacc15,
      stripeHex: 0xfacc15,
      skinHex: 0xd99b72,
      hairStyle: "parted_waves",
      browTilt: "confident",
      mouthStyle: "happy_grin",
      glasses: false,
      lashes: true,
      defaultAccessories: ["crown_gold"]
    }
  },

  // ============================================================================
  // GROUP 2: ELEMENTAL & MARTIAL MASTERS (8 CHARACTERS · OVR ~142 -> 196)
  // ============================================================================
  {
    id: "kenji",
    name: "Kenji Musashi",
    title: "Kiếm Thánh Samurai",
    roleTag: "BLADE MASTER",
    rarity: "MASTER",
    accentCss: "#dc2626",
    price: 1680,
    unlockedByDefault: false,
    baseStats: { speed: 9, power: 10, spin: 9, reflex: 10 },
    passiveName: "Nhất Kiếm Trảm Phong",
    passiveDesc: "Cơ chế: Khung căn giờ PERFECT rộng +14% & cú chém Backhand +14% lực • +50% Xu thưởng",
    mechanic: { id: "samurai_slash", sweetSpotBonus: 0.14, smashSpeedBonus: 0.14, coinBonusPct: 0.5 },
    appearance: {
      shirtHex: 0x991b1b,
      shirtDarkHex: 0x450a0a,
      shortsHex: 0x090d16,
      shoeHex: 0xef4444,
      hairHex: 0x0f172a,
      headbandHex: 0xdc2626,
      stripeHex: 0xfacc15,
      skinHex: 0xf5cba7,
      hairStyle: "spiky_pro",
      browTilt: "determined",
      mouthStyle: "confident_smirk",
      glasses: false,
      lashes: false,
      defaultAccessories: ["samurai_crest", "power_wristbands"]
    }
  },
  {
    id: "freya",
    name: "Freya Frost",
    title: "Nữ Thần Băng Giá",
    roleTag: "CRYO CONTROLLER",
    rarity: "MASTER",
    accentCss: "#38bdf8",
    price: 1980,
    unlockedByDefault: false,
    baseStats: { speed: 10, power: 9, spin: 12, reflex: 10 },
    passiveName: "Hàn Băng Kết Giới",
    passiveDesc: "Cơ chế: Quỹ đạo bóng xoáy lạnh cực gắt (+20% Spin) & +0.25m tầm đỡ • +58% Xu thưởng",
    mechanic: { id: "cryo_spin", spinCurveMult: 0.2, reachBonus: 0.25, coinBonusPct: 0.58 },
    appearance: {
      shirtHex: 0x0284c7,
      shirtDarkHex: 0x0c4a6e,
      shortsHex: 0xe0f2fe,
      shoeHex: 0x38bdf8,
      hairHex: 0xe0f2fe,
      headbandHex: 0x7dd3fc,
      stripeHex: 0xffffff,
      skinHex: 0xfff1f2,
      hairStyle: "parted_waves",
      browTilt: "calm",
      mouthStyle: "gentle_smile",
      glasses: false,
      lashes: true,
      defaultAccessories: ["cyber_halo"]
    }
  },
  {
    id: "blaze",
    name: "Blaze Ryu",
    title: "Chiến Binh Hỏa Long",
    roleTag: "HEAVY HITTER",
    rarity: "MASTER",
    accentCss: "#f97316",
    price: 2350,
    unlockedByDefault: false,
    baseStats: { speed: 10, power: 13, spin: 10, reflex: 11 },
    passiveName: "Hỏa Long Bạo Kích",
    passiveDesc: "Cơ chế: Cú Smash tạo chấn động đẩy lùi đối thủ • Giáp Vai 3D • +65% Xu thưởng",
    mechanic: { id: "dragon_impact", smashSpeedBonus: 0.18, knockbackImpulse: 0.45, coinBonusPct: 0.65 },
    appearance: {
      shirtHex: 0xea580c,
      shirtDarkHex: 0x9a3412,
      shortsHex: 0x18181b,
      shoeHex: 0xf97316,
      hairHex: 0xdc2626,
      headbandHex: 0xfacc15,
      stripeHex: 0xfacc15,
      skinHex: 0xf5cba7,
      hairStyle: "spiky_pro",
      browTilt: "determined",
      mouthStyle: "confident_smirk",
      glasses: false,
      lashes: false,
      defaultAccessories: ["shoulder_pads", "power_wristbands"]
    }
  },
  {
    id: "raiden",
    name: "Raiden Volt",
    title: "Lôi Thần Tốc Độ",
    roleTag: "THUNDER DASHER",
    rarity: "MASTER",
    accentCss: "#eab308",
    price: 2750,
    unlockedByDefault: false,
    baseStats: { speed: 14, power: 11, spin: 11, reflex: 11 },
    passiveName: "Tia Chớp Hoàng Kim",
    passiveDesc: "Cơ chế: Tăng +16% tốc độ chạy nước rút & giao bóng điện từ 238 KM/H • +74% Xu thưởng",
    mechanic: { id: "thunder_dash", speedBurstMult: 0.16, serveSpeedBonus: 0.15, coinBonusPct: 0.74 },
    appearance: {
      shirtHex: 0xca8a04,
      shirtDarkHex: 0x713f12,
      shortsHex: 0x090d16,
      shoeHex: 0xfacc15,
      hairHex: 0xfef08a,
      headbandHex: 0x38bdf8,
      stripeHex: 0xfef08a,
      skinHex: 0xffe4c8,
      hairStyle: "spiky_pro",
      browTilt: "determined",
      mouthStyle: "confident_smirk",
      glasses: true,
      lashes: false,
      defaultAccessories: ["visor_cyber", "thunder_gauntlets"]
    }
  },
  {
    id: "zephyr",
    name: "Zephyr Gale",
    title: "Phong Thần Đạp Gió",
    roleTag: "WIND RIDER",
    rarity: "MASTER",
    accentCss: "#34d399",
    price: 3150,
    unlockedByDefault: false,
    baseStats: { speed: 14, power: 11, spin: 12, reflex: 13 },
    passiveName: "Cơn Lốc Chân Không",
    passiveDesc: "Cơ chế: Tăng +0.42m bán kính đón bóng & Bot đồng đội bao sân siêu tốc • +82% Xu thưởng",
    mechanic: {
      id: "wind_vacuum",
      reachBonus: 0.42,
      speedBurstMult: 0.15,
      botInterceptBonus: 0.14,
      coinBonusPct: 0.82
    },
    appearance: {
      shirtHex: 0x059669,
      shirtDarkHex: 0x064e3b,
      shortsHex: 0x0f172a,
      shoeHex: 0x34d399,
      hairHex: 0x6ee7b7,
      headbandHex: 0xffffff,
      stripeHex: 0xa7f3d0,
      skinHex: 0xffe8d6,
      hairStyle: "swept_puffs",
      browTilt: "focused",
      mouthStyle: "happy_grin",
      glasses: false,
      lashes: false,
      defaultAccessories: ["cyber_wings", "aura_emerald"]
    }
  },
  {
    id: "ignis",
    name: "Ignis Vulcan",
    title: "Dung Nham Hủy Diệt",
    roleTag: "TITAN SMASHER",
    rarity: "MASTER",
    accentCss: "#ef4444",
    price: 3600,
    unlockedByDefault: false,
    baseStats: { speed: 11, power: 17, spin: 12, reflex: 13 },
    passiveName: "Núi Lửa Phun Trào",
    passiveDesc: "Cơ chế: Uy lực Smash & Forehand +22% kèm lực chấn động đẩy lùi • +92% Xu thưởng",
    mechanic: {
      id: "magma_crush",
      smashSpeedBonus: 0.22,
      serveSpeedBonus: 0.16,
      knockbackImpulse: 0.6,
      coinBonusPct: 0.92
    },
    appearance: {
      shirtHex: 0xb91c1c,
      shirtDarkHex: 0x450a0a,
      shortsHex: 0x18181b,
      shoeHex: 0xf97316,
      hairHex: 0xf97316,
      headbandHex: 0xfacc15,
      stripeHex: 0xf97316,
      skinHex: 0xd99b72,
      hairStyle: "spiky_pro",
      browTilt: "determined",
      mouthStyle: "confident_smirk",
      glasses: false,
      lashes: false,
      defaultAccessories: ["dragon_horns", "shoulder_pads"]
    }
  },
  {
    id: "sakura",
    name: "Sakura Haruno",
    title: "Ảo Ảnh Anh Đào",
    roleTag: "MIRAGE ARTIST",
    rarity: "MASTER",
    accentCss: "#f43f5e",
    price: 4050,
    unlockedByDefault: false,
    baseStats: { speed: 14, power: 12, spin: 16, reflex: 14 },
    passiveName: "Vũ Điệu Hoa Anh Đào",
    passiveDesc: "Cơ chế: Bóng xoáy đổi hướng đột ngột +24% & nhận thêm +102% Xu thưởng mỗi trận!",
    mechanic: { id: "blossom_mirage", spinCurveMult: 0.24, sweetSpotBonus: 0.12, coinBonusPct: 1.02 },
    appearance: {
      shirtHex: 0xe11d48,
      shirtDarkHex: 0x881337,
      shortsHex: 0xfff1f2,
      shoeHex: 0xfb7185,
      hairHex: 0xf472b6,
      headbandHex: 0xffffff,
      stripeHex: 0xfda4af,
      skinHex: 0xfff1f2,
      hairStyle: "parted_waves",
      browTilt: "calm",
      mouthStyle: "happy_grin",
      glasses: false,
      lashes: true,
      defaultAccessories: ["cyber_halo", "power_wristbands"]
    }
  },
  {
    id: "drake",
    name: "Drake Vortex",
    title: "Thợ Săn Bão Tố",
    roleTag: "STORM BREAKER",
    rarity: "MASTER",
    accentCss: "#6366f1",
    price: 4550,
    unlockedByDefault: false,
    baseStats: { speed: 15, power: 15, spin: 15, reflex: 15 },
    passiveName: "Tâm Bão Siêu Thanh",
    passiveDesc: "Cơ chế: Kết hợp Giao bóng siêu tốc +16% và Độ xoáy lốc +18% • +112% Xu thưởng",
    mechanic: {
      id: "storm_vortex",
      serveSpeedBonus: 0.16,
      spinCurveMult: 0.18,
      reachBonus: 0.28,
      coinBonusPct: 1.12
    },
    appearance: {
      shirtHex: 0x4f46e5,
      shirtDarkHex: 0x312e81,
      shortsHex: 0x090d16,
      shoeHex: 0x818cf8,
      hairHex: 0xc7d2fe,
      headbandHex: 0x38bdf8,
      stripeHex: 0x38bdf8,
      skinHex: 0xe6b89c,
      hairStyle: "spiky_pro",
      browTilt: "focused",
      mouthStyle: "confident_smirk",
      glasses: true,
      lashes: false,
      defaultAccessories: ["visor_cyber", "shoulder_pads"]
    }
  },

  // ============================================================================
  // GROUP 3: CYBER & MECHA ROBOTS (7 AUTONOMOUS / MECHA UNITS · OVR ~206 -> 278)
  // ============================================================================
  {
    id: "mecha_volt",
    name: "RX-01 Volt",
    title: "Robot Phản Xạ Quang Học",
    roleTag: "CYBER BOT",
    rarity: "ROBOT",
    isRobot: true,
    accentCss: "#22d3ee",
    price: 5200,
    unlockedByDefault: false,
    baseStats: { speed: 16, power: 15, spin: 15, reflex: 18 },
    passiveName: "Cảm Biến Laser 360°",
    passiveDesc: "Cơ chế Robot: Tự động khóa mục tiêu bóng • +16% tỷ lệ Bot chặn lưới & +125% Xu thưởng",
    mechanic: {
      id: "laser_sensor",
      reachBonus: 0.42,
      botInterceptBonus: 0.16,
      sweetSpotBonus: 0.14,
      coinBonusPct: 1.25
    },
    appearance: {
      shirtHex: 0x0891b2,
      shirtDarkHex: 0x164e63,
      shortsHex: 0x090d16,
      shoeHex: 0x22d3ee,
      hairHex: 0x38bdf8,
      headbandHex: 0x22d3ee,
      stripeHex: 0x67e8f9,
      skinHex: 0x94a3b8,
      hairStyle: "spiky_pro",
      browTilt: "focused",
      mouthStyle: "confident_smirk",
      glasses: true,
      lashes: false,
      defaultAccessories: ["mecha_helmet", "gravity_thrusters"]
    }
  },
  {
    id: "aegis_bot",
    name: "Aegis-VII",
    title: "Pháo Đài Phòng Thủ AI",
    roleTag: "GUARDIAN BOT",
    rarity: "ROBOT",
    isRobot: true,
    accentCss: "#10b981",
    price: 5900,
    unlockedByDefault: false,
    baseStats: { speed: 16, power: 17, spin: 16, reflex: 20 },
    passiveName: "Khiên Từ Trường Bắt Lưới",
    passiveDesc: "Cơ chế Robot: Hút mọi pha bóng trong bán kính +0.52m • Bot chặn lưới tối đa • +138% Xu",
    mechanic: {
      id: "aegis_shield",
      reachBonus: 0.52,
      botInterceptBonus: 0.22,
      botVolleyPowerBonus: 0.14,
      coinBonusPct: 1.38
    },
    appearance: {
      shirtHex: 0x059669,
      shirtDarkHex: 0x064e3b,
      shortsHex: 0x0f172a,
      shoeHex: 0x34d399,
      hairHex: 0x10b981,
      headbandHex: 0x34d399,
      stripeHex: 0x6ee7b7,
      skinHex: 0xcbd5e1,
      hairStyle: "round_cap",
      browTilt: "focused",
      mouthStyle: "confident_smirk",
      glasses: true,
      lashes: false,
      defaultAccessories: ["mecha_helmet", "shoulder_pads", "cyber_matrix_aura"]
    }
  },
  {
    id: "titan_x9",
    name: "Titan X-9",
    title: "Cỗ Máy Đập Bóng Hạng Nặng",
    roleTag: "MECHA CRUSHER",
    rarity: "ROBOT",
    isRobot: true,
    accentCss: "#f97316",
    price: 6700,
    unlockedByDefault: false,
    baseStats: { speed: 16, power: 22, spin: 17, reflex: 18 },
    passiveName: "Piston Thủy Lực Siêu Trọng",
    passiveDesc: "Cơ chế Robot: Cú Smash & Volley bắn đi như đạn pháo (+24% Lực) đẩy lùi • +150% Xu",
    mechanic: {
      id: "hydraulic_smash",
      smashSpeedBonus: 0.24,
      botVolleyPowerBonus: 0.22,
      knockbackImpulse: 0.68,
      coinBonusPct: 1.5
    },
    appearance: {
      shirtHex: 0xea580c,
      shirtDarkHex: 0x7c2d12,
      shortsHex: 0x090d16,
      shoeHex: 0xf97316,
      hairHex: 0xfacc15,
      headbandHex: 0xf97316,
      stripeHex: 0xfacc15,
      skinHex: 0x64748b,
      hairStyle: "spiky_pro",
      browTilt: "determined",
      mouthStyle: "confident_smirk",
      glasses: true,
      lashes: false,
      defaultAccessories: ["mecha_helmet", "shoulder_pads", "thunder_gauntlets"]
    }
  },
  {
    id: "cyber_valkyrie",
    name: "Valkyrie MK-II",
    title: "Chiến Cơ Phản Lực",
    roleTag: "JET VALKYRIE",
    rarity: "ROBOT",
    isRobot: true,
    accentCss: "#f43f5e",
    price: 7600,
    unlockedByDefault: false,
    baseStats: { speed: 22, power: 19, spin: 18, reflex: 19 },
    passiveName: "Động Cơ Phản Lực Đôi",
    passiveDesc: "Cơ chế Robot: Lướt trên mặt sân nhanh hơn +20% & tự động đập Volley trên không • +165% Xu",
    mechanic: {
      id: "valkyrie_jet",
      speedBurstMult: 0.2,
      smashSpeedBonus: 0.16,
      botInterceptBonus: 0.18,
      coinBonusPct: 1.65
    },
    appearance: {
      shirtHex: 0xe11d48,
      shirtDarkHex: 0x881337,
      shortsHex: 0x0f172a,
      shoeHex: 0xf43f5e,
      hairHex: 0xfda4af,
      headbandHex: 0xfacc15,
      stripeHex: 0xfef08a,
      skinHex: 0xe2e8f0,
      hairStyle: "parted_waves",
      browTilt: "focused",
      mouthStyle: "confident_smirk",
      glasses: true,
      lashes: true,
      defaultAccessories: ["mecha_helmet", "plasma_wings", "gravity_thrusters"]
    }
  },
  {
    id: "omega_droid",
    name: "Omega-Zero",
    title: "AI Tính Toán Quỹ Đạo",
    roleTag: "QUANTUM BOT",
    rarity: "ROBOT",
    isRobot: true,
    accentCss: "#a855f7",
    price: 8600,
    unlockedByDefault: false,
    baseStats: { speed: 20, power: 20, spin: 23, reflex: 20 },
    passiveName: "Thuật Toán Ma Trận Xoáy",
    passiveDesc: "Cơ chế Robot: Bẻ cong quỹ đạo bóng +26% vào góc chết không thể cứu • +180% Xu",
    mechanic: {
      id: "matrix_spin",
      spinCurveMult: 0.26,
      sweetSpotBonus: 0.18,
      botInterceptBonus: 0.2,
      coinBonusPct: 1.8
    },
    appearance: {
      shirtHex: 0x7c3aed,
      shirtDarkHex: 0x4c1d95,
      shortsHex: 0x090d16,
      shoeHex: 0xa855f7,
      hairHex: 0xd8b4fe,
      headbandHex: 0x22d3ee,
      stripeHex: 0xe879f9,
      skinHex: 0x94a3b8,
      hairStyle: "swept_puffs",
      browTilt: "focused",
      mouthStyle: "confident_smirk",
      glasses: true,
      lashes: false,
      defaultAccessories: ["mecha_helmet", "cyber_halo", "void_aura"]
    }
  },
  {
    id: "chronos_mk4",
    name: "Chronos MK-IV",
    title: "Cỗ Máy Thời Gian",
    roleTag: "CHRONO BOT",
    rarity: "ROBOT",
    isRobot: true,
    accentCss: "#facc15",
    price: 9800,
    unlockedByDefault: false,
    baseStats: { speed: 22, power: 21, spin: 22, reflex: 24 },
    passiveName: "Trường Làm Chậm Thời Gian",
    passiveDesc: "Cơ chế Robot: Mở rộng +22% khung căn giờ PERFECT & +0.5m tầm đón bóng • +195% Xu",
    mechanic: {
      id: "chrono_field",
      sweetSpotBonus: 0.22,
      reachBonus: 0.5,
      botInterceptBonus: 0.22,
      coinBonusPct: 1.95
    },
    appearance: {
      shirtHex: 0xd97706,
      shirtDarkHex: 0x78350f,
      shortsHex: 0x090d16,
      shoeHex: 0xfacc15,
      hairHex: 0xfef08a,
      headbandHex: 0x38bdf8,
      stripeHex: 0xfacc15,
      skinHex: 0xcbd5e1,
      hairStyle: "spiky_pro",
      browTilt: "focused",
      mouthStyle: "confident_smirk",
      glasses: true,
      lashes: false,
      defaultAccessories: ["mecha_helmet", "cyber_halo", "aura_gold"]
    }
  },
  {
    id: "nexus_prime",
    name: "Nexus Prime",
    title: "Siêu Trí Tuệ Tối Thượng",
    roleTag: "SUPREME MECHA",
    rarity: "ROBOT",
    isRobot: true,
    isPremium: true,
    accentCss: "#06b6d4",
    price: 11800,
    unlockedByDefault: false,
    baseStats: { speed: 25, power: 25, spin: 24, reflex: 25 },
    passiveName: "Lõi Phản Ứng Hạt Nhân",
    passiveDesc: "Cơ chế Robot Tối Thượng: Toàn diện +20% Lực, +20% Tốc, +26% AI Tự Đỡ Lưới & +220% Xu thưởng!",
    mechanic: {
      id: "nexus_overdrive",
      serveSpeedBonus: 0.2,
      smashSpeedBonus: 0.2,
      speedBurstMult: 0.18,
      reachBonus: 0.48,
      botInterceptBonus: 0.26,
      botVolleyPowerBonus: 0.24,
      coinBonusPct: 2.2
    },
    appearance: {
      shirtHex: 0x0284c7,
      shirtDarkHex: 0x0f172a,
      shortsHex: 0x090d16,
      shoeHex: 0x22d3ee,
      hairHex: 0x67e8f9,
      headbandHex: 0xfacc15,
      stripeHex: 0x22d3ee,
      skinHex: 0xe2e8f0,
      hairStyle: "spiky_pro",
      browTilt: "determined",
      mouthStyle: "confident_smirk",
      glasses: true,
      lashes: false,
      defaultAccessories: ["mecha_helmet", "cyber_wings", "thunder_gauntlets", "cyber_matrix_aura"]
    }
  },

  // ============================================================================
  // GROUP 4: PREMIUM & MYTHIC LEGENDS (7 SPECIAL CHARACTERS · OVR ~270 -> 405+)
  // ============================================================================
  {
    id: "astra",
    name: "Astra",
    title: "Siêu Sao Lượng Tử",
    roleTag: "LEGENDARY PRO",
    rarity: "MYTHIC",
    isPremium: true,
    accentCss: "#06b6d4",
    price: 11000,
    unlockedByDefault: false,
    baseStats: { speed: 24, power: 22, spin: 24, reflex: 24 },
    passiveName: "Cực Quang Lượng Tử",
    passiveDesc: "Cơ chế Premium: Tối đa phản xạ & mở rộng điểm ngọt +18% • Cánh Lượng Tử 3D & +210% Xu",
    mechanic: {
      id: "quantum_aurora",
      sweetSpotBonus: 0.18,
      reachBonus: 0.42,
      spinCurveMult: 0.2,
      coinBonusPct: 2.1
    },
    appearance: {
      shirtHex: 0x06b6d4,
      shirtDarkHex: 0x0e7490,
      shortsHex: 0x0f172a,
      shoeHex: 0x22d3ee,
      hairHex: 0xe0f2fe,
      headbandHex: 0xf43f5e,
      stripeHex: 0x22d3ee,
      skinHex: 0xffe8d6,
      hairStyle: "swept_puffs",
      browTilt: "focused",
      mouthStyle: "happy_grin",
      glasses: true,
      lashes: true,
      defaultAccessories: ["visor_cyber", "cyber_wings", "aura_emerald"]
    }
  },
  {
    id: "solaris_rex",
    name: "Solaris Rex",
    title: "Hoàng Đế Thái Dương",
    roleTag: "MYTHIC SOVEREIGN",
    rarity: "MYTHIC",
    isPremium: true,
    accentCss: "#facc15",
    price: 13800,
    unlockedByDefault: false,
    baseStats: { speed: 25, power: 29, spin: 25, reflex: 26 },
    passiveName: "Thái Dương Thần Chưởng",
    passiveDesc: "Cơ chế Premium: Giao bóng & Smash bùng nổ +24% vận tốc kèm chấn động đẩy lùi & +240% Xu",
    mechanic: {
      id: "solar_sovereign",
      serveSpeedBonus: 0.24,
      smashSpeedBonus: 0.24,
      knockbackImpulse: 0.6,
      coinBonusPct: 2.4
    },
    appearance: {
      shirtHex: 0xf59e0b,
      shirtDarkHex: 0x92400e,
      shortsHex: 0x0f172a,
      shoeHex: 0xfacc15,
      hairHex: 0xfef08a,
      headbandHex: 0xffffff,
      stripeHex: 0xfef08a,
      skinHex: 0xffdfc4,
      hairStyle: "spiky_pro",
      browTilt: "confident",
      mouthStyle: "confident_smirk",
      glasses: false,
      lashes: false,
      defaultAccessories: ["crown_gold", "shoulder_pads", "aura_gold"]
    }
  },
  {
    id: "nyx_shadow",
    name: "Nyx Eclipse",
    title: "Nữ Chúa Bóng Đêm",
    roleTag: "MYTHIC PHANTOM",
    rarity: "MYTHIC",
    isPremium: true,
    accentCss: "#c084fc",
    price: 16500,
    unlockedByDefault: false,
    baseStats: { speed: 29, power: 26, spin: 30, reflex: 28 },
    passiveName: "Bước Nhảy Không Gian",
    passiveDesc: "Cơ chế Premium: Tốc độ di chuyển +22%, bóng xoáy bóng ma +26% & +270% Xu thưởng",
    mechanic: {
      id: "shadow_blink",
      speedBurstMult: 0.22,
      spinCurveMult: 0.26,
      reachBonus: 0.48,
      botInterceptBonus: 0.22,
      coinBonusPct: 2.7
    },
    appearance: {
      shirtHex: 0x581c87,
      shirtDarkHex: 0x2e1065,
      shortsHex: 0x090d16,
      shoeHex: 0xc084fc,
      hairHex: 0xe9d5ff,
      headbandHex: 0xe879f9,
      stripeHex: 0xc084fc,
      skinHex: 0xf8fafc,
      hairStyle: "parted_waves",
      browTilt: "focused",
      mouthStyle: "confident_smirk",
      glasses: false,
      lashes: true,
      defaultAccessories: ["dragon_horns", "plasma_wings", "void_aura"]
    }
  },
  {
    id: "celestia",
    name: "Celestia Valkyrie",
    title: "Thiên Sứ Tinh Vân",
    roleTag: "MYTHIC SERAPH",
    rarity: "MYTHIC",
    isPremium: true,
    accentCss: "#38bdf8",
    price: 19500,
    unlockedByDefault: false,
    baseStats: { speed: 30, power: 29, spin: 30, reflex: 31 },
    passiveName: "Đôi Cánh Thiên Giới",
    passiveDesc: "Cơ chế Premium: Khung căn giờ PERFECT +24%, tự động chuẩn hóa đường bóng & +300% Xu",
    mechanic: {
      id: "seraph_grace",
      sweetSpotBonus: 0.24,
      reachBonus: 0.5,
      speedBurstMult: 0.2,
      botInterceptBonus: 0.24,
      coinBonusPct: 3.0
    },
    appearance: {
      shirtHex: 0xe0f2fe,
      shirtDarkHex: 0x0284c7,
      shortsHex: 0x1e293b,
      shoeHex: 0x38bdf8,
      hairHex: 0xfef08a,
      headbandHex: 0xfacc15,
      stripeHex: 0xfacc15,
      skinHex: 0xfff7ed,
      hairStyle: "parted_waves",
      browTilt: "calm",
      mouthStyle: "happy_grin",
      glasses: false,
      lashes: true,
      defaultAccessories: ["cyber_halo", "cyber_wings", "aura_gold"]
    }
  },
  {
    id: "odin_gold",
    name: "Odin Valhall",
    title: "Thần Chiến Tranh Bắc Âu",
    roleTag: "MYTHIC TITAN",
    rarity: "MYTHIC",
    isPremium: true,
    accentCss: "#f59e0b",
    price: 23000,
    unlockedByDefault: false,
    baseStats: { speed: 30, power: 36, spin: 31, reflex: 32 },
    passiveName: "Ngọn Giáo Gungnir",
    passiveDesc: "Cơ chế Premium: Giao bóng 255 KM/H & Smash sấm sét +28% lực đẩy lùi • +340% Xu thưởng",
    mechanic: {
      id: "gungnir_spear",
      serveSpeedBonus: 0.28,
      smashSpeedBonus: 0.28,
      knockbackImpulse: 0.8,
      botVolleyPowerBonus: 0.26,
      coinBonusPct: 3.4
    },
    appearance: {
      shirtHex: 0xb45309,
      shirtDarkHex: 0x451a03,
      shortsHex: 0x0f172a,
      shoeHex: 0xfacc15,
      hairHex: 0xf8fafc,
      headbandHex: 0xfacc15,
      stripeHex: 0xfef08a,
      skinHex: 0xffdfc4,
      hairStyle: "spiky_pro",
      browTilt: "determined",
      mouthStyle: "confident_smirk",
      glasses: false,
      lashes: false,
      defaultAccessories: ["crown_gold", "shoulder_pads", "thunder_gauntlets", "aura_gold"]
    }
  },
  {
    id: "void_emperor",
    name: "Malakor Void",
    title: "Chúa Tể Hố Đen",
    roleTag: "MYTHIC OVERLORD",
    rarity: "MYTHIC",
    isPremium: true,
    accentCss: "#d946ef",
    price: 27000,
    unlockedByDefault: false,
    baseStats: { speed: 33, power: 35, spin: 38, reflex: 34 },
    passiveName: "Lực Hấp Dẫn Hố Đen",
    passiveDesc: "Cơ chế Premium: Độ xoáy cực đại +32% bẻ cong không gian, hút bóng +0.56m & +380% Xu",
    mechanic: {
      id: "singularity_pull",
      spinCurveMult: 0.32,
      reachBonus: 0.56,
      smashSpeedBonus: 0.24,
      botInterceptBonus: 0.28,
      coinBonusPct: 3.8
    },
    appearance: {
      shirtHex: 0x4a044e,
      shirtDarkHex: 0x1e1b4b,
      shortsHex: 0x090d16,
      shoeHex: 0xd946ef,
      hairHex: 0xf5d0fe,
      headbandHex: 0xfacc15,
      stripeHex: 0xe879f9,
      skinHex: 0xe2e8f0,
      hairStyle: "spiky_pro",
      browTilt: "determined",
      mouthStyle: "confident_smirk",
      glasses: true,
      lashes: false,
      defaultAccessories: ["dragon_horns", "plasma_wings", "thunder_gauntlets", "void_aura"]
    }
  },
  {
    id: "archon_zero",
    name: "Archon Omega",
    title: "Vị Thần Sáng Thế Sân Đấu",
    roleTag: "GOD TIER APEX",
    rarity: "MYTHIC",
    isPremium: true,
    isRobot: true,
    accentCss: "#22d3ee",
    price: 32000,
    unlockedByDefault: false,
    baseStats: { speed: 38, power: 40, spin: 40, reflex: 40 },
    passiveName: "Thần Lực Đa Vũ Trụ",
    passiveDesc: "Cơ chế Thần Thoại Tối Thượng: +30% Uy Lực, +30% Độ Xoáy, +25% Tốc Độ, +32% AI Chặn Lưới & +450% Xu!",
    mechanic: {
      id: "omniverse_apex",
      serveSpeedBonus: 0.3,
      smashSpeedBonus: 0.3,
      spinCurveMult: 0.3,
      speedBurstMult: 0.25,
      reachBonus: 0.62,
      sweetSpotBonus: 0.26,
      botInterceptBonus: 0.32,
      botVolleyPowerBonus: 0.3,
      knockbackImpulse: 0.85,
      coinBonusPct: 4.5
    },
    appearance: {
      shirtHex: 0x0f172a,
      shirtDarkHex: 0x020617,
      shortsHex: 0x090d16,
      shoeHex: 0xfacc15,
      hairHex: 0x38bdf8,
      headbandHex: 0xfacc15,
      stripeHex: 0x22d3ee,
      skinHex: 0xf8fafc,
      hairStyle: "spiky_pro",
      browTilt: "determined",
      mouthStyle: "confident_smirk",
      glasses: true,
      lashes: false,
      defaultAccessories: ["crown_gold", "cyber_halo", "cyber_wings", "thunder_gauntlets", "aura_gold"]
    }
  }
];

// Dynamically register all 30 characters into MII_PROFILES so every character has a distinct 2D SVG portrait
registerRosterMiiProfiles(
  CHARACTER_ROSTER.map((c) => ({
    id: c.id,
    name: c.name,
    isRobot: Boolean(c.isRobot),
    rarity: c.rarity || "PRO",
    defaultAccessories: c.appearance?.defaultAccessories || [],
    colors: {
      shirt: c.appearance?.shirtHex,
      shorts: c.appearance?.shirtDarkHex,
      accent: c.accentCss,
      hair: c.appearance?.hairHex,
      skin: c.appearance?.skinHex
    }
  }))
);

export const OUTFIT_CATALOG = [
  {
    id: "outfit_default",
    name: "Đồng Phục Gốc Nhân Vật",
    price: 0,
    unlockedByDefault: true,
    desc: "Màu áo đấu đặc trưng nguyên bản của từng vận động viên.",
    isDefault: true,
    swatches: ["#ef4444", "#3b82f6", "#10b981"]
  },
  {
    id: "outfit_grand_slam_gold",
    name: "Grand Slam Bạch Kim",
    price: 250,
    unlockedByDefault: false,
    desc: "Áo trắng Wimbledon phối viền vàng hoàng gia sang trọng.",
    shirtHex: 0xf8fafc,
    shirtDarkHex: 0xcbd5e1,
    shortsHex: 0x1e293b,
    shoeHex: 0xf59e0b,
    headbandHex: 0xfacc15,
    stripeHex: 0xf59e0b,
    swatches: ["#f8fafc", "#facc15", "#1e293b"]
  },
  {
    id: "outfit_cyber_stealth",
    name: "Cyber Neon Đêm Đen",
    price: 380,
    unlockedByDefault: false,
    desc: "Giáp đấu đen carbon phối lõi phản ứng xanh điện quang tương lai.",
    shirtHex: 0x111827,
    shirtDarkHex: 0x030712,
    shortsHex: 0x090d16,
    shoeHex: 0x06b6d4,
    headbandHex: 0x22d3ee,
    stripeHex: 0x06b6d4,
    swatches: ["#111827", "#22d3ee", "#06b6d4"]
  },
  {
    id: "outfit_crimson_dragon",
    name: "Chiến Bào Hỏa Long",
    price: 450,
    unlockedByDefault: false,
    desc: "Sắc đỏ lửa rực rỡ phối đai vàng võ thuật và giày rực cháy.",
    shirtHex: 0xdc2626,
    shirtDarkHex: 0x7f1d1d,
    shortsHex: 0x18181b,
    shoeHex: 0xfacc15,
    headbandHex: 0xfef08a,
    stripeHex: 0xfacc15,
    swatches: ["#dc2626", "#facc15", "#18181b"]
  },
  {
    id: "outfit_emerald_storm",
    name: "Lục Bảo Siêu Tốc",
    price: 520,
    unlockedByDefault: false,
    desc: "Sắc xanh ngọc lục bảo năng động kèm vây khí động học ở hông.",
    shirtHex: 0x059669,
    shirtDarkHex: 0x064e3b,
    shortsHex: 0xf8fafc,
    shoeHex: 0x34d399,
    headbandHex: 0x10b981,
    stripeHex: 0x6ee7b7,
    swatches: ["#059669", "#34d399", "#f8fafc"]
  },
  {
    id: "outfit_royal_galaxy",
    name: "Tinh Vân Hoàng Gia",
    price: 680,
    unlockedByDefault: false,
    desc: "Tím ngân hà kết hợp vòng quỹ đạo hành tinh 3D quanh eo.",
    shirtHex: 0x6d28d9,
    shirtDarkHex: 0x4c1d95,
    shortsHex: 0x0f172a,
    shoeHex: 0xf43f5e,
    headbandHex: 0xe879f9,
    stripeHex: 0xf43f5e,
    swatches: ["#6d28d9", "#e879f9", "#f43f5e"]
  },
  {
    id: "outfit_mecha_titanium",
    name: "Giáp Cơ Khí Titanium",
    price: 820,
    unlockedByDefault: false,
    desc: "Bộ giáp hợp kim bạc-xanh dành cho chiến binh Robot & Mecha.",
    shirtHex: 0x334155,
    shirtDarkHex: 0x0f172a,
    shortsHex: 0x090d16,
    shoeHex: 0x38bdf8,
    headbandHex: 0x22d3ee,
    stripeHex: 0x38bdf8,
    swatches: ["#334155", "#38bdf8", "#0f172a"]
  },
  {
    id: "outfit_solar_emperor",
    name: "Hoàng Kim Thái Dương",
    price: 980,
    unlockedByDefault: false,
    desc: "Giáp hoàng kim rực rỡ dành riêng cho bậc Đế Vương sân đấu.",
    shirtHex: 0xf59e0b,
    shirtDarkHex: 0x78350f,
    shortsHex: 0x090d16,
    shoeHex: 0xfef08a,
    headbandHex: 0xfacc15,
    stripeHex: 0xfef08a,
    swatches: ["#f59e0b", "#fef08a", "#090d16"]
  }
];

export const STRIKE_VFX_CATALOG = [
  {
    id: "vfx_default",
    name: "Quang Phổ Tiêu Chuẩn",
    badge: "MẶC ĐỊNH",
    price: 0,
    unlockedByDefault: true,
    desc: "Vệt vợt ánh sáng chuẩn kết hợp tia sao cổ điển khi chạm bóng.",
    colors: ["#ffffff", "#fbbf24", "#38bdf8"],
    leadHex: 0xfff8d6,
    trailHex: 0xffaa18,
    rimHex: 0xff7b00,
    ringHex: 0xffe066,
    starHexes: [0xffe066, 0x38e8ff, 0xffffff, 0xffaa18],
    ballMainHex: 0xffffff,
    ballAccentHex: 0xffe066,
    shockwaveCount: 1,
    powerBonus: 0,
    spinBonus: 0,
    reflexBonus: 0
  },
  {
    id: "vfx_solar_phoenix",
    name: "Phượng Hoàng Lửa (Solar Flare)",
    badge: "HỎA LONG",
    price: 450,
    unlockedByDefault: false,
    desc: "Vệt kiếm lửa vàng-đỏ rực cháy kèm 2 vòng sóng nhiệt bùng nổ khi đánh bóng (+1 Lực).",
    colors: ["#fef08a", "#f97316", "#dc2626"],
    leadHex: 0xfef08a,
    trailHex: 0xf97316,
    rimHex: 0xdc2626,
    ringHex: 0xf97316,
    starHexes: [0xfacc15, 0xf97316, 0xef4444, 0xffffff],
    ballMainHex: 0xfef08a,
    ballAccentHex: 0xef4444,
    shockwaveCount: 2,
    powerBonus: 1,
    spinBonus: 0,
    reflexBonus: 0
  },
  {
    id: "vfx_thunder_plasma",
    name: "Lôi Điện Sấm Sét (Thunderbolt)",
    badge: "LÔI ĐIỆN",
    price: 600,
    unlockedByDefault: false,
    desc: "Tia sét điện quang xanh-tím phóng ra từ mặt vợt và xung kích điện từ (+1 Xoáy, +1 Phản Xạ).",
    colors: ["#e0f2fe", "#38bdf8", "#6366f1"],
    leadHex: 0xe0f2fe,
    trailHex: 0x0ea5e9,
    rimHex: 0x6366f1,
    ringHex: 0x38bdf8,
    starHexes: [0x38bdf8, 0x818cf8, 0xffffff, 0x22d3ee],
    ballMainHex: 0xe0f2fe,
    ballAccentHex: 0x38bdf8,
    shockwaveCount: 2,
    powerBonus: 0,
    spinBonus: 1,
    reflexBonus: 1
  },
  {
    id: "vfx_cryo_frost",
    name: "Băng Giá Cực Hàn (Cryo Nova)",
    badge: "BĂNG HÀN",
    price: 750,
    unlockedByDefault: false,
    desc: "Tinh thể băng kim cương phát nổ cùng luồng sương băng xanh ngọc (+2 Xoáy).",
    colors: ["#ffffff", "#67e8f9", "#0284c7"],
    leadHex: 0xffffff,
    trailHex: 0x22d3ee,
    rimHex: 0x0284c7,
    ringHex: 0x67e8f9,
    starHexes: [0xffffff, 0x67e8f9, 0x38bdf8, 0xa5f3fc],
    ballMainHex: 0xecfeff,
    ballAccentHex: 0x06b6d4,
    shockwaveCount: 2,
    powerBonus: 0,
    spinBonus: 2,
    reflexBonus: 0
  },
  {
    id: "vfx_emerald_dragon",
    name: "Cuồng Phong Lục Bảo (Dragon Wind)",
    badge: "CUỒNG PHONG",
    price: 900,
    unlockedByDefault: false,
    desc: "Lốc xoáy ngọc lục bảo tốc độ siêu thanh kèm sóng xung kích 3 tầng (+1 Lực, +2 Xoáy).",
    colors: ["#d1fae5", "#10b981", "#047857"],
    leadHex: 0xd1fae5,
    trailHex: 0x10b981,
    rimHex: 0xfacc15,
    ringHex: 0x34d399,
    starHexes: [0x34d399, 0x10b981, 0xfef08a, 0xffffff],
    ballMainHex: 0xd1fae5,
    ballAccentHex: 0x10b981,
    shockwaveCount: 3,
    powerBonus: 1,
    spinBonus: 2,
    reflexBonus: 0
  },
  {
    id: "vfx_quantum_void",
    name: "Hố Đen Lượng Tử (Supernova)",
    badge: "HUYỀN THOẠI",
    price: 1250,
    unlockedByDefault: false,
    desc: "Vụ nổ siêu tân tinh đa chiều tím-vàng kim với 3 tầng sóng xung kích (+2 Lực, +2 Xoáy).",
    colors: ["#f5d0fe", "#d946ef", "#facc15"],
    leadHex: 0xfef08a,
    trailHex: 0xd946ef,
    rimHex: 0x7c3aed,
    ringHex: 0xe879f9,
    starHexes: [0xfacc15, 0xe879f9, 0x38bdf8, 0xffffff],
    ballMainHex: 0xfdf4ff,
    ballAccentHex: 0xd946ef,
    shockwaveCount: 3,
    powerBonus: 2,
    spinBonus: 2,
    reflexBonus: 1
  },
  {
    id: "vfx_cyber_matrix",
    name: "Ma Trận Số Hóa (Cyber Matrix)",
    badge: "MECHA AI",
    price: 1450,
    unlockedByDefault: false,
    desc: "Chùm tia laser lục-lam số hóa chuẩn xác của Robot tương lai (+2 Xoáy, +2 Phản Xạ).",
    colors: ["#a7f3d0", "#06b6d4", "#10b981"],
    leadHex: 0xa7f3d0,
    trailHex: 0x06b6d4,
    rimHex: 0x10b981,
    ringHex: 0x22d3ee,
    starHexes: [0x22d3ee, 0x10b981, 0xffffff, 0xfacc15],
    ballMainHex: 0xecfeff,
    ballAccentHex: 0x10b981,
    shockwaveCount: 3,
    powerBonus: 1,
    spinBonus: 2,
    reflexBonus: 2
  },
  {
    id: "vfx_crimson_inferno",
    name: "Huyết Long Thiên Thạch (Meteor)",
    badge: "THẦN THOẠI",
    price: 1680,
    unlockedByDefault: false,
    desc: "Quả cầu lửa thiên thạch đỏ thẫm tạo chấn động mặt sân cực mạnh (+3 Lực, +1 Xoáy).",
    colors: ["#fecdd3", "#ef4444", "#7f1d1d"],
    leadHex: 0xfef08a,
    trailHex: 0xef4444,
    rimHex: 0x991b1b,
    ringHex: 0xf97316,
    starHexes: [0xef4444, 0xfacc15, 0xf97316, 0xffffff],
    ballMainHex: 0xfee2e2,
    ballAccentHex: 0xdc2626,
    shockwaveCount: 3,
    powerBonus: 3,
    spinBonus: 1,
    reflexBonus: 1
  },
  {
    id: "vfx_celestial_gold",
    name: "Thiên Hà Hoàng Kim (Godspeed)",
    badge: "MYTHIC VIP",
    price: 1980,
    unlockedByDefault: false,
    desc: "Hào quang thần thánh vàng 24K kết hợp tinh vân kim cương (+3 Lực, +3 Xoáy, +2 Phản Xạ).",
    colors: ["#ffffff", "#facc15", "#38bdf8"],
    leadHex: 0xffffff,
    trailHex: 0xfacc15,
    rimHex: 0x38bdf8,
    ringHex: 0xfde047,
    starHexes: [0xfacc15, 0xffffff, 0x38bdf8, 0xf43f5e],
    ballMainHex: 0xfef9c3,
    ballAccentHex: 0xfacc15,
    shockwaveCount: 3,
    powerBonus: 3,
    spinBonus: 3,
    reflexBonus: 2
  }
];

export const RACKET_CATALOG = [
  {
    id: "racket_classic",
    name: "Argon Pro Classic",
    price: 0,
    unlockedByDefault: true,
    frameHex: 0x2563eb,
    throatHex: 0xe2e8f0,
    gripHex: 0x1e293b,
    stringHex: 0xffffff,
    emissiveHex: 0x000000,
    emissiveIntensity: 0,
    metalness: 0.65,
    roughness: 0.22,
    bonus: { power: 0, spin: 0, reflex: 0, speed: 0 },
    desc: "Vợt tiêu chuẩn câu lạc bộ, cân bằng và dễ kiểm soát."
  },
  {
    id: "racket_carbon",
    name: "Carbon Stealth X",
    price: 300,
    unlockedByDefault: false,
    frameHex: 0x18181b,
    throatHex: 0xef4444,
    gripHex: 0x09090b,
    stringHex: 0xfca5a5,
    emissiveHex: 0xdc2626,
    emissiveIntensity: 0.3,
    metalness: 0.85,
    roughness: 0.16,
    tierGem: true,
    bonus: { power: 1, spin: 1, reflex: 0, speed: 0 },
    desc: "Khung sợi carbon siêu nhẹ giúp tăng tốc độ đầu vợt (+1 Lực, +1 Xoáy)."
  },
  {
    id: "racket_plasma",
    name: "Plasma Neon Blade",
    price: 550,
    unlockedByDefault: false,
    frameHex: 0x06b6d4,
    throatHex: 0x10b981,
    gripHex: 0x0f172a,
    stringHex: 0xa7f3d0,
    emissiveHex: 0x10b981,
    emissiveIntensity: 0.45,
    metalness: 0.78,
    roughness: 0.15,
    tierGem: true,
    twinFins: true,
    bonus: { power: 1, spin: 2, reflex: 1, speed: 0 },
    desc: "Lõi năng lượng Plasma tăng độ bám bóng và mở rộng điểm ngọt (+2 Xoáy, +1 Phản Xạ)."
  },
  {
    id: "racket_royal_gold",
    name: "Grand Slam Hoàng Kim",
    price: 850,
    unlockedByDefault: false,
    frameHex: 0xf59e0b,
    throatHex: 0xfef08a,
    gripHex: 0x27272a,
    stringHex: 0xfef9c3,
    emissiveHex: 0xd97706,
    emissiveIntensity: 0.42,
    metalness: 0.94,
    roughness: 0.12,
    tierGem: true,
    twinFins: true,
    bonus: { power: 2, spin: 2, reflex: 1, speed: 0 },
    desc: "Mạ vàng 24K nguyên khối dành cho nhà vô địch (+2 Lực, +2 Xoáy, +1 Phản Xạ)."
  },
  {
    id: "racket_dragon_fang",
    name: "Nanh Hỏa Long 3D",
    price: 1050,
    unlockedByDefault: false,
    frameHex: 0xdc2626,
    throatHex: 0xfacc15,
    gripHex: 0x18181b,
    stringHex: 0xfef08a,
    emissiveHex: 0xea580c,
    emissiveIntensity: 0.52,
    metalness: 0.88,
    roughness: 0.14,
    tierGem: true,
    twinFins: true,
    dragonSpikes: true,
    bonus: { power: 3, spin: 2, reflex: 1, speed: 0 },
    desc: "Vây kiếm Hỏa Long 3D tăng +12% tốc độ cú đập Smash (+3 Lực, +2 Xoáy, +1 Phản Xạ)."
  },
  {
    id: "racket_quantum",
    name: "Vợt Lượng Tử Tinh Vân",
    price: 1200,
    unlockedByDefault: false,
    frameHex: 0x8b5cf6,
    throatHex: 0x22d3ee,
    gripHex: 0x090d16,
    stringHex: 0xe0e7ff,
    emissiveHex: 0x7c3aed,
    emissiveIntensity: 0.58,
    metalness: 0.92,
    roughness: 0.1,
    tierGem: true,
    twinFins: true,
    quantumCore: true,
    bonus: { power: 3, spin: 2, reflex: 2, speed: 1 },
    desc: "Tích hợp vòng gia tốc lượng tử 3D trên cổ vợt (+3 Lực, +2 Xoáy, +2 Phản Xạ, +1 Tốc)."
  },
  {
    id: "racket_mecha_railgun",
    name: "Pháo Điện Từ Mecha X",
    price: 1550,
    unlockedByDefault: false,
    frameHex: 0x0284c7,
    throatHex: 0x38bdf8,
    gripHex: 0x090d16,
    stringHex: 0x67e8f9,
    emissiveHex: 0x22d3ee,
    emissiveIntensity: 0.72,
    metalness: 0.95,
    roughness: 0.08,
    tierGem: true,
    twinFins: true,
    quantumCore: true,
    railgunCoils: true,
    bonus: { power: 3, spin: 3, reflex: 3, speed: 1 },
    desc: "Cuộn cảm từ trường Robot giúp tự động hiệu chỉnh tâm bóng (+3 Lực, +3 Xoáy, +3 Phản Xạ)."
  },
  {
    id: "racket_celestial_omega",
    name: "Thần Khí Thái Dương Omega",
    price: 1950,
    unlockedByDefault: false,
    frameHex: 0xfacc15,
    throatHex: 0x38bdf8,
    gripHex: 0x0f172a,
    stringHex: 0xffffff,
    emissiveHex: 0xf59e0b,
    emissiveIntensity: 0.82,
    metalness: 0.98,
    roughness: 0.06,
    tierGem: true,
    twinFins: true,
    quantumCore: true,
    dragonSpikes: true,
    railgunCoils: true,
    bonus: { power: 4, spin: 4, reflex: 3, speed: 2 },
    desc: "Tuyệt phẩm Thần Thoại hội tụ 3 lõi năng lượng (+4 Lực, +4 Xoáy, +3 Phản Xạ, +2 Tốc)."
  }
];

export const ACCESSORY_CATALOG = [
  {
    id: "crown_gold",
    name: "Vương Miện Vô Địch 3D",
    slot: "hat",
    price: 350,
    colorHex: 0xfacc15,
    bonus: { power: 1, spin: 0, reflex: 1, speed: 0, coinBonusPct: 0.08 },
    desc: "Vương miện vàng 3D đính ngọc (+1 Lực, +1 Phản Xạ, +8% Xu thưởng trận)."
  },
  {
    id: "cyber_halo",
    name: "Vòng Hào Quang Thiên Sứ 3D",
    slot: "hat",
    price: 500,
    colorHex: 0x38bdf8,
    bonus: { power: 0, spin: 1, reflex: 2, speed: 0, botInterceptBonus: 0.05 },
    desc: "Vòng ánh sáng 3D lơ lửng trên đầu (+2 Phản Xạ, +1 Xoáy, +5% AI Bắt Lưới)."
  },
  {
    id: "mecha_helmet",
    name: "Mũ Giáp Robot Mecha 3D",
    slot: "hat",
    price: 680,
    colorHex: 0x06b6d4,
    bonus: { power: 1, spin: 1, reflex: 2, speed: 0, botInterceptBonus: 0.1 },
    desc: "Mũ giáp Cyber kèm ăng-ten kép & radar khóa mục tiêu (+2 Phản Xạ, +10% AI Chặn Lưới)."
  },
  {
    id: "dragon_horns",
    name: "Sừng Hỏa Long Thần Thoại 3D",
    slot: "hat",
    price: 780,
    colorHex: 0xef4444,
    bonus: { power: 2, spin: 1, reflex: 1, speed: 0 },
    desc: "Cặp sừng rồng phát sáng uy quyền (+2 Uy Lực, +1 Độ Xoáy, +1 Phản Xạ)."
  },
  {
    id: "samurai_crest",
    name: "Mão Kiếm Thánh Samurai 3D",
    slot: "hat",
    price: 620,
    colorHex: 0xf59e0b,
    bonus: { power: 1, spin: 2, reflex: 1, speed: 0 },
    desc: "Mão sừng trăng lưỡi liềm Samurai tăng độ chính xác (+2 Xoáy, +1 Lực, +1 Phản Xạ)."
  },
  {
    id: "visor_cyber",
    name: "Kính Quang Học Cyber 3D",
    slot: "glasses",
    price: 250,
    colorHex: 0x06b6d4,
    bonus: { power: 0, spin: 1, reflex: 1, speed: 0, botInterceptBonus: 0.06 },
    desc: "Kính phân cực HUD hiển thị quỹ đạo bóng (+1 Phản Xạ, +1 Xoáy, +6% AI Bắt Lưới)."
  },
  {
    id: "shoulder_pads",
    name: "Giáp Vai Chiến Binh 3D",
    slot: "back",
    price: 450,
    colorHex: 0xf97316,
    bonus: { power: 2, spin: 0, reflex: 0, speed: 0 },
    desc: "Bộ giáp vai 3D gia tăng lực vung vợt (+2 Uy Lực cú đánh & đập Smash)."
  },
  {
    id: "cyber_wings",
    name: "Đôi Cánh Lượng Tử 3D",
    slot: "back",
    price: 900,
    colorHex: 0x22d3ee,
    bonus: { power: 1, spin: 1, reflex: 1, speed: 2 },
    desc: "Đôi cánh năng lượng 3D sau lưng (+2 Tốc Độ, +1 Lực, +1 Xoáy, +1 Phản Xạ)."
  },
  {
    id: "plasma_wings",
    name: "Đôi Cánh Phượng Hoàng Tím 3D",
    slot: "back",
    price: 1150,
    colorHex: 0xd946ef,
    bonus: { power: 2, spin: 2, reflex: 1, speed: 2 },
    desc: "Cánh quang phổ tinh vân mở rộng bước nhảy cứu bóng (+2 Tốc, +2 Lực, +2 Xoáy)."
  },
  {
    id: "gravity_thrusters",
    name: "Động Cơ Phản Lực Jet 3D",
    slot: "back",
    price: 820,
    colorHex: 0x38bdf8,
    bonus: { power: 1, spin: 0, reflex: 1, speed: 3, botInterceptBonus: 0.08 },
    desc: "Bộ đẩy phản lực gắn lưng giúp bứt tốc tức thời (+3 Tốc Độ, +8% AI Chặn Lưới)."
  },
  {
    id: "power_wristbands",
    name: "Băng Cổ Tay Phát Sáng 3D",
    slot: "wrist",
    price: 200,
    colorHex: 0x10b981,
    bonus: { power: 1, spin: 1, reflex: 0, speed: 0 },
    desc: "Cặp vòng năng lượng 3D ở 2 cổ tay (+1 Uy Lực, +1 Độ Xoáy)."
  },
  {
    id: "thunder_gauntlets",
    name: "Găng Tay Lôi Thần 3D",
    slot: "wrist",
    price: 580,
    colorHex: 0xfacc15,
    bonus: { power: 2, spin: 1, reflex: 1, speed: 0 },
    desc: "Giáp cổ tay phóng điện từ tăng tốc độ đầu vợt (+2 Lực, +1 Xoáy, +1 Phản Xạ)."
  },
  {
    id: "aura_gold",
    name: "Hào Quang Hoàng Kim 3D",
    slot: "aura",
    price: 500,
    colorHex: 0xfacc15,
    bonus: { power: 1, spin: 1, reflex: 0, speed: 1, coinBonusPct: 0.1 },
    desc: "Vòng hào quang tinh thể vàng dưới chân (+1 Lực, +1 Tốc, +10% Xu thưởng)."
  },
  {
    id: "aura_emerald",
    name: "Hào Quang Lục Bảo 3D",
    slot: "aura",
    price: 650,
    colorHex: 0x10b981,
    bonus: { power: 0, spin: 2, reflex: 1, speed: 1 },
    desc: "Vòng xoáy lốc lục bảo dưới chân (+2 Độ Xoáy, +1 Tốc Độ, +1 Phản Xạ)."
  },
  {
    id: "cyber_matrix_aura",
    name: "Trường Lực Ma Trận AI 3D",
    slot: "aura",
    price: 850,
    colorHex: 0x06b6d4,
    bonus: { power: 1, spin: 1, reflex: 2, speed: 1, botInterceptBonus: 0.1 },
    desc: "Vòng radar công nghệ cao dưới chân (+2 Phản Xạ, +10% Tỷ Lệ Bot Tự Đỡ Lưới)."
  },
  {
    id: "void_aura",
    name: "Hào Quang Hố Đen Vũ Trụ 3D",
    slot: "aura",
    price: 1100,
    colorHex: 0xa855f7,
    bonus: { power: 2, spin: 2, reflex: 2, speed: 1, coinBonusPct: 0.12 },
    desc: "Trường hấp dẫn siêu tân tinh dưới chân (+2 Lực, +2 Xoáy, +2 Phản Xạ, +12% Xu)."
  }
];

export const UPGRADE_STAT_CONFIG = [
  {
    key: "speed",
    label: "Tốc Độ Di Chuyển",
    badge: "SPEED",
    desc: "Tăng tốc độ chạy cứu bóng dọc vạch đáy & lên lưới",
    baseCost: 110,
    costStep: 65,
    maxLevel: 10
  },
  {
    key: "power",
    label: "Uy Lực Cú Đánh",
    badge: "POWER",
    desc: "Tăng vận tốc KM/H khi Giao bóng, Topspin và Đập Smash",
    baseCost: 120,
    costStep: 70,
    maxLevel: 10
  },
  {
    key: "spin",
    label: "Độ Xoáy & Kiểm Soát",
    badge: "SPIN",
    desc: "Bóng cuộn cắm sâu hơn và mở góc đánh hiểm sát vạch",
    baseCost: 110,
    costStep: 65,
    maxLevel: 10
  },
  {
    key: "reflex",
    label: "Phản Xạ & Điểm Ngọt",
    badge: "REFLEX",
    desc: "Mở rộng tầm vung vợt đón bóng và khung PERFECT",
    baseCost: 130,
    costStep: 75,
    maxLevel: 10
  }
];

export const PLAYER_SPECIAL_SKILLS = [
  {
    key: "hyperServe",
    label: "Siêu Giao Bóng Sấm Sét",
    badge: "SERVE+",
    desc: "Tăng tốc độ giao bóng cực đại (lên tới 245 KM/H) & độ xoáy cắm góc",
    baseCost: 180,
    costStep: 140,
    maxLevel: 5
  },
  {
    key: "flashStep",
    label: "Bước Nhảy Tốc Biến",
    badge: "DASH+",
    desc: "Tăng khả năng bứt tốc đón các pha bóng xa tầm với",
    baseCost: 180,
    costStep: 140,
    maxLevel: 5
  },
  {
    key: "meteorSmash",
    label: "Cú Đập Thiên Thạch",
    badge: "SMASH+",
    desc: "Tăng uy lực cú Smash và tạo vòng nổ sóng xung kích kép",
    baseCost: 200,
    costStep: 150,
    maxLevel: 5
  },
  {
    key: "eagleEye",
    label: "Mắt Đại Bàng Chuẩn Xác",
    badge: "FOCUS+",
    desc: "Mở rộng khung căn giờ PERFECT SWEET SPOT và giảm lỗi đánh ra ngoài",
    baseCost: 200,
    costStep: 150,
    maxLevel: 5
  },
  {
    key: "curveMaster",
    label: "Quỹ Đạo Xoáy Magnus Cực Đại",
    badge: "CURVE+",
    desc: "Bẻ cong đường bóng Slice & Topspin lượn vòng qua tầm với đối thủ",
    baseCost: 220,
    costStep: 160,
    maxLevel: 5
  },
  {
    key: "thunderShock",
    label: "Chấn Động Đẩy Lùi Đối Thủ",
    badge: "IMPACT+",
    desc: "Cú đánh PERFECT & Smash tạo xung lực đẩy lùi đối phương khi đỡ bóng",
    baseCost: 240,
    costStep: 170,
    maxLevel: 5
  }
];

export const PARTNER_AI_UPGRADE_CONFIG = [
  {
    key: "aiIq",
    label: "Trí Tuệ AI Đọc Bóng & Tự Đỡ Lưới",
    badge: "AI IQ",
    desc: "Tăng tỷ lệ tự động di chuyển bắt bài và tự vung vợt chặn bóng trên lưới",
    baseCost: 140,
    costStep: 85,
    maxLevel: 10
  },
  {
    key: "speed",
    label: "Tốc Độ Bắt Lưới Của Bot",
    badge: "BOT SPD",
    desc: "Tăng tốc độ di chuyển ngang bảo vệ khu vực trên lưới của Bot",
    baseCost: 115,
    costStep: 65,
    maxLevel: 10
  },
  {
    key: "reflex",
    label: "Tầm Vung Vợt & Phản Xạ Bot",
    badge: "BOT RFLX",
    desc: "Mở rộng bán kính tự động cứu bóng và đỡ được cả cú đánh căng",
    baseCost: 125,
    costStep: 70,
    maxLevel: 10
  },
  {
    key: "power",
    label: "Uy Lực Đập Volley Của Bot",
    badge: "BOT PWR",
    desc: "Bot tự động tung cú đập Smash/Volley tốc độ cao vào góc hiểm đối thủ",
    baseCost: 130,
    costStep: 75,
    maxLevel: 10
  },
  {
    key: "overdrive",
    label: "Cơ Chế Robot Overdrive (Auto-Smash)",
    badge: "OVERDRIVE",
    desc: "Tăng tỷ lệ Bot nhảy đập Overhead Smash dứt điểm và bứt tốc phản lực",
    baseCost: 160,
    costStep: 95,
    maxLevel: 10
  },
  {
    key: "magnetNet",
    label: "Từ Trường Hút Bóng Trên Lưới",
    badge: "MAGNET",
    desc: "Tạo vùng từ trường mở rộng tầm hút bóng dọc lưới cho Bot & Robot",
    baseCost: 160,
    costStep: 95,
    maxLevel: 10
  }
];

class CharacterShopManager {
  constructor() {
    this.listeners = new Set();
    this._cloudSaveTimer = null;
    this._applyingRemoteState = false;
    this._unsubCloudVault = null;
    this._unsubUserVault = null;
    this.state = this._loadState();
    this._syncSelectedCharacterToMiiProfile();
    this._initAsyncAndCloudPersistence();
  }

  _resolveCharId(rawId) {
    if (!rawId || typeof rawId !== "string") return null;
    const cleaned = rawId.trim();
    const mapped = LEGACY_CHAR_ID_MAP[cleaned] || cleaned;
    return CHARACTER_ROSTER.some((c) => c.id === mapped) ? mapped : null;
  }

  _getDefaultState() {
    const charUpgrades = {};
    for (const c of CHARACTER_ROSTER) {
      charUpgrades[c.id] = { speed: 1, power: 1, spin: 1, reflex: 1 };
    }
    return {
      coins: 2400,
      updatedAtMs: 0,
      revision: 0,
      selectedMapId: "melbourne_blue",
      // Main Player (Bạn - P1)
      selectedCharacterId: "ammaar",
      unlockedCharacters: ["ammaar", "maya"],
      characterUpgrades: charUpgrades,
      playerSpecialSkills: {
        hyperServe: 1,
        flashStep: 1,
        meteorSmash: 1,
        eagleEye: 1,
        curveMaster: 1,
        thunderShock: 1
      },
      unlockedOutfits: ["outfit_default"],
      selectedOutfitId: "outfit_default",
      unlockedRackets: ["racket_classic"],
      selectedRacketId: "racket_classic",
      unlockedStrikeVfx: ["vfx_default"],
      selectedStrikeVfxId: "vfx_default",
      unlockedAccessories: [],
      equippedAccessories: {
        hat: null,
        glasses: null,
        back: null,
        wrist: null,
        aura: null
      },
      // Bot Đồng Đội (AI Partner at the Net)
      partnerCharacterId: "maya",
      partnerOutfitId: "outfit_default",
      partnerRacketId: "racket_classic",
      partnerStrikeVfxId: "vfx_default",
      partnerEquippedAccessories: {
        hat: null,
        glasses: null,
        back: null,
        wrist: null,
        aura: null
      },
      partnerAiUpgrades: {
        aiIq: 2,
        speed: 2,
        reflex: 2,
        power: 2,
        overdrive: 1,
        magnetNet: 1
      }
    };
  }

  _computeProgressScore(s) {
    if (!s || typeof s !== "object") return 0;
    let score = 0;
    const unlockedChars = Array.isArray(s.unlockedCharacters) ? s.unlockedCharacters : [];
    score += Math.max(0, unlockedChars.length - 2) * 1000;
    score += Math.max(0, (s.unlockedOutfits?.length || 1) - 1) * 500;
    score += Math.max(0, (s.unlockedRackets?.length || 1) - 1) * 500;
    score += Math.max(0, (s.unlockedStrikeVfx?.length || 1) - 1) * 500;
    score += (s.unlockedAccessories?.length || 0) * 500;

    if (s.characterUpgrades && typeof s.characterUpgrades === "object") {
      for (const upg of Object.values(s.characterUpgrades)) {
        if (!upg) continue;
        score +=
          (Math.max(1, Number(upg.speed || 1)) - 1 +
            (Math.max(1, Number(upg.power || 1)) - 1) +
            (Math.max(1, Number(upg.spin || 1)) - 1) +
            (Math.max(1, Number(upg.reflex || 1)) - 1)) *
          250;
      }
    }
    if (s.playerSpecialSkills && typeof s.playerSpecialSkills === "object") {
      for (const lv of Object.values(s.playerSpecialSkills)) {
        score += (Math.max(1, Number(lv || 1)) - 1) * 300;
      }
    }
    if (s.partnerAiUpgrades && typeof s.partnerAiUpgrades === "object") {
      const defaults = { aiIq: 2, speed: 2, reflex: 2, power: 2, overdrive: 1, magnetNet: 1 };
      for (const [k, defLv] of Object.entries(defaults)) {
        score += Math.max(0, Number(s.partnerAiUpgrades[k] || defLv) - defLv) * 280;
      }
    }
    if (Number(s.coins) !== 2400 && Number.isFinite(Number(s.coins))) {
      score += 120;
    }
    if (s.selectedCharacterId && s.selectedCharacterId !== "ammaar") score += 60;
    if (s.partnerCharacterId && s.partnerCharacterId !== "maya") score += 60;
    if (s.selectedOutfitId && s.selectedOutfitId !== "outfit_default") score += 40;
    if (s.selectedRacketId && s.selectedRacketId !== "racket_classic") score += 40;
    if (s.selectedStrikeVfxId && s.selectedStrikeVfxId !== "vfx_default") score += 40;
    return score;
  }

  _normalizeStateObject(rawInput) {
    const def = this._getDefaultState();
    if (!rawInput || typeof rawInput !== "object") return def;

    const parsed =
      rawInput.shopState && typeof rawInput.shopState === "object"
        ? rawInput.shopState
        : rawInput;

    // Support both flat structure and any legacy nested units.player / units.partner structure
    const pUnit = parsed.units?.player || {};
    const bUnit = parsed.units?.partner || {};

    const mergedUpgrades = { ...def.characterUpgrades };
    const rawCharUpgrades = parsed.characterUpgrades || pUnit.characterUpgrades || {};
    if (rawCharUpgrades && typeof rawCharUpgrades === "object") {
      for (const [rawCid, upg] of Object.entries(rawCharUpgrades)) {
        const cid = this._resolveCharId(rawCid) || rawCid;
        if (!mergedUpgrades[cid]) {
          mergedUpgrades[cid] = { speed: 1, power: 1, spin: 1, reflex: 1 };
        }
        mergedUpgrades[cid] = {
          speed: Math.min(10, Math.max(mergedUpgrades[cid].speed || 1, Number(upg?.speed || 1))),
          power: Math.min(10, Math.max(mergedUpgrades[cid].power || 1, Number(upg?.power || 1))),
          spin: Math.min(10, Math.max(mergedUpgrades[cid].spin || 1, Number(upg?.spin || 1))),
          reflex: Math.min(10, Math.max(mergedUpgrades[cid].reflex || 1, Number(upg?.reflex || 1)))
        };
      }
    }

    const rawUnlockedChars = [
      ...def.unlockedCharacters,
      ...(Array.isArray(parsed.unlockedCharacters) ? parsed.unlockedCharacters : []),
      ...(Array.isArray(pUnit.unlockedCharacters) ? pUnit.unlockedCharacters : [])
    ];
    const unlockedCharacters = Array.from(
      new Set(
        rawUnlockedChars
          .map((id) => this._resolveCharId(id))
          .filter(Boolean)
      )
    );

    const selChar =
      this._resolveCharId(parsed.selectedCharacterId || pUnit.selectedCharacterId) ||
      def.selectedCharacterId;
    const partChar =
      this._resolveCharId(parsed.partnerCharacterId || bUnit.selectedCharacterId) ||
      def.partnerCharacterId;

    if (!unlockedCharacters.includes(selChar)) unlockedCharacters.push(selChar);
    if (!unlockedCharacters.includes(partChar)) unlockedCharacters.push(partChar);

    const rawCoins = parsed.coins ?? parsed.wallet?.coins;
    const coins = Number.isFinite(Number(rawCoins))
      ? Math.max(0, Math.round(Number(rawCoins)))
      : def.coins;

    const normalized = {
      ...def,
      coins,
      selectedMapId:
        typeof (parsed.selectedMapId || rawInput.selectedMapId) === "string"
          ? parsed.selectedMapId || rawInput.selectedMapId
          : def.selectedMapId,
      selectedCharacterId: selChar,
      unlockedCharacters,
      characterUpgrades: mergedUpgrades,
      playerSpecialSkills: {
        ...def.playerSpecialSkills,
        ...(parsed.playerSpecialSkills || pUnit.specialSkills || {})
      },
      unlockedOutfits: Array.from(
        new Set([
          ...def.unlockedOutfits,
          ...(parsed.unlockedOutfits || []),
          ...(pUnit.unlockedOutfits || [])
        ])
      ),
      selectedOutfitId: OUTFIT_CATALOG.some(
        (o) => o.id === (parsed.selectedOutfitId || pUnit.selectedOutfitId)
      )
        ? parsed.selectedOutfitId || pUnit.selectedOutfitId
        : def.selectedOutfitId,
      unlockedRackets: Array.from(
        new Set([
          ...def.unlockedRackets,
          ...(parsed.unlockedRackets || []),
          ...(pUnit.unlockedRackets || [])
        ])
      ),
      selectedRacketId: RACKET_CATALOG.some(
        (r) => r.id === (parsed.selectedRacketId || pUnit.selectedRacketId)
      )
        ? parsed.selectedRacketId || pUnit.selectedRacketId
        : def.selectedRacketId,
      unlockedStrikeVfx: Array.from(
        new Set([
          ...def.unlockedStrikeVfx,
          ...(parsed.unlockedStrikeVfx || []),
          ...(pUnit.unlockedStrikeVfx || [])
        ])
      ),
      selectedStrikeVfxId: STRIKE_VFX_CATALOG.some(
        (v) => v.id === (parsed.selectedStrikeVfxId || pUnit.selectedStrikeVfxId)
      )
        ? parsed.selectedStrikeVfxId || pUnit.selectedStrikeVfxId
        : def.selectedStrikeVfxId,
      unlockedAccessories: Array.from(
        new Set([
          ...(parsed.unlockedAccessories || []),
          ...(pUnit.unlockedAccessories || [])
        ])
      ),
      equippedAccessories: {
        ...def.equippedAccessories,
        ...(pUnit.equippedAccessories || {}),
        ...(parsed.equippedAccessories || {})
      },
      partnerCharacterId: partChar,
      partnerOutfitId: OUTFIT_CATALOG.some(
        (o) => o.id === (parsed.partnerOutfitId || bUnit.selectedOutfitId)
      )
        ? parsed.partnerOutfitId || bUnit.selectedOutfitId
        : def.partnerOutfitId,
      partnerRacketId: RACKET_CATALOG.some(
        (r) => r.id === (parsed.partnerRacketId || bUnit.selectedRacketId)
      )
        ? parsed.partnerRacketId || bUnit.selectedRacketId
        : def.partnerRacketId,
      partnerStrikeVfxId: STRIKE_VFX_CATALOG.some(
        (v) => v.id === (parsed.partnerStrikeVfxId || bUnit.selectedStrikeVfxId)
      )
        ? parsed.partnerStrikeVfxId || bUnit.selectedStrikeVfxId
        : def.partnerStrikeVfxId,
      partnerEquippedAccessories: {
        ...def.partnerEquippedAccessories,
        ...(bUnit.equippedAccessories || {}),
        ...(parsed.partnerEquippedAccessories || {})
      },
      partnerAiUpgrades: {
        ...def.partnerAiUpgrades,
        ...(bUnit.aiUpgrades || {}),
        ...(parsed.partnerAiUpgrades || {})
      }
    };

    const progScore = this._computeProgressScore(normalized);
    const rawTs = Number(parsed.updatedAtMs || rawInput.updatedAtMs || 0);
    const rawRev = Number(parsed.revision || rawInput.revision || 0);
    normalized.updatedAtMs = rawTs > 0 ? rawTs : progScore > 0 ? 1000 : 0;
    normalized.revision = rawRev > 0 ? rawRev : progScore > 0 ? 1 : 0;
    return normalized;
  }

  _mergeShopStates(stateA, stateB) {
    const a = this._normalizeStateObject(stateA);
    const b = this._normalizeStateObject(stateB);

    const scoreA = this._computeProgressScore(a);
    const scoreB = this._computeProgressScore(b);
    const tsA = Number(a.updatedAtMs || 0);
    const tsB = Number(b.updatedAtMs || 0);
    const revA = Number(a.revision || 0);
    const revB = Number(b.revision || 0);

    // Determine which state is more recent / active for equipped selections & wallet
    let primary = a;
    let secondary = b;
    if (tsA === 0 && scoreA === 0 && (tsB > 0 || scoreB > 0)) {
      primary = b;
      secondary = a;
    } else if (tsB === 0 && scoreB === 0 && (tsA > 0 || scoreA > 0)) {
      primary = a;
      secondary = b;
    } else if (tsB > tsA) {
      primary = b;
      secondary = a;
    } else if (tsA > tsB) {
      primary = a;
      secondary = b;
    } else if (revB > revA || scoreB > scoreA) {
      primary = b;
      secondary = a;
    }

    // Merge character upgrades taking max level per stat so upgrades are never lost
    const mergedCharUpgrades = {};
    for (const c of CHARACTER_ROSTER) {
      const ua = a.characterUpgrades?.[c.id] || { speed: 1, power: 1, spin: 1, reflex: 1 };
      const ub = b.characterUpgrades?.[c.id] || { speed: 1, power: 1, spin: 1, reflex: 1 };
      mergedCharUpgrades[c.id] = {
        speed: Math.min(10, Math.max(1, Number(ua.speed || 1), Number(ub.speed || 1))),
        power: Math.min(10, Math.max(1, Number(ua.power || 1), Number(ub.power || 1))),
        spin: Math.min(10, Math.max(1, Number(ua.spin || 1), Number(ub.spin || 1))),
        reflex: Math.min(10, Math.max(1, Number(ua.reflex || 1), Number(ub.reflex || 1)))
      };
    }

    // Merge player special skills taking max level
    const mergedSkills = {};
    for (const sk of PLAYER_SPECIAL_SKILLS) {
      mergedSkills[sk.key] = Math.min(
        sk.maxLevel,
        Math.max(1, Number(a.playerSpecialSkills?.[sk.key] || 1), Number(b.playerSpecialSkills?.[sk.key] || 1))
      );
    }

    // Merge partner AI upgrades taking max level
    const mergedPartnerAi = {};
    for (const cfg of PARTNER_AI_UPGRADE_CONFIG) {
      mergedPartnerAi[cfg.key] = Math.min(
        cfg.maxLevel,
        Math.max(1, Number(a.partnerAiUpgrades?.[cfg.key] || 1), Number(b.partnerAiUpgrades?.[cfg.key] || 1))
      );
    }

    // Coins: if both states have the same unlock/upgrade progress score, take max coins;
    // otherwise take primary's coins (unless primary is untouched default 2400 while secondary has real progress)
    let mergedCoins = primary.coins;
    if (scoreA === scoreB) {
      mergedCoins = Math.max(a.coins, b.coins);
    } else if (primary.coins === 2400 && tsA === 0 && scoreB > 0) {
      mergedCoins = b.coins;
    }

    return {
      ...primary,
      coins: mergedCoins,
      updatedAtMs: Math.max(tsA, tsB),
      revision: Math.max(revA, revB),
      selectedMapId: primary.selectedMapId || secondary.selectedMapId || "melbourne_blue",
      unlockedCharacters: Array.from(new Set([...a.unlockedCharacters, ...b.unlockedCharacters])),
      characterUpgrades: mergedCharUpgrades,
      playerSpecialSkills: mergedSkills,
      unlockedOutfits: Array.from(new Set([...a.unlockedOutfits, ...b.unlockedOutfits])),
      unlockedRackets: Array.from(new Set([...a.unlockedRackets, ...b.unlockedRackets])),
      unlockedStrikeVfx: Array.from(new Set([...a.unlockedStrikeVfx, ...b.unlockedStrikeVfx])),
      unlockedAccessories: Array.from(new Set([...a.unlockedAccessories, ...b.unlockedAccessories])),
      partnerAiUpgrades: mergedPartnerAi
    };
  }

  _loadState() {
    let combined = this._getDefaultState();
    const rawCandidates = [];

    try {
      const r3 = localStorage.getItem(SHOP_STORAGE_KEY_V3);
      if (r3) rawCandidates.push(r3);
    } catch {}
    try {
      const r2 = localStorage.getItem(SHOP_STORAGE_KEY);
      if (r2) rawCandidates.push(r2);
    } catch {}
    try {
      const r1 = localStorage.getItem(SHOP_STORAGE_KEY_V1);
      if (r1) rawCandidates.push(r1);
    } catch {}
    try {
      const rs = sessionStorage.getItem(SHOP_STORAGE_KEY_V3);
      if (rs) rawCandidates.push(rs);
    } catch {}
    try {
      if (typeof window !== "undefined" && typeof window.name === "string" && window.name.startsWith("ARGON_SHOP_BACKUP:")) {
        rawCandidates.push(window.name.slice("ARGON_SHOP_BACKUP:".length));
      }
    } catch {}

    for (const raw of rawCandidates) {
      try {
        const parsed = JSON.parse(raw);
        combined = this._mergeShopStates(combined, parsed);
      } catch {}
    }

    // Write unified local state back immediately so v2 and v3 stay in sync
    this._writeLocalMirrors(combined);
    return combined;
  }

  _writeLocalMirrors(stateObj = this.state) {
    try {
      const serialized = JSON.stringify(stateObj);
      localStorage.setItem(SHOP_STORAGE_KEY_V3, serialized);
      localStorage.setItem(SHOP_STORAGE_KEY, serialized);
      sessionStorage.setItem(SHOP_STORAGE_KEY_V3, serialized);
      if (typeof window !== "undefined") {
        window.name = `ARGON_SHOP_BACKUP:${serialized}`;
      }
    } catch {}
    this._writeIndexedDBMirror(stateObj);
  }

  _openIndexedDB() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        resolve(null);
        return;
      }
      try {
        const req = indexedDB.open(IDB_DB_NAME, 1);
        req.onupgradeneeded = () => {
          const dbInst = req.result;
          if (!dbInst.objectStoreNames.contains(IDB_STORE_NAME)) {
            dbInst.createObjectStore(IDB_STORE_NAME);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });
  }

  async _readIndexedDBMirror() {
    try {
      const idb = await this._openIndexedDB();
      if (!idb) return null;
      return await new Promise((resolve) => {
        const tx = idb.transaction(IDB_STORE_NAME, "readonly");
        const store = tx.objectStore(IDB_STORE_NAME);
        const getReq = store.get(IDB_RECORD_KEY);
        getReq.onsuccess = () => resolve(getReq.result || null);
        getReq.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async _writeIndexedDBMirror(stateObj) {
    try {
      const idb = await this._openIndexedDB();
      if (!idb) return;
      const tx = idb.transaction(IDB_STORE_NAME, "readwrite");
      const store = tx.objectStore(IDB_STORE_NAME);
      store.put(stateObj, IDB_RECORD_KEY);
    } catch {}
  }

  _initAsyncAndCloudPersistence() {
    if (typeof window === "undefined") return;

    // 1. Restore from IndexedDB mirror if available
    this._readIndexedDBMirror().then((idbState) => {
      if (idbState && typeof idbState === "object") {
        this._applyIncomingExternalState(idbState, { source: "idb" });
      }
    });

    // 2. Restore & live-sync with Cloud Firestore so deploying the web app (ais-dev <-> ais-pre) never loses progress
    this._syncWithCloudFirestore();

    // 3. Re-sync when user logs in with Google or updates profile name
    if (auth && typeof auth.onAuthStateChanged === "function") {
      auth.onAuthStateChanged((user) => {
        if (user && user.uid) {
          this._syncUserCloudProfile(user.uid, user.displayName);
        }
      });
    }

    // 4. Flush any pending save immediately on pagehide / visibilitychange / online
    const flushNow = () => {
      this._writeLocalMirrors(this.state);
      if (this._cloudSaveTimer) {
        clearTimeout(this._cloudSaveTimer);
        this._cloudSaveTimer = null;
        this._pushStateToCloudNow();
      }
    };
    window.addEventListener("pagehide", flushNow);
    window.addEventListener("beforeunload", flushNow);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushNow();
    });
    window.addEventListener("online", () => {
      this._syncWithCloudFirestore();
    });
  }

  _applyIncomingExternalState(externalState, { source = "cloud" } = {}) {
    if (!externalState || typeof externalState !== "object") return false;
    const beforeSig = JSON.stringify(this.state);
    const merged = this._mergeShopStates(this.state, externalState);
    const afterSig = JSON.stringify(merged);
    if (beforeSig === afterSig) return false;

    this._applyingRemoteState = true;
    this.state = merged;
    this._writeLocalMirrors(this.state);
    this._syncSelectedCharacterToMiiProfile();

    // Also sync selected court map if changed
    if (this.state.selectedMapId) {
      try {
        localStorage.setItem("argon_tennis_selected_map_v1", this.state.selectedMapId);
      } catch {}
    }

    this._notify();
    this._applyingRemoteState = false;
    this._updateCloudSyncStatusLabel(
      source === "cloud"
        ? "☁️ Đã khôi phục & đồng bộ Đội Hình + Xu từ Cloud Firestore"
        : "Đã đồng bộ dữ liệu đội hình"
    );
    return true;
  }

  _updateCloudSyncStatusLabel(text) {
    if (typeof document === "undefined") return;
    const footerNote = document.getElementById("shop-footer-note");
    if (footerNote && text) {
      footerNote.textContent = text;
    }
  }

  async _syncWithCloudFirestore() {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    try {
      await setFirebaseNetworkEnabled(true);
      const vaultRef = doc(db, "players", CLOUD_MASTER_VAULT_DOC_ID);
      const snap = await getDoc(vaultRef);

      if (snap.exists()) {
        const cloudData = snap.data();
        if (cloudData) {
          this._applyIncomingExternalState(cloudData, { source: "cloud" });
        }
      }

      // If our local state has progress that is newer or higher than the cloud vault, push it to the cloud
      const localProgress = this._computeProgressScore(this.state);
      const cloudProgress = snap.exists() ? this._computeProgressScore(this._normalizeStateObject(snap.data())) : 0;
      const cloudRev = snap.exists() ? Number(snap.data()?.revision || snap.data()?.shopState?.revision || 0) : 0;

      if (
        (this.state.updatedAtMs > 0 || localProgress > 0) &&
        (!snap.exists() || localProgress > cloudProgress || this.state.revision > cloudRev)
      ) {
        await this._pushStateToCloudNow();
      }

      // Subscribe to real-time updates on the master cloud vault
      if (!this._unsubCloudVault) {
        this._unsubCloudVault = onSnapshot(
          vaultRef,
          (liveSnap) => {
            if (liveSnap.exists()) {
              this._applyIncomingExternalState(liveSnap.data(), { source: "cloud" });
            }
          },
          () => {}
        );
      }
    } catch {
      // Offline or transient network issue; local mirrors remain active
    }
  }

  async _syncUserCloudProfile(uid, displayName = "TayVot") {
    if (!uid || (typeof navigator !== "undefined" && !navigator.onLine)) return;
    try {
      await setFirebaseNetworkEnabled(true);
      const userRef = doc(db, "players", uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.shopState) {
          this._applyIncomingExternalState(data.shopState, { source: "cloud" });
        }
      }
      if (this._computeProgressScore(this.state) > 0 || this.state.updatedAtMs > 0) {
        this._scheduleCloudPush();
      }
    } catch {}
  }

  _scheduleCloudPush() {
    if (this._applyingRemoteState) return;
    if (this._cloudSaveTimer) clearTimeout(this._cloudSaveTimer);
    this._cloudSaveTimer = setTimeout(() => {
      this._cloudSaveTimer = null;
      this._pushStateToCloudNow();
    }, 350);
  }

  async _pushStateToCloudNow() {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    // Never overwrite cloud with an untouched fresh default state
    if ((this.state.updatedAtMs || 0) === 0 && this._computeProgressScore(this.state) === 0) {
      return;
    }
    try {
      await setFirebaseNetworkEnabled(true);
      const payload = {
        userId: auth.currentUser?.uid || CLOUD_MASTER_VAULT_DOC_ID,
        displayName: auth.currentUser?.displayName || "TayVot",
        skillRating: this.getEffectivePlayerModifiers()?.overallRating || 1000,
        wins: 0,
        losses: 0,
        shopState: this.state,
        selectedMapId: this.state.selectedMapId || "melbourne_blue",
        updatedAtMs: this.state.updatedAtMs || Date.now(),
        revision: this.state.revision || 1,
        updatedAt: new Date().toISOString()
      };

      const writes = [
        setDoc(doc(db, "players", CLOUD_MASTER_VAULT_DOC_ID), payload, { merge: true })
      ];
      const uid = auth.currentUser?.uid;
      if (uid && uid.length >= 4 && uid.length <= 128 && uid !== CLOUD_MASTER_VAULT_DOC_ID) {
        writes.push(
          setDoc(
            doc(db, "players", uid),
            { ...payload, userId: uid },
            { merge: true }
          )
        );
      }
      await Promise.all(writes);
      this._updateCloudSyncStatusLabel(
        "☁️ Đã lưu tự động lên Cloud Firestore — An toàn vĩnh viễn khi Deploy Web"
      );
    } catch {}
  }

  _saveState({ markUserChange = true } = {}) {
    if (markUserChange && !this._applyingRemoteState) {
      this.state.updatedAtMs = Date.now();
      this.state.revision = (Number(this.state.revision) || 0) + 1;
    }
    this._writeLocalMirrors(this.state);
    this._notify();
    if (markUserChange && !this._applyingRemoteState) {
      this._scheduleCloudPush();
    }
  }

  subscribe(fn) {
    if (typeof fn === "function") {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    }
    return () => {};
  }

  _notify() {
    for (const fn of this.listeners) {
      try {
        fn(this.state);
      } catch (e) {
        console.warn("[CharacterShop] listener error:", e);
      }
    }
  }

  addCoins(amount, reason = "") {
    const add = Math.max(0, Math.round(Number(amount) || 0));
    if (add <= 0) return this.state.coins;
    this.state.coins += add;
    this._saveState();
    return this.state.coins;
  }

  getCharacterById(id) {
    return CHARACTER_ROSTER.find((c) => c.id === id) || CHARACTER_ROSTER[0];
  }

  getSelectedCharacter(targetUnit = "player") {
    const id = targetUnit === "partner" ? this.state.partnerCharacterId : this.state.selectedCharacterId;
    return this.getCharacterById(id);
  }

  getOutfitById(id) {
    return OUTFIT_CATALOG.find((o) => o.id === id) || OUTFIT_CATALOG[0];
  }

  getSelectedOutfit(targetUnit = "player") {
    const id = targetUnit === "partner" ? this.state.partnerOutfitId : this.state.selectedOutfitId;
    return this.getOutfitById(id);
  }

  getSelectedRacket(targetUnit = "player") {
    const id = targetUnit === "partner" ? this.state.partnerRacketId : this.state.selectedRacketId;
    return RACKET_CATALOG.find((r) => r.id === id) || RACKET_CATALOG[0];
  }

  getSelectedStrikeVfx(targetUnit = "player") {
    const id = targetUnit === "partner" ? this.state.partnerStrikeVfxId : this.state.selectedStrikeVfxId;
    return STRIKE_VFX_CATALOG.find((v) => v.id === id) || STRIKE_VFX_CATALOG[0];
  }

  getCharacterUpgradeLevels(charId = this.state.selectedCharacterId) {
    if (!this.state.characterUpgrades[charId]) {
      this.state.characterUpgrades[charId] = { speed: 1, power: 1, spin: 1, reflex: 1 };
    }
    return this.state.characterUpgrades[charId];
  }

  getCharacterTotalUpgradeLevel(charId = this.state.selectedCharacterId) {
    const u = this.getCharacterUpgradeLevels(charId);
    return (u.speed || 1) + (u.power || 1) + (u.spin || 1) + (u.reflex || 1);
  }

  getCharacterStarTier(charId = this.state.selectedCharacterId) {
    const char = this.getCharacterById(charId);
    const total = this.getCharacterTotalUpgradeLevel(charId);
    const rarityBoost = char?.rarity === "MYTHIC" ? 2 : char?.rarity === "ROBOT" || char?.rarity === "MASTER" ? 1 : 0;
    if (total >= 28 || rarityBoost >= 2 && total >= 16) return 5;
    if (total >= 20 || rarityBoost >= 2) return 4;
    if (total >= 12 || rarityBoost >= 1) return 3;
    if (total >= 7) return 2;
    return 1;
  }

  getPartnerStarTier() {
    const u = this.state.partnerAiUpgrades;
    const total =
      (u.aiIq || 1) +
      (u.speed || 1) +
      (u.reflex || 1) +
      (u.power || 1) +
      (u.overdrive || 1) +
      (u.magnetNet || 1);
    if (total >= 36) return 5;
    if (total >= 26) return 4;
    if (total >= 16) return 3;
    if (total >= 10) return 2;
    return 1;
  }

  getPartnerAiRankTitle() {
    const char = this.getSelectedCharacter("partner");
    const iq = this.state.partnerAiUpgrades.aiIq || 1;
    const prefix = char?.isRobot ? "ROBOT MECHA" : "AI ĐỒNG ĐỘI";
    if (iq >= 9) return `${prefix} TỐI THƯỢNG (TỰ ĐỘNG 100%)`;
    if (iq >= 7) return `${prefix} CHUYÊN NGHIỆP (BẮT BÀI NHANH)`;
    if (iq >= 4) return `${prefix} BÁN CHUYÊN (CHẶN LƯỚI CHỦ ĐỘNG)`;
    return `${prefix} CƠ BẢN`;
  }

  getUpgradeCost(charId, statKey) {
    const cfg = UPGRADE_STAT_CONFIG.find((s) => s.key === statKey);
    const levels = this.getCharacterUpgradeLevels(charId);
    const curLv = levels[statKey] || 1;
    if (!cfg || curLv >= cfg.maxLevel) return null;
    return cfg.baseCost + (curLv - 1) * cfg.costStep;
  }

  getSpecialSkillCost(skillKey) {
    const cfg = PLAYER_SPECIAL_SKILLS.find((s) => s.key === skillKey);
    const curLv = this.state.playerSpecialSkills[skillKey] || 1;
    if (!cfg || curLv >= cfg.maxLevel) return null;
    return cfg.baseCost + (curLv - 1) * cfg.costStep;
  }

  getPartnerAiUpgradeCost(statKey) {
    const cfg = PARTNER_AI_UPGRADE_CONFIG.find((s) => s.key === statKey);
    const curLv = this.state.partnerAiUpgrades[statKey] || 1;
    if (!cfg || curLv >= cfg.maxLevel) return null;
    return cfg.baseCost + (curLv - 1) * cfg.costStep;
  }

  _computeAccessoryBonuses(accIds = []) {
    const total = { speed: 0, power: 0, spin: 0, reflex: 0, botInterceptBonus: 0, coinBonusPct: 0 };
    if (!Array.isArray(accIds)) return total;
    for (const id of accIds) {
      const item = ACCESSORY_CATALOG.find((a) => a.id === id);
      if (item && item.bonus) {
        total.speed += item.bonus.speed || 0;
        total.power += item.bonus.power || 0;
        total.spin += item.bonus.spin || 0;
        total.reflex += item.bonus.reflex || 0;
        total.botInterceptBonus += item.bonus.botInterceptBonus || 0;
        total.coinBonusPct += item.bonus.coinBonusPct || 0;
      }
    }
    return total;
  }

  getEffectivePlayerModifiers(charId = this.state.selectedCharacterId) {
    const char = this.getCharacterById(charId);
    const mech = char.mechanic || {};
    const upg = this.getCharacterUpgradeLevels(charId);
    const skills = this.state.playerSpecialSkills;
    const racket = this.getSelectedRacket("player");
    const vfx = this.getSelectedStrikeVfx("player");
    const accIds =
      charId === this.state.selectedCharacterId
        ? this.getActiveAccessoryIdsForUnit("player")
        : char.appearance?.defaultAccessories || [];
    const accBonus = this._computeAccessoryBonuses(accIds);

    const speedPoints =
      char.baseStats.speed +
      (upg.speed - 1) * 1.45 +
      (racket.bonus.speed || 0) * 1.2 +
      accBonus.speed * 1.2 +
      ((skills.flashStep || 1) - 1) * 0.85;
    const powerPoints =
      char.baseStats.power +
      (upg.power - 1) * 1.45 +
      (racket.bonus.power || 0) * 1.2 +
      (vfx.powerBonus || 0) * 1.2 +
      accBonus.power * 1.2 +
      ((skills.meteorSmash || 1) - 1) * 0.85;
    const spinPoints =
      char.baseStats.spin +
      (upg.spin - 1) * 1.45 +
      (racket.bonus.spin || 0) * 1.2 +
      (vfx.spinBonus || 0) * 1.2 +
      accBonus.spin * 1.2 +
      ((skills.curveMaster || 1) - 1) * 0.9;
    const reflexPoints =
      char.baseStats.reflex +
      (upg.reflex - 1) * 1.45 +
      (racket.bonus.reflex || 0) * 1.2 +
      (vfx.reflexBonus || 0) * 1.2 +
      accBonus.reflex * 1.2 +
      ((skills.eagleEye || 1) - 1) * 0.95;

    const effSpd = Math.max(0, speedPoints - 4);
    const effPwr = Math.max(0, powerPoints - 4);
    const effSpn = Math.max(0, spinPoints - 4);
    const effRflx = Math.max(0, reflexPoints - 4);

    const maxSpeed =
      (4.72 + Math.min(18, effSpd) * 0.165 + Math.max(0, effSpd - 18) * 0.065) *
      (1 + (mech.speedBurstMult || 0) * 0.48);
    const powerMult = 1.0 + Math.min(18, effPwr) * 0.028 + Math.max(0, effPwr - 18) * 0.015;
    const servePowerMult =
      powerMult + ((skills.hyperServe || 1) - 1) * 0.045 + (mech.serveSpeedBonus || 0);
    const smashPowerMult =
      powerMult + ((skills.meteorSmash || 1) - 1) * 0.055 + (mech.smashSpeedBonus || 0);
    const spinMult =
      1.0 +
      Math.min(18, effSpn) * 0.038 +
      Math.max(0, effSpn - 18) * 0.018 +
      (mech.spinCurveMult || 0) +
      ((skills.curveMaster || 1) - 1) * 0.05;
    const reachAdd = Math.min(
      1.75,
      Math.max(0, effRflx * 0.042 + ((skills.flashStep || 1) - 1) * 0.1 + (mech.reachBonus || 0))
    );
    const sweetSpotAdd = Math.min(
      0.75,
      Math.max(0, effRflx * 0.016 + ((skills.eagleEye || 1) - 1) * 0.05 + (mech.sweetSpotBonus || 0))
    );
    const knockbackImpulse =
      (mech.knockbackImpulse || 0) + ((skills.thunderShock || 1) - 1) * 0.14;
    const coinBonusMult =
      1.0 + (mech.coinBonusPct || 0) + accBonus.coinBonusPct;

    const partnerMods = this.getEffectivePartnerModifiers();
    const rawOvr =
      52 +
      (speedPoints + powerPoints + spinPoints + reflexPoints) * 2.18;

    return {
      mechanicId: mech.id || "standard",
      isRobot: Boolean(char.isRobot),
      isPremium: Boolean(char.isPremium),
      maxSpeed: Number(maxSpeed.toFixed(2)),
      partnerMaxSpeed: partnerMods.maxSpeed,
      powerMult: Number(powerMult.toFixed(3)),
      servePowerMult: Number(servePowerMult.toFixed(3)),
      smashPowerMult: Number(smashPowerMult.toFixed(3)),
      spinMult: Number(spinMult.toFixed(3)),
      reachAdd: Number(reachAdd.toFixed(2)),
      sweetSpotAdd: Number(sweetSpotAdd.toFixed(2)),
      knockbackImpulse: Number(knockbackImpulse.toFixed(2)),
      coinBonusMult: Number(coinBonusMult.toFixed(2)),
      speedPoints: Math.round(speedPoints),
      powerPoints: Math.round(powerPoints),
      spinPoints: Math.round(spinPoints),
      reflexPoints: Math.round(reflexPoints),
      starTier: this.getCharacterStarTier(charId),
      overallRating: Math.max(85, Math.round(rawOvr))
    };
  }

  getEffectivePartnerModifiers() {
    const char = this.getSelectedCharacter("partner");
    const mech = char.mechanic || {};
    const aiUpg = this.state.partnerAiUpgrades;
    const racket = this.getSelectedRacket("partner");
    const vfx = this.getSelectedStrikeVfx("partner");
    const accIds = this.getActiveAccessoryIdsForUnit("partner");
    const accBonus = this._computeAccessoryBonuses(accIds);

    const iqLv = aiUpg.aiIq || 1;
    const spdLv = aiUpg.speed || 1;
    const rflxLv = aiUpg.reflex || 1;
    const pwrLv = aiUpg.power || 1;
    const ovdLv = aiUpg.overdrive || 1;
    const magLv = aiUpg.magnetNet || 1;

    const speedPoints =
      char.baseStats.speed + (spdLv - 1) * 1.4 + (racket.bonus.speed || 0) * 1.2 + accBonus.speed * 1.2 + (ovdLv - 1) * 0.5;
    const powerPoints =
      char.baseStats.power +
      (pwrLv - 1) * 1.4 +
      (racket.bonus.power || 0) * 1.2 +
      (vfx.powerBonus || 0) * 1.2 +
      accBonus.power * 1.2 +
      (ovdLv - 1) * 0.7;
    const spinPoints =
      char.baseStats.spin + (racket.bonus.spin || 0) * 1.2 + (vfx.spinBonus || 0) * 1.2 + accBonus.spin * 1.2;
    const reflexPoints =
      char.baseStats.reflex +
      (rflxLv - 1) * 1.45 +
      (racket.bonus.reflex || 0) * 1.2 +
      (vfx.reflexBonus || 0) * 1.2 +
      accBonus.reflex * 1.2 +
      (magLv - 1) * 0.65;
    const iqPoints = 6 + iqLv * 1.8;

    const effSpd = Math.max(0, speedPoints - 4);
    const effPwr = Math.max(0, powerPoints - 4);
    const effSpn = Math.max(0, spinPoints - 4);

    const autoInterceptChance = Math.min(
      0.99,
      0.46 + iqLv * 0.055 + (mech.botInterceptBonus || 0) + accBonus.botInterceptBonus + (ovdLv - 1) * 0.02
    );
    const interceptReachX =
      1.52 + rflxLv * 0.19 + (magLv - 1) * 0.13 + (mech.reachBonus || 0) * 0.75;
    const interceptReachZ =
      1.2 + rflxLv * 0.11 + (magLv - 1) * 0.09 + (mech.reachBonus || 0) * 0.45;
    const canInterceptPowerShot = rflxLv >= 3 || iqLv >= 4 || Boolean(char.isRobot);
    const maxSpeed =
      (4.35 + Math.min(18, effSpd) * 0.18 + Math.max(0, effSpd - 18) * 0.065) *
      (1 + (mech.speedBurstMult || 0) * 0.48);
    const volleyPowerMult =
      1.0 +
      Math.min(18, effPwr) * 0.032 +
      Math.max(0, effPwr - 18) * 0.015 +
      (mech.botVolleyPowerBonus || 0) +
      (ovdLv - 1) * 0.035;
    const spinMult = 1.0 + Math.min(18, effSpn) * 0.035 + (mech.spinCurveMult || 0);
    const autoSmashChance = Math.min(0.97, 0.28 + (ovdLv - 1) * 0.08 + (char.isRobot ? 0.18 : 0));
    const smartPlacementAccuracy = Math.min(0.99, 0.4 + iqLv * 0.065);

    const rawOvr =
      50 + (speedPoints + powerPoints + spinPoints + reflexPoints + iqPoints * 0.5) * 2.15;

    return {
      mechanicId: mech.id || "standard",
      isRobot: Boolean(char.isRobot),
      aiIqLevel: iqLv,
      autoInterceptChance: Number(autoInterceptChance.toFixed(2)),
      interceptReachX: Number(interceptReachX.toFixed(2)),
      interceptReachZ: Number(interceptReachZ.toFixed(2)),
      canInterceptPowerShot,
      maxSpeed: Number(maxSpeed.toFixed(2)),
      volleyPowerMult: Number(volleyPowerMult.toFixed(3)),
      spinMult: Number(spinMult.toFixed(3)),
      autoSmashChance: Number(autoSmashChance.toFixed(2)),
      smartPlacementAccuracy: Number(smartPlacementAccuracy.toFixed(2)),
      speedPoints: Math.round(speedPoints),
      powerPoints: Math.round(powerPoints),
      spinPoints: Math.round(spinPoints),
      reflexPoints: Math.round(reflexPoints),
      starTier: this.getPartnerStarTier(),
      rankTitle: this.getPartnerAiRankTitle(),
      overallRating: Math.max(85, Math.round(rawOvr))
    };
  }


  unlockOrSelectCharacter(charId, targetUnit = "player") {
    const char = CHARACTER_ROSTER.find((c) => c.id === charId);
    if (!char) return { ok: false, message: "Không tìm thấy nhân vật." };

    if (this.state.unlockedCharacters.includes(charId)) {
      if (targetUnit === "partner") {
        this.state.partnerCharacterId = charId;
        this._saveState();
        return { ok: true, action: "selected", message: `Đã chọn ${char.name} làm Bot Đồng Đội!` };
      } else {
        this.state.selectedCharacterId = charId;
        this._syncSelectedCharacterToMiiProfile();
        this._saveState();
        return { ok: true, action: "selected", message: `Đã chọn nhân vật ${char.name}!` };
      }
    }

    if (this.state.coins < char.price) {
      return {
        ok: false,
        message: `Cần ${char.price.toLocaleString("vi-VN")} Xu để mở khóa ${char.name}.`
      };
    }

    this.state.coins -= char.price;
    this.state.unlockedCharacters.push(charId);
    if (targetUnit === "partner") {
      this.state.partnerCharacterId = charId;
    } else {
      this.state.selectedCharacterId = charId;
      this._syncSelectedCharacterToMiiProfile();
    }
    this._saveState();
    return {
      ok: true,
      action: "unlocked",
      message: `Đã mở khóa ${char.name} và đưa vào đội hình!`
    };
  }

  upgradeCharacterStat(charId, statKey) {
    if (!this.state.unlockedCharacters.includes(charId)) {
      return { ok: false, message: "Hãy mở khóa nhân vật trước khi nâng cấp!" };
    }
    const cost = this.getUpgradeCost(charId, statKey);
    if (cost === null) {
      return { ok: false, message: "Chỉ số này đã đạt cấp tối đa (Lv.10)!" };
    }
    if (this.state.coins < cost) {
      return { ok: false, message: `Cần ${cost.toLocaleString("vi-VN")} Xu để nâng cấp!` };
    }

    this.state.coins -= cost;
    this.state.characterUpgrades[charId][statKey] += 1;
    const newLv = this.state.characterUpgrades[charId][statKey];
    this._syncSelectedCharacterToMiiProfile();
    this._saveState();
    return {
      ok: true,
      newLevel: newLv,
      starTier: this.getCharacterStarTier(charId),
      message: `Nâng cấp thành công lên Lv.${newLv}!`
    };
  }

  upgradePlayerSpecialSkill(skillKey) {
    const cfg = PLAYER_SPECIAL_SKILLS.find((s) => s.key === skillKey);
    if (!cfg) return { ok: false, message: "Không tìm thấy kỹ năng." };
    const cost = this.getSpecialSkillCost(skillKey);
    if (cost === null) {
      return { ok: false, message: "Kỹ năng này đã đạt cấp tối đa (Lv.5)!" };
    }
    if (this.state.coins < cost) {
      return { ok: false, message: `Cần ${cost.toLocaleString("vi-VN")} Xu để nâng cấp kỹ năng!` };
    }
    this.state.coins -= cost;
    this.state.playerSpecialSkills[skillKey] = (this.state.playerSpecialSkills[skillKey] || 1) + 1;
    const newLv = this.state.playerSpecialSkills[skillKey];
    this._syncSelectedCharacterToMiiProfile();
    this._saveState();
    return {
      ok: true,
      newLevel: newLv,
      message: `Đã nâng cấp ${cfg.label} lên Lv.${newLv}!`
    };
  }

  upgradePartnerAiStat(statKey) {
    const cfg = PARTNER_AI_UPGRADE_CONFIG.find((s) => s.key === statKey);
    if (!cfg) return { ok: false, message: "Không tìm thấy chỉ số Bot." };
    const cost = this.getPartnerAiUpgradeCost(statKey);
    if (cost === null) {
      return { ok: false, message: "Chỉ số AI này đã đạt cấp tối đa (Lv.10)!" };
    }
    if (this.state.coins < cost) {
      return { ok: false, message: `Cần ${cost.toLocaleString("vi-VN")} Xu để nâng cấp Bot Đồng Đội!` };
    }
    this.state.coins -= cost;
    this.state.partnerAiUpgrades[statKey] = (this.state.partnerAiUpgrades[statKey] || 1) + 1;
    const newLv = this.state.partnerAiUpgrades[statKey];
    this._syncSelectedCharacterToMiiProfile();
    this._saveState();
    return {
      ok: true,
      newLevel: newLv,
      message: `Bot Đồng Đội: ${cfg.label} đạt Lv.${newLv}!`
    };
  }

  unlockOrSelectOutfit(outfitId, targetUnit = "player") {
    const outfit = OUTFIT_CATALOG.find((o) => o.id === outfitId);
    if (!outfit) return { ok: false, message: "Không tìm thấy trang phục." };

    if (this.state.unlockedOutfits.includes(outfitId)) {
      if (targetUnit === "partner") {
        this.state.partnerOutfitId = outfitId;
      } else {
        this.state.selectedOutfitId = outfitId;
      }
      this._syncSelectedCharacterToMiiProfile();
      this._saveState();
      return {
        ok: true,
        action: "selected",
        message: `Đã mặc ${outfit.name} cho ${targetUnit === "partner" ? "Bot Đồng Đội" : "Nhân Vật Chính"}!`
      };
    }

    if (this.state.coins < outfit.price) {
      return { ok: false, message: `Cần ${outfit.price.toLocaleString("vi-VN")} Xu để mua ${outfit.name}.` };
    }

    this.state.coins -= outfit.price;
    this.state.unlockedOutfits.push(outfitId);
    if (targetUnit === "partner") {
      this.state.partnerOutfitId = outfitId;
    } else {
      this.state.selectedOutfitId = outfitId;
    }
    this._syncSelectedCharacterToMiiProfile();
    this._saveState();
    return {
      ok: true,
      action: "unlocked",
      message: `Đã mở khóa và mặc ${outfit.name}!`
    };
  }

  unlockOrSelectStrikeVfx(vfxId, targetUnit = "player") {
    const vfx = STRIKE_VFX_CATALOG.find((v) => v.id === vfxId);
    if (!vfx) return { ok: false, message: "Không tìm thấy hiệu ứng." };

    if (this.state.unlockedStrikeVfx.includes(vfxId)) {
      if (targetUnit === "partner") {
        this.state.partnerStrikeVfxId = vfxId;
      } else {
        this.state.selectedStrikeVfxId = vfxId;
      }
      this._saveState();
      return {
        ok: true,
        action: "selected",
        message: `Đã trang bị hiệu ứng ${vfx.name} cho ${targetUnit === "partner" ? "Bot Đồng Đội" : "Nhân Vật Chính"}!`
      };
    }

    if (this.state.coins < vfx.price) {
      return { ok: false, message: `Cần ${vfx.price.toLocaleString("vi-VN")} Xu để mở khóa ${vfx.name}.` };
    }

    this.state.coins -= vfx.price;
    this.state.unlockedStrikeVfx.push(vfxId);
    if (targetUnit === "partner") {
      this.state.partnerStrikeVfxId = vfxId;
    } else {
      this.state.selectedStrikeVfxId = vfxId;
    }
    this._saveState();
    return {
      ok: true,
      action: "unlocked",
      message: `Đã mở khóa hiệu ứng 3D ${vfx.name}!`
    };
  }

  unlockOrSelectRacket(racketId, targetUnit = "player") {
    const racket = RACKET_CATALOG.find((r) => r.id === racketId);
    if (!racket) return { ok: false, message: "Không tìm thấy mẫu vợt." };

    if (this.state.unlockedRackets.includes(racketId)) {
      if (targetUnit === "partner") {
        this.state.partnerRacketId = racketId;
      } else {
        this.state.selectedRacketId = racketId;
      }
      this._saveState();
      return {
        ok: true,
        action: "selected",
        message: `Đã trang bị ${racket.name} cho ${targetUnit === "partner" ? "Bot Đồng Đội" : "Nhân Vật Chính"}!`
      };
    }

    if (this.state.coins < racket.price) {
      return { ok: false, message: `Cần ${racket.price.toLocaleString("vi-VN")} Xu để mua ${racket.name}.` };
    }

    this.state.coins -= racket.price;
    this.state.unlockedRackets.push(racketId);
    if (targetUnit === "partner") {
      this.state.partnerRacketId = racketId;
    } else {
      this.state.selectedRacketId = racketId;
    }
    this._saveState();
    return { ok: true, action: "unlocked", message: `Đã mua và trang bị ${racket.name}!` };
  }

  unlockOrToggleAccessory(accId, targetUnit = "player") {
    const acc = ACCESSORY_CATALOG.find((a) => a.id === accId);
    if (!acc) return { ok: false, message: "Không tìm thấy phụ kiện." };

    const char = this.getSelectedCharacter(targetUnit);
    const isDefaultForChar = (char.appearance.defaultAccessories || []).includes(accId);
    const isUnlocked = isDefaultForChar || this.state.unlockedAccessories.includes(accId);
    const equipMap = targetUnit === "partner" ? this.state.partnerEquippedAccessories : this.state.equippedAccessories;
    const activeIds = this.getActiveAccessoryIdsForUnit(targetUnit);

    if (isUnlocked) {
      if (activeIds.includes(accId)) {
        equipMap[acc.slot] = "__none__";
        this._syncSelectedCharacterToMiiProfile();
        this._saveState();
        return { ok: true, action: "unequipped", message: `Đã tháo ${acc.name}.` };
      } else {
        equipMap[acc.slot] = accId;
        this._syncSelectedCharacterToMiiProfile();
        this._saveState();
        return {
          ok: true,
          action: "equipped",
          message: `Đã gắn ${acc.name} cho ${targetUnit === "partner" ? "Bot Đồng Đội" : "Nhân Vật Chính"}!`
        };
      }
    }

    if (this.state.coins < acc.price) {
      return { ok: false, message: `Cần ${acc.price.toLocaleString("vi-VN")} Xu để mua ${acc.name}.` };
    }

    this.state.coins -= acc.price;
    this.state.unlockedAccessories.push(accId);
    equipMap[acc.slot] = accId;
    this._syncSelectedCharacterToMiiProfile();
    this._saveState();
    return { ok: true, action: "unlocked", message: `Đã mua và gắn ${acc.name}!` };
  }

  getActiveAccessoryIdsForUnit(targetUnit = "player") {
    const char = this.getSelectedCharacter(targetUnit);
    const set = new Set(char.appearance.defaultAccessories || []);
    const equipMap = targetUnit === "partner" ? this.state.partnerEquippedAccessories : this.state.equippedAccessories;

    for (const [slot, equippedId] of Object.entries(equipMap)) {
      if (equippedId === "__none__") {
        for (const item of ACCESSORY_CATALOG) {
          if (item.slot === slot) set.delete(item.id);
        }
      } else if (equippedId) {
        for (const item of ACCESSORY_CATALOG) {
          if (item.slot === slot && set.has(item.id) && item.id !== equippedId) {
            set.delete(item.id);
          }
        }
        set.add(equippedId);
      }
    }

    return Array.from(set);
  }

  _syncSelectedCharacterToMiiProfile() {
    const char = this.getSelectedCharacter("player");
    const outfit = this.getSelectedOutfit("player");
    if (!char || !MII_PROFILES?.player1) return;

    const app = char.appearance;
    const toCssHex = (num) => `#${new THREE.Color(num).getHexString()}`;
    const activeGear = this.getActiveAccessoryIdsForUnit("player");
    const shirtHex = outfit && !outfit.isDefault ? outfit.shirtHex : app.shirtHex;
    const shirtDarkHex = outfit && !outfit.isDefault ? outfit.shirtDarkHex : app.shirtDarkHex;

    MII_PROFILES.player1.name = char.name;
    MII_PROFILES.player1.shirtLight = toCssHex(shirtHex);
    MII_PROFILES.player1.shirtDark = toCssHex(shirtDarkHex);
    MII_PROFILES.player1.collarAccent = char.accentCss || toCssHex(shirtHex);
    MII_PROFILES.player1.hairMid = toCssHex(app.hairHex);
    MII_PROFILES.player1.hairLight = toCssHex(new THREE.Color(app.hairHex).offsetHSL(0, 0, 0.12).getHex());
    MII_PROFILES.player1.hairDark = toCssHex(new THREE.Color(app.hairHex).offsetHSL(0, 0, -0.1).getHex());
    MII_PROFILES.player1.skinMid = toCssHex(app.skinHex);
    MII_PROFILES.player1.hairStyle = app.hairStyle || "swept_puffs";
    MII_PROFILES.player1.browTilt = app.browTilt || "confident";
    MII_PROFILES.player1.mouthStyle = app.mouthStyle || "happy_grin";
    MII_PROFILES.player1.glasses = !!(app.glasses || activeGear.includes("visor_cyber"));
    MII_PROFILES.player1.lashes = !!app.lashes;
    MII_PROFILES.player1.isRobot = Boolean(char.isRobot || activeGear.includes("mecha_helmet"));
    MII_PROFILES.player1.mythicCrown = !!(activeGear.includes("crown_gold") || activeGear.includes("samurai_crest"));
    MII_PROFILES.player1.dragonHorns = !!activeGear.includes("dragon_horns");

    // Also sync Partner Bot avatar (player2 in HUD scoreboard)
    const pChar = this.getSelectedCharacter("partner");
    const pOutfit = this.getSelectedOutfit("partner");
    if (pChar && MII_PROFILES?.player2) {
      const pApp = pChar.appearance;
      const pGear = this.getActiveAccessoryIdsForUnit("partner");
      const pShirtHex = pOutfit && !pOutfit.isDefault ? pOutfit.shirtHex : pApp.shirtHex;
      const pShirtDarkHex = pOutfit && !pOutfit.isDefault ? pOutfit.shirtDarkHex : pApp.shirtDarkHex;
      MII_PROFILES.player2.name = pChar.name;
      MII_PROFILES.player2.shirtLight = toCssHex(pShirtHex);
      MII_PROFILES.player2.shirtDark = toCssHex(pShirtDarkHex);
      MII_PROFILES.player2.collarAccent = pChar.accentCss || toCssHex(pShirtHex);
      MII_PROFILES.player2.hairMid = toCssHex(pApp.hairHex);
      MII_PROFILES.player2.hairLight = toCssHex(new THREE.Color(pApp.hairHex).offsetHSL(0, 0, 0.12).getHex());
      MII_PROFILES.player2.hairDark = toCssHex(new THREE.Color(pApp.hairHex).offsetHSL(0, 0, -0.1).getHex());
      MII_PROFILES.player2.skinMid = toCssHex(pApp.skinHex);
      MII_PROFILES.player2.hairStyle = pApp.hairStyle || "round_cap";
      MII_PROFILES.player2.browTilt = pApp.browTilt || "calm";
      MII_PROFILES.player2.mouthStyle = pApp.mouthStyle || "gentle_smile";
      MII_PROFILES.player2.glasses = !!(pApp.glasses || pGear.includes("visor_cyber"));
      MII_PROFILES.player2.lashes = !!pApp.lashes;
      MII_PROFILES.player2.isRobot = Boolean(pChar.isRobot || pGear.includes("mecha_helmet"));
      MII_PROFILES.player2.mythicCrown = !!(pGear.includes("crown_gold") || pGear.includes("samurai_crest"));
      MII_PROFILES.player2.dragonHorns = !!pGear.includes("dragon_horns");
    }

    if (typeof document !== "undefined") {
      renderAllHudMiiAvatars();
      const lobbyAvatar = document.getElementById("lobby-mii-avatar");
      if (lobbyAvatar) renderMiiAvatar(lobbyAvatar, "player1");

      const plateName = document.querySelector("#player-nameplate .plate-name");
      const plateSkill = document.querySelector("#player-nameplate .plate-skill");
      const mods = this.getEffectivePlayerModifiers(char.id);
      if (plateName) plateName.textContent = char.name;
      if (plateSkill) plateSkill.textContent = `OVR ${mods.overallRating} • ★${mods.starTier}`;

      const youTag = document.querySelector(".court-slot-marker.player-marker .you-tag");
      if (youTag) youTag.textContent = `${char.name} + Bot ${pChar.name}`;
    }
  }

  /**
   * Serializes the player's Main Character + Bot Partner squad into a compact object (~180 bytes)
   * for Firebase online 1v1 synchronization.
   */
  getCompactOnlineLoadout() {
    const pCharId = this.state.selectedCharacterId;
    const bCharId = this.state.partnerCharacterId;
    return {
      pChar: pCharId,
      pOut: this.state.selectedOutfitId,
      pRac: this.state.selectedRacketId,
      pVfx: this.state.selectedStrikeVfxId,
      pAcc: this.getActiveAccessoryIdsForUnit("player"),
      pUpg: { ...this.getCharacterUpgradeLevels(pCharId) },
      pSk: { ...this.state.playerSpecialSkills },
      bChar: bCharId,
      bOut: this.state.partnerOutfitId,
      bRac: this.state.partnerRacketId,
      bVfx: this.state.partnerStrikeVfxId,
      bAcc: this.getActiveAccessoryIdsForUnit("partner"),
      bAi: { ...this.state.partnerAiUpgrades }
    };
  }

  getPlayerModifiersFromLoadout(loadout = null) {
    if (!loadout) return this.getEffectivePlayerModifiers();
    const char = this.getCharacterById(loadout.pChar);
    const mech = char.mechanic || {};
    const upg = { speed: 1, power: 1, spin: 1, reflex: 1, ...(loadout.pUpg || {}) };
    const skills = {
      hyperServe: 1,
      flashStep: 1,
      meteorSmash: 1,
      eagleEye: 1,
      curveMaster: 1,
      thunderShock: 1,
      ...(loadout.pSk || {})
    };
    const racket = RACKET_CATALOG.find((r) => r.id === loadout.pRac) || RACKET_CATALOG[0];
    const vfx = STRIKE_VFX_CATALOG.find((v) => v.id === loadout.pVfx) || STRIKE_VFX_CATALOG[0];
    const accIds = Array.isArray(loadout.pAcc) ? loadout.pAcc : char.appearance?.defaultAccessories || [];
    const accBonus = this._computeAccessoryBonuses(accIds);

    const speedPoints =
      char.baseStats.speed +
      (upg.speed - 1) * 1.45 +
      (racket.bonus.speed || 0) * 1.2 +
      accBonus.speed * 1.2 +
      (skills.flashStep - 1) * 0.85;
    const powerPoints =
      char.baseStats.power +
      (upg.power - 1) * 1.45 +
      (racket.bonus.power || 0) * 1.2 +
      (vfx.powerBonus || 0) * 1.2 +
      accBonus.power * 1.2 +
      (skills.meteorSmash - 1) * 0.85;
    const spinPoints =
      char.baseStats.spin +
      (upg.spin - 1) * 1.45 +
      (racket.bonus.spin || 0) * 1.2 +
      (vfx.spinBonus || 0) * 1.2 +
      accBonus.spin * 1.2 +
      (skills.curveMaster - 1) * 0.9;
    const reflexPoints =
      char.baseStats.reflex +
      (upg.reflex - 1) * 1.45 +
      (racket.bonus.reflex || 0) * 1.2 +
      (vfx.reflexBonus || 0) * 1.2 +
      accBonus.reflex * 1.2 +
      (skills.eagleEye - 1) * 0.95;

    const effSpd = Math.max(0, speedPoints - 4);
    const effPwr = Math.max(0, powerPoints - 4);
    const effSpn = Math.max(0, spinPoints - 4);
    const effRflx = Math.max(0, reflexPoints - 4);

    const maxSpeed =
      (4.72 + Math.min(18, effSpd) * 0.165 + Math.max(0, effSpd - 18) * 0.065) *
      (1 + (mech.speedBurstMult || 0) * 0.48);
    const powerMult = 1.0 + Math.min(18, effPwr) * 0.028 + Math.max(0, effPwr - 18) * 0.015;
    const servePowerMult = powerMult + (skills.hyperServe - 1) * 0.045 + (mech.serveSpeedBonus || 0);
    const smashPowerMult = powerMult + (skills.meteorSmash - 1) * 0.055 + (mech.smashSpeedBonus || 0);
    const spinMult =
      1.0 +
      Math.min(18, effSpn) * 0.038 +
      Math.max(0, effSpn - 18) * 0.018 +
      (mech.spinCurveMult || 0) +
      (skills.curveMaster - 1) * 0.05;
    const reachAdd = Math.min(
      1.75,
      Math.max(0, effRflx * 0.042 + (skills.flashStep - 1) * 0.1 + (mech.reachBonus || 0))
    );
    const sweetSpotAdd = Math.min(
      0.75,
      Math.max(0, effRflx * 0.016 + (skills.eagleEye - 1) * 0.05 + (mech.sweetSpotBonus || 0))
    );
    const knockbackImpulse = (mech.knockbackImpulse || 0) + (skills.thunderShock - 1) * 0.14;
    const coinBonusMult = 1.0 + (mech.coinBonusPct || 0) + accBonus.coinBonusPct;

    const totalUpg = (upg.speed || 1) + (upg.power || 1) + (upg.spin || 1) + (upg.reflex || 1);
    const starTier = totalUpg >= 28 ? 5 : totalUpg >= 20 ? 4 : totalUpg >= 12 ? 3 : totalUpg >= 7 ? 2 : 1;
    const partnerMods = this.getPartnerModifiersFromLoadout(loadout);

    return {
      mechanicId: mech.id || "standard",
      isRobot: Boolean(char.isRobot),
      isPremium: Boolean(char.isPremium),
      maxSpeed: Number(maxSpeed.toFixed(2)),
      partnerMaxSpeed: partnerMods.maxSpeed,
      powerMult: Number(powerMult.toFixed(3)),
      servePowerMult: Number(servePowerMult.toFixed(3)),
      smashPowerMult: Number(smashPowerMult.toFixed(3)),
      spinMult: Number(spinMult.toFixed(3)),
      reachAdd: Number(reachAdd.toFixed(2)),
      sweetSpotAdd: Number(sweetSpotAdd.toFixed(2)),
      knockbackImpulse: Number(knockbackImpulse.toFixed(2)),
      coinBonusMult: Number(coinBonusMult.toFixed(2)),
      speedPoints: Math.round(speedPoints),
      powerPoints: Math.round(powerPoints),
      spinPoints: Math.round(spinPoints),
      reflexPoints: Math.round(reflexPoints),
      starTier,
      overallRating: Math.max(
        85,
        Math.round(52 + (speedPoints + powerPoints + spinPoints + reflexPoints) * 2.18)
      )
    };
  }

  getPartnerModifiersFromLoadout(loadout = null) {
    if (!loadout) return this.getEffectivePartnerModifiers();
    const char = this.getCharacterById(loadout.bChar || "maya");
    const mech = char.mechanic || {};
    const aiUpg = {
      aiIq: 2,
      speed: 2,
      reflex: 2,
      power: 2,
      overdrive: 1,
      magnetNet: 1,
      ...(loadout.bAi || {})
    };
    const racket = RACKET_CATALOG.find((r) => r.id === loadout.bRac) || RACKET_CATALOG[0];
    const vfx = STRIKE_VFX_CATALOG.find((v) => v.id === loadout.bVfx) || STRIKE_VFX_CATALOG[0];
    const accIds = Array.isArray(loadout.bAcc) ? loadout.bAcc : char.appearance?.defaultAccessories || [];
    const accBonus = this._computeAccessoryBonuses(accIds);

    const iqLv = aiUpg.aiIq || 1;
    const spdLv = aiUpg.speed || 1;
    const rflxLv = aiUpg.reflex || 1;
    const pwrLv = aiUpg.power || 1;
    const ovdLv = aiUpg.overdrive || 1;
    const magLv = aiUpg.magnetNet || 1;

    const speedPoints =
      char.baseStats.speed + (spdLv - 1) * 1.4 + (racket.bonus.speed || 0) * 1.2 + accBonus.speed * 1.2 + (ovdLv - 1) * 0.5;
    const powerPoints =
      char.baseStats.power +
      (pwrLv - 1) * 1.4 +
      (racket.bonus.power || 0) * 1.2 +
      (vfx.powerBonus || 0) * 1.2 +
      accBonus.power * 1.2 +
      (ovdLv - 1) * 0.7;
    const spinPoints =
      char.baseStats.spin + (racket.bonus.spin || 0) * 1.2 + (vfx.spinBonus || 0) * 1.2 + accBonus.spin * 1.2;
    const reflexPoints =
      char.baseStats.reflex +
      (rflxLv - 1) * 1.45 +
      (racket.bonus.reflex || 0) * 1.2 +
      (vfx.reflexBonus || 0) * 1.2 +
      accBonus.reflex * 1.2 +
      (magLv - 1) * 0.65;
    const iqPoints = 6 + iqLv * 1.8;

    const effSpd = Math.max(0, speedPoints - 4);
    const effPwr = Math.max(0, powerPoints - 4);
    const effSpn = Math.max(0, spinPoints - 4);

    const autoInterceptChance = Math.min(
      0.99,
      0.46 + iqLv * 0.055 + (mech.botInterceptBonus || 0) + accBonus.botInterceptBonus + (ovdLv - 1) * 0.02
    );
    const interceptReachX =
      1.52 + rflxLv * 0.19 + (magLv - 1) * 0.13 + (mech.reachBonus || 0) * 0.75;
    const interceptReachZ =
      1.2 + rflxLv * 0.11 + (magLv - 1) * 0.09 + (mech.reachBonus || 0) * 0.45;
    const canInterceptPowerShot = rflxLv >= 3 || iqLv >= 4 || Boolean(char.isRobot);
    const maxSpeed =
      (4.35 + Math.min(18, effSpd) * 0.18 + Math.max(0, effSpd - 18) * 0.065) *
      (1 + (mech.speedBurstMult || 0) * 0.48);
    const volleyPowerMult =
      1.0 +
      Math.min(18, effPwr) * 0.032 +
      Math.max(0, effPwr - 18) * 0.015 +
      (mech.botVolleyPowerBonus || 0) +
      (ovdLv - 1) * 0.035;
    const spinMult = 1.0 + Math.min(18, effSpn) * 0.035 + (mech.spinCurveMult || 0);
    const autoSmashChance = Math.min(0.97, 0.28 + (ovdLv - 1) * 0.08 + (char.isRobot ? 0.18 : 0));
    const smartPlacementAccuracy = Math.min(0.99, 0.4 + iqLv * 0.065);

    const total = iqLv + spdLv + rflxLv + pwrLv + ovdLv + magLv;
    const starTier = total >= 36 ? 5 : total >= 26 ? 4 : total >= 16 ? 3 : total >= 10 ? 2 : 1;

    return {
      mechanicId: mech.id || "standard",
      isRobot: Boolean(char.isRobot),
      aiIqLevel: iqLv,
      aiIqLv: iqLv,
      powerLv: pwrLv,
      autoInterceptChance: Number(autoInterceptChance.toFixed(2)),
      interceptReachX: Number(interceptReachX.toFixed(2)),
      interceptReachZ: Number(interceptReachZ.toFixed(2)),
      canInterceptPowerShot,
      maxSpeed: Number(maxSpeed.toFixed(2)),
      volleyPowerMult: Number(volleyPowerMult.toFixed(3)),
      spinMult: Number(spinMult.toFixed(3)),
      autoSmashChance: Number(autoSmashChance.toFixed(2)),
      smartPlacementAccuracy: Number(smartPlacementAccuracy.toFixed(2)),
      speedPoints: Math.round(speedPoints),
      powerPoints: Math.round(powerPoints),
      spinPoints: Math.round(spinPoints),
      reflexPoints: Math.round(reflexPoints),
      starTier,
      overallRating: Math.max(
        85,
        Math.round(50 + (speedPoints + powerPoints + spinPoints + reflexPoints + iqPoints * 0.5) * 2.15)
      )
    };
  }

  formatSquadSummaryFromLoadout(loadout = null) {
    const l = loadout || this.getCompactOnlineLoadout();
    const pChar = this.getCharacterById(l.pChar);
    const bChar = this.getCharacterById(l.bChar || "maya");
    const pMods = this.getPlayerModifiersFromLoadout(l);
    const bMods = this.getPartnerModifiersFromLoadout(l);
    return `${pChar.name} (OVR ${pMods.overallRating}) + Bot ${bChar.name} (AI Lv.${bMods.aiIqLevel})`;
  }

  syncMiiProfileSlotFromLoadout(slotKey, loadout, unitRole = "player") {
    if (!loadout || !MII_PROFILES?.[slotKey]) return;
    const charId = unitRole === "partner" ? loadout.bChar || "maya" : loadout.pChar || "ammaar";
    const outId = unitRole === "partner" ? loadout.bOut : loadout.pOut;
    const accList = (unitRole === "partner" ? loadout.bAcc : loadout.pAcc) || [];
    const char = this.getCharacterById(charId);
    const outfit = this.getOutfitById(outId);
    if (!char) return;

    const app = char.appearance;
    const toCssHex = (num) => `#${new THREE.Color(num).getHexString()}`;
    const shirtHex = outfit && !outfit.isDefault ? outfit.shirtHex : app.shirtHex;
    const shirtDarkHex = outfit && !outfit.isDefault ? outfit.shirtDarkHex : app.shirtDarkHex;

    const prof = MII_PROFILES[slotKey];
    prof.name = char.name;
    prof.shirtLight = toCssHex(shirtHex);
    prof.shirtDark = toCssHex(shirtDarkHex);
    prof.collarAccent = char.accentCss || toCssHex(shirtHex);
    prof.hairMid = toCssHex(app.hairHex);
    prof.hairLight = toCssHex(new THREE.Color(app.hairHex).offsetHSL(0, 0, 0.12).getHex());
    prof.hairDark = toCssHex(new THREE.Color(app.hairHex).offsetHSL(0, 0, -0.1).getHex());
    prof.skinMid = toCssHex(app.skinHex);
    prof.hairStyle = app.hairStyle || "swept_puffs";
    prof.browTilt = app.browTilt || "confident";
    prof.mouthStyle = app.mouthStyle || "happy_grin";
    prof.glasses = !!(app.glasses || accList.includes("visor_cyber"));
    prof.lashes = !!app.lashes;
    prof.isRobot = Boolean(char.isRobot || accList.includes("mecha_helmet"));
    prof.mythicCrown = !!(accList.includes("crown_gold") || accList.includes("samurai_crest"));
    prof.dragonHorns = !!accList.includes("dragon_horns");
  }
}

export const characterShopManager = new CharacterShopManager();

/**
 * Applies the selected character's 3D colors, outfit, racket materials, strike VFX config,
 * and 3D upgrade/accessory meshes directly onto an in-game or preview 3D Mii actor.
 * Supports `customLoadout` for syncing remote online players and their Bot Partners!
 */
export function applyCharacter3DUpgradesToActor(
  actor,
  shopManager = characterShopManager,
  { unitRole = null, customLoadout = null } = {}
) {
  if (!actor || !actor.model) return;

  const resolvedUnit =
    unitRole ||
    (actor.role === "player_partner" || actor.role === "opponent_partner"
      ? "partner"
      : "player");

  let char, outfit, racketCfg, strikeVfxCfg, activeGear, starTier;

  if (customLoadout) {
    const isPartner = resolvedUnit === "partner";
    char = shopManager.getCharacterById(isPartner ? customLoadout.bChar || "maya" : customLoadout.pChar || "ammaar");
    outfit = shopManager.getOutfitById(isPartner ? customLoadout.bOut : customLoadout.pOut);
    racketCfg =
      RACKET_CATALOG.find((r) => r.id === (isPartner ? customLoadout.bRac : customLoadout.pRac)) ||
      RACKET_CATALOG[0];
    strikeVfxCfg =
      STRIKE_VFX_CATALOG.find((v) => v.id === (isPartner ? customLoadout.bVfx : customLoadout.pVfx)) ||
      STRIKE_VFX_CATALOG[0];
    const mods = isPartner
      ? shopManager.getPartnerModifiersFromLoadout(customLoadout)
      : shopManager.getPlayerModifiersFromLoadout(customLoadout);
    starTier = mods.starTier || 1;
    const rawAcc = (isPartner ? customLoadout.bAcc : customLoadout.pAcc) || char.appearance.defaultAccessories || [];
    activeGear = new Set(rawAcc);
  } else {
    char = shopManager.getSelectedCharacter(resolvedUnit);
    outfit = shopManager.getSelectedOutfit(resolvedUnit);
    racketCfg = shopManager.getSelectedRacket(resolvedUnit);
    strikeVfxCfg = shopManager.getSelectedStrikeVfx(resolvedUnit);
    activeGear = new Set(shopManager.getActiveAccessoryIdsForUnit(resolvedUnit));
    starTier =
      resolvedUnit === "partner"
        ? shopManager.getPartnerStarTier()
        : shopManager.getCharacterStarTier(char.id);
  }

  const app = char.appearance;

  // Store custom Strike VFX & character mechanic on the actor for SwingVFXManager, BallTrail & Engine
  actor.customStrikeVfx = strikeVfxCfg;
  actor.characterMechanic = char.mechanic || null;
  actor.isRobotUnit = Boolean(char.isRobot);

  const shirtHex = outfit && !outfit.isDefault ? outfit.shirtHex : app.shirtHex;
  const shortsHex = outfit && !outfit.isDefault ? outfit.shortsHex : app.shortsHex;
  const shoeHex = outfit && !outfit.isDefault ? outfit.shoeHex : app.shoeHex;
  const headbandHex = outfit && !outfit.isDefault ? outfit.headbandHex : app.headbandHex;
  const stripeHex = outfit && !outfit.isDefault ? outfit.stripeHex : app.stripeHex;

  // 1. Recolor the 3D Mii character materials
  actor.model.traverse((node) => {
    if (!node.isMesh || !node.material) return;
    if (node.userData?.isCustomUpgradePart) return;

    let ancestorPath = "";
    let p = node;
    while (p && p !== actor.root) {
      ancestorPath += ` ${p.name || ""}`;
      p = p.parent;
    }

    const mats = Array.isArray(node.material) ? node.material : [node.material];
    mats.forEach((mat) => {
      if (!mat || !mat.color) return;
      const tag = `${mat.name || ""} ${node.name || ""} ${ancestorPath}`;
      if (/Eye|Pupil|Mouth|Tongue|Lash|Teeth/i.test(tag)) return;

      if (/Shorts|Pants/i.test(tag)) {
        mat.color.setHex(shortsHex);
      } else if (/Skin|HeadSkin|Ear|Nose|Neck|Hand|Finger|Thumb|Ankle/i.test(tag) && !/Band|Hat|Visor/i.test(tag)) {
        mat.color.setHex(app.skinHex);
      } else if (/Hair|Brow/i.test(tag)) {
        mat.color.setHex(app.hairHex);
      } else if (/Headband|Band|Visor/i.test(tag) && !/White/i.test(tag)) {
        mat.color.setHex(headbandHex);
      } else if ((/Shoe|Sneaker|Foot/i.test(tag) || /foot_l|foot_r/i.test(ancestorPath)) && !/Skin|Sock|Ankle|White/i.test(tag)) {
        mat.color.setHex(shoeHex);
      } else if (/Collar|Stripe|Trim/i.test(tag)) {
        mat.color.setHex(stripeHex);
      } else if (/Shirt|Polo|Torso|Red|Blue|Body/i.test(tag) || /torso/i.test(ancestorPath)) {
        if (/White|Button/i.test(mat.name || "")) {
          mat.color.setHex(stripeHex);
        } else {
          mat.color.setHex(shirtHex);
        }
      }
      mat.needsUpdate = true;
    });
  });

  // 2. Upgrade & customize the 3D Racket mesh
  if (actor.racketMesh) {
    const oldRacketAttachments = [];
    actor.racketMesh.traverse((c) => {
      if (c.userData?.isCustomRacketUpgrade) oldRacketAttachments.push(c);
    });
    oldRacketAttachments.forEach((c) => c.parent && c.parent.remove(c));

    actor.racketMesh.traverse((node) => {
      if (!node.isMesh || !node.material || node.userData?.isCustomRacketUpgrade) return;
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((mat) => {
        if (!mat || !mat.color) return;
        const tag = `${mat.name || ""} ${node.name || ""}`;
        if (/String/i.test(tag)) {
          mat.color.setHex(racketCfg.stringHex);
          if (mat.emissive) {
            mat.emissive.setHex(racketCfg.emissiveHex || 0xffffff);
            mat.emissiveIntensity = Math.max(0.28, racketCfg.emissiveIntensity);
          }
        } else if (/Grip|Handle/i.test(tag)) {
          mat.color.setHex(racketCfg.gripHex);
        } else if (/Silver|Throat/i.test(tag)) {
          mat.color.setHex(racketCfg.throatHex);
          mat.metalness = racketCfg.metalness;
          mat.roughness = racketCfg.roughness;
        } else {
          mat.color.setHex(racketCfg.frameHex);
          mat.metalness = racketCfg.metalness;
          mat.roughness = racketCfg.roughness;
          if (mat.emissive) {
            mat.emissive.setHex(racketCfg.emissiveHex);
            mat.emissiveIntensity = racketCfg.emissiveIntensity * 0.65;
          }
        }
        mat.needsUpdate = true;
      });
    });

    if (
      racketCfg.tierGem ||
      racketCfg.twinFins ||
      racketCfg.quantumCore ||
      racketCfg.dragonSpikes ||
      racketCfg.railgunCoils
    ) {
      const racketUpgradeGroup = new THREE.Group();
      racketUpgradeGroup.name = "CustomRacketUpgradeGroup";
      racketUpgradeGroup.userData.isCustomRacketUpgrade = true;

      const frameMat = new THREE.MeshStandardMaterial({
        color: racketCfg.frameHex,
        metalness: 0.9,
        roughness: 0.14,
        emissive: racketCfg.emissiveHex || racketCfg.frameHex,
        emissiveIntensity: 0.55
      });

      if (racketCfg.tierGem) {
        const coreGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.036, 0), frameMat);
        coreGem.position.set(0, 0.27, 0);
        coreGem.userData.isCustomRacketUpgrade = true;
        racketUpgradeGroup.add(coreGem);
      }

      if (racketCfg.twinFins) {
        const finGeo = new THREE.BoxGeometry(0.018, 0.16, 0.034);
        const finL = new THREE.Mesh(finGeo, frameMat);
        finL.position.set(-0.165, 0.48, 0);
        finL.userData.isCustomRacketUpgrade = true;
        const finR = finL.clone();
        finR.position.x = 0.165;
        finR.userData.isCustomRacketUpgrade = true;
        racketUpgradeGroup.add(finL, finR);
      }

      if (racketCfg.quantumCore) {
        const ringGeo = new THREE.TorusGeometry(0.068, 0.009, 10, 28);
        const ringMat = new THREE.MeshStandardMaterial({
          color: racketCfg.throatHex || 0x22d3ee,
          emissive: racketCfg.throatHex || 0x22d3ee,
          emissiveIntensity: 0.85,
          metalness: 0.9,
          roughness: 0.1
        });
        const qRing = new THREE.Mesh(ringGeo, ringMat);
        qRing.position.set(0, 0.27, 0);
        qRing.userData.isCustomRacketUpgrade = true;
        racketUpgradeGroup.add(qRing);
      }

      if (racketCfg.dragonSpikes) {
        const spikeMat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xea580c,
          emissiveIntensity: 0.75,
          metalness: 0.92,
          roughness: 0.12
        });
        for (const side of [-1, 1]) {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.09, 5), spikeMat);
          spike.position.set(side * 0.175, 0.56, 0);
          spike.rotation.z = -side * 0.45;
          spike.userData.isCustomRacketUpgrade = true;
          racketUpgradeGroup.add(spike);
        }
      }

      if (racketCfg.railgunCoils) {
        const coilMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x22d3ee,
          emissiveIntensity: 0.95,
          metalness: 0.95,
          roughness: 0.08
        });
        const topCrown = new THREE.Mesh(new THREE.OctahedronGeometry(0.032, 0), coilMat);
        topCrown.position.set(0, 0.68, 0);
        topCrown.userData.isCustomRacketUpgrade = true;
        racketUpgradeGroup.add(topCrown);
      }

      actor.racketMesh.add(racketUpgradeGroup);
    }
  }

  // 3. Remove previous custom 3D upgrade parts on character body
  const oldParts = [];
  actor.root.traverse((c) => {
    if (c.userData?.isCustomUpgradePart) oldParts.push(c);
  });
  oldParts.forEach((c) => c.parent && c.parent.remove(c));

  const markUpgradePart = (obj) => {
    obj.traverse((c) => {
      c.userData.isCustomUpgradePart = true;
    });
    return obj;
  };

  // 4. Attach Head 3D Upgrades (Crown, Halo, Visor, Mecha Helmet, Dragon Horns, Samurai Crest)
  const headNode = actor.parts?.head || actor.rig?.headBounceGroup || actor.rig?.neckPivot;
  if (headNode) {
    if (activeGear.has("crown_gold")) {
      const crownGroup = new THREE.Group();
      crownGroup.name = "CustomCrown3D";
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.92,
        roughness: 0.12,
        emissive: 0xb45309,
        emissiveIntensity: 0.35
      });
      const baseRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.155, 0.138, 0.07, 20, 1, false),
        goldMat
      );
      crownGroup.add(baseRing);

      const rubyMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.75,
        metalness: 0.4,
        roughness: 0.1
      });
      const sapphireMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.75,
        metalness: 0.4,
        roughness: 0.1
      });

      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.085, 6), goldMat);
        spike.position.set(Math.cos(ang) * 0.14, 0.072, Math.sin(ang) * 0.14);
        crownGroup.add(spike);

        const tipOrb = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), goldMat);
        tipOrb.position.set(Math.cos(ang) * 0.14, 0.115, Math.sin(ang) * 0.14);
        crownGroup.add(tipOrb);

        const gem = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.018, 0),
          i % 2 === 0 ? rubyMat : sapphireMat
        );
        gem.position.set(Math.cos(ang) * 0.152, 0.0, Math.sin(ang) * 0.152);
        crownGroup.add(gem);
      }
      crownGroup.position.set(0, 0.36, 0.0);
      headNode.add(markUpgradePart(crownGroup));
    }

    if (activeGear.has("mecha_helmet") || char.isRobot) {
      const mechaGroup = new THREE.Group();
      mechaGroup.name = "CustomMechaHelmet3D";
      const accentHex = headbandHex || 0x22d3ee;
      const armorMat = new THREE.MeshStandardMaterial({
        color: shirtHex || 0x0891b2,
        metalness: 0.88,
        roughness: 0.16
      });
      const glowMat = new THREE.MeshStandardMaterial({
        color: accentHex,
        emissive: accentHex,
        emissiveIntensity: 0.9,
        metalness: 0.92,
        roughness: 0.08
      });

      // Forehead Mecha V-Fin Crest
      const crestCenter = new THREE.Mesh(new THREE.OctahedronGeometry(0.042, 0), glowMat);
      crestCenter.position.set(0, 0.31, 0.22);
      mechaGroup.add(crestCenter);

      // Dual Cyber Antennas on sides of head
      for (const side of [-1, 1]) {
        const earPod = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.05, 12), armorMat);
        earPod.rotation.z = Math.PI / 2;
        earPod.position.set(side * 0.25, 0.2, 0.0);
        const antenna = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.19, 6), glowMat);
        antenna.position.set(side * 0.265, 0.31, -0.02);
        antenna.rotation.z = -side * 0.24;
        antenna.rotation.x = -0.18;
        mechaGroup.add(earPod, antenna);
      }

      // Glowing Cyber LED Visor Strip
      const ledVisor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.256, 0.248, 0.072, 24, 1, true, -Math.PI * 0.35, Math.PI * 0.7),
        glowMat
      );
      ledVisor.rotation.y = Math.PI;
      ledVisor.position.set(0, 0.19, 0.03);
      mechaGroup.add(ledVisor);

      headNode.add(markUpgradePart(mechaGroup));
    }

    if (activeGear.has("dragon_horns")) {
      const hornsGroup = new THREE.Group();
      hornsGroup.name = "CustomDragonHorns3D";
      const hornMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        emissive: 0xea580c,
        emissiveIntensity: 0.65,
        metalness: 0.85,
        roughness: 0.15
      });
      for (const side of [-1, 1]) {
        const baseHorn = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.18, 8), hornMat);
        baseHorn.position.set(side * 0.14, 0.36, 0.05);
        baseHorn.rotation.z = -side * 0.48;
        baseHorn.rotation.x = 0.22;
        hornsGroup.add(baseHorn);
      }
      headNode.add(markUpgradePart(hornsGroup));
    }

    if (activeGear.has("samurai_crest")) {
      const crestGroup = new THREE.Group();
      crestGroup.name = "CustomSamuraiCrest3D";
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xd97706,
        emissiveIntensity: 0.6,
        metalness: 0.94,
        roughness: 0.1
      });
      const crescent = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.018, 8, 24, Math.PI * 1.25),
        goldMat
      );
      crescent.rotation.z = Math.PI * 0.875;
      crescent.position.set(0, 0.36, 0.21);
      const centerSun = new THREE.Mesh(new THREE.OctahedronGeometry(0.036, 0), goldMat);
      centerSun.position.set(0, 0.31, 0.22);
      crestGroup.add(crescent, centerSun);
      headNode.add(markUpgradePart(crestGroup));
    }

    if (activeGear.has("cyber_halo")) {
      const haloGroup = new THREE.Group();
      haloGroup.name = "CustomHalo3D";
      const haloMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.95,
        metalness: 0.85,
        roughness: 0.08
      });
      const goldNodeMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1
      });
      const outerTorus = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.016, 12, 40), haloMat);
      outerTorus.rotation.x = Math.PI / 2;
      haloGroup.add(outerTorus);

      const innerTorus = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.008, 10, 32), goldNodeMat);
      innerTorus.rotation.x = Math.PI / 2;
      haloGroup.add(innerTorus);

      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.024, 0), goldNodeMat);
        crystal.position.set(Math.cos(ang) * 0.21, 0, Math.sin(ang) * 0.21);
        haloGroup.add(crystal);
      }
      haloGroup.position.set(0, 0.43, 0);
      headNode.add(markUpgradePart(haloGroup));
    }

    if (activeGear.has("visor_cyber") && !char.isRobot && !activeGear.has("mecha_helmet")) {
      const visorGroup = new THREE.Group();
      visorGroup.name = "CustomVisor3D";
      const visorMat = new THREE.MeshStandardMaterial({
        color: strikeVfxCfg.id !== "vfx_default" ? strikeVfxCfg.trailHex : 0x06b6d4,
        emissive: strikeVfxCfg.id !== "vfx_default" ? strikeVfxCfg.leadHex : 0x22d3ee,
        emissiveIntensity: 0.72,
        metalness: 0.92,
        roughness: 0.06,
        transparent: true,
        opacity: 0.92
      });
      const browMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xd97706,
        emissiveIntensity: 0.45,
        metalness: 0.9,
        roughness: 0.15
      });
      const shield = new THREE.Mesh(
        new THREE.CylinderGeometry(0.258, 0.248, 0.078, 28, 1, true, -Math.PI * 0.36, Math.PI * 0.72),
        visorMat
      );
      shield.rotation.y = Math.PI;
      shield.position.set(0, 0.19, 0.032);
      visorGroup.add(shield);

      const topFrame = new THREE.Mesh(
        new THREE.CylinderGeometry(0.263, 0.263, 0.016, 28, 1, true, -Math.PI * 0.37, Math.PI * 0.74),
        browMat
      );
      topFrame.rotation.y = Math.PI;
      topFrame.position.set(0, 0.23, 0.034);
      visorGroup.add(topFrame);

      headNode.add(markUpgradePart(visorGroup));
    }
  }

  // 5. Attach Distinct 3D Outfit Kit Trim + Torso Accessories
  const torsoNode = actor.parts?.torso || actor.rig?.hipPivot;
  if (torsoNode) {
    // Robot Chest Arc Reactor Core for all Robot units
    if (char.isRobot) {
      const robotChestGroup = new THREE.Group();
      robotChestGroup.name = "CustomRobotChestCore3D";
      const coreColor = headbandHex || 0x22d3ee;
      const coreMat = new THREE.MeshStandardMaterial({
        color: coreColor,
        emissive: coreColor,
        emissiveIntensity: 0.95,
        metalness: 0.9,
        roughness: 0.1
      });
      const arcGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.052, 0), coreMat);
      arcGem.position.set(0, 0.08, 0.226);
      const arcRing = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 20), coreMat);
      arcRing.position.set(0, 0.08, 0.222);
      robotChestGroup.add(arcGem, arcRing);
      torsoNode.add(markUpgradePart(robotChestGroup));
    }

    // 5A. Distinct 3D Outfit Geometry
    if (outfit && !outfit.isDefault) {
      const outfitGroup = new THREE.Group();
      outfitGroup.name = "CustomOutfitKit3D";

      if (outfit.id === "outfit_grand_slam_gold" || outfit.id === "outfit_solar_emperor") {
        const goldTrimMat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xb45309,
          emissiveIntensity: 0.45,
          metalness: 0.92,
          roughness: 0.14
        });
        const navyMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.35,
          metalness: 0.25
        });
        const collarRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 10, 28), goldTrimMat);
        collarRing.rotation.x = Math.PI / 2 + 0.18;
        collarRing.position.set(0, 0.23, 0.02);
        outfitGroup.add(collarRing);

        const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.228, 0.225, 0.048, 24), navyMat);
        belt.position.set(0, -0.15, 0);
        const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.03), goldTrimMat);
        buckle.position.set(0, -0.15, 0.22);
        const crest = new THREE.Mesh(new THREE.OctahedronGeometry(0.036, 0), goldTrimMat);
        crest.position.set(0.09, 0.1, 0.215);
        outfitGroup.add(belt, buckle, crest);
      } else if (outfit.id === "outfit_cyber_stealth" || outfit.id === "outfit_mecha_titanium") {
        const neonCyanMat = new THREE.MeshStandardMaterial({
          color: 0x22d3ee,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.95,
          metalness: 0.85,
          roughness: 0.1
        });
        const darkArmorMat = new THREE.MeshStandardMaterial({
          color: outfit.id === "outfit_mecha_titanium" ? 0x334155 : 0x090d16,
          metalness: 0.88,
          roughness: 0.18
        });
        const chestPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.234, 0.215, 0.26, 12), darkArmorMat);
        chestPlate.position.set(0, 0.06, 0);
        const reactorCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.052, 0), neonCyanMat);
        reactorCore.position.set(0, 0.09, 0.225);
        const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.01, 10, 24), neonCyanMat);
        coreRing.position.set(0, 0.09, 0.222);
        const beltRing = new THREE.Mesh(new THREE.TorusGeometry(0.226, 0.015, 10, 28), neonCyanMat);
        beltRing.rotation.x = Math.PI / 2;
        beltRing.position.set(0, -0.13, 0);
        outfitGroup.add(chestPlate, reactorCore, coreRing, beltRing);
      } else if (outfit.id === "outfit_crimson_dragon") {
        const dragonGoldMat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xd97706,
          emissiveIntensity: 0.55,
          metalness: 0.9,
          roughness: 0.14
        });
        const sash = new THREE.Mesh(new THREE.TorusGeometry(0.232, 0.024, 10, 32), dragonGoldMat);
        sash.rotation.set(0.82, 0.25, -0.62);
        sash.position.set(0, 0.05, 0);
        const dragonBelt = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.055, 24), dragonGoldMat);
        dragonBelt.position.set(0, -0.15, 0);
        const medal = new THREE.Mesh(new THREE.OctahedronGeometry(0.048, 0), dragonGoldMat);
        medal.position.set(0, -0.15, 0.232);
        outfitGroup.add(sash, dragonBelt, medal);
      } else if (outfit.id === "outfit_emerald_storm") {
        const emeraldGlowMat = new THREE.MeshStandardMaterial({
          color: 0x34d399,
          emissive: 0x10b981,
          emissiveIntensity: 0.8,
          metalness: 0.82,
          roughness: 0.14
        });
        const whiteTrimMat = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.2,
          metalness: 0.3
        });
        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.228, 0.015, 10, 28), whiteTrimMat);
        ring1.rotation.x = Math.PI / 2 + 0.16;
        ring1.position.set(0, 0.11, 0);
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.226, 0.016, 10, 28), emeraldGlowMat);
        ring2.rotation.x = Math.PI / 2 + 0.16;
        ring2.position.set(0, 0.03, 0);

        for (const side of [-1, 1]) {
          const hipFin = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.15, 0.09), emeraldGlowMat);
          hipFin.position.set(side * 0.235, -0.12, 0);
          hipFin.rotation.z = -side * 0.28;
          outfitGroup.add(hipFin);
        }
        outfitGroup.add(ring1, ring2);
      } else if (outfit.id === "outfit_royal_galaxy") {
        const neonPinkMat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          emissive: 0xe879f9,
          emissiveIntensity: 0.85,
          metalness: 0.88,
          roughness: 0.12
        });
        const starGoldMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.75,
          metalness: 0.92,
          roughness: 0.1
        });
        const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.013, 12, 36), neonPinkMat);
        orbitRing.rotation.set(Math.PI / 2 - 0.28, 0.22, 0);
        orbitRing.position.set(0, 0.02, 0);
        const chestStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), starGoldMat);
        chestStar.position.set(0, 0.11, 0.226);
        outfitGroup.add(orbitRing, chestStar);
      }

      torsoNode.add(markUpgradePart(outfitGroup));
    }

    // 5B. Gladiator Warrior Shoulder Pads 3D
    if (activeGear.has("shoulder_pads")) {
      const padsGroup = new THREE.Group();
      padsGroup.name = "CustomShoulderPads3D";
      const padMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        metalness: 0.82,
        roughness: 0.18,
        emissive: 0xc2410c,
        emissiveIntensity: 0.35
      });
      const trimMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xb45309,
        emissiveIntensity: 0.3,
        metalness: 0.92,
        roughness: 0.12
      });

      const buildPad = (side) => {
        const g = new THREE.Group();
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(0.125, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
          padMat
        );
        dome.scale.set(1.32, 0.88, 1.18);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.118, 0.015, 10, 24), trimMat);
        rim.rotation.x = Math.PI / 2;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.075, 6), trimMat);
        spike.position.set(side * 0.04, 0.095, 0);
        spike.rotation.z = -side * 0.35;
        g.add(dome, rim, spike);
        g.position.set(side * 0.275, 0.23, 0.0);
        g.rotation.z = -side * 0.32;
        return g;
      };

      padsGroup.add(buildPad(-1), buildPad(1));
      torsoNode.add(markUpgradePart(padsGroup));
    }

    // 5C. Quantum Cyber Wings / Plasma Wings 3D
    if (activeGear.has("cyber_wings") || activeGear.has("plasma_wings")) {
      const isPlasma = activeGear.has("plasma_wings");
      const wingsGroup = new THREE.Group();
      wingsGroup.name = "CustomCyberWings3D";
      const wingMat = new THREE.MeshStandardMaterial({
        color: isPlasma ? 0xd946ef : 0x22d3ee,
        emissive: isPlasma ? 0xa855f7 : 0x06b6d4,
        emissiveIntensity: 0.85,
        metalness: 0.88,
        roughness: 0.1
      });
      const goldCoreMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
        metalness: 0.92,
        roughness: 0.12
      });

      const hub = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), goldCoreMat);
      hub.position.set(0, 0.14, -0.2);
      wingsGroup.add(hub);

      for (const side of [-1, 1]) {
        for (let b = 0; b < 3; b++) {
          const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.4 - b * 0.055, 0.046, 0.016),
            wingMat
          );
          blade.position.set(side * (0.24 + b * 0.03), 0.24 - b * 0.095, -0.21);
          blade.rotation.z = side * (0.48 - b * 0.24);
          blade.rotation.y = -side * 0.22;
          wingsGroup.add(blade);
        }
      }
      torsoNode.add(markUpgradePart(wingsGroup));
    }

    // 5D. Gravity Jet Thrusters 3D
    if (activeGear.has("gravity_thrusters")) {
      const jetGroup = new THREE.Group();
      jetGroup.name = "CustomGravityThrusters3D";
      const podMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.18
      });
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.88
      });
      for (const side of [-1, 1]) {
        const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.068, 0.22, 12), podMat);
        pod.position.set(side * 0.13, 0.14, -0.22);
        pod.rotation.x = 0.22;
        const nozzleFlame = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.16, 10), flameMat);
        nozzleFlame.position.set(side * 0.13, -0.02, -0.25);
        nozzleFlame.rotation.x = Math.PI + 0.22;
        jetGroup.add(pod, nozzleFlame);
      }
      torsoNode.add(markUpgradePart(jetGroup));
    }
  }

  // 6. Attach Hand Wristbands / Thunder Gauntlets 3D
  if (activeGear.has("power_wristbands") || activeGear.has("thunder_gauntlets")) {
    const isThunder = activeGear.has("thunder_gauntlets");
    const wristMat = new THREE.MeshStandardMaterial({
      color: isThunder ? 0xfacc15 : 0x10b981,
      emissive: isThunder ? 0xf59e0b : 0x34d399,
      emissiveIntensity: 0.82,
      metalness: 0.86,
      roughness: 0.14
    });
    const ringMat = new THREE.MeshStandardMaterial({
      color: isThunder ? 0x38bdf8 : 0xfacc15,
      emissive: isThunder ? 0x22d3ee : 0xf59e0b,
      emissiveIntensity: 0.75,
      metalness: 0.9,
      roughness: 0.12
    });
    for (const handPart of [actor.parts?.handL, actor.parts?.handR]) {
      if (!handPart) continue;
      const wristGroup = new THREE.Group();
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.066, 0.07, 16), wristMat);
      const glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.012, 8, 18), ringMat);
      glowRing.rotation.x = Math.PI / 2;
      wristGroup.add(cuff, glowRing);
      wristGroup.position.set(0, 0.025, 0);
      handPart.add(markUpgradePart(wristGroup));
    }
  }

  // 7. Attach Underfoot 3D Aura Ring
  const hasGoldAura = activeGear.has("aura_gold");
  const hasEmeraldAura = activeGear.has("aura_emerald");
  const hasMatrixAura = activeGear.has("cyber_matrix_aura");
  const hasVoidAura = activeGear.has("void_aura");
  const hasVfxAura = strikeVfxCfg.id !== "vfx_default";
  actor.customAuraRing = null;
  if (hasGoldAura || hasEmeraldAura || hasMatrixAura || hasVoidAura || hasVfxAura) {
    const auraColor = hasVoidAura
      ? 0xa855f7
      : hasMatrixAura
      ? 0x06b6d4
      : hasEmeraldAura
      ? 0x10b981
      : hasGoldAura
      ? 0xfacc15
      : strikeVfxCfg.ringHex;

    const auraGroup = new THREE.Group();
    auraGroup.name = "CustomCharacterAuraRing";
    auraGroup.position.set(0, 0.026, 0);

    const outerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.56, 0.68, 36),
      new THREE.MeshBasicMaterial({
        color: auraColor,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    outerRing.rotation.x = -Math.PI / 2;
    auraGroup.add(outerRing);

    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.42, 24),
      new THREE.MeshBasicMaterial({
        color: hasVoidAura ? 0xf5d0fe : hasMatrixAura ? 0x67e8f9 : hasEmeraldAura ? 0x6ee7b7 : 0xfef08a,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    innerRing.rotation.x = -Math.PI / 2;
    auraGroup.add(innerRing);

    if (hasGoldAura || hasVoidAura) {
      const crystalMat = new THREE.MeshBasicMaterial({
        color: hasVoidAura ? 0xe879f9 : 0xfde047,
        transparent: true,
        opacity: 0.82
      });
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const pillar = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.22, 6), crystalMat);
        pillar.position.set(Math.cos(ang) * 0.61, 0.11, Math.sin(ang) * 0.61);
        auraGroup.add(pillar);
      }
    } else if (hasEmeraldAura || hasMatrixAura) {
      const vortexMat = new THREE.MeshBasicMaterial({
        color: hasMatrixAura ? 0x22d3ee : 0x34d399,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide
      });
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        const arc = new THREE.Mesh(
          new THREE.TorusGeometry(0.52, 0.016, 8, 20, Math.PI * 0.35),
          vortexMat
        );
        arc.rotation.x = Math.PI / 2;
        arc.rotation.z = ang;
        arc.position.y = 0.06 + (i % 2) * 0.05;
        auraGroup.add(arc);
      }
    }

    actor.root.add(markUpgradePart(auraGroup));
    actor.customAuraRing = auraGroup;
  }
}


export class CharacterShopUI {
  constructor({ engine }) {
    this.engine = engine;
    this.shop = characterShopManager;
    this.isOpen = false;
    this.targetUnit = "player"; // "player" | "partner" | "duo"
    this.activeTab = "upgrades"; // "upgrades" | "characters" | "outfits" | "vfx" | "gear"
    this.previewPose = "idle";

    this.elModal = document.getElementById("character-shop-modal");
    this.elCanvas = document.getElementById("shop-3d-canvas");

    this.previewRenderer = null;
    this.previewScene = null;
    this.previewCamera = null;
    this.cameraTargetPos = new THREE.Vector3(0, 1.32, 3.45);
    this.cameraTargetLook = new THREE.Vector3(0, 0.88, 0);

    this.previewActorPlayer = null;
    this.previewActorPartner = null;
    this.pedestalPlayer = null;
    this.pedestalPartner = null;

    this.previewAnimator = new MiiBodyAnimator();
    this.previewRacketKinematics = new RacketKinematicsController();
    this.previewFacialFX = null;
    this.previewClock = new THREE.Clock();
    this.previewElapsed = 0;
    this.turntableGroup = null;
    this.userRotationY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this._rafId = 0;

    // 3D Strike VFX Preview Pool inside the Shop Stage
    this.previewVfxBall = null;
    this.previewVfxRings = [];
    this.previewVfxStars = [];
    this.previewVfxTimer = 0;

    this.cameraZoomMode = "wide"; // "wide" | "closeup"
    this.mobileStageCollapsed = false;
    this.studioFloorRing = null;
    this.studioMotes = [];
    this.pedestalPulseTimer = 0;

    this._initDOMBindings();
    this.shop.subscribe(() => {
      this._renderCoinDisplays();
      this._updateUnitSwitcherBadges();
      if (this.isOpen) {
        this._renderShopContent();
        this._syncPreviewCharacter3D();
        this._renderActiveLoadoutDock();
        this._updateStageLiveStats();
      }
      this._applyToLiveGameActors();
    });
  }

  _playSfx(kind, arg) {
    const audio = this.engine?.audioEngine;
    if (!audio) return;
    switch (kind) {
      case "open":
        audio.playShopOpen?.();
        break;
      case "close":
        audio.playShopClose?.();
        break;
      case "coin":
        audio.playCoinClaim?.();
        break;
      case "upgrade":
        audio.playStatUpgrade?.(arg || 1);
        break;
      case "unlock":
        audio.playItemUnlock?.();
        break;
      case "equip":
        audio.playItemEquip?.();
        break;
      case "error":
        audio.playErrorBuzz?.();
        break;
      default:
        audio.playUiClick?.(arg || "default");
        break;
    }
  }

  _spawnCoinBurstFX(sourceEl, labelText = "+500 XU") {
    const walletEl = document.getElementById("shop-coin-wallet-pill");
    if (walletEl) {
      walletEl.classList.remove("wallet-pulse");
      void walletEl.offsetWidth;
      walletEl.classList.add("wallet-pulse");
    }
    if (!sourceEl || typeof document === "undefined") return;
    const rect = sourceEl.getBoundingClientRect();
    const floater = document.createElement("div");
    floater.className = "shop-coin-floater";
    floater.textContent = labelText;
    floater.style.left = `${Math.round(rect.left + rect.width * 0.5)}px`;
    floater.style.top = `${Math.round(rect.top)}px`;
    document.body.appendChild(floater);
    setTimeout(() => {
      floater.remove();
    }, 950);
  }

  _initDOMBindings() {
    const openBtns = [
      document.getElementById("btn-title-shop"),
      document.getElementById("btn-hud-shop")
    ];
    openBtns.forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.open();
        });
      }
    });

    const closeBtns = [
      document.getElementById("btn-close-shop-x"),
      document.getElementById("btn-close-shop"),
      document.getElementById("btn-close-shop-footer")
    ];
    closeBtns.forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", () => this.close());
      }
    });

    if (this.elModal) {
      this.elModal.addEventListener("click", (e) => {
        if (e.target === this.elModal) {
          this.close();
        }
      });
    }

    // Free training coins button
    const btnFreeCoins = document.getElementById("btn-shop-claim-coins");
    if (btnFreeCoins) {
      btnFreeCoins.addEventListener("click", () => {
        this.shop.addCoins(2500, "training_bonus");
        this._playSfx("coin");
        this._spawnCoinBurstFX(btnFreeCoins, "+2.500 XU");
        this._showToast("Đã nhận +2.500 Xu quỹ tài trợ tập luyện & CLB!");
      });
    }

    // Camera Zoom Toggle (Wide vs Close-Up Inspection)
    const btnCamZoom = document.getElementById("btn-shop-cam-zoom");
    if (btnCamZoom) {
      btnCamZoom.addEventListener("click", () => {
        this.cameraZoomMode = this.cameraZoomMode === "wide" ? "closeup" : "wide";
        const lbl = document.getElementById("shop-cam-zoom-label");
        if (lbl) {
          lbl.textContent = this.cameraZoomMode === "closeup" ? "Cận Cảnh" : "Góc Rộng";
        }
        btnCamZoom.classList.toggle("active", this.cameraZoomMode === "closeup");
        this._updateStageCameraFraming(false);
      });
    }

    // Mobile 3D Stage Collapse/Expand Toggle
    const btnToggleMobileStage = document.getElementById("btn-shop-toggle-stage-mobile");
    if (btnToggleMobileStage) {
      btnToggleMobileStage.addEventListener("click", () => {
        this.mobileStageCollapsed = !this.mobileStageCollapsed;
        const panel = document.getElementById("shop-stage-panel");
        if (panel) {
          panel.classList.toggle("stage-collapsed-mobile", this.mobileStageCollapsed);
        }
        const lbl = document.getElementById("shop-stage-collapse-label");
        if (lbl) {
          lbl.textContent = this.mobileStageCollapsed ? "Mở Sân 3D" : "Thu gọn 3D";
        }
      });
    }

    // Unit Switcher (Nhân Vật Chính vs Bot Đồng Đội vs Đội Hình 2 Người)
    document.querySelectorAll("[data-shop-unit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const unit = btn.getAttribute("data-shop-unit") || "player";
        this.setTargetUnit(unit);
      });
    });

    // Shop tabs
    document.querySelectorAll("[data-shop-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-shop-tab") || "upgrades";
        this.switchTab(tab);
      });
    });

    // 3D Pose Preview buttons
    document.querySelectorAll("[data-shop-pose]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pose = btn.getAttribute("data-shop-pose") || "idle";
        this.triggerPreviewPose(pose);
        document.querySelectorAll("[data-shop-pose]").forEach((b) => {
          b.classList.toggle("active", b.getAttribute("data-shop-pose") === pose);
        });
      });
    });

    this._renderCoinDisplays();
    this._updateUnitSwitcherBadges();
  }

  switchTab(tabName) {
    this.activeTab = tabName || "upgrades";
    document.querySelectorAll("[data-shop-tab]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-shop-tab") === this.activeTab);
    });
    this._renderShopContent();
    this._renderActiveLoadoutDock();
    const container = document.getElementById("shop-tab-content");
    if (container) container.scrollTop = 0;
  }

  setTargetUnit(unit = "player") {
    this.targetUnit = unit;
    document.querySelectorAll("[data-shop-unit]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-shop-unit") === unit);
    });
    this.userRotationY = 0;
    this._updateStageCameraFraming();
    this._syncPreviewCharacter3D();
    this._renderShopContent();
    this._renderActiveLoadoutDock();
    this._updateStageLiveStats();
  }

  _EffectiveEditUnit() {
    return this.targetUnit === "partner" ? "partner" : "player";
  }

  _updateUnitSwitcherBadges() {
    const pMods = this.shop.getEffectivePlayerModifiers();
    const bMods = this.shop.getEffectivePartnerModifiers();

    const elPlayerOvr = document.getElementById("shop-unit-player-ovr");
    if (elPlayerOvr) {
      elPlayerOvr.textContent = `OVR ${pMods.overallRating}`;
    }
    const elPartnerOvr = document.getElementById("shop-unit-partner-ovr");
    if (elPartnerOvr) {
      elPartnerOvr.textContent = `AI Lv.${bMods.aiIqLevel}`;
    }
  }

  _showToast(msg) {
    const toast = document.getElementById("lobby-toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("hidden", "fading-out");
    toast.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.add("fading-out");
      setTimeout(() => {
        toast.classList.remove("show", "fading-out");
        toast.classList.add("hidden");
      }, 300);
    }, 2200);
  }

  _refreshCoinsBadges() {
    this._renderCoinDisplays();
  }

  _renderCoinDisplays() {
    const coins = this.shop.state.coins;
    document.querySelectorAll("[data-shop-coins]").forEach((el) => {
      el.textContent = coins.toLocaleString("vi-VN");
    });
  }

  open() {
    if (!this.elModal) return;
    this.isOpen = true;
    this.elModal.classList.remove("hidden");
    this._playSfx("open");
    this._renderCoinDisplays();
    this._updateUnitSwitcherBadges();
    this._renderShopContent();
    this._renderActiveLoadoutDock();
    this._updateStageLiveStats();
    this._ensure3DPreviewScene();
    this._updateStageCameraFraming(true);
    this._syncPreviewCharacter3D();
    this.previewClock.start();
    this._startPreviewLoop();
  }

  close() {
    if (!this.elModal) return;
    this.isOpen = false;
    this._playSfx("close");
    this.elModal.classList.add("hidden");
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }
    this._applyToLiveGameActors();
    if (this.engine) {
      this.engine._staticModalFrameRendered = false;
    }
  }

  _ensure3DPreviewScene() {
    if (this.previewRenderer || !this.elCanvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas: this.elCanvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.previewRenderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090f1a);
    scene.fog = new THREE.FogExp2(0x090f1a, 0.065);
    this.previewScene = scene;

    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {}

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
    camera.position.set(0, 1.32, 3.45);
    camera.lookAt(0, 0.88, 0);
    this.previewCamera = camera;

    // 3-Point Pro Locker Room Lighting
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x064e3b, 1.35);
    hemi.position.set(0, 8, 0);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.45);
    keyLight.position.set(3.2, 5.2, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    const d = 2.6;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-3.0, 3.0, -2.8);
    scene.add(rimLight);

    const goldFill = new THREE.DirectionalLight(0xf59e0b, 0.75);
    goldFill.position.set(2.5, 1.4, -2.2);
    scene.add(goldFill);

    // Master Turntable Group holding both Player 1 and Bot Partner Pedestals
    const turntable = new THREE.Group();
    this.turntableGroup = turntable;
    scene.add(turntable);

    const buildCourtPedestal = (rimColorHex) => {
      const group = new THREE.Group();
      const pedestalBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.76, 0.86, 0.12, 40),
        new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.75, roughness: 0.25 })
      );
      pedestalBase.position.y = -0.06;
      pedestalBase.receiveShadow = true;
      group.add(pedestalBase);

      const courtTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.71, 0.71, 0.02, 40),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.68, metalness: 0.06 })
      );
      courtTop.position.y = 0.005;
      courtTop.receiveShadow = true;
      group.add(courtTop);

      const whiteLine = new THREE.Mesh(
        new THREE.PlaneGeometry(1.22, 0.042),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      whiteLine.rotation.x = -Math.PI / 2;
      whiteLine.position.set(0, 0.017, 0.22);
      group.add(whiteLine);

      const rimGlow = new THREE.Mesh(
        new THREE.TorusGeometry(0.74, 0.016, 12, 56),
        new THREE.MeshBasicMaterial({ color: rimColorHex })
      );
      rimGlow.rotation.x = Math.PI / 2;
      rimGlow.position.y = 0.012;
      group.add(rimGlow);
      return group;
    };

    this.pedestalPlayer = buildCourtPedestal(0xf59e0b);
    this.pedestalPartner = buildCourtPedestal(0x06b6d4);
    turntable.add(this.pedestalPlayer, this.pedestalPartner);

    // Outer Rotating Broadcast Turntable Ring
    const outerRing = new THREE.Mesh(
      new THREE.RingGeometry(1.42, 1.48, 64),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide
      })
    );
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = -0.04;
    scene.add(outerRing);
    this.studioFloorRing = outerRing;

    // Floating Atmospheric Stadium Light Motes
    const moteGeo = new THREE.SphereGeometry(0.018, 8, 8);
    this.studioMotes = [];
    for (let i = 0; i < 16; i++) {
      const moteMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xfbbf24 : 0x38bdf8,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const mote = new THREE.Mesh(moteGeo, moteMat);
      const angle = (i / 16) * Math.PI * 2;
      const radius = 0.85 + (i % 3) * 0.45;
      mote.position.set(
        Math.cos(angle) * radius,
        0.25 + (i % 5) * 0.38,
        Math.sin(angle) * radius - 0.2
      );
      scene.add(mote);
      this.studioMotes.push({
        mesh: mote,
        baseY: mote.position.y,
        speed: 0.9 + (i % 4) * 0.35,
        phase: i * 0.7
      });
    }

    // Build 3D Strike VFX Preview Objects inside the Shop Scene
    this._initShopPreviewVFXPool(scene);

    this.previewFacialFX = new MiiFacialFXController(scene);

    // Pointer Drag to Rotate 360° (without blocking vertical touch scrolling)
    this.elCanvas.addEventListener("pointerdown", (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
    });
    window.addEventListener("pointermove", (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - (this.dragStartY ?? e.clientY);
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      if (Math.abs(dx) >= Math.abs(dy) * 0.6) {
        this.userRotationY += dx * 0.012;
      }
    });
    const endDrag = () => {
      this.isDragging = false;
    };
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
  }

  _initShopPreviewVFXPool(scene) {
    // Glowing 3D Tennis Ball + Shockwave Rings + Elemental Star Burst for live VFX testing in shop
    const ballGroup = new THREE.Group();
    const ballCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 20, 20),
      new THREE.MeshStandardMaterial({
        color: 0xdfff00,
        emissive: 0xfacc15,
        emissiveIntensity: 0.75,
        roughness: 0.25
      })
    );
    const ballAura = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 18, 18),
      new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    ballGroup.add(ballCore, ballAura);
    ballGroup.visible = false;
    scene.add(ballGroup);
    this.previewVfxBall = {
      group: ballGroup,
      core: ballCore,
      aura: ballAura,
      vel: new THREE.Vector3(),
      startPos: new THREE.Vector3()
    };

    const ringGeo = new THREE.RingGeometry(0.78, 1.0, 32);
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(ringGeo, mat);
      mesh.visible = false;
      scene.add(mesh);
      this.previewVfxRings.push({
        mesh,
        mat,
        active: false,
        age: 0,
        delay: i * 0.055,
        duration: 0.38,
        maxScale: 0.55 + i * 0.22
      });
    }

    const starGeo = new THREE.OctahedronGeometry(0.045, 0);
    for (let i = 0; i < 24; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(starGeo, mat);
      mesh.visible = false;
      scene.add(mesh);
      this.previewVfxStars.push({
        mesh,
        mat,
        vel: new THREE.Vector3(),
        age: 0,
        maxAge: 0.45,
        active: false
      });
    }
  }

  _triggerShopStrikeVfxBurst(actor, vfxCfg) {
    if (!actor || !this.previewScene) return;
    const contactPos = actor.root.position.clone().add(new THREE.Vector3(0.32, 1.08, 0.42));

    if (this.previewVfxBall) {
      this.previewVfxBall.group.position.copy(contactPos);
      this.previewVfxBall.startPos.copy(contactPos);
      this.previewVfxBall.vel.set(0.18, 0.35, 3.6);
      this.previewVfxBall.core.material.color.setHex(vfxCfg.ballMainHex || 0xffffff);
      this.previewVfxBall.core.material.emissive.setHex(vfxCfg.leadHex || 0xfacc15);
      this.previewVfxBall.aura.material.color.setHex(vfxCfg.trailHex || 0xf97316);
      this.previewVfxBall.group.visible = true;
      this.previewVfxTimer = 0.52;
    }

    const ringCount = vfxCfg.shockwaveCount || 2;
    this.previewVfxRings.forEach((r, idx) => {
      if (idx < ringCount) {
        r.active = true;
        r.age = -r.delay;
        r.mesh.position.copy(contactPos);
        r.mesh.scale.setScalar(0.08);
        r.mat.color.setHex(idx % 2 === 0 ? vfxCfg.ringHex : vfxCfg.leadHex);
        r.mat.opacity = 0.9;
        r.mesh.visible = true;
      } else {
        r.active = false;
        r.mesh.visible = false;
      }
    });

    const palette = vfxCfg.starHexes || [0xfacc15, 0x38bdf8, 0xffffff];
    this.previewVfxStars.forEach((s, idx) => {
      s.active = true;
      s.age = 0;
      s.maxAge = 0.34 + Math.random() * 0.22;
      const ang = (idx / this.previewVfxStars.length) * Math.PI * 2;
      const spd = 1.4 + Math.random() * 1.9;
      s.vel.set(Math.cos(ang) * spd, Math.sin(ang) * spd * 0.8 + 0.5, 0.8 + Math.random() * 1.4);
      s.mesh.position.copy(contactPos);
      s.mat.color.setHex(palette[idx % palette.length]);
      s.mat.opacity = 1;
      s.mesh.visible = true;
    });
  }

  _updateShopStrikeVfx(dt) {
    if (this.previewVfxTimer > 0 && this.previewVfxBall) {
      this.previewVfxTimer = Math.max(0, this.previewVfxTimer - dt);
      this.previewVfxBall.group.position.addScaledVector(this.previewVfxBall.vel, dt);
      this.previewVfxBall.aura.scale.setScalar(1 + Math.sin(this.previewElapsed * 28) * 0.22);
      if (this.previewVfxTimer <= 0) {
        this.previewVfxBall.group.visible = false;
      }
    }

    for (const r of this.previewVfxRings) {
      if (!r.active) continue;
      r.age += dt;
      if (r.age < 0) continue;
      const t = r.age / r.duration;
      if (t >= 1) {
        r.active = false;
        r.mesh.visible = false;
      } else {
        const s = 0.1 + t * r.maxScale;
        r.mesh.scale.setScalar(s);
        if (this.previewCamera) r.mesh.lookAt(this.previewCamera.position);
        r.mat.opacity = (1 - t) * 0.85;
      }
    }

    for (const s of this.previewVfxStars) {
      if (!s.active) continue;
      s.age += dt;
      const t = s.age / s.maxAge;
      if (t >= 1) {
        s.active = false;
        s.mesh.visible = false;
      } else {
        s.vel.y -= 3.2 * dt;
        s.mesh.position.addScaledVector(s.vel, dt);
        s.mesh.rotation.x += 9 * dt;
        s.mesh.rotation.y += 11 * dt;
        s.mesh.scale.setScalar(Math.max(0.1, 1 - t * 0.75));
        s.mat.opacity = 1 - t;
      }
    }
  }

  _updateStageCameraFraming(snap = false) {
    const isClose = this.cameraZoomMode === "closeup";
    const swayX = Math.sin(this.previewElapsed * 0.85) * 0.028;
    const swayY = Math.cos(this.previewElapsed * 1.1) * 0.014;

    const aspect = this.previewCamera?.aspect || 1.2;
    // When viewport is wide/short (e.g. mobile top stage), pull camera back slightly so head-to-toe fits cleanly
    const widePullback = aspect > 1.35 ? Math.min(0.65, (aspect - 1.35) * 0.38) : 0;

    if (this.targetUnit === "duo") {
      this.cameraTargetPos.set(
        swayX,
        (isClose ? 1.24 : 1.18) + swayY,
        (isClose ? 3.55 : 4.45) + widePullback
      );
      this.cameraTargetLook.set(0, isClose ? 1.05 : 0.94, 0);
    } else {
      this.cameraTargetPos.set(
        swayX,
        (isClose ? 1.26 : 1.16) + swayY,
        (isClose ? 2.75 : 3.92) + widePullback
      );
      this.cameraTargetLook.set(0, isClose ? 1.12 : 0.96, 0);
    }

    if (this.pedestalPlayer && this.pedestalPartner) {
      if (this.targetUnit === "duo") {
        this.pedestalPlayer.visible = true;
        this.pedestalPartner.visible = true;
        this.pedestalPlayer.position.set(-0.64, 0, 0.06);
        this.pedestalPartner.position.set(0.64, 0, -0.06);
      } else if (this.targetUnit === "partner") {
        this.pedestalPlayer.visible = false;
        this.pedestalPartner.visible = true;
        this.pedestalPartner.position.set(0, 0, 0);
      } else {
        this.pedestalPlayer.visible = true;
        this.pedestalPartner.visible = false;
        this.pedestalPlayer.position.set(0, 0, 0);
      }
    }

    if (snap && this.previewCamera) {
      this.previewCamera.position.copy(this.cameraTargetPos);
      this.previewCamera.lookAt(this.cameraTargetLook);
    }
  }

  _buildArticulatedFallbackMiiModel() {
    const model = new THREE.Group();
    const torso = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.22, 0.42, 12, 18),
      new THREE.MeshStandardMaterial({ name: "Shirt", color: 0xf64a35, roughness: 0.4 })
    );
    torso.name = "torso";
    torso.position.set(0, 0.76, 0);
    model.add(torso);

    const head = new THREE.Group();
    head.name = "head";
    head.position.set(0, 1.22, 0);
    const skull = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 24, 20),
      new THREE.MeshStandardMaterial({ name: "Skin", color: 0xffdfc4, roughness: 0.36 })
    );
    skull.name = "HeadSkin";
    skull.position.set(0, 0.18, 0);
    head.add(skull);

    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.252, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({ name: "Hair", color: 0x4a2812, roughness: 0.38 })
    );
    hair.position.set(0, 0.2, -0.01);
    head.add(hair);

    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.246, 0.246, 0.06, 24),
      new THREE.MeshStandardMaterial({ name: "Headband", color: 0xffffff, roughness: 0.32 })
    );
    band.position.set(0, 0.27, 0);
    head.add(band);
    model.add(head);

    const handMat = new THREE.MeshStandardMaterial({ name: "Skin", color: 0xffdfc4, roughness: 0.36 });
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), handMat);
    handL.name = "hand_l";
    handL.position.set(-0.33, 0.8, 0.1);
    model.add(handL);

    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), handMat);
    handR.name = "hand_r";
    handR.position.set(0.33, 0.82, 0.14);
    model.add(handR);

    const shoeMat = new THREE.MeshStandardMaterial({ name: "Shoe", color: 0xe83b28, roughness: 0.35 });
    const footL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.1, 0.24), shoeMat);
    footL.name = "foot_l";
    footL.position.set(-0.105, 0.08, 0.02);
    model.add(footL);

    const footR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.1, 0.24), shoeMat);
    footR.name = "foot_r";
    footR.position.set(0.105, 0.08, 0.02);
    model.add(footR);

    return model;
  }

  _buildFallbackRacketModel() {
    const group = new THREE.Group();
    const grip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.024, 0.24, 12),
      new THREE.MeshStandardMaterial({ name: "Grip", color: 0x1e293b, roughness: 0.55 })
    );
    grip.position.y = 0.12;
    group.add(grip);

    const frame = new THREE.Mesh(
      new THREE.TorusGeometry(0.17, 0.018, 12, 28),
      new THREE.MeshStandardMaterial({ name: "BlueHoop", color: 0x2563eb, metalness: 0.65, roughness: 0.22 })
    );
    frame.scale.set(0.88, 1.15, 1);
    frame.position.y = 0.48;
    group.add(frame);

    const strings = new THREE.Mesh(
      new THREE.CircleGeometry(0.155, 24),
      new THREE.MeshStandardMaterial({
        name: "String",
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide
      })
    );
    strings.scale.set(0.86, 1.13, 1);
    strings.position.y = 0.48;
    group.add(strings);
    return group;
  }

  _cloneCleanInGameMiiModel() {
    const srcActor = this.engine?.player;
    if (!srcActor || !srcActor.model) {
      return this._buildArticulatedFallbackMiiModel();
    }

    const rawClone = srcActor.model.clone(true);
    const cleanModel = new THREE.Group();
    const partNames = ["torso", "head", "hand_l", "hand_r", "foot_l", "foot_r"];

    for (const pName of partNames) {
      let found = null;
      rawClone.traverse((node) => {
        if (found) return;
        const n = (node.name || "").trim();
        if (new RegExp(`^${pName}(\\.?0*\\d+)?$`, "i").test(n)) {
          found = node;
        }
      });
      if (found) {
        const partClone = found.clone(true);
        const toStrip = [];
        partClone.traverse((c) => {
          if (c.name === "MiiDynamicFaceGroup" || c.userData?.isCustomUpgradePart) {
            toStrip.push(c);
          }
        });
        toStrip.forEach((c) => c.parent && c.parent.remove(c));

        if (found.userData?.basePos) partClone.position.copy(found.userData.basePos);
        if (found.userData?.baseRot) partClone.rotation.copy(found.userData.baseRot);
        cleanModel.add(partClone);
      }
    }

    if (cleanModel.children.length === 0) {
      return this._buildArticulatedFallbackMiiModel();
    }
    return cleanModel;
  }

  _cloneCleanInGameRacket() {
    const srcRacket = this.engine?.player?.racketMesh;
    if (!srcRacket) return this._buildFallbackRacketModel();
    const racketClone = srcRacket.clone(true);
    const toRemove = [];
    racketClone.traverse((c) => {
      if (c.userData?.isCustomRacketUpgrade) toRemove.push(c);
    });
    toRemove.forEach((c) => c.parent && c.parent.remove(c));
    return racketClone;
  }

  _createPreviewActorInstance(role = "player") {
    const actor = {
      role,
      sideSign: -1,
      root: new THREE.Group(),
      model: null,
      parts: {},
      racketPivot: new THREE.Group(),
      racketMesh: null,
      shadowBlob: null,
      pos: new THREE.Vector3(0, 0, 0),
      vel: new THREE.Vector3(0, 0, 0),
      targetPos: new THREE.Vector3(0, 0, 0),
      maxSpeed: 4.8,
      stridePhase: 0,
      swingTimer: 0,
      swingDuration: 0.36,
      swingCooldown: 0,
      swingType: "forehand",
      arcVisibleTimer: 0
    };

    const miiModel = this._cloneCleanInGameMiiModel();
    miiModel.traverse((s) => {
      if (s.isMesh) {
        s.castShadow = true;
        s.receiveShadow = true;
      }
      s.userData.basePos = s.position.clone();
      s.userData.baseRot = s.rotation.clone();
      const n = (s.name || "").trim();
      if (/^head(\.?0*\d+)?$/i.test(n) && (!actor.parts.head || !s.isMesh)) actor.parts.head = s;
      else if (/^torso(\.?0*\d+)?$/i.test(n) && (!actor.parts.torso || !s.isMesh)) actor.parts.torso = s;
      else if (/^hand_l(\.?0*\d+)?$/i.test(n) && (!actor.parts.handL || !s.isMesh)) actor.parts.handL = s;
      else if (/^hand_r(\.?0*\d+)?$/i.test(n) && (!actor.parts.handR || !s.isMesh)) actor.parts.handR = s;
      else if (/^foot_l(\.?0*\d+)?$/i.test(n) && (!actor.parts.footL || !s.isMesh)) actor.parts.footL = s;
      else if (/^foot_r(\.?0*\d+)?$/i.test(n) && (!actor.parts.footR || !s.isMesh)) actor.parts.footR = s;
    });

    miiModel.scale.setScalar(1.16);
    actor.model = miiModel;
    actor.root.add(miiModel);

    upgradeMiiCharacterMaterials(actor, "p1");
    this.previewFacialFX?.attachFacialRig(actor);
    this.previewAnimator.setupArticulatedMiiRig(actor);

    const racketMesh = this._cloneCleanInGameRacket();
    racketMesh.traverse((s) => {
      if (s.isMesh) {
        s.castShadow = true;
        s.receiveShadow = true;
      }
    });
    upgradeRacketMaterials(racketMesh);
    racketMesh.scale.setScalar(1.22);
    actor.racketMesh = racketMesh;
    actor.racketPivot.position.set(-0.36, 0.9, 0.16);
    actor.racketPivot.add(racketMesh);
    actor.root.add(actor.racketPivot);
    actor.root.rotation.y = 0;

    this.previewRacketKinematics.initActor(actor);
    return actor;
  }

  _syncPreviewCharacter3D() {
    if (!this.previewScene || !this.turntableGroup) return;

    const hasRealEnginePlayer = !!(this.engine?.player?.model);
    if (
      !this.previewActorPlayer ||
      !this.previewActorPartner ||
      (hasRealEnginePlayer && !this.previewActorPlayer._clonedFromRealAsset)
    ) {
      if (this.previewActorPlayer?.root && this.pedestalPlayer) {
        this.pedestalPlayer.remove(this.previewActorPlayer.root);
      }
      if (this.previewActorPartner?.root && this.pedestalPartner) {
        this.pedestalPartner.remove(this.previewActorPartner.root);
      }
      this.previewActorPlayer = this._createPreviewActorInstance("player");
      this.previewActorPlayer._clonedFromRealAsset = hasRealEnginePlayer;
      this.previewActorPartner = this._createPreviewActorInstance("player_partner");
      this.previewActorPartner._clonedFromRealAsset = hasRealEnginePlayer;

      this.pedestalPlayer.add(this.previewActorPlayer.root);
      this.pedestalPartner.add(this.previewActorPartner.root);
    }

    applyCharacter3DUpgradesToActor(this.previewActorPlayer, this.shop, { unitRole: "player" });
    applyCharacter3DUpgradesToActor(this.previewActorPartner, this.shop, { unitRole: "partner" });

    // Update 3D Stage Overlay Labels
    const editUnit = this._EffectiveEditUnit();
    const char = this.shop.getSelectedCharacter(editUnit);
    const vfx = this.shop.getSelectedStrikeVfx(editUnit);
    const elCharName = document.getElementById("shop-preview-char-name");
    const elRating = document.getElementById("shop-preview-rating");
    const elRoleTag = document.getElementById("shop-preview-role-badge");

    if (this.targetUnit === "duo") {
      const pChar = this.shop.getSelectedCharacter("player");
      const bChar = this.shop.getSelectedCharacter("partner");
      const pMods = this.shop.getEffectivePlayerModifiers();
      const bMods = this.shop.getEffectivePartnerModifiers();
      if (elCharName) elCharName.textContent = `${pChar.name} & Bot ${bChar.name}`;
      if (elRating) elRating.textContent = `OVR ${Math.round((pMods.overallRating + bMods.overallRating) / 2)}`;
      if (elRoleTag) {
        elRoleTag.textContent = `SONG ĐẤU 3D · AI ĐỠ LƯỚI ${Math.round(bMods.autoInterceptChance * 100)}%`;
      }
    } else if (editUnit === "partner") {
      const bMods = this.shop.getEffectivePartnerModifiers();
      if (elCharName) elCharName.textContent = `BOT ${char.name.toUpperCase()}`;
      if (elRating) elRating.textContent = `OVR ${bMods.overallRating}`;
      if (elRoleTag) {
        elRoleTag.textContent = `${char.roleTag} · TIER ${bMods.starTier} · AI LV.${bMods.aiIqLevel}`;
      }
    } else {
      const pMods = this.shop.getEffectivePlayerModifiers();
      if (elCharName) elCharName.textContent = char.name.toUpperCase();
      if (elRating) elRating.textContent = `OVR ${pMods.overallRating}`;
      if (elRoleTag) {
        elRoleTag.textContent = `${char.roleTag} · TIER ${pMods.starTier} · ${char.title.toUpperCase()}`;
      }
    }
  }

  _updateStageLiveStats() {
    const editUnit = this._EffectiveEditUnit();
    const mods =
      editUnit === "partner"
        ? this.shop.getEffectivePartnerModifiers()
        : this.shop.getEffectivePlayerModifiers();

    const statsMap = [
      { id: "speed", pts: mods.speedPoints || 10 },
      { id: "power", pts: mods.powerPoints || 10 },
      { id: "spin", pts: mods.spinPoints || 10 },
      { id: "reflex", pts: mods.reflexPoints || 10 }
    ];

    statsMap.forEach(({ id, pts }) => {
      const displayVal = Math.round(42 + pts * 6.5);
      const pct = Math.min(100, Math.max(14, Math.round((displayVal / 365) * 100)));
      const bar = document.getElementById(`stage-bar-${id}`);
      const val = document.getElementById(`stage-val-${id}`);
      if (bar) bar.style.width = `${pct}%`;
      if (val) val.textContent = String(displayVal);
    });
  }

  _renderActiveLoadoutDock() {
    const dock = document.getElementById("shop-active-loadout-dock");
    if (!dock) return;

    const editUnit = this._EffectiveEditUnit();
    const char = this.shop.getSelectedCharacter(editUnit);
    const outfit = this.shop.getSelectedOutfit(editUnit);
    const racket = this.shop.getSelectedRacket(editUnit);
    const vfx = this.shop.getSelectedStrikeVfx(editUnit);
    const activeAccIds = this.shop.getActiveAccessoryIdsForUnit(editUnit);
    const firstAcc =
      ACCESSORY_CATALOG.find((a) => activeAccIds.includes(a.id)) || ACCESSORY_CATALOG[0];

    const slots = [
      {
        tab: "characters",
        slotLabel: "VẬN ĐỘNG VIÊN",
        itemName: char.name,
        artHtml: getMiiAvatarSVG(char.id, { uid: `dock-${editUnit}-${char.id}` })
      },
      {
        tab: "outfits",
        slotLabel: "TRANG PHỤC",
        itemName: outfit.name,
        artHtml: SVG_ICONS.proOutfitArt(
          outfit.swatches?.[0] || "#2563eb",
          outfit.swatches?.[1] || "#f8fafc",
          outfit.swatches?.[2] || "#0f172a",
          "shop-card-art-svg",
          outfit.id
        )
      },
      {
        tab: "gear",
        slotLabel: "VỢT THI ĐẤU",
        itemName: racket.name,
        artHtml: SVG_ICONS.proRacketArt(
          `#${racket.frameHex.toString(16).padStart(6, "0")}`,
          `#${racket.throatHex.toString(16).padStart(6, "0")}`,
          `#${(racket.stringHex || 0xffffff).toString(16).padStart(6, "0")}`,
          "shop-card-art-svg",
          racket.id
        )
      },
      {
        tab: "gear",
        slotLabel: "PHỤ KIỆN 3D",
        itemName: activeAccIds.length > 0 ? `${activeAccIds.length} Đang gắn` : "Chưa gắn",
        artHtml: SVG_ICONS.proAccessoryArt(
          firstAcc.id,
          `#${firstAcc.colorHex.toString(16).padStart(6, "0")}`,
          "shop-card-art-svg"
        )
      },
      {
        tab: "vfx",
        slotLabel: "HIỆU ỨNG",
        itemName: vfx.name,
        artHtml: SVG_ICONS.proVfxArt(
          vfx.colors?.[0] || "#38bdf8",
          vfx.colors?.[1] || "#2563eb",
          vfx.colors?.[2] || "#facc15",
          "shop-card-art-svg",
          vfx.id
        )
      }
    ];

    dock.innerHTML = slots
      .map(
        (s) => `
        <button type="button" class="loadout-slot-btn ${this.activeTab === s.tab ? "active-slot" : ""}" data-loadout-slot="${s.tab}" title="${s.slotLabel}: ${s.itemName}">
          <div class="loadout-slot-art">${s.artHtml}</div>
          <div class="loadout-slot-meta">
            <span class="slot-kicker">${s.slotLabel}</span>
            <strong class="slot-value">${s.itemName}</strong>
          </div>
        </button>
      `
      )
      .join("");

    dock.querySelectorAll("[data-loadout-slot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-loadout-slot") || "upgrades";
        this.switchTab(targetTab);
      });
    });
  }

  triggerPreviewPose(pose = "idle") {
    this.previewPose = pose;
    const actors =
      this.targetUnit === "duo"
        ? [this.previewActorPlayer, this.previewActorPartner]
        : this.targetUnit === "partner"
        ? [this.previewActorPartner]
        : [this.previewActorPlayer];

    actors.forEach((a, idx) => {
      if (!a) return;
      const unitRole = a === this.previewActorPartner ? "partner" : "player";
      const vfxCfg = this.shop.getSelectedStrikeVfx(unitRole);

      if (pose === "forehand") {
        a.swingType = "forehand";
        a.swingDuration = 0.42;
        a.swingTimer = 0.42;
        this.previewRacketKinematics.triggerSwing(a, {
          shotType: "topspin",
          side: "forehand",
          speed: 1.35,
          timing: "sweet"
        });
        this.previewFacialFX?.setExpression(a, "effort_shout", 1.2);
        if (idx === 0) this._triggerShopStrikeVfxBurst(a, vfxCfg);
        this.stageCameraShake = Math.max(this.stageCameraShake || 0, 0.25);
      } else if (pose === "backhand") {
        a.swingType = "backhand";
        a.swingDuration = 0.42;
        a.swingTimer = 0.42;
        this.previewRacketKinematics.triggerSwing(a, {
          shotType: "slice",
          side: "backhand",
          speed: 1.32,
          timing: "sweet"
        });
        this.previewFacialFX?.setExpression(a, "focused_squint", 1.2);
        if (idx === 0) this._triggerShopStrikeVfxBurst(a, vfxCfg);
        this.stageCameraShake = Math.max(this.stageCameraShake || 0, 0.25);
      } else if (pose === "smash") {
        a.swingType = "smash";
        a.swingDuration = 0.45;
        a.swingTimer = 0.45;
        this.previewRacketKinematics.triggerSwing(a, {
          shotType: "smash",
          side: "overhead",
          speed: 1.5,
          timing: "sweet"
        });
        this.previewFacialFX?.setExpression(a, "effort_shout", 1.4);
        if (idx === 0) this._triggerShopStrikeVfxBurst(a, vfxCfg);
        this.stageCameraShake = Math.max(this.stageCameraShake || 0, 0.55);
      } else if (pose === "win") {
        this.previewAnimator.triggerPointReaction(a, "win");
        this.previewFacialFX?.setExpression(a, "happy_grin", 2.0);
        this.previewFacialFX?.triggerEmoteBurst(a, "win");
        this.stageCameraShake = Math.max(this.stageCameraShake || 0, 0.35);
      } else {
        this.previewFacialFX?.setExpression(a, "neutral", 1.5);
      }
    });

    if (pose !== "idle" && this.engine?.audioEngine?.playSwingWhoosh) {
      this.engine.audioEngine.playSwingWhoosh(1.25);
    }
  }

  _startPreviewLoop() {
    if (this._rafId) cancelAnimationFrame(this._rafId);

    const step = () => {
      if (!this.isOpen) return;
      this._rafId = requestAnimationFrame(step);

      const dt = Math.min(this.previewClock.getDelta(), 0.05);
      this.previewElapsed += dt;

      if (this.elCanvas && this.previewRenderer && this.previewCamera) {
        const rect = this.elCanvas.getBoundingClientRect();
        const w = Math.max(80, Math.round(rect.width));
        const h = Math.max(48, Math.round(rect.height));
        const pr = this.previewRenderer.getPixelRatio();
        if (
          Math.abs(this.elCanvas.width - Math.round(w * pr)) > 1 ||
          Math.abs(this.elCanvas.height - Math.round(h * pr)) > 1
        ) {
          this.previewRenderer.setSize(w, h, false);
          this.previewCamera.aspect = w / h;
          this.previewCamera.updateProjectionMatrix();
        }
      }

      this._updateStageCameraFraming(false);

      // Smooth camera transition between Player, Bot Partner, and Duo View + impact shake
      if (this.previewCamera) {
        this.previewCamera.position.lerp(this.cameraTargetPos, 1 - Math.exp(-8 * dt));
        if (this.stageCameraShake > 0.001) {
          const s = this.stageCameraShake * this.stageCameraShake * 0.16;
          this.previewCamera.position.x += Math.sin(this.previewElapsed * 56) * s;
          this.previewCamera.position.y += Math.cos(this.previewElapsed * 68) * s * 0.85;
          this.stageCameraShake = Math.max(0, this.stageCameraShake - dt * 2.6);
        }
        this.previewCamera.lookAt(this.cameraTargetLook);
      }

      for (const a of [this.previewActorPlayer, this.previewActorPartner]) {
        if (!a) continue;
        if (a.swingTimer > 0) {
          a.swingTimer = Math.max(0, a.swingTimer - dt);
        }

        this.previewRacketKinematics.update(a, dt, {
          phase: "SERVE_STANCE",
          score: { server: "player" },
          ball: { pos: new THREE.Vector3(0, 1.2, 2.0), inPlay: false },
          elapsedTime: this.previewElapsed
        });

        this.previewAnimator.updateMiiBodyAnimation(a, dt, {
          phase: "SERVE_STANCE",
          score: { server: "player" },
          ball: { pos: new THREE.Vector3(0, 1.2, 2.0), inPlay: false },
          elapsedTime: this.previewElapsed,
          player: a
        });

        this.previewFacialFX?.update(a, dt, {
          phase: "SERVE_STANCE",
          ball: { pos: new THREE.Vector3(0, 1.2, 2.0), inPlay: false },
          score: { playerPoints: 0, opponentPoints: 0 },
          rallyCount: 0,
          camera: this.previewCamera
        });

        if (!this.isDragging) {
          this.userRotationY += dt * 0.14;
        }
        a.root.rotation.y = Math.sin(this.userRotationY) * 0.45 + (this.isDragging ? this.userRotationY : 0);

        const aura = a.root.getObjectByName("CustomCharacterAuraRing");
        if (aura) aura.rotation.y += dt * 1.35;
      }

      if (this.studioFloorRing) {
        this.studioFloorRing.rotation.z += dt * 0.25;
      }
      if (this.studioMotes.length > 0) {
        for (const m of this.studioMotes) {
          m.mesh.position.y = m.baseY + Math.sin(this.previewElapsed * m.speed + m.phase) * 0.14;
        }
      }

      this._updateShopStrikeVfx(dt);

      if (this.previewRenderer && this.previewScene && this.previewCamera) {
        this.previewRenderer.render(this.previewScene, this.previewCamera);
      }
    };

    this._rafId = requestAnimationFrame(step);
  }

  _applyToLiveGameActors() {
    if (!this.engine) return;
    const myLoadout = this.shop.getCompactOnlineLoadout();

    // If in an online room or match, broadcast our updated Character + Bot Partner loadout
    if (this.engine.onlineMatchmaker?.currentRoomId) {
      this.engine.onlineMatchmaker.syncMyLoadout?.(myLoadout);
    }

    if (this.engine.isMultiplayer && typeof this.engine.syncOnlineSquadLoadouts === "function") {
      this.engine.syncOnlineSquadLoadouts();
      return;
    }

    const mods = this.shop.getEffectivePlayerModifiers();
    if (this.engine.player) {
      this.engine.player.maxSpeed = mods.maxSpeed;
      applyCharacter3DUpgradesToActor(this.engine.player, this.shop, { unitRole: "player" });
    }
    if (this.engine.playerPartner) {
      this.engine.playerPartner.maxSpeed = mods.partnerMaxSpeed;
      applyCharacter3DUpgradesToActor(this.engine.playerPartner, this.shop, { unitRole: "partner" });
    }
    if (this.engine.ballTrail) {
      this.engine.ballTrail.setStyle(
        this.engine.ball?.shotType || "TOPSPIN",
        !!this.engine.ball?.isPowerShot,
        this.engine.player
      );
    }
  }

  // ============================================================================
  // 3D VICTORY CELEBRATION POSE STAGE (FOR #victory-modal)
  // ============================================================================

  startVictoryModal3D(opts = {}) {
    const canvas = document.getElementById("victory-3d-canvas");
    if (!canvas) return;

    this.stopVictoryModal3D();
    this.victoryModalActive = true;
    this.victoryPoseMode = "jump";
    this.victoryElapsed = 0;
    this.victoryCameraShake = 0.65;
    this.victoryClock = new THREE.Clock();

    if (!this.victoryRenderer || this.victoryCanvas !== canvas) {
      this.victoryCanvas = canvas;
      this.victoryRenderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      this.victoryRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.victoryRenderer.outputColorSpace = THREE.SRGBColorSpace;
      this.victoryRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.victoryRenderer.toneMappingExposure = 1.22;
      this.victoryRenderer.shadowMap.enabled = true;
      this.victoryRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.victoryScene = new THREE.Scene();
    this.victoryCamera = new THREE.PerspectiveCamera(34, 1.8, 0.1, 35);
    this.victoryCamera.position.set(0, 1.38, 3.65);
    this.victoryCamera.lookAt(0, 0.96, 0);

    // Dramatic championship lighting
    const hemi = new THREE.HemisphereLight(0xfffbeb, 0x0f172a, 1.35);
    this.victoryScene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 2.35);
    key.position.set(2.5, 4.4, 3.6);
    key.castShadow = true;
    this.victoryScene.add(key);

    const goldRim = new THREE.DirectionalLight(0xfacc15, 1.55);
    goldRim.position.set(-2.6, 2.5, -2.2);
    this.victoryScene.add(goldRim);

    const cyanFill = new THREE.DirectionalLight(0x38bdf8, 1.1);
    cyanFill.position.set(2.2, 1.6, -2.0);
    this.victoryScene.add(cyanFill);

    // Champion Podium & Golden Rings
    const podiumGroup = new THREE.Group();
    const baseDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.28, 0.12, 48),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.25,
        metalness: 0.72
      })
    );
    baseDisc.position.y = -0.06;
    baseDisc.receiveShadow = true;
    podiumGroup.add(baseDisc);

    this.victoryPodiumRing = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.12, 48),
      new THREE.MeshBasicMaterial({
        color: opts.playerWon !== false ? 0xfacc15 : 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88
      })
    );
    this.victoryPodiumRing.rotation.x = -Math.PI / 2;
    this.victoryPodiumRing.position.y = 0.012;
    podiumGroup.add(this.victoryPodiumRing);

    this.victoryOuterHalo = new THREE.Mesh(
      new THREE.TorusGeometry(1.22, 0.018, 12, 64),
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.65
      })
    );
    this.victoryOuterHalo.rotation.x = Math.PI / 2;
    this.victoryOuterHalo.position.y = 0.04;
    podiumGroup.add(this.victoryOuterHalo);
    this.victoryScene.add(podiumGroup);

    // Build Champion Actor & Bot Partner Actor
    const mainActor = this._createPreviewActorInstance("player");
    const partnerActor = this._createPreviewActorInstance("player_partner");

    const playerWon = opts.playerWon !== false;
    const isOnlineGuestWinner =
      this.engine?.isMultiplayer &&
      this.engine?.myOnlineSlot === "p2" &&
      !playerWon &&
      false; // playerWon passed in already reflects local perspective or winner

    // Apply current 3D upgrades (or opponent online loadout if opponent won in Online mode)
    const oppOnlineLoadout =
      this.engine?.isMultiplayer && !playerWon ? this.engine?.remoteOpponentLoadout : null;

    if (oppOnlineLoadout) {
      applyCharacter3DUpgradesToActor(mainActor, this.shop, {
        unitRole: "player",
        customLoadout: oppOnlineLoadout
      });
      applyCharacter3DUpgradesToActor(partnerActor, this.shop, {
        unitRole: "partner",
        customLoadout: oppOnlineLoadout
      });
    } else {
      applyCharacter3DUpgradesToActor(mainActor, this.shop, { unitRole: "player" });
      applyCharacter3DUpgradesToActor(partnerActor, this.shop, { unitRole: "partner" });
    }

    mainActor.root.position.set(-0.26, 0, 0.18);
    partnerActor.root.position.set(0.46, 0, -0.22);
    partnerActor.root.scale.setScalar(0.92);

    this.victoryScene.add(mainActor.root);
    this.victoryScene.add(partnerActor.root);
    this.victoryMainActor = mainActor;
    this.victoryPartnerActor = partnerActor;

    // Trigger initial celebratory expressions and pose
    this.previewAnimator.triggerPointReaction(mainActor, "win");
    this.previewAnimator.triggerPointReaction(partnerActor, "win");
    this.previewFacialFX?.setExpression(mainActor, "happy_grin", 12.0);
    this.previewFacialFX?.setExpression(partnerActor, "happy_grin", 12.0);
    this.previewFacialFX?.triggerEmoteBurst(mainActor, "win");

    // 3D Confetti & Star Particles
    this.victoryConfetti = [];
    const confettiColors = [0xfacc15, 0x38bdf8, 0xf43f5e, 0x10b981, 0xa855f7, 0xffffff];
    const confGeo = new THREE.PlaneGeometry(0.065, 0.036);
    for (let i = 0; i < 42; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: confettiColors[i % confettiColors.length],
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(confGeo, mat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.25 + Math.random() * 1.35;
      mesh.position.set(
        Math.cos(angle) * radius,
        0.5 + Math.random() * 2.2,
        Math.sin(angle) * radius * 0.7
      );
      mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      this.victoryScene.add(mesh);
      this.victoryConfetti.push({
        mesh,
        vy: 0.65 + Math.random() * 0.85,
        vx: (Math.random() - 0.5) * 0.4,
        rotSpeed: 2.5 + Math.random() * 4.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    const stepVictory = () => {
      if (!this.victoryModalActive) return;
      this._victoryRafId = requestAnimationFrame(stepVictory);

      const dt = Math.min(this.victoryClock.getDelta(), 0.05);
      this.victoryElapsed += dt;
      const t = this.victoryElapsed;

      if (this.victoryCanvas && this.victoryRenderer && this.victoryCamera) {
        const rect = this.victoryCanvas.getBoundingClientRect();
        const w = Math.max(120, Math.round(rect.width));
        const h = Math.max(90, Math.round(rect.height));
        const pr = this.victoryRenderer.getPixelRatio();
        if (
          Math.abs(this.victoryCanvas.width - Math.round(w * pr)) > 1 ||
          Math.abs(this.victoryCanvas.height - Math.round(h * pr)) > 1
        ) {
          this.victoryRenderer.setSize(w, h, false);
          this.victoryCamera.aspect = w / h;
          this.victoryCamera.updateProjectionMatrix();
        }
      }

      // Animate Champion & Partner Victory Poses
      const actors = [this.victoryMainActor, this.victoryPartnerActor];
      actors.forEach((act, idx) => {
        if (!act) return;
        const phaseOffset = idx * 0.85;
        const pTime = t * 4.2 + phaseOffset;

        if (this.victoryPoseMode === "jump") {
          // Energetic Championship Jump + Double Fist Pump
          const jumpWave = Math.max(0, Math.sin(pTime));
          const prevWave = Math.max(0, Math.sin(pTime - dt * 4.2));
          // Trigger camera landing shake when landing from a high jump
          if (prevWave > 0.05 && jumpWave <= 0.05 && idx === 0) {
            this.victoryCameraShake = Math.max(this.victoryCameraShake, 0.32);
          }

          act.root.position.y = jumpWave * 0.34;
          act.root.rotation.y = Math.sin(t * 1.6 + phaseOffset) * 0.38;

          if (act.parts.torso) {
            act.parts.torso.rotation.x = -0.14 * jumpWave;
            act.parts.torso.rotation.z = Math.sin(t * 3.2 + phaseOffset) * 0.08;
          }
          if (act.parts.head) {
            act.parts.head.rotation.x = -0.18 * jumpWave;
            act.parts.head.rotation.y = Math.sin(t * 2.4 + phaseOffset) * 0.22;
          }
          if (act.parts.handL) {
            act.parts.handL.position.y =
              (act.parts.handL.userData.basePos?.y || 0.78) + 0.32 + Math.sin(t * 8 + phaseOffset) * 0.12;
            act.parts.handL.position.x = (act.parts.handL.userData.basePos?.x || 0.34) + 0.08;
          }
          if (act.parts.handR) {
            act.parts.handR.position.y =
              (act.parts.handR.userData.basePos?.y || 0.78) + 0.28 + Math.cos(t * 8 + phaseOffset) * 0.12;
          }
          if (act.racketPivot) {
            act.racketPivot.position.y = 1.18 + Math.sin(t * 8 + phaseOffset) * 0.14;
            act.racketPivot.rotation.z = -0.55 + Math.sin(t * 6) * 0.25;
            act.racketPivot.rotation.x = -0.35;
          }
        } else if (this.victoryPoseMode === "smash") {
          // Power Smash Trophy Pose
          const smashCycle = (t * 1.8 + idx * 0.4) % 1.6;
          const leap = smashCycle < 0.65 ? Math.sin((smashCycle / 0.65) * Math.PI) : 0;
          act.root.position.y = leap * 0.42;
          act.root.rotation.y = Math.sin(t * 2.2 + phaseOffset) * 0.45;

          if (act.swingTimer <= 0 && smashCycle < 0.12) {
            act.swingType = "smash";
            act.swingDuration = 0.48;
            act.swingTimer = 0.48;
            this.previewRacketKinematics.triggerSwing(act, {
              shotType: "smash",
              side: "overhead",
              speed: 1.55,
              timing: "sweet"
            });
            if (idx === 0) this.victoryCameraShake = Math.max(this.victoryCameraShake, 0.48);
          }
          if (act.swingTimer > 0) act.swingTimer = Math.max(0, act.swingTimer - dt);
          this.previewRacketKinematics.update(act, dt, {
            phase: "SERVE_STANCE",
            score: { server: "player" },
            ball: { pos: new THREE.Vector3(0, 1.5, 2.0), inPlay: false },
            elapsedTime: t
          });
        } else if (this.victoryPoseMode === "spin") {
          // 360 Champion Spin & Wave
          act.root.position.y = Math.abs(Math.sin(t * 3.6 + phaseOffset)) * 0.18;
          act.root.rotation.y = t * 2.6 + phaseOffset;
          if (act.parts.handL) {
            act.parts.handL.position.y = (act.parts.handL.userData.basePos?.y || 0.78) + 0.36;
          }
          if (act.racketPivot) {
            act.racketPivot.position.y = 1.22;
            act.racketPivot.rotation.z = -0.75;
          }
        }

        const aura = act.root.getObjectByName("CustomCharacterAuraRing");
        if (aura) aura.rotation.y += dt * 2.2;

        this.previewFacialFX?.update(act, dt, {
          phase: "MATCH_OVER",
          ball: { pos: new THREE.Vector3(0, 1.2, 2.0), inPlay: false },
          score: { playerPoints: 4, opponentPoints: 0 },
          rallyCount: 0,
          camera: this.victoryCamera
        });
      });

      // Rotate Podium Rings
      if (this.victoryPodiumRing) this.victoryPodiumRing.rotation.z += dt * 0.65;
      if (this.victoryOuterHalo) {
        this.victoryOuterHalo.rotation.z -= dt * 0.85;
        this.victoryOuterHalo.scale.setScalar(1 + Math.sin(t * 4) * 0.035);
      }

      // Update Falling Confetti
      for (const c of this.victoryConfetti) {
        c.mesh.position.y -= c.vy * dt;
        c.mesh.position.x += Math.sin(t * 2.5 + c.phase) * 0.25 * dt;
        c.mesh.rotation.x += c.rotSpeed * dt;
        c.mesh.rotation.y += c.rotSpeed * 0.8 * dt;
        if (c.mesh.position.y < 0.02) {
          c.mesh.position.y = 2.2 + Math.random() * 0.5;
        }
      }

      // Dynamic Camera Orbit + Impact Shake
      if (this.victoryCamera) {
        const baseX = Math.sin(t * 0.55) * 0.28;
        const baseY = 1.34 + Math.sin(t * 1.1) * 0.05;
        const baseZ = 3.55 + Math.cos(t * 0.55) * 0.14;
        let shakeX = 0;
        let shakeY = 0;
        if (this.victoryCameraShake > 0.001) {
          const s = this.victoryCameraShake * this.victoryCameraShake * 0.18;
          shakeX = Math.sin(t * 62) * s;
          shakeY = Math.cos(t * 74) * s * 0.85;
          this.victoryCameraShake = Math.max(0, this.victoryCameraShake - dt * 2.2);
        }
        this.victoryCamera.position.set(baseX + shakeX, baseY + shakeY, baseZ);
        this.victoryCamera.lookAt(0.05, 0.94, 0);
      }

      if (this.victoryRenderer && this.victoryScene && this.victoryCamera) {
        this.victoryRenderer.render(this.victoryScene, this.victoryCamera);
      }
    };

    this._victoryRafId = requestAnimationFrame(stepVictory);
  }

  setVictoryPose(pose = "jump") {
    this.victoryPoseMode = pose;
    this.victoryCameraShake = 0.52;
    if (this.victoryMainActor) {
      this.previewFacialFX?.triggerEmoteBurst(this.victoryMainActor, "win");
    }
    if (this.engine?.audioEngine?.playSwingWhoosh) {
      this.engine.audioEngine.playSwingWhoosh(1.3);
    }
  }

  stopVictoryModal3D() {
    this.victoryModalActive = false;
    if (this._victoryRafId) {
      cancelAnimationFrame(this._victoryRafId);
      this._victoryRafId = null;
    }
  }

  _renderShopContent() {
    const container = document.getElementById("shop-tab-content");
    if (!container) return;

    if (this.activeTab === "upgrades") {
      this._renderUpgradesAndSkillsTab(container);
    } else if (this.activeTab === "characters") {
      this._renderCharactersTab(container);
    } else if (this.activeTab === "outfits") {
      this._renderOutfitsTab(container);
    } else if (this.activeTab === "vfx") {
      this._renderStrikeVfxTab(container);
    } else if (this.activeTab === "gear") {
      this._renderGearAndRacketsTab(container);
    }
  }

  _renderUpgradesAndSkillsTab(container) {
    const editUnit = this._EffectiveEditUnit();
    const coins = this.shop.state.coins;

    if (editUnit === "partner") {
      // BOT ĐỒNG ĐỘI AI INTELLIGENCE & VOLLEY UPGRADES
      const pChar = this.shop.getSelectedCharacter("partner");
      const bMods = this.shop.getEffectivePartnerModifiers();
      const aiUpgrades = this.shop.state.partnerAiUpgrades;

      const aiRowsHtml = PARTNER_AI_UPGRADE_CONFIG.map((cfg, idx) => {
        const curLv = aiUpgrades[cfg.key] || 1;
        const cost = this.shop.getPartnerAiUpgradeCost(cfg.key);
        const isMax = cost === null;
        const canAfford = !isMax && coins >= cost;

        let barsHtml = "";
        for (let i = 1; i <= 10; i++) {
          const filled = i <= curLv;
          barsHtml += `<span class="upgrade-seg ${filled ? "filled partner-seg" : ""}"></span>`;
        }

        return `
          <div class="upgrade-stat-row partner-card-theme" style="--stagger-idx:${idx}">
            <div class="upgrade-stat-info">
              <div class="upgrade-stat-top">
                <span class="upgrade-stat-meta-inline">${cfg.badge} · AI MODULE</span>
                <span class="upgrade-stat-lv">LV.${curLv}/10</span>
              </div>
              <div class="upgrade-stat-label">${cfg.label}</div>
              <div class="upgrade-stat-desc">${cfg.desc}</div>
              <div class="upgrade-segments-track">${barsHtml}</div>
            </div>
            <button type="button" class="upgrade-stat-btn ${isMax ? "maxed" : canAfford ? "can-buy" : "locked"}"
              data-upgrade-partner-ai="${cfg.key}" ${isMax ? "disabled" : ""}>
              ${isMax ? "ĐÃ TỐI ĐA" : `NÂNG CẤP · ${SVG_ICONS.coin("coin-svg-icon icon-xs")} ${cost.toLocaleString("vi-VN")}`}
            </button>
          </div>
        `;
      }).join("");

      container.innerHTML = `
        <div class="shop-section-block partner-highlight-block">
          <div class="shop-section-header">
            <div class="section-heading-group">
              <span class="section-index-tag">01 // AI NEURAL CORE</span>
              <h3 class="shop-section-title">TRÍ TUỆ &amp; PHẢN XẠ BOT: ${pChar.name.toUpperCase()}</h3>
            </div>
            <span class="shop-section-sub">${bMods.rankTitle} · AI LV.${bMods.aiIqLevel}</span>
          </div>

          <div class="bot-telemetry-strip">
            <div class="telemetry-metric">
              <span class="t-label">TỶ LỆ TỰ ĐỠ BÓNG</span>
              <strong class="t-val">${Math.round(bMods.autoInterceptChance * 100)}%</strong>
            </div>
            <div class="telemetry-metric">
              <span class="t-label">BÁN KÍNH CHẶN LƯỚI</span>
              <strong class="t-val">${bMods.interceptReachX}m</strong>
            </div>
            <div class="telemetry-metric">
              <span class="t-label">TỐC ĐỘ CHẠY LƯỚI</span>
              <strong class="t-val">${bMods.maxSpeed} m/s</strong>
            </div>
            <div class="telemetry-metric">
              <span class="t-label">CHẶN BÓNG MẠNH</span>
              <strong class="t-val">${bMods.canInterceptPowerShot ? "ĐÃ MỞ KHÓA" : "PHẢN XẠ LV.4"}</strong>
            </div>
          </div>

          <div class="upgrade-stats-grid">
            ${aiRowsHtml}
          </div>
        </div>
      `;

      container.querySelectorAll("[data-upgrade-partner-ai]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.getAttribute("data-upgrade-partner-ai");
          const res = this.shop.upgradePartnerAiStat(key);
          this._showToast(res.message);
          if (res.ok) {
            const newLv = this.shop.state.partnerAiUpgrades[key] || 2;
            this._playSfx("upgrade", newLv);
            this.triggerPreviewPose("smash");
          } else {
            this._playSfx("error");
          }
        });
      });
      return;
    }

    // MAIN PLAYER (BẠN) STATS & SPECIAL SKILLS
    const char = this.shop.getSelectedCharacter("player");
    const upgLevels = this.shop.getCharacterUpgradeLevels(char.id);
    const pMods = this.shop.getEffectivePlayerModifiers(char.id);
    const skills = this.shop.state.playerSpecialSkills;

    const statRowsHtml = UPGRADE_STAT_CONFIG.map((cfg, idx) => {
      const curLv = upgLevels[cfg.key] || 1;
      const baseVal = char.baseStats[cfg.key] || 5;
      const cost = this.shop.getUpgradeCost(char.id, cfg.key);
      const isMax = cost === null;
      const canAfford = !isMax && coins >= cost;

      let barsHtml = "";
      for (let i = 1; i <= 10; i++) {
        const filled = i <= curLv;
        barsHtml += `<span class="upgrade-seg ${filled ? "filled" : ""} ${i <= Math.round(baseVal / 2) ? "base" : "bonus"}"></span>`;
      }

      return `
        <div class="upgrade-stat-row" style="--stagger-idx:${idx}">
          <div class="upgrade-stat-info">
            <div class="upgrade-stat-top">
              <span class="upgrade-stat-meta-inline">${cfg.badge} · CHỈ SỐ GỐC</span>
              <span class="upgrade-stat-lv">LV.${curLv}/10</span>
            </div>
            <div class="upgrade-stat-label">${cfg.label}</div>
            <div class="upgrade-stat-desc">${cfg.desc}</div>
            <div class="upgrade-segments-track">${barsHtml}</div>
          </div>
          <button type="button" class="upgrade-stat-btn ${isMax ? "maxed" : canAfford ? "can-buy" : "locked"}"
            data-upgrade-stat="${cfg.key}" ${isMax ? "disabled" : ""}>
            ${isMax ? "ĐÃ TỐI ĐA" : `HUẤN LUYỆN · ${SVG_ICONS.coin("coin-svg-icon icon-xs")} ${cost.toLocaleString("vi-VN")}`}
          </button>
        </div>
      `;
    }).join("");

    const skillRowsHtml = PLAYER_SPECIAL_SKILLS.map((cfg, idx) => {
      const curLv = skills[cfg.key] || 1;
      const cost = this.shop.getSpecialSkillCost(cfg.key);
      const isMax = cost === null;
      const canAfford = !isMax && coins >= cost;

      let barsHtml = "";
      for (let i = 1; i <= 5; i++) {
        barsHtml += `<span class="upgrade-seg ${i <= curLv ? "filled bonus" : ""}"></span>`;
      }

      return `
        <div class="upgrade-stat-row special-skill-card" style="--stagger-idx:${idx + 4}">
          <div class="upgrade-stat-info">
            <div class="upgrade-stat-top">
              <span class="upgrade-stat-meta-inline gold">${cfg.badge} · TUYỆT KỸ PRO</span>
              <span class="upgrade-stat-lv">LV.${curLv}/5</span>
            </div>
            <div class="upgrade-stat-label">${cfg.label}</div>
            <div class="upgrade-stat-desc">${cfg.desc}</div>
            <div class="upgrade-segments-track skill-track-5">${barsHtml}</div>
          </div>
          <button type="button" class="upgrade-stat-btn ${isMax ? "maxed" : canAfford ? "can-buy" : "locked"}"
            data-upgrade-skill="${cfg.key}" ${isMax ? "disabled" : ""}>
            ${isMax ? "ĐÃ TỐI ĐA" : `NÂNG KỸ NĂNG · ${SVG_ICONS.coin("coin-svg-icon icon-xs")} ${cost.toLocaleString("vi-VN")}`}
          </button>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="shop-section-block">
        <div class="shop-section-header">
          <div class="section-heading-group">
            <span class="section-index-tag">01 // ATHLETE ATTRIBUTES</span>
            <h3 class="shop-section-title">CHỈ SỐ VẬN ĐỘNG VIÊN: ${char.name.toUpperCase()}</h3>
          </div>
          <span class="shop-section-sub">TIER ${pMods.starTier} · TỐC ĐỘ ${pMods.maxSpeed} M/S · LỰC +${Math.round((pMods.powerMult - 1) * 100)}%</span>
        </div>
        <div class="upgrade-stats-grid">
          ${statRowsHtml}
        </div>
      </div>

      <div class="shop-section-block">
        <div class="shop-section-header">
          <div class="section-heading-group">
            <span class="section-index-tag">02 // SIGNATURE SKILLS</span>
            <h3 class="shop-section-title">TUYỆT KỸ CHỦ LỰC TRÊN SÂN</h3>
          </div>
          <span class="shop-section-sub">4 KỸ NĂNG CHỦ ĐỘNG</span>
        </div>
        <div class="upgrade-stats-grid">
          ${skillRowsHtml}
        </div>
      </div>
    `;

    container.querySelectorAll("[data-upgrade-stat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const statKey = btn.getAttribute("data-upgrade-stat");
        const res = this.shop.upgradeCharacterStat(char.id, statKey);
        this._showToast(res.message);
        if (res.ok) {
          const lv = this.shop.getCharacterUpgradeLevels(char.id)[statKey] || 2;
          this._playSfx("upgrade", lv);
          this.triggerPreviewPose("forehand");
        } else {
          this._playSfx("error");
        }
      });
    });

    container.querySelectorAll("[data-upgrade-skill]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const skillKey = btn.getAttribute("data-upgrade-skill");
        const res = this.shop.upgradePlayerSpecialSkill(skillKey);
        this._showToast(res.message);
        if (res.ok) {
          const lv = (this.shop.state.playerSpecialSkills[skillKey] || 2) * 2;
          this._playSfx("upgrade", lv);
          this.triggerPreviewPose("smash");
        } else {
          this._playSfx("error");
        }
      });
    });
  }

  _renderCharactersTab(container) {
    const editUnit = this._EffectiveEditUnit();
    const selectedId =
      editUnit === "partner" ? this.shop.state.partnerCharacterId : this.shop.state.selectedCharacterId;
    const coins = this.shop.state.coins;
    const activeFilter = this.charCategoryFilter || "all";

    const matchesFilter = (c) => {
      const r = (c.rarity || "").toUpperCase();
      if (activeFilter === "all") return true;
      if (activeFilter === "unlocked") return this.shop.state.unlockedCharacters.includes(c.id);
      if (activeFilter === "robot") return !!c.isRobot;
      if (activeFilter === "mythic") return !!c.isPremium || r === "MYTHIC";
      if (activeFilter === "master") return !c.isRobot && !c.isPremium && (r === "MASTER" || r === "EPIC" || r === "LEGENDARY");
      if (activeFilter === "pro") return !c.isRobot && !c.isPremium && (r === "PRO" || r === "CLUB");
      return true;
    };

    const filteredRoster = CHARACTER_ROSTER.filter(matchesFilter);

    const countPro = CHARACTER_ROSTER.filter((c) => {
      const r = (c.rarity || "").toUpperCase();
      return !c.isRobot && !c.isPremium && (r === "PRO" || r === "CLUB");
    }).length;
    const countMaster = CHARACTER_ROSTER.filter((c) => {
      const r = (c.rarity || "").toUpperCase();
      return !c.isRobot && !c.isPremium && (r === "MASTER" || r === "EPIC" || r === "LEGENDARY");
    }).length;
    const countRobot = CHARACTER_ROSTER.filter((c) => !!c.isRobot).length;
    const countMythic = CHARACTER_ROSTER.filter((c) => !!c.isPremium || (c.rarity || "").toUpperCase() === "MYTHIC").length;
    const countUnlocked = this.shop.state.unlockedCharacters.length;

    const filterTabs = [
      { id: "all", label: `TẤT CẢ (${CHARACTER_ROSTER.length})` },
      { id: "pro", label: `PRO & CLB (${countPro})` },
      { id: "master", label: `CAO THỦ NGUYÊN TỐ (${countMaster})` },
      { id: "robot", label: `ROBOT & MECHA (${countRobot})` },
      { id: "mythic", label: `PREMIUM MYTHIC (${countMythic})` },
      { id: "unlocked", label: `ĐÃ SỞ HỮU (${countUnlocked})` }
    ];

    const filterBarHtml = filterTabs
      .map(
        (ft) => `
        <button type="button" class="char-filter-chip ${activeFilter === ft.id ? "active" : ""}" data-char-filter="${ft.id}"
          style="padding:7px 13px; border-radius:6px; font-size:11px; font-weight:800; letter-spacing:0.06em; border:1px solid ${
            activeFilter === ft.id ? "#38bdf8" : "rgba(148,163,184,0.22)"
          }; background:${
            activeFilter === ft.id ? "linear-gradient(135deg, rgba(14,165,233,0.32), rgba(37,99,235,0.28))" : "rgba(15,23,42,0.72)"
          }; color:${activeFilter === ft.id ? "#f8fafc" : "#94a3b8"}; cursor:pointer; transition:all 0.16s ease;">
          ${ft.label}
        </button>
      `
      )
      .join("");

    const rosterHtml = filteredRoster
      .map((c, idx) => {
        const unlocked = this.shop.state.unlockedCharacters.includes(c.id);
        const isSelected = c.id === selectedId;
        const starTier = this.shop.getCharacterStarTier(c.id);
        const mods = this.shop.getEffectivePlayerModifiers(c.id);
        const canAfford = coins >= c.price;
        const r = (c.rarity || "").toUpperCase();

        const rarityLabel = c.isPremium
          ? "MYTHIC PREMIUM"
          : c.isRobot
          ? "CYBER ROBOT"
          : r === "MASTER"
          ? "CAO THỦ NGUYÊN TỐ"
          : "PRO TOUR";

        const coinBonusPct = Math.round(((c.mechanic?.coinBonusPct || 0) + (mods.coinBonusMult - 1 - (c.mechanic?.coinBonusPct || 0))) * 100);
        const charCoinPct = Math.round((c.mechanic?.coinBonusPct || 0.1) * 100);

        const spdVal = Math.round(42 + mods.speedPoints * 6.5);
        const pwrVal = Math.round(42 + mods.powerPoints * 6.5);
        const spnVal = Math.round(42 + mods.spinPoints * 6.5);
        const rflxVal = Math.round(42 + mods.reflexPoints * 6.5);

        const spdPct = Math.min(100, Math.max(14, Math.round((spdVal / 365) * 100)));
        const pwrPct = Math.min(100, Math.max(14, Math.round((pwrVal / 365) * 100)));
        const spnPct = Math.min(100, Math.max(14, Math.round((spnVal / 365) * 100)));
        const rflxPct = Math.min(100, Math.max(14, Math.round((rflxVal / 365) * 100)));

        const btnLabel = isSelected
          ? editUnit === "partner"
            ? "ĐANG LÀ BOT ĐỒNG ĐỘI"
            : "ĐANG RA SÂN CHÍNH"
          : unlocked
          ? editUnit === "partner"
            ? "CHỌN LÀM BOT ĐỒNG ĐỘI"
            : "CHỌN VẬN ĐỘNG VIÊN"
          : `CHIÊU MỘ · ${SVG_ICONS.coin("coin-svg-icon icon-xs")} ${c.price.toLocaleString("vi-VN")}`;

        const miiPortraitSvg = getMiiAvatarSVG(c.id, { uid: `shop-card-${c.id}` });

        return `
          <article class="shop-item-card char-card ${isSelected ? "active" : ""} ${!unlocked ? "locked-card" : ""}" style="--stagger-idx:${Math.min(idx, 12)}; --card-accent:${c.accentCss}">
            <div class="shop-card-visual-box char-visual-box">
              <div class="char-portrait-wrap">${miiPortraitSvg}</div>
              <div class="char-ovr-Lockup">
                <span class="ovr-num" style="color:${mods.overallRating >= 250 ? "#facc15" : mods.overallRating >= 150 ? "#38bdf8" : "#f8fafc"}">${mods.overallRating}</span>
                <span class="ovr-lbl">OVR</span>
              </div>
            </div>

            <div class="shop-item-meta-line">${rarityLabel} · ${c.roleTag} · +${charCoinPct}% XU</div>
            <div class="shop-item-name">${c.name}</div>
            <div class="shop-item-role" style="color:${c.accentCss}; font-weight:800;">⚡ ${c.passiveName || c.title}</div>
            <div class="shop-item-desc">${c.passiveDesc}</div>

            <div class="shop-mini-bars">
              <div class="mini-bar-row"><span>TỐC</span><div class="mini-bar-track"><div class="mini-bar-fill" style="width:${spdPct}%"></div></div><strong class="mini-bar-num">${spdVal}</strong></div>
              <div class="mini-bar-row"><span>LỰC</span><div class="mini-bar-track"><div class="mini-bar-fill" style="width:${pwrPct}%"></div></div><strong class="mini-bar-num">${pwrVal}</strong></div>
              <div class="mini-bar-row"><span>XOÁY</span><div class="mini-bar-track"><div class="mini-bar-fill" style="width:${spnPct}%"></div></div><strong class="mini-bar-num">${spnVal}</strong></div>
              <div class="mini-bar-row"><span>P.XẠ</span><div class="mini-bar-track"><div class="mini-bar-fill" style="width:${rflxPct}%"></div></div><strong class="mini-bar-num">${rflxVal}</strong></div>
            </div>

            <div class="shop-item-actions">
              <button type="button" class="shop-action-btn ${isSelected ? "equipped" : unlocked ? "select" : canAfford ? "buy" : "buy locked"}"
                data-char-action="${c.id}">
                ${btnLabel}
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    container.innerHTML = `
      <div class="shop-section-block">
        <div class="shop-section-header">
          <div class="section-heading-group">
            <span class="section-index-tag">ROSTER // 30 PRO, ELEMENTAL, ROBOT &amp; MYTHIC LEGENDS</span>
            <h3 class="shop-section-title">ĐỘI HÌNH VẬN ĐỘNG VIÊN &amp; ROBOT: ${editUnit === "partner" ? "BOT ĐỒNG ĐỘI" : "BẠN"}</h3>
          </div>
          <span class="shop-section-sub">ĐÃ MỞ KHÓA ${countUnlocked}/${CHARACTER_ROSTER.length}</span>
        </div>

        <div class="char-filter-bar" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
          ${filterBarHtml}
        </div>

        <div class="shop-cards-grid">
          ${rosterHtml}
        </div>
      </div>
    `;

    container.querySelectorAll("[data-char-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.charCategoryFilter = btn.getAttribute("data-char-filter") || "all";
        this._playSfx("tab");
        this._renderCharactersTab(container);
      });
    });

    container.querySelectorAll("[data-char-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cid = btn.getAttribute("data-char-action");
        const res = this.shop.unlockOrSelectCharacter(cid, editUnit);
        this._showToast(res.message);
        if (res.ok) {
          this._playSfx(res.action === "unlocked" ? "unlock" : "equip");
          this.triggerPreviewPose(res.action === "unlocked" ? "win" : "forehand");
        } else {
          this._playSfx("error");
        }
      });
    });
  }

  _renderOutfitsTab(container) {
    const editUnit = this._EffectiveEditUnit();
    const selectedOutfitId =
      editUnit === "partner" ? this.shop.state.partnerOutfitId : this.shop.state.selectedOutfitId;
    const coins = this.shop.state.coins;

    const cardsHtml = OUTFIT_CATALOG.map((o, idx) => {
      const unlocked = this.shop.state.unlockedOutfits.includes(o.id);
      const isSelected = o.id === selectedOutfitId;
      const canAfford = coins >= o.price;

      const c1 = o.swatches?.[0] || "#2563eb";
      const c2 = o.swatches?.[1] || "#f8fafc";
      const c3 = o.swatches?.[2] || "#0f172a";

      const btnLabel = isSelected
        ? "ĐANG MẶC THI ĐẤU"
        : unlocked
        ? "MẶC TRANG PHỤC NÀY"
        : `MỞ KHÓA · ${SVG_ICONS.coin("coin-svg-icon icon-xs")} ${o.price.toLocaleString("vi-VN")}`;

      return `
        <article class="shop-item-card ${isSelected ? "active" : ""}" style="--stagger-idx:${idx}; --card-accent:${c1}">
          <div class="shop-card-visual-box outfit-visual-box">
            ${SVG_ICONS.proOutfitArt(c1, c2, c3, "shop-card-art-svg", o.id)}
          </div>
          <div class="shop-item-meta-line">${o.price === 0 ? "TIÊU CHUẨN · CLB" : "PRO TOUR KIT · 3D"}</div>
          <div class="shop-item-name">${o.name}</div>
          <div class="shop-item-desc">${o.desc}</div>
          <div class="shop-item-actions">
            <button type="button" class="shop-action-btn ${isSelected ? "equipped" : unlocked ? "select" : canAfford ? "buy" : "buy locked"}"
              data-outfit-action="${o.id}">
              ${btnLabel}
            </button>
          </div>
        </article>
      `;
    }).join("");

    container.innerHTML = `
      <div class="shop-section-block">
        <div class="shop-section-header">
          <div class="section-heading-group">
            <span class="section-index-tag">APPAREL // GRAND SLAM JERSEYS</span>
            <h3 class="shop-section-title">TRANG PHỤC THI ĐẤU: ${editUnit === "partner" ? "BOT ĐỒNG ĐỘI" : "BẠN"}</h3>
          </div>
          <span class="shop-section-sub">${OUTFIT_CATALOG.length} BỘ TRANG PHỤC 3D</span>
        </div>
        <div class="shop-cards-grid">
          ${cardsHtml}
        </div>
      </div>
    `;

    container.querySelectorAll("[data-outfit-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const oid = btn.getAttribute("data-outfit-action");
        const res = this.shop.unlockOrSelectOutfit(oid, editUnit);
        this._showToast(res.message);
        if (res.ok) {
          this._playSfx(res.action === "unlocked" ? "unlock" : "equip");
          this.triggerPreviewPose("win");
        } else {
          this._playSfx("error");
        }
      });
    });
  }

  _renderStrikeVfxTab(container) {
    const editUnit = this._EffectiveEditUnit();
    const selectedVfxId =
      editUnit === "partner" ? this.shop.state.partnerStrikeVfxId : this.shop.state.selectedStrikeVfxId;
    const coins = this.shop.state.coins;

    const cardsHtml = STRIKE_VFX_CATALOG.map((v, idx) => {
      const unlocked = this.shop.state.unlockedStrikeVfx.includes(v.id);
      const isSelected = v.id === selectedVfxId;
      const canAfford = coins >= v.price;

      const c1 = v.colors?.[0] || "#38bdf8";
      const c2 = v.colors?.[1] || "#2563eb";
      const c3 = v.colors?.[2] || "#facc15";

      const btnLabel = isSelected
        ? "ĐANG KÍCH HOẠT"
        : unlocked
        ? "TRANG BỊ HIỆU ỨNG"
        : `MỞ KHÓA · ${SVG_ICONS.coin("coin-svg-icon icon-xs")} ${v.price.toLocaleString("vi-VN")}`;

      return `
        <article class="shop-item-card vfx-card ${isSelected ? "active" : ""}" style="--stagger-idx:${idx}; --card-accent:${c1}">
          <div class="shop-card-visual-box vfx-visual-box">
            ${SVG_ICONS.proVfxArt(c1, c2, c3, "shop-card-art-svg", v.id)}
          </div>
          <div class="shop-item-meta-line">${v.badge} · SÓNG XUNG KÍCH ${v.shockwaveCount} TẦNG</div>
          <div class="shop-item-name">${v.name}</div>
          <div class="shop-item-role">+${v.powerBonus} Lực Đánh · +${v.spinBonus} Độ Xoáy</div>
          <div class="shop-item-desc">${v.desc}</div>
          <div class="shop-item-actions vfx-dual-actions">
            <button type="button" class="shop-action-btn preview-vfx-btn" data-preview-vfx="${v.id}">
              TEST 3D
            </button>
            <button type="button" class="shop-action-btn ${isSelected ? "equipped" : unlocked ? "select" : canAfford ? "buy" : "buy locked"}"
              data-vfx-action="${v.id}">
              ${btnLabel}
            </button>
          </div>
        </article>
      `;
    }).join("");

    container.innerHTML = `
      <div class="shop-section-block">
        <div class="shop-section-header">
          <div class="section-heading-group">
            <span class="section-index-tag">KINETICS // BALL TRAIL &amp; IMPACT VFX</span>
            <h3 class="shop-section-title">HIỆU ỨNG ĐÁNH BÓNG: ${editUnit === "partner" ? "BOT ĐỒNG ĐỘI" : "BẠN"}</h3>
          </div>
          <span class="shop-section-sub">NHẤN "TEST 3D" ĐỂ XEM TRỰC TIẾP TRÊN SÂN</span>
        </div>
        <div class="shop-cards-grid rackets-grid">
          ${cardsHtml}
        </div>
      </div>
    `;

    container.querySelectorAll("[data-preview-vfx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const vid = btn.getAttribute("data-preview-vfx");
        const vfxCfg = STRIKE_VFX_CATALOG.find((v) => v.id === vid) || STRIKE_VFX_CATALOG[0];
        const actor = editUnit === "partner" ? this.previewActorPartner : this.previewActorPlayer;
        if (actor) {
          actor.swingType = "smash";
          actor.swingDuration = 0.45;
          actor.swingTimer = 0.45;
          this.previewRacketKinematics.triggerSwing(actor, {
            shotType: "smash",
            side: "overhead",
            speed: 1.5,
            timing: "sweet"
          });
          this._triggerShopStrikeVfxBurst(actor, vfxCfg);
          this.stageCameraShake = Math.max(this.stageCameraShake || 0, 0.55);
          if (this.engine?.audioEngine?.playRacketHit) {
            this.engine.audioEngine.playRacketHit("smash", "perfect");
          }
        }
      });
    });

    container.querySelectorAll("[data-vfx-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const vid = btn.getAttribute("data-vfx-action");
        const res = this.shop.unlockOrSelectStrikeVfx(vid, editUnit);
        this._showToast(res.message);
        if (res.ok) {
          this._playSfx(res.action === "unlocked" ? "unlock" : "equip");
          this.triggerPreviewPose("smash");
        } else {
          this._playSfx("error");
        }
      });
    });
  }

  _renderGearAndRacketsTab(container) {
    const editUnit = this._EffectiveEditUnit();
    const selectedRacketId =
      editUnit === "partner" ? this.shop.state.partnerRacketId : this.shop.state.selectedRacketId;
    const coins = this.shop.state.coins;
    const char = this.shop.getSelectedCharacter(editUnit);
    const activeGear = new Set(this.shop.getActiveAccessoryIdsForUnit(editUnit));

    const racketsHtml = RACKET_CATALOG.map((r, idx) => {
      const unlocked = this.shop.state.unlockedRackets.includes(r.id);
      const isSelected = r.id === selectedRacketId;
      const canAfford = coins >= r.price;

      const bonusTags = [];
      if (r.bonus.power) bonusTags.push(`+${r.bonus.power} LỰC`);
      if (r.bonus.spin) bonusTags.push(`+${r.bonus.spin} XOÁY`);
      if (r.bonus.reflex) bonusTags.push(`+${r.bonus.reflex} P.XẠ`);

      const frameCss = `#${r.frameHex.toString(16).padStart(6, "0")}`;
      const throatCss = `#${r.throatHex.toString(16).padStart(6, "0")}`;
      const stringCss = `#${(r.stringHex || 0xffffff).toString(16).padStart(6, "0")}`;

      const btnLabel = isSelected
        ? "ĐANG CẦM TRÊN TAY"
        : unlocked
        ? "TRANG BỊ VỢT NÀY"
        : `MUA VỢT · ${SVG_ICONS.coin("coin-svg-icon icon-xs")} ${r.price.toLocaleString("vi-VN")}`;

      return `
        <article class="shop-item-card ${isSelected ? "active" : ""}" style="--stagger-idx:${idx}; --card-accent:${frameCss}">
          <div class="shop-card-visual-box racket-visual-box">
            ${SVG_ICONS.proRacketArt(frameCss, throatCss, stringCss, "shop-card-art-svg", r.id)}
          </div>
          <div class="shop-item-meta-line">${bonusTags.length ? bonusTags.join(" · ") : "KHUNG TIÊU CHUẨN"}</div>
          <div class="shop-item-name">${r.name}</div>
          <div class="shop-item-desc">${r.desc}</div>
          <div class="shop-item-actions">
            <button type="button" class="shop-action-btn ${isSelected ? "equipped" : unlocked ? "select" : canAfford ? "buy" : "buy locked"}"
              data-racket-action="${r.id}">
              ${btnLabel}
            </button>
          </div>
        </article>
      `;
    }).join("");

    const slotNames = {
      hat: "PHỤ KIỆN ĐẦU 3D",
      glasses: "KÍNH QUANG HỌC 3D",
      back: "GIÁP VAI / CÁNH 3D",
      wrist: "BĂNG CỔ TAY 3D",
      aura: "HÀO QUANG SÂN 3D"
    };

    const accHtml = ACCESSORY_CATALOG.map((a, idx) => {
      const isDefault = (char.appearance.defaultAccessories || []).includes(a.id);
      const unlocked = isDefault || this.shop.state.unlockedAccessories.includes(a.id);
      const isEquipped = activeGear.has(a.id);
      const canAfford = coins >= a.price;
      const colorCss = `#${a.colorHex.toString(16).padStart(6, "0")}`;

      const accBonusTags = [];
      if (a.bonus) {
        if (a.bonus.speed) accBonusTags.push(`+${a.bonus.speed} TỐC`);
        if (a.bonus.power) accBonusTags.push(`+${a.bonus.power} LỰC`);
        if (a.bonus.spin) accBonusTags.push(`+${a.bonus.spin} XOÁY`);
        if (a.bonus.reflex) accBonusTags.push(`+${a.bonus.reflex} P.XẠ`);
        if (a.bonus.botIntercept) accBonusTags.push(`+${Math.round(a.bonus.botIntercept * 100)}% AI BẮT LƯỚI`);
        if (a.bonus.coinPct) accBonusTags.push(`+${a.bonus.coinPct}% XU`);
      }

      const btnLabel = isEquipped
        ? "ĐANG GẮN (NHẤN ĐỂ THÁO)"
        : unlocked
        ? "GẮN LÊN NHÂN VẬT 3D"
        : `MỞ KHÓA · ${SVG_ICONS.coin("coin-svg-icon icon-xs")} ${a.price.toLocaleString("vi-VN")}`;

      return `
        <article class="shop-item-card ${isEquipped ? "active" : ""}" style="--stagger-idx:${idx + 5}; --card-accent:${colorCss}">
          <div class="shop-card-visual-box acc-visual-box">
            ${SVG_ICONS.proAccessoryArt(a.id, colorCss, "shop-card-art-svg")}
          </div>
          <div class="shop-item-meta-line">${slotNames[a.slot] || "PHỤ KIỆN 3D"}</div>
          <div class="shop-item-name">${a.name}</div>
          ${accBonusTags.length ? `<div class="shop-item-role" style="color:${colorCss}; font-weight:800;">⚡ ${accBonusTags.join(" · ")}</div>` : ""}
          <div class="shop-item-desc">${a.desc}</div>
          <div class="shop-item-actions">
            <button type="button" class="shop-action-btn ${isEquipped ? "equipped" : unlocked ? "select" : canAfford ? "buy" : "buy locked"}"
              data-acc-action="${a.id}">
              ${btnLabel}
            </button>
          </div>
        </article>
      `;
    }).join("");

    container.innerHTML = `
      <div class="shop-section-block">
        <div class="shop-section-header">
          <div class="section-heading-group">
            <span class="section-index-tag">01 // PRO CARBON RACKETS</span>
            <h3 class="shop-section-title">VỢT THI ĐẤU: ${editUnit === "partner" ? "BOT ĐỒNG ĐỘI" : "BẠN"}</h3>
          </div>
          <span class="shop-section-sub">${RACKET_CATALOG.length} MẪU VỢT PRO</span>
        </div>
        <div class="shop-cards-grid rackets-grid">
          ${racketsHtml}
        </div>
      </div>

      <div class="shop-section-block">
        <div class="shop-section-header">
          <div class="section-heading-group">
            <span class="section-index-tag">02 // 3D COSMETIC GEAR, AURAS &amp; STAT BOOSTERS</span>
            <h3 class="shop-section-title">PHỤ KIỆN 3D &amp; HÀO QUANG CỘNG CHỈ SỐ: ${editUnit === "partner" ? "BOT ĐỒNG ĐỘI" : "BẠN"}</h3>
          </div>
          <span class="shop-section-sub">${ACCESSORY_CATALOG.length} TRANG BỊ 3D CÓ CHỈ SỐ</span>
        </div>
        <div class="shop-cards-grid">
          ${accHtml}
        </div>
      </div>
    `;

    container.querySelectorAll("[data-racket-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const rid = btn.getAttribute("data-racket-action");
        const res = this.shop.unlockOrSelectRacket(rid, editUnit);
        this._showToast(res.message);
        if (res.ok) {
          this._playSfx(res.action === "unlocked" ? "unlock" : "equip");
          this.triggerPreviewPose("forehand");
        } else {
          this._playSfx("error");
        }
      });
    });

    container.querySelectorAll("[data-acc-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const aid = btn.getAttribute("data-acc-action");
        const res = this.shop.unlockOrToggleAccessory(aid, editUnit);
        this._showToast(res.message);
        if (res.ok) {
          this._playSfx(res.action === "unlocked" ? "unlock" : "equip");
          this.triggerPreviewPose("win");
        } else {
          this._playSfx("error");
        }
      });
    });
  }
}
