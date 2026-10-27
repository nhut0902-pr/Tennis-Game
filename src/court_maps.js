import * as THREE from "three";

export const COURT_MAPS = [
  {
    id: "melbourne_hard",
    name: "Melbourne Grand Arena",
    shortName: "Melbourne Blue",
    subtitle: "Mặt Sân Cứng Chuẩn Quốc Tế",
    surfaceLabel: "HARD COURT • CÂN BẰNG",
    badgeColor: "#2563eb",
    accentCss: "#38bdf8",
    innerCourtHex: "#1d63b8",
    outerCourtHex: "#1e7a46",
    lineHex: "#ffffff",
    netTapeHex: 0xffffff,
    netMeshHex: 0xe2e8f0,
    skyTop: "#1d6ed8",
    skyMid: "#4ea8ff",
    skyBot: "#d8f3ff",
    fogHex: 0xbae6fd,
    fogDensity: 0.0032,
    sunHex: 0xfffbeb,
    sunIntensity: 2.55,
    hemiSkyHex: 0xa6dcff,
    hemiGroundHex: 0x3b6e4c,
    bounceRestitution: 0.77,
    surfaceFriction: 0.86,
    coinBonusPct: 0.1,
    pattern: "hard_pro",
    propTheme: "grand_slam"
  },
  {
    id: "roland_clay",
    name: "Roland Paris Clay",
    shortName: "Đất Nện Paris",
    subtitle: "Thánh Địa Đất Nện Đỏ Hoàng Hôn",
    surfaceLabel: "CLAY COURT • NẢY CAO & XOÁY",
    badgeColor: "#ea580c",
    accentCss: "#fb923c",
    innerCourtHex: "#c24e24",
    outerCourtHex: "#8f3415",
    lineHex: "#fff7ed",
    netTapeHex: 0xfef3c7,
    netMeshHex: 0xd6d3d1,
    skyTop: "#7c2d12",
    skyMid: "#ea580c",
    skyBot: "#fed7aa",
    fogHex: 0xfdba74,
    fogDensity: 0.0038,
    sunHex: 0xffedd5,
    sunIntensity: 2.65,
    hemiSkyHex: 0xfdba74,
    hemiGroundHex: 0x7c2d12,
    bounceRestitution: 0.83,
    surfaceFriction: 0.81,
    coinBonusPct: 0.2,
    pattern: "clay_brick",
    propTheme: "clay_pillars"
  },
  {
    id: "london_grass",
    name: "Royal London Grass",
    shortName: "Sân Cỏ London",
    subtitle: "Đấu Trường Cỏ Hoàng Gia Cổ Điển",
    surfaceLabel: "GRASS COURT • BÓNG NHANH",
    badgeColor: "#16a34a",
    accentCss: "#4ade80",
    innerCourtHex: "#1f7a3e",
    outerCourtHex: "#134e28",
    lineHex: "#ffffff",
    netTapeHex: 0xffffff,
    netMeshHex: 0xd1fae5,
    skyTop: "#1e40af",
    skyMid: "#60a5fa",
    skyBot: "#ecfdf5",
    fogHex: 0xd1fae5,
    fogDensity: 0.003,
    sunHex: 0xfefce8,
    sunIntensity: 2.5,
    hemiSkyHex: 0xbbf7d0,
    hemiGroundHex: 0x14532d,
    bounceRestitution: 0.72,
    surfaceFriction: 0.92,
    coinBonusPct: 0.25,
    pattern: "grass_stripes",
    propTheme: "royal_hedges"
  },
  {
    id: "cyber_tokyo",
    name: "Cyber Neon Tokyo 2099",
    shortName: "Cyber Neon",
    subtitle: "Siêu Đô Thị Ánh Sáng Laser Đêm",
    surfaceLabel: "CYBER COURT • SIÊU TỐC ĐỘ",
    badgeColor: "#06b6d4",
    accentCss: "#22d3ee",
    innerCourtHex: "#0b132b",
    outerCourtHex: "#050814",
    lineHex: "#00f5ff",
    netTapeHex: 0x00f5ff,
    netMeshHex: 0xf43f5e,
    skyTop: "#030712",
    skyMid: "#1e1b4b",
    skyBot: "#0f172a",
    fogHex: 0x090d1a,
    fogDensity: 0.0045,
    sunHex: 0x38bdf8,
    sunIntensity: 2.35,
    hemiSkyHex: 0x22d3ee,
    hemiGroundHex: 0x831843,
    bounceRestitution: 0.81,
    surfaceFriction: 0.91,
    coinBonusPct: 0.4,
    pattern: "cyber_grid",
    propTheme: "cyber_pylons"
  },
  {
    id: "maldives_sunset",
    name: "Maldives Sunset Lagoon",
    shortName: "Biển Hoàng Hôn",
    subtitle: "Vịnh Ngọc Bích Nhiệt Đới",
    surfaceLabel: "RESORT COURT • ĐỘ NẢY ÊM",
    badgeColor: "#db2777",
    accentCss: "#f472b6",
    innerCourtHex: "#0d9488",
    outerCourtHex: "#d97706",
    lineHex: "#fef9c3",
    netTapeHex: 0xfef08a,
    netMeshHex: 0x99f6e4,
    skyTop: "#4c1d95",
    skyMid: "#db2777",
    skyBot: "#fde047",
    fogHex: 0xfda4af,
    fogDensity: 0.0034,
    sunHex: 0xfde047,
    sunIntensity: 2.6,
    hemiSkyHex: 0xf472b6,
    hemiGroundHex: 0x0f766e,
    bounceRestitution: 0.76,
    surfaceFriction: 0.85,
    coinBonusPct: 0.3,
    pattern: "lagoon_waves",
    propTheme: "sunset_torches"
  },
  {
    id: "volcano_magma",
    name: "Volcanic Magma Core",
    shortName: "Hỏa Diệm Sơn",
    subtitle: "Đấu Trường Dung Nham Lửa Thiêng",
    surfaceLabel: "MAGMA COURT • NẢY CỰC MẠNH",
    badgeColor: "#dc2626",
    accentCss: "#f87171",
    innerCourtHex: "#271715",
    outerCourtHex: "#140a09",
    lineHex: "#ff6b00",
    netTapeHex: 0xfacc15,
    netMeshHex: 0xef4444,
    skyTop: "#1c0404",
    skyMid: "#7f1d1d",
    skyBot: "#ea580c",
    fogHex: 0x450a0a,
    fogDensity: 0.0048,
    sunHex: 0xfb923c,
    sunIntensity: 2.75,
    hemiSkyHex: 0xf97316,
    hemiGroundHex: 0x450a0a,
    bounceRestitution: 0.86,
    surfaceFriction: 0.88,
    coinBonusPct: 0.55,
    pattern: "magma_cracks",
    propTheme: "lava_monoliths"
  },
  {
    id: "arctic_glacier",
    name: "Arctic Aurora Crystal",
    shortName: "Băng Cực Quang",
    subtitle: "Đỉnh Băng Pha Lê Bắc Cực Quang",
    surfaceLabel: "ICE COURT • TRƯỢT SIÊU TỐC",
    badgeColor: "#0284c7",
    accentCss: "#7dd3fc",
    innerCourtHex: "#0369a1",
    outerCourtHex: "#0c4a6e",
    lineHex: "#e0f2fe",
    netTapeHex: 0x7dd3fc,
    netMeshHex: 0xe0f2fe,
    skyTop: "#022c22",
    skyMid: "#0284c7",
    skyBot: "#a7f3d0",
    fogHex: 0x082f49,
    fogDensity: 0.0036,
    sunHex: 0xe0f2fe,
    sunIntensity: 2.5,
    hemiSkyHex: 0x34d399,
    hemiGroundHex: 0x0369a1,
    bounceRestitution: 0.79,
    surfaceFriction: 0.95,
    coinBonusPct: 0.45,
    pattern: "ice_crystal",
    propTheme: "ice_spires"
  },
  {
    id: "cosmic_nebula",
    name: "Cosmic Starlight Nebula",
    shortName: "Vũ Trụ Tinh Vân",
    subtitle: "Thánh Điện Ngân Hà Không Trọng Lực",
    surfaceLabel: "COSMIC COURT • SIÊU CẤP +65% XU",
    badgeColor: "#9333ea",
    accentCss: "#c084fc",
    innerCourtHex: "#2e1065",
    outerCourtHex: "#0f0728",
    lineHex: "#fde047",
    netTapeHex: 0xfacc15,
    netMeshHex: 0xc084fc,
    skyTop: "#05020d",
    skyMid: "#3b0764",
    skyBot: "#701a75",
    fogHex: 0x14072c,
    fogDensity: 0.0042,
    sunHex: 0xfde047,
    sunIntensity: 2.6,
    hemiSkyHex: 0xc084fc,
    hemiGroundHex: 0x1e1b4b,
    bounceRestitution: 0.84,
    surfaceFriction: 0.89,
    coinBonusPct: 0.65,
    pattern: "cosmic_stars",
    propTheme: "cosmic_rings"
  },
  {
    id: "windy_canyon",
    name: "Gale Force Wind Canyon",
    shortName: "Sân Gió Lốc (X2.5 Xu)",
    subtitle: "Hẻm Núi Gió Xoáy Tạt Ngang Cực Mạnh",
    surfaceLabel: "MAP GIÓ XOÁY • BÓNG LIỆNG • +150% XU",
    badgeColor: "#0d9488",
    accentCss: "#2dd4bf",
    innerCourtHex: "#115e59",
    outerCourtHex: "#134e4a",
    lineHex: "#ccfbf1",
    netTapeHex: 0x5eead4,
    netMeshHex: 0x99f6e4,
    skyTop: "#042f2e",
    skyMid: "#0f766e",
    skyBot: "#99f6e4",
    fogHex: 0x115e59,
    fogDensity: 0.0046,
    sunHex: 0xccfbf1,
    sunIntensity: 2.35,
    hemiSkyHex: 0x5eead4,
    hemiGroundHex: 0x042f2e,
    bounceRestitution: 0.81,
    surfaceFriction: 0.88,
    coinBonusPct: 1.5,
    defaultWeather: "wind",
    windStrength: 2.4,
    pattern: "wind_streaks",
    propTheme: "wind_turbines"
  },
  {
    id: "storm_thunder",
    name: "Thunderstorm Tempest Arena",
    shortName: "Đảo Bão Tố (X4.0 Xu)",
    subtitle: "Đấu Trường Mưa Bão Sấm Sét Giữa Đại Dương",
    surfaceLabel: "MAP MƯA BÃO • GIÓ GIẬT & SẤM SÉT • +300% XU",
    badgeColor: "#1d4ed8",
    accentCss: "#60a5fa",
    innerCourtHex: "#1e293b",
    outerCourtHex: "#0f172a",
    lineHex: "#38bdf8",
    netTapeHex: 0x60a5fa,
    netMeshHex: 0x93c5fd,
    skyTop: "#020617",
    skyMid: "#1e293b",
    skyBot: "#334155",
    fogHex: 0x0f172a,
    fogDensity: 0.0062,
    sunHex: 0x93c5fd,
    sunIntensity: 1.95,
    hemiSkyHex: 0x38bdf8,
    hemiGroundHex: 0x090d16,
    bounceRestitution: 0.78,
    surfaceFriction: 0.94,
    coinBonusPct: 3.0,
    defaultWeather: "storm",
    windStrength: 3.8,
    pattern: "storm_grid",
    propTheme: "storm_towers"
  },
  {
    id: "super_typhoon",
    name: "Super Typhoon Eye Lv.12",
    shortName: "Tâm Siêu Bão (X6.0 Xu)",
    subtitle: "Tâm Bão Cuồng Phong Cấp 12 Siêu Thưởng Xu",
    surfaceLabel: "SIÊU BÃO CẤP 12 • CUỒNG PHONG • +500% XU",
    badgeColor: "#7e22ce",
    accentCss: "#f43f5e",
    innerCourtHex: "#1e1b4b",
    outerCourtHex: "#090514",
    lineHex: "#f43f5e",
    netTapeHex: 0xfacc15,
    netMeshHex: 0xf43f5e,
    skyTop: "#030008",
    skyMid: "#311042",
    skyBot: "#4c0519",
    fogHex: 0x130722,
    fogDensity: 0.0072,
    sunHex: 0xfda4af,
    sunIntensity: 2.1,
    hemiSkyHex: 0xf43f5e,
    hemiGroundHex: 0x1e1b4b,
    bounceRestitution: 0.85,
    surfaceFriction: 0.93,
    coinBonusPct: 5.0,
    defaultWeather: "super_storm",
    windStrength: 5.2,
    pattern: "typhoon_vortex",
    propTheme: "typhoon_spires"
  }
];

