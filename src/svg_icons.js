/**
 * Vector SVG Icons & Distinct Pro Sports Equipment Illustrations for Argon Tennis
 */

const toCssColor = (val, fallback = "#38bdf8") => {
  if (typeof val === "number") {
    return `#${val.toString(16).padStart(6, "0")}`;
  }
  if (typeof val === "string" && val.trim()) {
    return val.trim();
  }
  return fallback;
};

let _svgUidCounter = 0;
const nextUid = (prefix = "svg") => `${prefix}-${++_svgUidCounter}`;

export const SVG_ICONS = {
  coin: (cls = "coin-svg-icon") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" fill="#f59e0b" stroke="#fde68a" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="6.75" stroke="#fef08a" stroke-width="1.1" stroke-dasharray="2 1.5"/>
      <path d="M12 7.8v8.4M9.6 10.2h3.6a1.4 1.4 0 0 1 0 2.8H9.6h3.8a1.4 1.4 0 0 1 0 2.8H9.6" stroke="#fffbeb" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `.trim(),

  user: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  `.trim(),

  bot: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="11" width="18" height="10" rx="2.5"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M12 7v4M8.5 16h.01M15.5 16h.01M1 15h2M21 15h2"/>
    </svg>
  `.trim(),

  duo: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  `.trim(),

  bolt: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  `.trim(),

  racket: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="9" cy="9" rx="6.5" ry="6.5"/>
      <path d="m13.8 13.8 7.2 7.2M7.5 3v12M3 7.5h12M17.5 17.5l2 2"/>
    </svg>
  `.trim(),

  shirt: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
    </svg>
  `.trim(),

  sparkle: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3zM5 3v4M3 5h4M19 17v4M17 19h4"/>
    </svg>
  `.trim(),

  star: (cls = "ui-svg-icon icon-xs") => `
    <svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  `.trim(),

  trophy: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  `.trim(),

  rotate360: (cls = "ui-svg-icon stroke icon-xs") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
      <path d="M16 21h5v-5"/>
    </svg>
  `.trim(),

  close: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  `.trim(),

  gamepad: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="6" y1="12" x2="10" y2="12"/>
      <line x1="8" y1="10" x2="8" y2="14"/>
      <line x1="15" y1="13" x2="15.01" y2="13"/>
      <line x1="18" y1="11" x2="18.01" y2="11"/>
      <rect x="2" y="6" width="20" height="12" rx="6"/>
    </svg>
  `.trim(),

  phone: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2.5"/>
      <line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  `.trim(),

  gyro: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="7" y="4" width="10" height="16" rx="2"/>
      <path d="M3 8a8 8 0 0 0 0 8M21 8a8 8 0 0 1 0 8"/>
    </svg>
  `.trim(),

  run: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="17" cy="4" r="2"/>
      <path d="m15 8-4 3 2 4 4 1M8 12l3-3 2 1M5 19l4-4M13 15l2 6"/>
    </svg>
  `.trim(),

  check: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  `.trim(),

  toss: (cls = "ui-svg-icon stroke icon-sm") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7"/>
      <circle cx="12" cy="21" r="1" fill="currentColor"/>
    </svg>
  `.trim(),

  plus: (cls = "ui-svg-icon stroke icon-xs") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  `.trim(),

  camera: (cls = "ui-svg-icon stroke icon-xs") => `
    <svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  `.trim(),

  /**
   * Renders distinct angled Pro Tennis Racket SVG illustrations.
   * Supports both object ({ id, frameHex, throatHex, stringHex, cls }) and positional (frameCss, throatCss, stringCss, cls, id) calls.
   */
  proRacketArt: (arg1 = {}, arg2, arg3, arg4 = "pro-equip-svg", arg5 = "") => {
    let id = "rac";
    let fCol = "#2563eb";
    let tCol = "#1e293b";
    let sCol = "#e2e8f0";
    let cls = "pro-equip-svg shop-card-art-svg";

    if (typeof arg1 === "object" && arg1 !== null) {
      id = arg1.id || "rac";
      fCol = toCssColor(arg1.frameHex, "#2563eb");
      tCol = toCssColor(arg1.throatHex, "#1e293b");
      sCol = toCssColor(arg1.stringHex, "#e2e8f0");
      cls = arg1.cls || cls;
    } else {
      fCol = toCssColor(arg1, "#2563eb");
      tCol = toCssColor(arg2, "#1e293b");
      sCol = toCssColor(arg3, "#e2e8f0");
      if (typeof arg4 === "string" && arg4) cls = arg4;
      if (typeof arg5 === "string" && arg5) id = arg5;
    }

    const uid = nextUid(`rac-${id}`);
    const isQuantum = id.includes("quantum") || fCol.toLowerCase() === "#8b5cf6";
    const isGold = id.includes("gold") || fCol.toLowerCase() === "#f59e0b";
    const isPlasma = id.includes("plasma") || fCol.toLowerCase() === "#06b6d4";
    const isCarbon = id.includes("carbon") || fCol.toLowerCase() === "#18181b";

    const extraMods = isQuantum
      ? `
        <circle cx="48" cy="61" r="7" stroke="#22d3ee" stroke-width="2" fill="rgba(139,92,246,0.35)"/>
        <path d="M25 28 L21 36 L25 44 M71 28 L75 36 L71 44" stroke="#22d3ee" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="48" cy="36" r="6" stroke="#facc15" stroke-width="1.5" stroke-dasharray="3 2"/>
      `
      : isGold
      ? `
        <path d="M25 30 L22 36 L25 42 M71 30 L74 36 L71 42" stroke="#fef08a" stroke-width="2.4" stroke-linecap="round"/>
        <polygon points="48,56 52,61 48,66 44,61" fill="#fef08a" stroke="#b45309" stroke-width="1"/>
        <path d="M41 37 L44 29 L48 34 L52 29 L55 37 Z" fill="#facc15" opacity="0.85"/>
      `
      : isPlasma
      ? `
        <path d="M25 29 L22 36 L25 43 M71 29 L74 36 L71 43" stroke="#10b981" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="48" cy="60" r="4" fill="#10b981" stroke="#a7f3d0" stroke-width="1.4"/>
      `
      : isCarbon
      ? `
        <polygon points="48,56 51.5,61 48,65 44.5,61" fill="#ef4444"/>
        <path d="M32 22 L64 50 M64 22 L32 50" stroke="#ef4444" stroke-width="1.2" opacity="0.45"/>
      `
      : `
        <path d="M43 39 L48 28 L53 39 M44.5 36.5 H51.5" stroke="${fCol}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
      `;

    return `
      <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="${uid}-f" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${fCol}"/>
            <stop offset="100%" stop-color="${tCol}"/>
          </linearGradient>
          <clipPath id="${uid}-bed">
            <ellipse cx="48" cy="36" rx="19" ry="24"/>
          </clipPath>
        </defs>
        <g transform="rotate(-30 48 48)">
          <g clip-path="url(#${uid}-bed)" stroke="${sCol}" stroke-width="0.95" stroke-opacity="0.58">
            <line x1="34" y1="10" x2="34" y2="62"/><line x1="39" y1="10" x2="39" y2="62"/>
            <line x1="44" y1="10" x2="44" y2="62"/><line x1="48" y1="10" x2="48" y2="62"/>
            <line x1="52" y1="10" x2="52" y2="62"/><line x1="57" y1="10" x2="57" y2="62"/>
            <line x1="62" y1="10" x2="62" y2="62"/>
            <line x1="26" y1="20" x2="70" y2="20"/><line x1="26" y1="25" x2="70" y2="25"/>
            <line x1="26" y1="30" x2="70" y2="30"/><line x1="26" y1="36" x2="70" y2="36"/>
            <line x1="26" y1="42" x2="70" y2="42"/><line x1="26" y1="47" x2="70" y2="47"/>
            <line x1="26" y1="52" x2="70" y2="52"/>
          </g>
          <path d="M37 56 L45.5 72 H50.5 L59 56" stroke="${tCol}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M38.5 57 L46 71 H50 L57.5 57" stroke="${fCol}" stroke-width="1.6" stroke-linecap="round"/>
          <ellipse cx="48" cy="36" rx="20.5" ry="25.5" stroke="url(#${uid}-f)" stroke-width="4.4"/>
          <path d="M33 19 A20.5 25.5 0 0 1 63 19" stroke="#f8fafc" stroke-width="2" stroke-linecap="round" opacity="0.72"/>
          ${extraMods}
          <rect x="44.8" y="71" width="6.4" height="19" rx="2" fill="#0f172a" stroke="#475569" stroke-width="1"/>
          <path d="M45 75 L51 76.5 M45 79.5 L51 81 M45 84 L51 85.5" stroke="#94a3b8" stroke-width="1" opacity="0.7"/>
          <rect x="44" y="88.5" width="8" height="3" rx="1" fill="${fCol}"/>
        </g>
      </svg>
    `.trim();
  },

  /**
   * Renders 6 visually distinct Pro Tennis Outfit Kits (each outfit has its own pattern, collar, and trim).
   * Supports both object and positional arguments.
   */
  proOutfitArt: (arg1 = {}, arg2, arg3, arg4 = "pro-equip-svg", arg5 = "") => {
    let id = "outfit_default";
    let c1 = "#ef4444";
    let c2 = "#facc15";
    let c3 = "#0f172a";
    let cls = "pro-equip-svg shop-card-art-svg";

    if (typeof arg1 === "object" && arg1 !== null) {
      id = arg1.id || "outfit_default";
      c1 = toCssColor(arg1.shirtHex ?? arg1.c1, "#ef4444");
      c2 = toCssColor(arg1.stripeHex ?? arg1.c2, "#facc15");
      c3 = toCssColor(arg1.shortsHex ?? arg1.c3, "#0f172a");
      cls = arg1.cls || cls;
    } else {
      c1 = toCssColor(arg1, "#ef4444");
      c2 = toCssColor(arg2, "#facc15");
      c3 = toCssColor(arg3, "#0f172a");
      if (typeof arg4 === "string" && arg4) cls = arg4;
      if (typeof arg5 === "string" && arg5) id = arg5;
    }

    const uid = nextUid(`kit-${id}`);
    const lowerC1 = c1.toLowerCase();

    // Detect specific outfit theme by ID or primary swatch
    const isGrandSlamGold = id.includes("gold") || lowerC1 === "#f8fafc";
    const isCyberStealth = id.includes("cyber") || lowerC1 === "#111827";
    const isCrimsonDragon = id.includes("dragon") || lowerC1 === "#dc2626";
    const isEmeraldStorm = id.includes("emerald") || lowerC1 === "#059669";
    const isRoyalGalaxy = id.includes("galaxy") || lowerC1 === "#6d28d9";

    let patternOverlay = "";
    if (isGrandSlamGold) {
      // Wimbledon White Championship Kit with Golden V-Sweater Ribbing & Royal Crest
      patternOverlay = `
        <path d="M36 18 L48 38 L60 18" stroke="#f59e0b" stroke-width="3.2" stroke-linejoin="round" fill="none"/>
        <path d="M35 56 H61" stroke="#f59e0b" stroke-width="3"/>
        <path d="M35 59.5 H61" stroke="#1e293b" stroke-width="1.8"/>
        <polygon points="55,31 58,34 55,38 52,34" fill="#f59e0b" stroke="#1e293b" stroke-width="0.8"/>
        <path d="M22 32 L28 40 M74 32 L68 40" stroke="#f59e0b" stroke-width="2.6" stroke-linecap="round"/>
      `;
    } else if (isCyberStealth) {
      // Futuristic Cyber Stealth Armor with Neon Cyan Hex-Reactor & Tron Circuit Lines
      patternOverlay = `
        <path d="M38 22 V59 M58 22 V59" stroke="#22d3ee" stroke-width="1.6" stroke-dasharray="4 2" opacity="0.9"/>
        <path d="M35 38 L44 43 H52 L61 38" stroke="#06b6d4" stroke-width="2.2" fill="none"/>
        <polygon points="48,29 53,34 48,39 43,34" fill="#06b6d4" stroke="#e0f2fe" stroke-width="1.2"/>
        <path d="M21 31 L28 40 M75 31 L68 40" stroke="#22d3ee" stroke-width="2.8" stroke-linecap="round"/>
      `;
    } else if (isCrimsonDragon) {
      // Fierce Dragon Scale Diagonal Sash & Golden Flame Hem
      patternOverlay = `
        <path d="M36 21 L60 58" stroke="#facc15" stroke-width="5" stroke-linecap="round" opacity="0.9"/>
        <path d="M36 21 L60 58" stroke="#fef08a" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M35 58 L39 52 L43 58 L48 50 L53 58 L57 52 L61 58" fill="#facc15" opacity="0.85"/>
        <circle cx="42" cy="32" r="3.2" fill="#fef08a"/>
      `;
    } else if (isEmeraldStorm) {
      // High-Speed Double Lightning Chevrons & White Racing Panels
      patternOverlay = `
        <path d="M35 34 L48 44 L61 34" stroke="#f8fafc" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M35 42 L48 52 L61 42" stroke="#6ee7b7" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M46 25 L43 32 H48 L45 39" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      `;
    } else if (isRoyalGalaxy) {
      // Cosmic Nebula Sash with Starburst Emblem & Neon Pink Trim
      patternOverlay = `
        <ellipse cx="48" cy="40" rx="13" ry="6" transform="rotate(-24 48 40)" stroke="#e879f9" stroke-width="2" fill="rgba(244,63,94,0.25)"/>
        <path d="M48 31 L50 37 L56 39 L50 41 L48 47 L46 41 L40 39 L46 37 Z" fill="#fef08a"/>
        <circle cx="39" cy="30" r="1.5" fill="#ffffff"/>
        <circle cx="57" cy="49" r="1.5" fill="#ffffff"/>
      `;
    } else {
      // Default Multi-Athlete Signature Kit (Tri-color athletic chest stripes)
      patternOverlay = `
        <path d="M35 36 H61" stroke="#ffffff" stroke-width="3.2"/>
        <path d="M35 41 H61" stroke="${c2}" stroke-width="3.2"/>
        <path d="M35 46 H61" stroke="${c3}" stroke-width="2.4"/>
        <circle cx="54" cy="29" r="2.8" fill="#fde047"/>
      `;
    }

    return `
      <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="${uid}-shirt" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${c1}"/>
            <stop offset="100%" stop-color="${isGrandSlamGold ? "#cbd5e1" : c1}"/>
          </linearGradient>
        </defs>
        <!-- Athletic Shorts -->
        <path d="M33 61 H63 L66 83 H51 L48 72 L45 83 H30 L33 61 Z" fill="${c3}" stroke="rgba(255,255,255,0.28)" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M31 79 H45.5 M50.5 79 H65" stroke="${c2}" stroke-width="2.4" stroke-linecap="round"/>
        <!-- Sculpted Jersey Torso -->
        <path d="M34 19 L41 16 H55 L62 19 L76 29 L69 42 L61 37 V62 H35 V37 L27 42 L20 29 L34 19 Z" fill="url(#${uid}-shirt)" stroke="${isCyberStealth ? "#22d3ee" : "rgba(255,255,255,0.32)"}" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- Distinct Outfit Pattern -->
        ${patternOverlay}
        <!-- Collar & Placket -->
        <path d="M41 16 L48 26 L55 16" fill="#0f172a" opacity="0.4"/>
        <path d="M40 15.5 L45 23.5 L48 20.5 L42 14 Z M56 15.5 L51 23.5 L48 20.5 L54 14 Z" fill="${isCyberStealth ? "#22d3ee" : "#ffffff"}" stroke="#475569" stroke-width="0.8"/>
      </svg>
    `.trim();
  },

  /**
   * Renders 8 completely distinct vector illustrations for 3D Accessories:
   * crown_gold, cyber_halo, visor_cyber, shoulder_pads, cyber_wings, power_wristbands, aura_gold, aura_emerald.
   * Supports both object ({ id, slot, colorHex, accentHex, cls }) and positional (id, colorCss, cls) calls.
   */
  proAccessoryArt: (arg1 = {}, arg2, arg3 = "pro-equip-svg") => {
    let id = "";
    let slot = "";
    let cMain = "#38bdf8";
    let cAcc = "#facc15";
    let cls = "pro-equip-svg shop-card-art-svg";

    if (typeof arg1 === "object" && arg1 !== null) {
      id = String(arg1.id || "");
      slot = String(arg1.slot || "");
      cMain = toCssColor(arg1.colorHex, "#38bdf8");
      cAcc = toCssColor(arg1.accentHex, "#facc15");
      cls = arg1.cls || cls;
    } else {
      id = String(arg1 || "");
      cMain = toCssColor(arg2, "#38bdf8");
      if (typeof arg3 === "string" && arg3) cls = arg3;
    }

    // 1. Royal Golden Crown 3D
    if (id.includes("crown")) {
      return `
        <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <path d="M18 66 L24 30 L38 48 L48 20 L58 48 L72 30 L78 66 Z" fill="#facc15" stroke="#fef08a" stroke-width="2.2" stroke-linejoin="round"/>
          <rect x="18" y="66" width="60" height="9" rx="3.5" fill="#d97706" stroke="#fef08a" stroke-width="1.6"/>
          <circle cx="48" cy="17" r="4" fill="#fef08a"/>
          <circle cx="23" cy="27" r="3.2" fill="#38bdf8"/>
          <circle cx="73" cy="27" r="3.2" fill="#38bdf8"/>
          <polygon points="48,44 53,51 48,58 43,51" fill="#ef4444" stroke="#fef08a" stroke-width="1.2"/>
          <circle cx="32" cy="56" r="2.8" fill="#10b981"/>
          <circle cx="64" cy="56" r="2.8" fill="#10b981"/>
        </svg>
      `.trim();
    }

    // 1B. Mecha Cyber Helmet 3D
    if (id.includes("mecha_helmet")) {
      return `
        <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <path d="M24 68 L20 38 L34 22 H62 L76 38 L72 68 L58 76 H38 Z" fill="${cMain}" stroke="#e0f2fe" stroke-width="2" stroke-linejoin="round"/>
          <path d="M18 36 L10 16 L22 24 Z M78 36 L86 16 L74 24 Z" fill="${cAcc}" stroke="#ffffff" stroke-width="1.4"/>
          <polygon points="48,14 55,28 48,34 41,28" fill="${cAcc}" stroke="#ffffff" stroke-width="1.2"/>
          <path d="M28 44 Q48 38 68 44 L64 56 Q48 52 32 56 Z" fill="#090d16" stroke="${cAcc}" stroke-width="2"/>
          <path d="M33 49 Q48 45 63 49" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `.trim();
    }

    // 1C. Dragon Horns 3D
    if (id.includes("dragon_horns")) {
      return `
        <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <path d="M38 66 C20 52, 12 28, 24 14 C26 28, 34 42, 44 54 Z" fill="${cMain}" stroke="${cAcc}" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M58 66 C76 52, 84 28, 72 14 C70 28, 62 42, 52 54 Z" fill="${cMain}" stroke="${cAcc}" stroke-width="2.2" stroke-linejoin="round"/>
          <polygon points="48,36 55,50 48,64 41,50" fill="${cAcc}" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="48" cy="50" r="4" fill="#ffffff"/>
        </svg>
      `.trim();
    }

    // 1D. Samurai Crest 3D
    if (id.includes("samurai_crest")) {
      return `
        <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <path d="M48 56 L14 22 L28 54 L48 66 L68 54 L82 22 Z" fill="${cAcc}" stroke="#fef08a" stroke-width="2.2" stroke-linejoin="round"/>
          <circle cx="48" cy="54" r="9" fill="${cMain}" stroke="#ffffff" stroke-width="2"/>
          <rect x="24" y="64" width="48" height="8" rx="4" fill="#1e293b" stroke="${cAcc}" stroke-width="1.6"/>
        </svg>
      `.trim();
    }

    // 2. Floating Cyber Halo 3D
    if (id.includes("halo")) {
      return `
        <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <ellipse cx="48" cy="44" rx="32" ry="12" stroke="${cMain}" stroke-width="5" opacity="0.35"/>
          <ellipse cx="48" cy="44" rx="30" ry="10.5" stroke="#e0f2fe" stroke-width="2.6"/>
          <ellipse cx="48" cy="44" rx="22" ry="7" stroke="${cAcc}" stroke-width="1.6" stroke-dasharray="5 3"/>
          <polygon points="48,24 52,32 48,36 44,32" fill="#facc15" stroke="#ffffff" stroke-width="1"/>
          <circle cx="18" cy="44" r="3.5" fill="${cMain}" stroke="#ffffff" stroke-width="1.2"/>
          <circle cx="78" cy="44" r="3.5" fill="${cMain}" stroke="#ffffff" stroke-width="1.2"/>
          <path d="M34 64 L48 54 L62 64" stroke="${cMain}" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>
        </svg>
      `.trim();
    }

    // 3. Cyber Sports Visor / Glasses 3D
    if (id.includes("visor") || slot === "glasses") {
      return `
        <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <path d="M14 38 C28 28, 68 28, 82 38 L76 58 C65 63, 54 58, 48 49 C42 58, 31 63, 20 58 Z" fill="${cMain}" fill-opacity="0.88" stroke="#e0f2fe" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M12 38 C30 27, 66 27, 84 38" stroke="${cAcc}" stroke-width="4" stroke-linecap="round"/>
          <path d="M24 42 L34 54 M32 41 L39 50" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="0.85"/>
          <circle cx="64" cy="47" r="5" stroke="#fef08a" stroke-width="1.3" stroke-dasharray="2 2"/>
          <line x1="61" y1="47" x2="67" y2="47" stroke="#fef08a" stroke-width="1.2"/>
        </svg>
      `.trim();
    }

    // 4. Quantum Mecha / Plasma Wings 3D
    if (id.includes("wings")) {
      return `
        <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <!-- Left Wing Blades -->
          <path d="M43 46 L10 20 L20 38 L8 42 L22 54 L14 66 L43 58 Z" fill="${cMain}" stroke="#e0f2fe" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M40 48 L18 30 M38 53 L18 46" stroke="${cAcc}" stroke-width="1.6" stroke-linecap="round"/>
          <!-- Right Wing Blades -->
          <path d="M53 46 L86 20 L76 38 L88 42 L74 54 L82 66 L53 58 Z" fill="${cMain}" stroke="#e0f2fe" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M56 48 L78 30 M58 53 L78 46" stroke="${cAcc}" stroke-width="1.6" stroke-linecap="round"/>
          <!-- Central Quantum Core -->
          <polygon points="48,38 56,50 48,62 40,50" fill="${cAcc}" stroke="#ffffff" stroke-width="1.8"/>
          <circle cx="48" cy="50" r="3.5" fill="#ffffff"/>
        </svg>
      `.trim();
    }

    // 4B. Gravity Jet Thrusters 3D
    if (id.includes("thruster")) {
      return `
        <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <rect x="20" y="24" width="20" height="34" rx="6" fill="${cMain}" stroke="#e0f2fe" stroke-width="2"/>
          <rect x="56" y="24" width="20" height="34" rx="6" fill="${cMain}" stroke="#e0f2fe" stroke-width="2"/>
          <path d="M24 58 L30 82 L36 58 Z M60 58 L66 82 L72 58 Z" fill="${cAcc}"/>
          <rect x="40" y="34" width="16" height="14" rx="3" fill="#1e293b" stroke="${cAcc}" stroke-width="1.8"/>
        </svg>
      `.trim();
    }

    // 5. Gladiator Warrior Shoulder Pads 3D
    if (id.includes("shoulder") || slot === "back") {
      return `
        <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <!-- Left Pauldron -->
          <path d="M12 48 C12 28, 30 24, 42 34 L39 58 C26 60, 14 56, 12 48 Z" fill="${cMain}" stroke="#fef08a" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M16 40 L24 30 L28 38" fill="${cAcc}" stroke="#fef08a" stroke-width="1.2"/>
          <circle cx="29" cy="46" r="4" fill="#fef08a" stroke="#9a3412" stroke-width="1.2"/>
          <!-- Right Pauldron -->
          <path d="M84 48 C84 28, 66 24, 54 34 L57 58 C70 60, 82 56, 84 48 Z" fill="${cMain}" stroke="#fef08a" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M80 40 L72 30 L68 38" fill="${cAcc}" stroke="#fef08a" stroke-width="1.2"/>
          <circle cx="67" cy="46" r="4" fill="#fef08a" stroke="#9a3412" stroke-width="1.2"/>
          <!-- Chest Energy Bridge -->
          <path d="M39 46 H57" stroke="${cAcc}" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 3"/>
        </svg>
      `.trim();
    }

    // 6. Glowing Power Wristbands / Thunder Gauntlets 3D
    if (id.includes("wrist") || id.includes("gauntlet") || slot === "wrist") {
      return `
        <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <rect x="18" y="32" width="24" height="32" rx="7" fill="${cMain}" stroke="#ffffff" stroke-width="2"/>
          <rect x="18" y="44" width="24" height="8" fill="${cAcc}"/>
          <polygon points="30,39 26,48 31,48 28,57 35,46 30,46" fill="#fef08a"/>
          <rect x="54" y="32" width="24" height="32" rx="7" fill="${cMain}" stroke="#ffffff" stroke-width="2"/>
          <rect x="54" y="44" width="24" height="8" fill="${cAcc}"/>
          <polygon points="66,39 62,48 67,48 64,57 71,46 66,46" fill="#fef08a"/>
        </svg>
      `.trim();
    }

    // 7. Emerald / Cyber / Void Vortex Aura 3D
    if (id.includes("aura_emerald") || id.includes("void_aura") || id.includes("cyber_matrix_aura")) {
      return `
        <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <ellipse cx="48" cy="64" rx="34" ry="13" stroke="${cMain}" stroke-width="3.2" stroke-dasharray="8 4"/>
          <ellipse cx="48" cy="64" rx="23" ry="8.5" fill="${cMain}" fill-opacity="0.28" stroke="${cAcc}" stroke-width="2"/>
          <path d="M26 58 C24 40, 38 30, 48 20 C58 30, 72 40, 70 58" stroke="${cMain}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
          <path d="M35 54 C36 42, 44 34, 48 26 C52 34, 60 42, 61 54" stroke="${cAcc}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <circle cx="48" cy="44" r="5.5" fill="${cMain}" stroke="#ffffff" stroke-width="1.5"/>
        </svg>
      `.trim();
    }

    // 8. Golden Championship Solar Aura 3D
    if (id.includes("aura") || slot === "aura") {
      return `
        <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <ellipse cx="48" cy="64" rx="34" ry="13" stroke="${cMain}" stroke-width="3.2" stroke-dasharray="6 4"/>
          <ellipse cx="48" cy="64" rx="23" ry="8.5" fill="rgba(250,204,21,0.28)" stroke="${cAcc}" stroke-width="2.2"/>
          <path d="M28 60 L32 28 M48 56 L48 18 M68 60 L64 28" stroke="${cAcc}" stroke-width="2.6" stroke-linecap="round"/>
          <polygon points="48,26 52,36 62,36 54,42 57,52 48,46 39,52 42,42 34,36 44,36" fill="${cMain}" stroke="#fffbeb" stroke-width="1.2"/>
        </svg>
      `.trim();
    }

    return `
      <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <path d="M24 52 C24 32, 72 32, 72 52 Z" fill="${cMain}" stroke="#ffffff" stroke-width="1.6"/>
        <path d="M20 52 H80 C76 60, 56 62, 24 56 Z" fill="${cAcc}"/>
      </svg>
    `.trim();
  },

  /**
   * Renders distinct elemental 3D Strike VFX SVG illustrations.
   * Supports both object ({ id, colors, cls }) and positional (c1, c2, c3, cls, id) calls.
   */
  proVfxArt: (arg1 = {}, arg2, arg3, arg4 = "pro-equip-svg", arg5 = "") => {
    let id = "vfx";
    let c1 = "#38bdf8";
    let c2 = "#facc15";
    let c3 = "#f97316";
    let cls = "pro-equip-svg shop-card-art-svg";

    if (typeof arg1 === "object" && arg1 !== null) {
      id = arg1.id || "vfx";
      c1 = arg1.colors?.[0] || "#38bdf8";
      c2 = arg1.colors?.[1] || "#facc15";
      c3 = arg1.colors?.[2] || c1;
      cls = arg1.cls || cls;
    } else {
      c1 = toCssColor(arg1, "#38bdf8");
      c2 = toCssColor(arg2, "#facc15");
      c3 = toCssColor(arg3, c1);
      if (typeof arg4 === "string" && arg4) cls = arg4;
      if (typeof arg5 === "string" && arg5) id = arg5;
    }

    const uid = nextUid(`vfx-${id}`);
    const isThunder = id.includes("thunder") || id.includes("plasma") || c3.toLowerCase() === "#6366f1";
    const isCryo = id.includes("cryo") || id.includes("glacial") || c2.toLowerCase() === "#67e8f9";
    const isQuantum = id.includes("quantum") || id.includes("nebula") || id.includes("void") || c2.toLowerCase() === "#d946ef";
    const isSolar = id.includes("solar") || id.includes("dragon") || id.includes("inferno") || c2.toLowerCase() === "#f97316";

    const elementalOverlay = isThunder
      ? `<path d="M74 14 L62 28 H72 L58 46 M26 56 L38 44 H30 L44 32" stroke="#fef08a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
      : isCryo
      ? `<polygon points="64,18 68,28 78,32 68,36 64,46 60,36 50,32 60,28" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.2"/>`
      : isQuantum
      ? `<circle cx="64" cy="34" r="14" stroke="#facc15" stroke-width="1.8" stroke-dasharray="4 3"/><circle cx="64" cy="34" r="5" fill="#090d16" stroke="#f5d0fe" stroke-width="2"/>`
      : isSolar
      ? `<path d="M54 42 C50 28, 62 16, 76 18 C72 28, 76 38, 64 44 Z" fill="#f97316" opacity="0.65"/>`
      : "";

    return `
      <svg class="${cls}" viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="${uid}-arc" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${c3}" stop-opacity="0.15"/>
            <stop offset="55%" stop-color="${c2}"/>
            <stop offset="100%" stop-color="${c1}"/>
          </linearGradient>
        </defs>
        <path d="M16 74 C22 40, 48 20, 80 22 C60 32, 38 50, 26 78 Z" fill="url(#${uid}-arc)"/>
        <ellipse cx="64" cy="34" rx="18" ry="10" transform="rotate(-28 64 34)" stroke="${c1}" stroke-width="2.2" opacity="0.9"/>
        <ellipse cx="64" cy="34" rx="11" ry="6" transform="rotate(-28 64 34)" stroke="${c2}" stroke-width="2"/>
        <circle cx="64" cy="34" r="6.5" fill="${c1}" stroke="#ffffff" stroke-width="1.6"/>
        ${elementalOverlay}
        <path d="M76 18 L84 12 M80 34 L89 35 M52 18 L48 10" stroke="${c2}" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    `.trim();
  }
};