export const COURT_WEATHER_MODES = [
  {
    id: "calm",
    name: "Trời Quang",
    shortLabel: "TRỜI QUANG",
    desc: "Thời tiết ổn định, không có gió tạt ngang",
    extraCoinBonusPct: 0,
    windPower: 0,
    rainCount: 0,
    badgeColor: "#475569"
  },
  {
    id: "wind",
    name: "Gió Lốc Xoáy",
    shortLabel: "GIÓ LỐC (+120% XU)",
    desc: "Gió tạt ngang làm bóng uốn lượn trên không • Thưởng thêm +120% Xu",
    extraCoinBonusPct: 1.2,
    windPower: 2.35,
    rainCount: 90,
    badgeColor: "#0d9488"
  },
  {
    id: "storm",
    name: "Bão Mưa Sấm Sét",
    shortLabel: "MƯA BÃO (+250% XU)",
    desc: "Mưa bão lớn, sấm chớp và gió giật đảo chiều • Thưởng thêm +250% Xu",
    extraCoinBonusPct: 2.5,
    windPower: 3.75,
    rainCount: 220,
    badgeColor: "#2563eb"
  },
  {
    id: "super_storm",
    name: "Siêu Bão Cấp 12",
    shortLabel: "SIÊU BÃO (+450% XU)",
    desc: "Cuồng phong cấp 12 cực mạnh đẩy bóng xoáy gắt • Thưởng thêm +450% Xu",
    extraCoinBonusPct: 4.5,
    windPower: 5.1,
    rainCount: 340,
    badgeColor: "#e11d48"
  }
];

function createCourtSurfaceTexture(mapCfg) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  // Outer apron
  ctx.fillStyle = mapCfg.outerCourtHex;
  ctx.fillRect(0, 0, 1024, 2048);

  // Subtle outer texture detail
  if (mapCfg.pattern === "grass_stripes") {
    for (let i = 0; i < 32; i++) {
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.045)";
      ctx.fillRect(0, i * 64, 1024, 64);
    }
  } else if (mapCfg.pattern === "cyber_grid") {
    ctx.strokeStyle = "rgba(0, 245, 255, 0.12)";
    ctx.lineWidth = 2;
    for (let x = 0; x <= 1024; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 2048);
      ctx.stroke();
    }
    for (let y = 0; y <= 2048; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }
  } else if (mapCfg.pattern === "magma_cracks") {
    const grad = ctx.createRadialGradient(512, 1024, 100, 512, 1024, 980);
    grad.addColorStop(0, "rgba(255, 90, 0, 0.22)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0.45)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 2048);
  } else if (mapCfg.pattern === "cosmic_stars") {
    for (let i = 0; i < 180; i++) {
      const sx = (i * 173) % 1024;
      const sy = (i * 311) % 2048;
      const r = (i % 3) + 1;
      ctx.fillStyle = i % 4 === 0 ? "#fde047" : "#e9d5ff";
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner playing court bounds mapped to world plane (24m wide x 36m long)
  // Doubles court is 10.97m wide x 23.77m long
  const cx = 512;
  const cy = 1024;
  const pxPerMeterX = 1024 / 24;
  const pxPerMeterZ = 2048 / 36;

  const halfDoublesW = 5.485 * pxPerMeterX;
  const halfSinglesW = 4.115 * pxPerMeterX;
  const halfCourtL = 11.89 * pxPerMeterZ;
  const serviceZ = 6.4 * pxPerMeterZ;

  // Fill inner court
  ctx.fillStyle = mapCfg.innerCourtHex;
  ctx.fillRect(cx - halfDoublesW, cy - halfCourtL, halfDoublesW * 2, halfCourtL * 2);

  // Inner court special patterns
  if (mapCfg.pattern === "grass_stripes") {
    const stripeCount = 16;
    const stripeH = (halfCourtL * 2) / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(cx - halfDoublesW, cy - halfCourtL + i * stripeH, halfDoublesW * 2, stripeH);
    }
  } else if (mapCfg.pattern === "clay_brick") {
    for (let i = 0; i < 240; i++) {
      ctx.fillStyle = i % 2 === 0 ? "rgba(255, 220, 180, 0.05)" : "rgba(80, 20, 5, 0.06)";
      const rx = cx - halfDoublesW + ((i * 97) % (halfDoublesW * 2));
      const ry = cy - halfCourtL + ((i * 151) % (halfCourtL * 2));
      ctx.fillRect(rx, ry, 28, 14);
    }
  } else if (mapCfg.pattern === "ice_crystal") {
    const iceGrad = ctx.createLinearGradient(cx - halfDoublesW, cy - halfCourtL, cx + halfDoublesW, cy + halfCourtL);
    iceGrad.addColorStop(0, "rgba(224, 242, 254, 0.22)");
    iceGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.08)");
    iceGrad.addColorStop(1, "rgba(186, 230, 253, 0.25)");
    ctx.fillStyle = iceGrad;
    ctx.fillRect(cx - halfDoublesW, cy - halfCourtL, halfDoublesW * 2, halfCourtL * 2);
  } else if (mapCfg.pattern === "lagoon_waves") {
    const waveGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, halfCourtL);
    waveGrad.addColorStop(0, "rgba(45, 212, 191, 0.28)");
    waveGrad.addColorStop(1, "rgba(15, 118, 110, 0.1)");
    ctx.fillStyle = waveGrad;
    ctx.fillRect(cx - halfDoublesW, cy - halfCourtL, halfDoublesW * 2, halfCourtL * 2);
  }

  // Court Lines
  ctx.strokeStyle = mapCfg.lineHex;
  ctx.lineWidth = 6;
  ctx.shadowColor = mapCfg.lineHex;
  ctx.shadowBlur = mapCfg.pattern === "cyber_grid" || mapCfg.pattern === "magma_cracks" || mapCfg.pattern === "cosmic_stars" ? 12 : 0;

  // Outer doubles rectangle
  ctx.strokeRect(cx - halfDoublesW, cy - halfCourtL, halfDoublesW * 2, halfCourtL * 2);

  // Singles sidelines
  ctx.beginPath();
  ctx.moveTo(cx - halfSinglesW, cy - halfCourtL);
  ctx.lineTo(cx - halfSinglesW, cy + halfCourtL);
  ctx.moveTo(cx + halfSinglesW, cy - halfCourtL);
  ctx.lineTo(cx + halfSinglesW, cy + halfCourtL);

  // Service lines
  ctx.moveTo(cx - halfSinglesW, cy - serviceZ);
  ctx.lineTo(cx + halfSinglesW, cy - serviceZ);
  ctx.moveTo(cx - halfSinglesW, cy + serviceZ);
  ctx.lineTo(cx + halfSinglesW, cy + serviceZ);

  // Center service line
  ctx.moveTo(cx, cy - serviceZ);
  ctx.lineTo(cx, cy + serviceZ);

  // Center baseline marks
  ctx.moveTo(cx, cy - halfCourtL);
  ctx.lineTo(cx, cy - halfCourtL + 18);
  ctx.moveTo(cx, cy + halfCourtL);
  ctx.lineTo(cx, cy + halfCourtL - 18);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function createSkyTextureForMap(mapCfg) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 0, 420);
  grad.addColorStop(0, mapCfg.skyTop);
  grad.addColorStop(0.52, mapCfg.skyMid);
  grad.addColorStop(1, mapCfg.skyBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  const isNight =
    mapCfg.id === "cyber_tokyo" || mapCfg.id === "cosmic_nebula" || mapCfg.id === "arctic_glacier";

  if (isNight) {
    for (let i = 0; i < 160; i++) {
      const x = (i * 197) % 1024;
      const y = (i * 89) % 280;
      const r = (i % 2) + 1;
      ctx.fillStyle = i % 3 === 0 ? mapCfg.accentCss : "#ffffff";
      ctx.globalAlpha = 0.45 + (i % 5) * 0.1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Soft atmospheric clouds / aurora bands
  const cloudCenters = [
    [130, 185, 95, 36],
    [240, 175, 115, 42],
    [490, 165, 130, 46],
    [620, 178, 98, 36],
    [850, 172, 125, 44]
  ];
  cloudCenters.forEach(([x, y, rx, ry]) => {
    const cg = ctx.createRadialGradient(x, y - ry * 0.2, rx * 0.1, x, y, rx);
    if (mapCfg.id === "arctic_glacier") {
      cg.addColorStop(0, "rgba(52, 211, 153, 0.55)");
      cg.addColorStop(0.6, "rgba(56, 189, 248, 0.25)");
      cg.addColorStop(1, "rgba(0, 0, 0, 0)");
    } else if (mapCfg.id === "cyber_tokyo" || mapCfg.id === "cosmic_nebula") {
      cg.addColorStop(0, "rgba(192, 132, 252, 0.38)");
      cg.addColorStop(0.6, "rgba(34, 211, 238, 0.16)");
      cg.addColorStop(1, "rgba(0, 0, 0, 0)");
    } else if (mapCfg.id === "volcano_magma") {
      cg.addColorStop(0, "rgba(251, 146, 60, 0.48)");
      cg.addColorStop(0.6, "rgba(220, 38, 38, 0.22)");
      cg.addColorStop(1, "rgba(0, 0, 0, 0)");
    } else {
      cg.addColorStop(0, "rgba(255, 255, 255, 0.88)");
      cg.addColorStop(0.6, "rgba(245, 252, 255, 0.45)");
      cg.addColorStop(1, "rgba(255, 255, 255, 0)");
    }
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export class CourtMapManager {
  constructor(engine) {
    this.engine = engine;
    this.selectedMapId = this._loadSavedMapId();
    this.selectedWeatherId = this._loadSavedWeatherId();
    this.surfaceMesh = null;
    this.propGroup = new THREE.Group();
    this.propGroup.name = "CourtMapCustomProps";
    this.weatherGroup = new THREE.Group();
    this.weatherGroup.name = "CourtWeatherEffectsGroup";
    this.weatherDrops = [];
    this.lightningTimer = 0;
    this.nextLightningAt = 3.5;
    this._textureCache = new Map();
    this._skyCache = new Map();

    if (this.engine?.characterShop?.subscribe) {
      this.engine.characterShop.subscribe((shopState) => {
        const cloudMapId = shopState?.selectedMapId;
        if (cloudMapId && cloudMapId !== this.selectedMapId && COURT_MAPS.some((m) => m.id === cloudMapId)) {
          this.selectedMapId = cloudMapId;
          try {
            localStorage.setItem("argon_tennis_selected_map_v1", cloudMapId);
          } catch {}
          this.applyToScene();
          this.syncUiElements();
        }
      });
    }
  }

  _loadSavedMapId() {
    try {
      const saved =
        localStorage.getItem("argon_tennis_selected_map_v1") ||
        this.engine?.characterShop?.state?.selectedMapId;
      if (saved && COURT_MAPS.some((m) => m.id === saved)) return saved;
    } catch {}
    return COURT_MAPS[0].id;
  }

  _loadSavedWeatherId() {
    try {
      const saved = localStorage.getItem("argon_tennis_selected_weather_v2");
      if (saved && COURT_WEATHER_MODES.some((w) => w.id === saved)) return saved;
    } catch {}
    const mapCfg = COURT_MAPS.find((m) => m.id === this.selectedMapId);
    // Default to "storm" (Bão Mưa Sấm Sét) so players immediately see and feel the wind/storm challenge!
    return mapCfg?.defaultWeather || "storm";
  }

  getSelectedMap() {
    return COURT_MAPS.find((m) => m.id === this.selectedMapId) || COURT_MAPS[0];
  }

  getSelectedWeather() {
    return (
      COURT_WEATHER_MODES.find((w) => w.id === this.selectedWeatherId) ||
      COURT_WEATHER_MODES[0]
    );
  }

  getTotalCoinBonusPct() {
    const mapCfg = this.getSelectedMap();
    const weatherCfg = this.getSelectedWeather();
    const mapBonus = Number(mapCfg?.coinBonusPct || 0);
    const extraWeather =
      mapCfg?.defaultWeather === weatherCfg?.id
        ? Math.max(0, Number(weatherCfg?.extraCoinBonusPct || 0) * 0.4)
        : Number(weatherCfg?.extraCoinBonusPct || 0);
    return +(mapBonus + extraWeather).toFixed(2);
  }

  getCurrentWindVector(elapsedTime = 0) {
    const mapCfg = this.getSelectedMap();
    const weatherCfg = this.getSelectedWeather();
    const baseWind = Math.max(
      Number(mapCfg?.windStrength || 0),
      Number(weatherCfg?.windPower || 0)
    );
    if (baseWind <= 0.05) {
      return { x: 0, z: 0, strength: 0, speedKmh: 0, dirSign: 1, label: "TRỜI QUANG" };
    }
    // Dynamic gust oscillation so wind shifts direction every ~11 seconds and gusts strongly
    const gustWave = Math.sin(elapsedTime * 1.15) + 0.45 * Math.cos(elapsedTime * 2.1);
    const dirSign = Math.sin(elapsedTime * 0.26) >= 0 ? 1 : -1;
    const gustFactor = 0.72 + 0.38 * Math.abs(gustWave);
    const vx = dirSign * baseWind * gustFactor;
    const vz = Math.cos(elapsedTime * 0.58) * baseWind * 0.35;
    const speedKmh = Math.round(Math.abs(vx) * 26 + baseWind * 12);
    return {
      x: vx,
      z: vz,
      strength: baseWind,
      speedKmh,
      dirSign,
      label: weatherCfg?.shortLabel || "GIÓ BÃO"
    };
  }

  getMapById(id) {
    return COURT_MAPS.find((m) => m.id === id) || COURT_MAPS[0];
  }

  cycleNextMap() {
    const idx = COURT_MAPS.findIndex((m) => m.id === this.selectedMapId);
    const next = COURT_MAPS[(idx + 1) % COURT_MAPS.length];
    return this.selectMap(next.id, { showBanner: true });
  }

  cycleNextWeather() {
    const idx = COURT_WEATHER_MODES.findIndex((w) => w.id === this.selectedWeatherId);
    const next = COURT_WEATHER_MODES[(idx + 1) % COURT_WEATHER_MODES.length];
    return this.selectWeather(next.id, { showBanner: true });
  }

  selectWeather(weatherId, { showBanner = false } = {}) {
    const wCfg =
      COURT_WEATHER_MODES.find((w) => w.id === weatherId) ||
      COURT_WEATHER_MODES[0];
    this.selectedWeatherId = wCfg.id;
    try {
      localStorage.setItem("argon_tennis_selected_weather_v2", wCfg.id);
    } catch {}
    this._rebuildWeatherParticles();
    this.syncUiElements();

    if (showBanner && this.engine?.hud) {
      const totalBonus = Math.round(this.getTotalCoinBonusPct() * 100);
      this.engine.hud.showCenterBanner(`THỜI TIẾT: ${wCfg.name.toUpperCase()}`, {
        style: "style-gold",
        subText: `${wCfg.desc} • TỔNG THƯỞNG +${totalBonus}% XU`,
        durationMs: 1850
      });
    }
    return wCfg;
  }

  selectMap(mapId, { showBanner = false } = {}) {
    const mapCfg = this.getMapById(mapId);
    this.selectedMapId = mapCfg.id;
    try {
      localStorage.setItem("argon_tennis_selected_map_v1", mapCfg.id);
    } catch {}

    // Automatically activate the map's signature wind/storm weather if it has one
    if (mapCfg.defaultWeather) {
      this.selectedWeatherId = mapCfg.defaultWeather;
      try {
        localStorage.setItem("argon_tennis_selected_weather_v2", this.selectedWeatherId);
      } catch {}
    }

    if (this.engine?.characterShop?.state && this.engine.characterShop.state.selectedMapId !== mapCfg.id) {
      this.engine.characterShop.state.selectedMapId = mapCfg.id;
      this.engine.characterShop._saveState?.();
    }

    this.applyToScene();
    this.syncUiElements();

    if (showBanner && this.engine?.hud) {
      const totalBonus = Math.round(this.getTotalCoinBonusPct() * 100);
      this.engine.hud.showCenterBanner(mapCfg.name.toUpperCase(), {
        style: "style-gold",
        subText: `${mapCfg.surfaceLabel} • TỔNG THƯỞNG +${totalBonus}% XU`,
        durationMs: 1700
      });
    }
    return mapCfg;
  }

  applyToScene() {
    const scene = this.engine?.scene;
    if (!scene) return;
    const mapCfg = this.getSelectedMap();

    // 1. Custom 3D Court Surface Overlay Plane
    if (!this.surfaceMesh) {
      const geo = new THREE.PlaneGeometry(24, 36);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({
        roughness: 0.78,
        metalness: 0.06,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
      });
      this.surfaceMesh = new THREE.Mesh(geo, mat);
      this.surfaceMesh.position.set(0, 0.011, 0);
      this.surfaceMesh.receiveShadow = true;
      this.surfaceMesh.renderOrder = 1;
      scene.add(this.surfaceMesh);
    }

    if (!this._textureCache.has(mapCfg.id)) {
      this._textureCache.set(mapCfg.id, createCourtSurfaceTexture(mapCfg));
    }
    this.surfaceMesh.material.map = this._textureCache.get(mapCfg.id);
    this.surfaceMesh.material.roughness =
      mapCfg.id === "arctic_glacier" || mapCfg.id === "cyber_tokyo" || mapCfg.id === "storm_thunder" ? 0.32 : 0.78;
    this.surfaceMesh.material.metalness =
      mapCfg.id === "cyber_tokyo" || mapCfg.id === "cosmic_nebula" || mapCfg.id === "super_typhoon" ? 0.24 : 0.05;
    this.surfaceMesh.material.needsUpdate = true;

    // 2. Sky & Atmosphere & Lighting
    if (this.engine.skyDome?.material) {
      if (!this._skyCache.has(mapCfg.id)) {
        this._skyCache.set(mapCfg.id, createSkyTextureForMap(mapCfg));
      }
      this.engine.skyDome.material.map = this._skyCache.get(mapCfg.id);
      this.engine.skyDome.material.needsUpdate = true;
    }

    if (scene.background?.setHex) {
      scene.background.setHex(mapCfg.fogHex);
    }
    if (scene.fog) {
      scene.fog.color.setHex(mapCfg.fogHex);
      scene.fog.density = mapCfg.fogDensity;
    }
    if (this.engine.sunLight) {
      this.engine.sunLight.color.setHex(mapCfg.sunHex);
      this.engine.sunLight.intensity = mapCfg.sunIntensity;
    }

    // 3. Rebuild 3D Stadium Theme Props around the Court Perimeter
    if (!this.propGroup.parent) {
      scene.add(this.propGroup);
    }
    while (this.propGroup.children.length > 0) {
      const child = this.propGroup.children.pop();
      this.propGroup.remove(child);
    }
    this._buildThemeProps(mapCfg);
    this._rebuildWeatherParticles();
  }

  _rebuildWeatherParticles() {
    const scene = this.engine?.scene;
    if (!scene) return;
    if (!this.weatherGroup.parent) {
      scene.add(this.weatherGroup);
    }
    while (this.weatherGroup.children.length > 0) {
      const c = this.weatherGroup.children.pop();
      this.weatherGroup.remove(c);
    }
    this.weatherDrops = [];
    this.windRibbons = [];
    this.windDebris = [];

    const mapCfg = this.getSelectedMap();
    const wCfg = this.getSelectedWeather();
    const isStormy =
      wCfg.id === "wind" ||
      wCfg.id === "storm" ||
      wCfg.id === "super_storm" ||
      !!mapCfg.defaultWeather;
    if (!isStormy) return;

    const isSuper = wCfg.id === "super_storm" || mapCfg.id === "super_typhoon";
    const isStorm = wCfg.id === "storm" || mapCfg.id === "storm_thunder" || isSuper;

    // 1. BOLD 3D HORIZONTAL WIND STREAM RIBBONS sweeping right across the court!
    const ribbonCount = isSuper ? 46 : isStorm ? 36 : 28;
    for (let i = 0; i < ribbonCount; i++) {
      const len = 2.8 + (i % 4) * 0.95;
      const rGeo = new THREE.PlaneGeometry(len, i % 3 === 0 ? 0.095 : 0.055);
      const rMat = new THREE.MeshBasicMaterial({
        color: isSuper
          ? i % 2 === 0
            ? 0xf43f5e
            : 0xfde047
          : isStorm
            ? i % 2 === 0
              ? 0x38bdf8
              : 0xe0f2fe
            : 0x5eead4,
        transparent: true,
        opacity: isSuper ? 0.72 : 0.58,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.position.set(
        (Math.random() - 0.5) * 20,
        0.38 + Math.random() * 4.4,
        (Math.random() - 0.5) * 25
      );
      rMesh.rotation.x = Math.PI * 0.15;
      this.weatherGroup.add(rMesh);
      this.windRibbons.push({
        mesh: rMesh,
        baseY: rMesh.position.y,
        phase: Math.random() * Math.PI * 2,
        speedMult: 0.85 + Math.random() * 0.65
      });
    }

    // 2. SWIRLING WIND LEAVES / ENERGY DEBRIS blowing across the turf
    const debrisGeo = new THREE.OctahedronGeometry(0.11, 0);
    const debrisMat = new THREE.MeshBasicMaterial({
      color: isSuper ? 0xfacc15 : 0x67e8f9,
      transparent: true,
      opacity: 0.82
    });
    for (let i = 0; i < 28; i++) {
      const dMesh = new THREE.Mesh(debrisGeo, debrisMat);
      dMesh.position.set(
        (Math.random() - 0.5) * 18,
        0.25 + Math.random() * 3.2,
        (Math.random() - 0.5) * 24
      );
      this.weatherGroup.add(dMesh);
      this.windDebris.push({
        mesh: dMesh,
        phase: Math.random() * Math.PI * 2,
        speedMult: 0.9 + Math.random() * 0.7
      });
    }

    // 3. DIAGONAL STORM RAIN SLASHES
    const rainCount = isSuper ? 220 : isStorm ? 160 : 85;
    const streakGeo = new THREE.BoxGeometry(0.045, isStorm ? 0.95 : 0.65, 0.045);
    const streakMat = new THREE.MeshBasicMaterial({
      color: isSuper ? 0xfda4af : 0xbae6fd,
      transparent: true,
      opacity: isStorm ? 0.68 : 0.45,
      depthWrite: false
    });

    for (let i = 0; i < rainCount; i++) {
      const mesh = new THREE.Mesh(streakGeo, streakMat);
      mesh.position.set(
        (Math.random() - 0.5) * 24,
        0.4 + Math.random() * 10,
        (Math.random() - 0.5) * 28
      );
      this.weatherGroup.add(mesh);
      this.weatherDrops.push({
        mesh,
        speedY: (isStorm ? 13 : 8) + Math.random() * 5,
        speedX: (isSuper ? 12 : isStorm ? 8.5 : 5.5) + Math.random() * 3.5
      });
    }
  }

  updateWeather(dt, elapsedTime = 0) {
    const wind = this.getCurrentWindVector(elapsedTime);
    this._updateLiveWindHudBadge(wind);

    if (wind.strength <= 0.05) return;
    const dirX = wind.x >= 0 ? 1 : -1;
    const windSpeedX = Math.max(4.5, Math.abs(wind.x) * 3.8);

    // 1. Animate horizontal 3D Wind Stream Ribbons across the court
    if (this.windRibbons && this.windRibbons.length > 0) {
      for (let i = 0; i < this.windRibbons.length; i++) {
        const r = this.windRibbons[i];
        r.mesh.position.x += dirX * windSpeedX * r.speedMult * dt;
        r.mesh.position.z += wind.z * 0.85 * dt;
        r.mesh.position.y =
          r.baseY + Math.sin(elapsedTime * 4.5 + r.phase) * 0.28;
        r.mesh.rotation.z = Math.sin(elapsedTime * 3.2 + r.phase) * 0.08;
        if (r.mesh.position.x > 12.5) r.mesh.position.x = -12.5;
        else if (r.mesh.position.x < -12.5) r.mesh.position.x = 12.5;
        if (r.mesh.position.z > 15) r.mesh.position.z = -15;
        else if (r.mesh.position.z < -15) r.mesh.position.z = 15;
      }
    }

    // 2. Animate swirling wind debris
    if (this.windDebris && this.windDebris.length > 0) {
      for (let i = 0; i < this.windDebris.length; i++) {
        const b = this.windDebris[i];
        b.mesh.position.x += dirX * windSpeedX * 0.9 * b.speedMult * dt;
        b.mesh.position.y =
          0.35 + Math.abs(Math.sin(elapsedTime * 3.6 + b.phase)) * 2.4;
        b.mesh.rotation.x += dt * 7;
        b.mesh.rotation.y += dt * 9;
        if (b.mesh.position.x > 11.5) b.mesh.position.x = -11.5;
        else if (b.mesh.position.x < -11.5) b.mesh.position.x = 11.5;
      }
    }

    // 3. Animate diagonal rain drops
    if (this.weatherDrops && this.weatherDrops.length > 0) {
      for (let i = 0; i < this.weatherDrops.length; i++) {
        const d = this.weatherDrops[i];
        d.mesh.position.x += dirX * d.speedX * dt;
        d.mesh.position.y -= d.speedY * dt;
        d.mesh.rotation.z = -dirX * 0.36;

        if (d.mesh.position.y < 0.1) {
          d.mesh.position.y = 9.5 + Math.random() * 3.5;
          d.mesh.position.x = (Math.random() - 0.5) * 24;
        }
        if (d.mesh.position.x > 13) d.mesh.position.x = -13;
        else if (d.mesh.position.x < -13) d.mesh.position.x = 13;
      }
    }

    // 4. Lightning flash on Storm / Super Storm
    const wCfg = this.getSelectedWeather();
    const mapCfg = this.getSelectedMap();
    if (
      (wCfg.id === "storm" || wCfg.id === "super_storm" || mapCfg.id === "storm_thunder" || mapCfg.id === "super_typhoon") &&
      this.engine?.sunLight
    ) {
      this.lightningTimer += dt;
      if (this.lightningTimer >= this.nextLightningAt) {
        this.lightningTimer = 0;
        this.nextLightningAt = 2.8 + Math.random() * 3.8;
        this.engine.sunLight.intensity = (mapCfg.sunIntensity || 2.2) + 2.8;
        setTimeout(() => {
          if (this.engine?.sunLight) {
            this.engine.sunLight.intensity = mapCfg.sunIntensity || 2.2;
          }
        }, 120);
      }
    }
  }

  _updateLiveWindHudBadge(wind) {
    const el = document.getElementById("hud-weather-live-label");
    if (!el) return;
    const wCfg = this.getSelectedWeather();
    const totalBonusPct = Math.round(this.getTotalCoinBonusPct() * 100);
    if (!wind || wind.strength <= 0.05) {
      el.textContent = `Trời Quang (+${totalBonusPct}% Xu)`;
      return;
    }
    const dirArrow = wind.dirSign < 0 ? "<<< GIÓ TẠT TRÁI" : "GIÓ TẠT PHẢI >>>";
    el.textContent = `${wCfg.name}: ${dirArrow} ${wind.speedKmh} KM/H (+${totalBonusPct}% XU)`;
  }

  _buildThemeProps(mapCfg) {
    const corners = [
      [-8.6, -14.8],
      [8.6, -14.8],
      [-8.6, 14.8],
      [8.6, 14.8],
      [-9.2, 0],
      [9.2, 0]
    ];

    if (mapCfg.propTheme === "cyber_pylons" || mapCfg.propTheme === "storm_towers" || mapCfg.propTheme === "typhoon_spires") {
      const isTyphoon = mapCfg.propTheme === "typhoon_spires";
      const pylonGeo = new THREE.CylinderGeometry(0.18, 0.28, 4.6, 8);
      const pylonMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: isTyphoon ? 0xf43f5e : 0x00f5ff,
        emissiveIntensity: 0.65,
        metalness: 0.8,
        roughness: 0.2
      });
      const ringGeo = new THREE.TorusGeometry(0.48, 0.06, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: isTyphoon ? 0xfacc15 : 0x38bdf8 });

      corners.forEach(([x, z]) => {
        const m = new THREE.Mesh(pylonGeo, pylonMat);
        m.position.set(x, 2.3, z);
        m.castShadow = true;
        this.propGroup.add(m);

        const r = new THREE.Mesh(ringGeo, ringMat);
        r.rotation.x = Math.PI / 2;
        r.position.set(x, 4.2, z);
        this.propGroup.add(r);
      });
    } else if (mapCfg.propTheme === "lava_monoliths" || mapCfg.propTheme === "wind_turbines") {
      const isWind = mapCfg.propTheme === "wind_turbines";
      const rockGeo = new THREE.ConeGeometry(0.65, 3.8, 6);
      const rockMat = new THREE.MeshStandardMaterial({
        color: isWind ? 0x134e4a : 0x1c1917,
        emissive: isWind ? 0x2dd4bf : 0xea580c,
        emissiveIntensity: 0.55,
        roughness: 0.85
      });
      corners.forEach(([x, z]) => {
        const m = new THREE.Mesh(rockGeo, rockMat);
        m.position.set(x, 1.9, z);
        m.castShadow = true;
        this.propGroup.add(m);
      });
    } else if (mapCfg.propTheme === "ice_spires") {
      const iceGeo = new THREE.ConeGeometry(0.55, 4.2, 5);
      const iceMat = new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        roughness: 0.15,
        metalness: 0.35,
        transparent: true,
        opacity: 0.88
      });
      corners.forEach(([x, z]) => {
        const m = new THREE.Mesh(iceGeo, iceMat);
        m.position.set(x, 2.1, z);
        this.propGroup.add(m);
      });
    } else if (mapCfg.propTheme === "cosmic_rings") {
      const orbGeo = new THREE.OctahedronGeometry(0.55, 0);
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0xfde047,
        emissive: 0xa855f7,
        emissiveIntensity: 0.65,
        metalness: 0.7,
        roughness: 0.2
      });
      corners.forEach(([x, z]) => {
        const m = new THREE.Mesh(orbGeo, orbMat);
        m.position.set(x, 2.4, z);
        this.propGroup.add(m);
      });
    }
  }

  syncUiElements() {
    const mapCfg = this.getSelectedMap();
    const wCfg = this.getSelectedWeather();
    const totalBonusPct = Math.round(this.getTotalCoinBonusPct() * 100);

    // Update HUD map label with wind/storm bonus info
    const hudMapLabel = document.getElementById("hud-map-label");
    if (hudMapLabel) {
      hudMapLabel.textContent = `${mapCfg.shortName}`;
    }

    const wind = this.getCurrentWindVector(this.engine?.elapsedTime || 0);
    this._updateLiveWindHudBadge(wind);

    // Update Title screen mini-court preview colors
    const miniTurf = document.querySelector(".mini-court-turf");
    if (miniTurf) {
      miniTurf.style.background = `linear-gradient(180deg, ${mapCfg.outerCourtHex}, ${mapCfg.innerCourtHex})`;
      miniTurf.style.borderColor = mapCfg.accentCss;
    }

    // Update Map selector cards active state
    document.querySelectorAll("[data-court-map-id]").forEach((btn) => {
      const isSelected = btn.getAttribute("data-court-map-id") === mapCfg.id;
      btn.classList.toggle("selected", isSelected);
    });

    // Update Weather selector buttons active state
    document.querySelectorAll("[data-court-weather-id]").forEach((btn) => {
      const isSelected = btn.getAttribute("data-court-weather-id") === wCfg.id;
      btn.classList.toggle("selected", isSelected);
    });
  }

  initUiBindings() {
    const grid = document.getElementById("court-map-selector-grid");
    if (grid) {
      grid.innerHTML = COURT_MAPS.map(
        (m) => `
        <button type="button" class="court-map-card ${m.id === this.selectedMapId ? "selected" : ""}" data-court-map-id="${m.id}">
          <span class="map-swatch-preview" style="background: linear-gradient(135deg, ${m.innerCourtHex} 55%, ${m.outerCourtHex} 55%); border-color: ${m.lineHex};">
            <i class="map-swatch-line" style="background:${m.lineHex}"></i>
          </span>
          <span class="map-card-meta">
            <strong class="map-card-title">${m.shortName}</strong>
            <small class="map-card-sub" style="color:${m.accentCss}">+${Math.round(m.coinBonusPct * 100)}% Xu${m.defaultWeather ? " • GIÓ BÃO" : ""}</small>
          </span>
        </button>
      `
      ).join("");

      grid.querySelectorAll("[data-court-map-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-court-map-id");
          if (id) this.selectMap(id, { showBanner: false });
        });
      });
    }

    // Inject or populate Weather Mode selector row right inside #court-map-section
    const mapSection = document.getElementById("court-map-section");
    if (mapSection) {
      let weatherRow = document.getElementById("court-weather-selector-row");
      if (!weatherRow) {
        weatherRow = document.createElement("div");
        weatherRow.id = "court-weather-selector-row";
        weatherRow.className = "court-weather-selector-row";
        mapSection.appendChild(weatherRow);
      }
      weatherRow.innerHTML = `
        <div class="weather-selector-header">
          <span class="setup-label">CHẾ ĐỘ THỜI TIẾT SÂN ĐẤU (GIÓ LỐC &amp; BÃO TỐ LÀM BÓNG LIỆNG KHÓ ĐÁNH • CỘNG CỰC NHIỀU XU)</span>
        </div>
        <div class="weather-choice-grid">
          ${COURT_WEATHER_MODES.map(
            (w) => `
            <button type="button" class="weather-mode-btn ${w.id === this.selectedWeatherId ? "selected" : ""}" data-court-weather-id="${w.id}">
              <strong class="weather-btn-title">${w.name}</strong>
              <span class="weather-btn-bonus">${w.extraCoinBonusPct > 0 ? `+${Math.round(w.extraCoinBonusPct * 100)}% XU THƯỞNG` : "Không gió"}</span>
            </button>
          `
          ).join("")}
        </div>
      `;
      weatherRow.querySelectorAll("[data-court-weather-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const wid = btn.getAttribute("data-court-weather-id");
          if (wid) this.selectWeather(wid, { showBanner: false });
        });
      });
    }

    const hudBtn = document.getElementById("btn-map-cycle");
    if (hudBtn) {
      hudBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.cycleNextMap();
      });

      // Inject live Wind/Storm toggle pill right after #btn-map-cycle if not present
      if (!document.getElementById("btn-weather-cycle") && hudBtn.parentElement) {
        const wBtn = document.createElement("button");
        wBtn.id = "btn-weather-cycle";
        wBtn.type = "button";
        wBtn.className = "hud-mini-btn highlight-wind-storm";
        wBtn.title = "Đổi chế độ Gió Lốc / Mưa Bão / Siêu Bão ngay trong trận";
        wBtn.innerHTML = `<strong id="hud-weather-live-label">Mưa Bão: <<< GIÓ TẠT TRÁI 98 KM/H (+260% XU)</strong>`;
        wBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.cycleNextWeather();
        });
        hudBtn.insertAdjacentElement("afterend", wBtn);
      }
    }

    this.syncUiElements();
  }
}
