import * as THREE from "three";
import { characterShopManager } from "./character_shop.js";

const STORAGE_KEY = "argon_tennis_addictive_v1";

export const RANK_TIERS = [
  { id: "bronze", name: "ĐỒNG ĐOÀN", minElo: 0, rewardCoins: 5000, color: "#d97706" },
  { id: "silver", name: "BẠC ĐOÀN", minElo: 1150, rewardCoins: 15000, color: "#94a3b8" },
  { id: "gold", name: "VÀNG ĐOÀN", minElo: 1350, rewardCoins: 40000, color: "#facc15" },
  { id: "platinum", name: "BẠCH KIM", minElo: 1600, rewardCoins: 100000, color: "#38bdf8" },
  { id: "diamond", name: "KIM CƯƠNG", minElo: 1900, rewardCoins: 250000, color: "#818cf8" },
  { id: "master", name: "CAO THỦ", minElo: 2250, rewardCoins: 600000, color: "#f43f5e" },
  { id: "challenger", name: "THÁCH ĐẤU TỐI THƯỢNG", minElo: 2650, rewardCoins: 2000000, color: "#10b981" },
];

export const PRESTIGE_TITLES = [
  { id: "title_rookie", name: "TÂN BINH SÂN ĐẤU", desc: "Danh hiệu khởi đầu sự nghiệp quần vợt", unlockRule: "Mặc định", bonusPct: 2 },
  { id: "title_sweetspot", name: "BẬC THẦY ĐIỂM NGỌT", desc: "Đánh trúng 25 cú Sweet Spot chuẩn xác", unlockRule: "25 cú Sweet Spot", reqStat: "sweetSpots", reqVal: 25, bonusPct: 5 },
  { id: "title_rally_king", name: "VUA ĐÔI CÔNG BẤT TẬN", desc: "Đạt chuỗi đôi công liên hoàn 15 chạm trở lên", unlockRule: "Chuỗi Rally 15 chạm", reqStat: "longestRally", reqVal: 15, bonusPct: 8 },
  { id: "title_sniper", name: "XẠ THỦ TÂM ĐIỂM", desc: "Bắn trúng Vòng Tâm Điểm trên sân 10 lần", unlockRule: "10 lần trúng Tâm Điểm", reqStat: "bullseyeHits", reqVal: 10, bonusPct: 10 },
  { id: "title_smash_god", name: "THẦN SẤM ĐẬP BÓNG", desc: "Thực hiện 30 cú đập bóng Smash uy lực", unlockRule: "30 cú Smash", reqStat: "totalSmashes", reqVal: 30, bonusPct: 12 },
  { id: "title_overdrive", name: "CHIẾN THẦN BÙNG NỔ", desc: "Kích hoạt trạng thái Nộ Khí Fever 8 lần", unlockRule: "8 lần kích hoạt Fever", reqStat: "feverActivations", reqVal: 8, bonusPct: 15 },
  { id: "title_boss_slayer", name: "KẺ HỦY DIỆT TRÙM CUỐI", desc: "Vượt qua ít nhất tầng 5 Tháp Đấu Trùm", unlockRule: "Tầng 5 Tháp Boss", reqStat: "bossTowerFloor", reqVal: 5, bonusPct: 20 },
  { id: "title_grand_slam", name: "HUYỀN THOẠI BẤT BẠI", desc: "Đạt 15 trận thắng trong sự nghiệp", unlockRule: "15 trận thắng", reqStat: "matchesWon", reqVal: 15, bonusPct: 30 },
];

export const DAILY_MISSIONS_CATALOG = [
  { id: "dm_sweetspot", title: "Chuẩn Xác Tuyệt Đối", desc: "Thực hiện 12 cú đánh trúng điểm ngọt (Sweet Spot)", target: 12, statKey: "dailySweetSpots", rewardCoins: 18000, rewardXp: 160 },
  { id: "dm_rally", title: "Đôi Công Bền Bỉ", desc: "Đạt chuỗi đánh qua lại (Rally) tối thiểu 10 chạm", target: 10, statKey: "dailyMaxRally", rewardCoins: 22000, rewardXp: 180 },
  { id: "dm_bullseye", title: "Xạ Thủ Sân Đấu", desc: "Đánh bóng rơi trúng Vòng Tâm Điểm 4 lần", target: 4, statKey: "dailyBullseyes", rewardCoins: 35000, rewardXp: 240 },
  { id: "dm_smash", title: "Cơn Mưa Đập Bóng", desc: "Tung ra 8 cú đập Smash hoặc Power Shot", target: 8, statKey: "dailySmashes", rewardCoins: 25000, rewardXp: 200 },
  { id: "dm_points", title: "Áp Đảo Tỷ Số", desc: "Ghi được tổng cộng 15 điểm trực tiếp trong trận", target: 15, statKey: "dailyPointsWon", rewardCoins: 30000, rewardXp: 220 },
  { id: "dm_matches", title: "Chiến Thắng Vinh Quang", desc: "Giành chiến thắng chung cuộc 2 trận đấu bất kỳ", target: 2, statKey: "dailyMatchesWon", rewardCoins: 65000, rewardXp: 350 },
];

export const WEEKLY_CHALLENGES_CATALOG = [
  { id: "wk_total_hits", title: "Cỗ Máy Đánh Bóng", desc: "Thực hiện 120 cú chạm vợt hợp lệ trong tuần", target: 120, statKey: "totalStrokes", rewardCoins: 120000, rewardVip: 25000, rewardXp: 600 },
  { id: "wk_bullseye_master", title: "Chuyên Gia Tâm Điểm", desc: "Đánh trúng Vòng Tâm Điểm trên sân 15 lần", target: 15, statKey: "bullseyeHits", rewardCoins: 180000, rewardVip: 50000, rewardXp: 800 },
  { id: "wk_fever_lord", title: "Bùng Nổ Nộ Khí", desc: "Kích hoạt trạng thái Nộ Khí Overdrive 10 lần", target: 10, statKey: "feverActivations", rewardCoins: 150000, rewardVip: 40000, rewardXp: 750 },
  { id: "wk_win_matches", title: "Nhà Vô Địch Tuần", desc: "Giành chiến thắng 8 trận đấu trong tuần", target: 8, statKey: "matchesWon", rewardCoins: 350000, rewardVip: 120000, rewardXp: 1200 },
];

export const ACHIEVEMENTS_CATALOG = [
  { id: "ach_first_win", title: "Chiến Thắng Đầu Tay", desc: "Giành chiến thắng trận đấu đầu tiên", statKey: "matchesWon", target: 1, rewardCoins: 10000 },
  { id: "ach_win_10", title: "Tay Vợt Chuyên Nghiệp", desc: "Giành chiến thắng 10 trận đấu", statKey: "matchesWon", target: 10, rewardCoins: 85000 },
  { id: "ach_win_30", title: "Độc Cô Cầu Bại", desc: "Giành chiến thắng 30 trận đấu", statKey: "matchesWon", target: 30, rewardCoins: 300000 },
  { id: "ach_rally_12", title: "Siêu Đôi Công 12 Chạm", desc: "Đạt chuỗi Rally 12 chạm liên tiếp không hỏng", statKey: "longestRally", target: 12, rewardCoins: 25000 },
  { id: "ach_rally_25", title: "Tường Thành Thép 25 Chạm", desc: "Đạt chuỗi Rally 25 chạm liên tiếp", statKey: "longestRally", target: 25, rewardCoins: 110000 },
  { id: "ach_sweet_50", title: "Cảm Giác Bóng Thượng Thừa", desc: "Đánh trúng 50 cú Sweet Spot hoàn hảo", statKey: "sweetSpots", target: 50, rewardCoins: 60000 },
  { id: "ach_sweet_200", title: "Kỷ Lục Gia Điểm Ngọt", desc: "Đánh trúng 200 cú Sweet Spot hoàn hảo", statKey: "sweetSpots", target: 200, rewardCoins: 240000 },
  { id: "ach_bullseye_5", title: "Mắt Đại Bàng", desc: "Bắn trúng Vòng Tâm Điểm trên sân 5 lần", statKey: "bullseyeHits", target: 5, rewardCoins: 35000 },
  { id: "ach_bullseye_25", title: "Định Vị Vệ Tinh", desc: "Bắn trúng Vòng Tâm Điểm trên sân 25 lần", statKey: "bullseyeHits", target: 25, rewardCoins: 190000 },
  { id: "ach_speed_210", title: "Cú Đánh Siêu Thanh", desc: "Đạt vận tốc bóng tối thiểu 210 KM/H", statKey: "fastestShotKmh", target: 210, rewardCoins: 75000 },
  { id: "ach_boss_3", title: "Chinh Phục Tháp Đấu", desc: "Vượt qua Tầng 3 Tháp Đấu Trùm", statKey: "bossTowerFloor", target: 3, rewardCoins: 90000 },
  { id: "ach_boss_10", title: "Hạ Gục Thần Quần Vợt", desc: "Phá đảo Tầng 10 Tháp Đấu Trùm Cuối", statKey: "bossTowerFloor", target: 10, rewardCoins: 1500000 },
];

export const BOSS_TOWER_FLOORS = [
  { floor: 1, name: "TẦNG 1 • TÂN BINH HỌC VIỆN", diff: "de", games: 1, rewardCoins: 12000, rewardVip: 2000, desc: "Khởi động nhẹ nhàng với Bot học viện cấp thấp." },
  { floor: 2, name: "TẦNG 2 • TAY VỢT PHONG TRÀO", diff: "thap", games: 1, rewardCoins: 24000, rewardVip: 5000, desc: "Biết trả bóng chéo sân cơ bản." },
  { floor: 3, name: "TẦNG 3 • ĐỘI TRƯỞNG CÂU LẠC BỘ", diff: "trung_binh", games: 1, rewardCoins: 45000, rewardVip: 12000, desc: "Phản xạ ổn định, bắt đầu sử dụng bóng xoáy." },
  { floor: 4, name: "TẦNG 4 • KIỆN TƯỚNG QUỐC GIA", diff: "cao", games: 1, rewardCoins: 80000, rewardVip: 25000, desc: "Tốc độ di chuyển nhanh, dứt điểm góc rộng." },
  { floor: 5, name: "TẦNG 5 • CHUYÊN GIA BẮT LƯỚI", diff: "cao", games: 3, rewardCoins: 150000, rewardVip: 60000, desc: "Thể thức Best of 3 với cặp đôi đánh chặn trên lưới." },
  { floor: 6, name: "TẦNG 6 • ĐẠI KIỆN TƯỚNG CHÂU LỤC", diff: "sieu_cao", games: 1, rewardCoins: 240000, rewardVip: 110000, desc: "Phản xạ cực nhanh, hiểm hóc từng đường bóng." },
  { floor: 7, name: "TẦNG 7 • Á QUÂN GRAND SLAM", diff: "sieu_cao", games: 3, rewardCoins: 400000, rewardVip: 200000, desc: "Áp lực toàn sân với những cú Topspin sấm sét." },
  { floor: 8, name: "TẦNG 8 • VÔ ĐỊCH THẾ GIỚI", diff: "cuc_cao", games: 1, rewardCoins: 700000, rewardVip: 380000, desc: "Cấp độ Cực Cao Lv.18 — Hầu như không mắc lỗi." },
  { floor: 9, name: "TẦNG 9 • SIÊU AI LƯỢNG TỬ", diff: "cuc_cao", games: 3, rewardCoins: 1200000, rewardVip: 650000, desc: "Thử thách bản lĩnh trước ngưỡng cửa Thần Thoại." },
  { floor: 10, name: "TẦNG 10 • TRÙM CUỐI TỐI THƯỢNG LV.20", diff: "x2", games: 3, rewardCoins: 3500000, rewardVip: 2500000, desc: "Thử thách khó nhất lịch sử: Bot X2 God Lv.20." },
];

export const LOGIN_STREAK_REWARDS = [
  { day: 1, coins: 8000, vip: 1000, label: "NGÀY 1" },
  { day: 2, coins: 15000, vip: 2500, label: "NGÀY 2" },
  { day: 3, coins: 30000, vip: 6000, label: "NGÀY 3" },
  { day: 4, coins: 50000, vip: 12000, label: "NGÀY 4" },
  { day: 5, coins: 85000, vip: 25000, label: "NGÀY 5" },
  { day: 6, coins: 140000, vip: 50000, label: "NGÀY 6" },
  { day: 7, coins: 300000, vip: 150000, label: "NGÀY 7 • ĐẶC BIỆT" },
];

export const MATRIX_REWARDS = [
  { id: "m1", label: "15.000 XU", type: "coins", amount: 15000, weight: 28 },
  { id: "m2", label: "35.000 XU", type: "coins", amount: 35000, weight: 22 },
  { id: "m3", label: "8.000 VIP", type: "vip", amount: 8000, weight: 18 },
  { id: "m4", label: "75.000 XU", type: "coins", amount: 75000, weight: 14 },
  { id: "m5", label: "25.000 VIP", type: "vip", amount: 25000, weight: 9 },
  { id: "m6", label: "200.000 XU", type: "coins", amount: 200000, weight: 5 },
  { id: "m7", label: "80.000 VIP", type: "vip", amount: 80000, weight: 3 },
  { id: "m8", label: "ĐỘC ĐẮC 500.000 XU", type: "coins", amount: 500000, weight: 1 },
];

export const PHYSICS_MUTATORS = [
  { id: "standard", name: "CHUẨN THI ĐẤU", desc: "Vật lý sân đấu tiêu chuẩn ATP 120 FPS", gravityMult: 1.0, speedMult: 1.0, spinMult: 1.0, ballScale: 1.0 },
  { id: "turbo", name: "SIÊU TỐC TURBO", desc: "Tốc độ bóng và nhịp độ trận đấu tăng +25%", gravityMult: 1.05, speedMult: 1.25, spinMult: 1.15, ballScale: 1.0 },
  { id: "moon", name: "TRỌNG LỰC THẤP", desc: "Bóng bay bổng lâu hơn, dễ căn thời gian đập Smash", gravityMult: 0.72, speedMult: 0.92, spinMult: 1.1, ballScale: 1.05 },
  { id: "hyperspin", name: "XOÁY CỰC ĐẠI", desc: "Quỹ đạo bóng uốn cong gấp đôi, cực kỳ ảo diệu", gravityMult: 1.0, speedMult: 1.08, spinMult: 2.1, ballScale: 1.0 },
  { id: "giantball", name: "BÓNG KHỔNG LỒ", desc: "Kích thước bóng lớn gấp 1.8 lần, dễ nhìn và giải trí", gravityMult: 0.95, speedMult: 1.05, spinMult: 1.2, ballScale: 1.8 },
];

export const WEATHER_MODES = [
  { id: "clear", name: "QUANG ĐÃNG", desc: "Thời tiết tiêu chuẩn, không có gió cản", windX: 0, fogHex: null },
  { id: "breeze", name: "GIÓ XOÁY NGANG", desc: "Gió tạt ngang làm bóng liệng nhẹ trên không", windX: 1.35, fogHex: 0x0f172a },
  { id: "sunset", name: "HOÀNG HÔN RỰC LỬA", desc: "Ánh nắng chiều vàng rực và không khí ấm", windX: 0.45, fogHex: 0x451a03 },
  { id: "cybernight", name: "ĐÊM ĐIỆN TỬ", desc: "Bầu trời đêm tương phản cao, tăng độ nét đường bóng", windX: -0.6, fogHex: 0x020617 },
];

export const PARTNER_STANCES = [
  { id: "interceptor", name: "ĐÁNH CHẶN TỰ ĐỘNG", short: "ĐÁNH CHẶN", desc: "Bot đồng đội di chuyển rộng khắp sân và chủ động cắt bóng", zTarget: 4.5, reachMult: 1.25 },
  { id: "net_rush", name: "ÁP SÁT LƯỚI", short: "ÁP LƯỚI", desc: "Dâng sát lưới 2.8m để dứt điểm Volley & Smash ngay lập tức", zTarget: 2.8, reachMult: 1.15 },
  { id: "baseline", name: "BỌC LÓT CUỐI SÂN", short: "BỌC LÓT", desc: "Lùi sâu hỗ trợ phòng ngự các pha bóng bổng qua đầu", zTarget: 6.8, reachMult: 1.1 },
];

export class AddictiveFeaturesManager {
  constructor() {
    this.engine = null;
    this.state = this._loadState();
    this.activeTab = "overview";

    // Live match transient state
    this.currentRallyCombo = 0;
    this.comboMultiplier = 1.0;
    this.feverGauge = 0; // 0 to 100
    this.feverActiveTimer = 0; // seconds remaining
    this.survivalLives = 3;
    this.survivalStreak = 0;

    // 3D Bullseye target ring on opponent court
    this.targetZoneMesh = null;
    this.targetZonePulseMesh = null;
    this.targetPos = new THREE.Vector3(1.8, 0.03, -7.2);
    this.targetRadius = 1.55;
    this.targetActive = true;

    this._checkDailyReset();
  }

  _defaultState() {
    const todayStr = new Date().toISOString().slice(0, 10);
    return {
      elo: 1200,
      seasonXp: 0,
      claimedPassLevels: {},
      claimedDailyMissions: {},
      claimedWeeklyChallenges: {},
      claimedAchievements: {},
      equippedTitleId: "title_rookie",
      partnerStance: "interceptor",
      physicsMutator: "standard",
      weatherMode: "clear",
      specialGameMode: "standard", // standard | survival | marathon | boss_tower
      activeBossFloor: 1,
      wagerAmount: 0,
      lastDailyDate: todayStr,
      loginStreakDay: 1,
      loginClaimedDate: "",
      freeSpinsLeft: 2,
      sponsorVaultCoins: 1500,
      lastSponsorTick: Date.now(),
      shotLandings: [], // up to 60 recent {x, z, type, isWinner}
      stats: {
        totalStrokes: 0,
        sweetSpots: 0,
        totalSmashes: 0,
        longestRally: 0,
        fastestShotKmh: 142,
        bullseyeHits: 0,
        feverActivations: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        bossTowerFloor: 0,
        bestSurvivalStreak: 0,
        dailySweetSpots: 0,
        dailyMaxRally: 0,
        dailyBullseyes: 0,
        dailySmashes: 0,
        dailyPointsWon: 0,
        dailyMatchesWon: 0,
      },
    };
  }

  _loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this._defaultState();
      const parsed = JSON.parse(raw);
      const def = this._defaultState();
      return {
        ...def,
        ...parsed,
        stats: { ...def.stats, ...(parsed.stats || {}) },
      };
    } catch {
      return this._defaultState();
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore storage quota errors
    }
  }

  _checkDailyReset() {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (this.state.lastDailyDate !== todayStr) {
      this.state.lastDailyDate = todayStr;
      this.state.claimedDailyMissions = {};
      this.state.freeSpinsLeft = 2;
      this.state.stats.dailySweetSpots = 0;
      this.state.stats.dailyMaxRally = 0;
      this.state.stats.dailyBullseyes = 0;
      this.state.stats.dailySmashes = 0;
      this.state.stats.dailyPointsWon = 0;
      this.state.stats.dailyMatchesWon = 0;
      this.saveState();
    }
  }

  attachEngine(engine) {
    this.engine = engine;
    this._create3DCourtTargetZone();
    this._buildDomUI();
    this._syncAllHudReadouts();
    this._applyEnvironmentAndMutators();

    // Passive Sponsor Vault ticker
    setInterval(() => {
      const add = Math.round(180 * this.getTitleBonusMultiplier());
      this.state.sponsorVaultCoins = Math.min(500000, (this.state.sponsorVaultCoins || 0) + add);
      this.saveState();
      const vaultEl = document.getElementById("hub-vault-amount");
      if (vaultEl) vaultEl.textContent = `${this.state.sponsorVaultCoins.toLocaleString("vi-VN")} XU`;
    }, 8000);
  }

  getEquippedTitle() {
    return (
      PRESTIGE_TITLES.find((t) => t.id === this.state.equippedTitleId) ||
      PRESTIGE_TITLES[0]
    );
  }

  getTitleBonusMultiplier() {
    const t = this.getEquippedTitle();
    return 1 + (t?.bonusPct || 0) / 100;
  }

  getCurrentRankTier() {
    const elo = this.state.elo || 1200;
    let current = RANK_TIERS[0];
    for (const r of RANK_TIERS) {
      if (elo >= r.minElo) current = r;
    }
    return current;
  }

  getNextRankTier() {
    const elo = this.state.elo || 1200;
    for (const r of RANK_TIERS) {
      if (elo < r.minElo) return r;
    }
    return null;
  }

  getSeasonLevelInfo() {
    const xp = this.state.seasonXp || 0;
    const xpPerLevel = 500;
    const level = Math.min(30, Math.floor(xp / xpPerLevel) + 1);
    const currentLevelXp = xp % xpPerLevel;
    const progressPct = level >= 30 ? 100 : Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100));
    return { level, currentLevelXp, xpPerLevel, progressPct, totalXp: xp };
  }

  getActivePhysicsMutator() {
    return (
      PHYSICS_MUTATORS.find((m) => m.id === this.state.physicsMutator) ||
      PHYSICS_MUTATORS[0]
    );
  }

  getActiveWeatherMode() {
    return (
      WEATHER_MODES.find((w) => w.id === this.state.weatherMode) ||
      WEATHER_MODES[0]
    );
  }

  getActivePartnerStance() {
    return (
      PARTNER_STANCES.find((s) => s.id === this.state.partnerStance) ||
      PARTNER_STANCES[0]
    );
  }

  // =========================================================================
  // 3D COURT TARGET ZONE (MỤC TIÊU TÂM ĐIỂM TRÊN SÂN)
  // =========================================================================
  _create3DCourtTargetZone() {
    if (!this.engine || !this.engine.scene) return;

    const group = new THREE.Group();
    group.name = "CourtBullseyeTargetZone";

    const outerGeo = new THREE.RingGeometry(1.18, 1.52, 40);
    outerGeo.rotateX(-Math.PI / 2);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);

    const innerGeo = new THREE.RingGeometry(0.42, 0.72, 32);
    innerGeo.rotateX(-Math.PI / 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);

    const coreGeo = new THREE.CircleGeometry(0.26, 24);
    coreGeo.rotateX(-Math.PI / 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);

    group.add(outerMesh, innerMesh, coreMesh);
    group.position.copy(this.targetPos);
    this.engine.scene.add(group);
    this.targetZoneMesh = group;
    this.targetZoneOuterMat = outerMat;
    this._relocateCourtTargetZone();
  }

  _relocateCourtTargetZone() {
    // Pick a tactical spot on the opponent side (z between -3.5 and -10.5, x between -3.2 and 3.2)
    const tx = (Math.random() * 2 - 1) * 3.1;
    const tz = -(4.0 + Math.random() * 6.4);
    this.targetPos.set(tx, 0.028, tz);
    if (this.targetZoneMesh) {
      this.targetZoneMesh.position.copy(this.targetPos);
    }
  }

  // =========================================================================
  // REAL-TIME GAMEPLAY HOOKS (CALLED BY GAME ENGINE)
  // =========================================================================
  update(dt) {
    if (!this.engine) return;

    // Animate 3D target zone ring
    if (this.targetZoneMesh) {
      this.targetZoneMesh.visible = this.targetActive && !this.engine.isMultiplayer;
      if (this.targetZoneMesh.visible) {
        const pulse = 1 + Math.sin(this.engine.elapsedTime * 5.2) * 0.08;
        this.targetZoneMesh.scale.set(pulse, 1, pulse);
        this.targetZoneMesh.rotation.y += dt * 1.15;
      }
    }

    // Update Fever Overdrive timer
    if (this.feverActiveTimer > 0) {
      this.feverActiveTimer = Math.max(0, this.feverActiveTimer - dt);
      if (this.feverActiveTimer <= 0) {
        this.feverGauge = 0;
        this._syncLiveStripHUD();
      } else {
        this.feverGauge = Math.round((this.feverActiveTimer / 15) * 100);
        this._syncLiveStripHUD();
      }
    }

    // Apply wind & mutator physics during active rally ball flight
    if (this.engine.phase === "RALLY" && this.engine.ball?.inPlay) {
      const weather = this.getActiveWeatherMode();
      if (weather && Math.abs(weather.windX) > 0.01) {
        this.engine.ball.vel.x += weather.windX * dt * 0.55;
      }
      const mut = this.getActivePhysicsMutator();
      if (mut && mut.gravityMult !== 1.0) {
        // Compensate gravity difference
        const diffG = (1.0 - mut.gravityMult) * 9.15;
        this.engine.ball.vel.y += diffG * dt;
      }
    }
  }

  onPlayerStroke({ shotType = "TOPSPIN", timing = "GOOD", isPower = false, speedKmh = 140 }) {
    if (!this.engine || this.engine.autoPlayMode) return;

    this.currentRallyCombo += 1;
    this.comboMultiplier = Math.min(5.0, +(1.0 + Math.floor(this.currentRallyCombo / 2) * 0.25).toFixed(2));

    // Update career & daily stats
    this.state.stats.totalStrokes += 1;
    if (this.currentRallyCombo > this.state.stats.longestRally) {
      this.state.stats.longestRally = this.currentRallyCombo;
    }
    if (this.currentRallyCombo > this.state.stats.dailyMaxRally) {
      this.state.stats.dailyMaxRally = this.currentRallyCombo;
    }

    let finalSpeedKmh = speedKmh;
    if (this.feverActiveTimer > 0) {
      // Fever Overdrive boosts ball velocity by +18%
      this.engine.ball.vel.multiplyScalar(1.14);
      finalSpeedKmh = Math.round(speedKmh * 1.18);
    }

    const mut = this.getActivePhysicsMutator();
    if (mut && mut.speedMult !== 1.0) {
      this.engine.ball.vel.multiplyScalar(mut.speedMult);
      finalSpeedKmh = Math.round(finalSpeedKmh * mut.speedMult);
    }

    if (finalSpeedKmh > this.state.stats.fastestShotKmh) {
      this.state.stats.fastestShotKmh = finalSpeedKmh;
    }

    if (shotType === "SMASH" || isPower) {
      this.state.stats.totalSmashes += 1;
      this.state.stats.dailySmashes += 1;
    }

    // Sweet Spot / Perfect Parry Counter
    if (timing === "PERFECT") {
      this.state.stats.sweetSpots += 1;
      this.state.stats.dailySweetSpots += 1;
      // Perfect Counter bonus coins on every 3rd sweet spot in a rally
      if (this.currentRallyCombo >= 3) {
        const counterCoins = Math.round(180 * this.comboMultiplier * this.getTitleBonusMultiplier());
        characterShopManager.addCoins(counterCoins, "Phản Công Điểm Ngọt");
      }
    }

    // Charge Fever Overdrive Gauge
    if (this.feverActiveTimer <= 0) {
      const gain = timing === "PERFECT" ? 22 : isPower ? 16 : 12;
      this.feverGauge = Math.min(100, this.feverGauge + gain);
      if (this.feverGauge >= 100) {
        this.activateFeverOverdrive();
      }
    }

    // Rally Marathon Mode milestone check
    if (this.state.specialGameMode === "marathon" && this.currentRallyCombo % 10 === 0) {
      const marathonBonus = this.currentRallyCombo * 2500;
      characterShopManager.addCoins(marathonBonus, `Mốc Marathon ${this.currentRallyCombo} Chạm`);
      this.addSeasonXp(80);
      this.engine._spawnFloatingCoinToast?.(marathonBonus, `MỐC ĐÔI CÔNG ${this.currentRallyCombo} CHẠM!`);
    }

    this.addSeasonXp(timing === "PERFECT" ? 8 : 4);
    this._syncLiveStripHUD();
    this.saveState();
  }

  activateFeverOverdrive() {
    if (this.feverActiveTimer > 0) return;
    this.feverActiveTimer = 15.0;
    this.feverGauge = 100;
    this.state.stats.feverActivations += 1;
    this.addSeasonXp(45);
    this.saveState();

    if (this.engine) {
      this.engine.triggerCameraShake?.(0.65);
      if (this.engine.player) {
        this.engine._spawnStarBurst?.(
          this.engine.player.pos.clone().add(new THREE.Vector3(0, 1.2, 0)),
          24,
        );
      }
      this.engine.hud?.showCenterBanner?.("BÙNG NỔ NỘ KHÍ OVERDRIVE", {
        style: "style-gold",
        subText: "TỐC ĐỘ BÓNG +20% • NHÂN ĐÔI XU THƯỞNG TRONG 15 GIÂY",
        durationMs: 1650,
      });
    }
    this._syncLiveStripHUD();
  }

  onBallBounceOnCourt(x, z, lastHitter) {
    if (!this.engine || this.engine.autoPlayMode) return;

    // Record shot landing for Heatmap if hit by player onto opponent court
    if (lastHitter === "player" && z < 0) {
      this.state.shotLandings.push({
        x: +x.toFixed(2),
        z: +z.toFixed(2),
        shotType: this.engine.ball?.shotType || "TOPSPIN",
        ts: Date.now(),
      });
      if (this.state.shotLandings.length > 60) {
        this.state.shotLandings.shift();
      }

      // Check 3D Bullseye Target Zone hit!
      if (this.targetActive && !this.engine.isMultiplayer) {
        const dist = Math.hypot(x - this.targetPos.x, z - this.targetPos.z);
        if (dist <= this.targetRadius) {
          const isDeadCenter = dist <= 0.65;
          const baseReward = isDeadCenter ? 2500 : 1200;
          const finalReward = Math.round(
            baseReward *
              this.comboMultiplier *
              (this.feverActiveTimer > 0 ? 2 : 1) *
              this.getTitleBonusMultiplier(),
          );
          this.state.stats.bullseyeHits += 1;
          this.state.stats.dailyBullseyes += 1;
          this.addSeasonXp(isDeadCenter ? 65 : 35);
          characterShopManager.addCoins(finalReward, "Bắn Trúng Tâm Điểm Sân");

          this.engine._spawnStarBurst?.(new THREE.Vector3(x, 0.35, z), 22);
          this.engine.triggerCameraShake?.(0.45);
          this.engine._spawnFloatingCoinToast?.(
            finalReward,
            isDeadCenter ? "HỒNG TÂM HOÀN HẢO!" : "TRÚNG VÒNG TÂM ĐIỂM!",
          );
          this._relocateCourtTargetZone();
          this.saveState();
          this._syncLiveStripHUD();
        }
      }
    }
  }

  onPointFinished(winner) {
    if (!this.engine || this.engine.autoPlayMode) return;
    const playerWonPoint =
      this.engine.playerRole === "p2" ? winner === "opponent" : winner === "player";

    if (playerWonPoint) {
      this.state.stats.dailyPointsWon += 1;
      const comboBonus =
        this.currentRallyCombo >= 3
          ? Math.round(this.currentRallyCombo * 65 * this.comboMultiplier * (this.feverActiveTimer > 0 ? 2 : 1))
          : 0;
      if (comboBonus > 0) {
        characterShopManager.addCoins(comboBonus, `Thưởng Chuỗi Combo x${this.comboMultiplier}`);
      }

      if (this.state.specialGameMode === "survival") {
        this.survivalStreak += 1;
        if (this.survivalStreak > (this.state.stats.bestSurvivalStreak || 0)) {
          this.state.stats.bestSurvivalStreak = this.survivalStreak;
        }
        const survCoins = this.survivalStreak * 450;
        characterShopManager.addCoins(survCoins, `Chuỗi Sinh Tồn #${this.survivalStreak}`);
      }
      this.addSeasonXp(25);
    } else if (this.state.specialGameMode === "survival") {
      this.survivalLives = Math.max(0, this.survivalLives - 1);
      if (this.survivalLives <= 0) {
        this.survivalLives = 3;
        this.survivalStreak = 0;
      }
    }

    this.currentRallyCombo = 0;
    this.comboMultiplier = 1.0;
    this._syncLiveStripHUD();
    this.saveState();
  }

  onMatchFinished(playerWon) {
    if (!this.engine || this.engine.autoPlayMode) return;

    this.state.stats.matchesPlayed += 1;
    if (playerWon) {
      this.state.stats.matchesWon += 1;
      this.state.stats.dailyMatchesWon += 1;
    }

    // ELO calculation
    const diffWeights = {
      de: 14,
      thap: 18,
      trung_binh: 24,
      cao: 32,
      sieu_cao: 42,
      cuc_cao: 55,
      x2: 85,
    };
    const diff = this.engine.matchConfig?.difficulty || "trung_binh";
    const delta = diffWeights[diff] || 24;
    if (playerWon) {
      this.state.elo = (this.state.elo || 1200) + delta;
    } else {
      this.state.elo = Math.max(800, (this.state.elo || 1200) - Math.round(delta * 0.45));
    }

    // Wager / Match Pot resolution
    if (this.state.wagerAmount > 0) {
      if (playerWon) {
        const jackpot = Math.round(this.state.wagerAmount * 2.5);
        characterShopManager.addCoins(jackpot, "Thắng Quỹ Cược Trận Đấu 2.5X");
        this.engine._spawnFloatingCoinToast?.(jackpot, `THẮNG QUỸ CƯỢC 2.5X: +${jackpot.toLocaleString("vi-VN")} XU!`);
      }
      this.state.wagerAmount = 0;
    }

    // Boss Rush Tower progression
    if (playerWon && this.state.specialGameMode === "boss_tower") {
      const floorObj = BOSS_TOWER_FLOORS.find((f) => f.floor === this.state.activeBossFloor);
      if (floorObj) {
        characterShopManager.addCoins(floorObj.rewardCoins, `Phá Đảo ${floorObj.name}`);
        characterShopManager.addVipCoins(floorObj.rewardVip, `Thưởng VIP ${floorObj.name}`);
        if (this.state.activeBossFloor > (this.state.stats.bossTowerFloor || 0)) {
          this.state.stats.bossTowerFloor = this.state.activeBossFloor;
        }
        if (this.state.activeBossFloor < 10) {
          this.state.activeBossFloor += 1;
        }
      }
    }

    this.addSeasonXp(playerWon ? 160 : 55);
    this.saveState();
    this._syncAllHudReadouts();
  }

  addSeasonXp(amount) {
    this.state.seasonXp = (this.state.seasonXp || 0) + Math.max(0, Math.round(amount));
    this.saveState();
  }

  // =========================================================================
  // ENVIRONMENT, PHYSICS MUTATORS & PARTNER STANCE APPLICATION
  // =========================================================================
  _applyEnvironmentAndMutators() {
    if (!this.engine) return;
    const mut = this.getActivePhysicsMutator();
    if (this.engine.ball?.mesh && mut) {
      this.engine.ball.mesh.scale.setScalar(mut.ballScale || 1.0);
    }

    const weather = this.getActiveWeatherMode();
    if (this.engine.scene && weather) {
      if (weather.fogHex !== null) {
        this.engine.scene.fog = new THREE.FogExp2(weather.fogHex, 0.0085);
      } else {
        this.engine.scene.fog = null;
      }
    }

    // Sync Partner Stance Z-positioning
    const stance = this.getActivePartnerStance();
    if (this.engine.playerPartner && stance) {
      this.engine.playerPartner.customStanceZ = stance.zTarget;
      this.engine.playerPartner.customReachMult = stance.reachMult;
    }

    this._syncAllHudReadouts();
  }

  cyclePartnerStance() {
    const idx = PARTNER_STANCES.findIndex((s) => s.id === this.state.partnerStance);
    const next = PARTNER_STANCES[(idx + 1) % PARTNER_STANCES.length];
    this.state.partnerStance = next.id;
    this.saveState();
    this._applyEnvironmentAndMutators();
    if (this.engine?.hud?.showCenterBanner) {
      this.engine.hud.showCenterBanner(`ĐỘI HÌNH BOT: ${next.name}`, {
        style: "style-score",
        subText: next.desc,
        durationMs: 1350,
      });
    }
  }

  // =========================================================================
  // UI INJECTION: 22-FEATURE COMMAND HUB MODAL (NO TOP HUD STRIP CLUTTER)
  // =========================================================================
  _buildDomUI() {
    // Ensure any legacy top HUD strip or extra dock button is removed
    document.getElementById("addictive-hud-strip")?.remove();
    document.getElementById("btn-hud-addictive-hub")?.remove();

    const titleShopCta = document.querySelector(".title-shop-cta");
    if (titleShopCta && !document.getElementById("btn-title-addictive-hub")) {
      const hubBtn = document.createElement("button");
      hubBtn.id = "btn-title-addictive-hub";
      hubBtn.type = "button";
      hubBtn.className = "wii-shop-cta-btn addictive-title-cta-btn";
      hubBtn.innerHTML = `
        <span class="shop-cta-title">TRUNG TÂM TIẾN TRÌNH • NHIỆM VỤ • THÁP BOSS • BATTLE PASS (22+ TÍNH NĂNG)</span>
        <span class="shop-cta-badge" id="title-elo-badge">1200 ELO</span>
      `;
      hubBtn.addEventListener("click", () => this.openHubModal());
      titleShopCta.appendChild(hubBtn);
    }

    // Create the main Command Hub Modal
    if (!document.getElementById("addictive-hub-modal")) {
      const modal = document.createElement("div");
      modal.id = "addictive-hub-modal";
      modal.className = "wii-modal-backdrop hidden";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.innerHTML = `
        <div class="addictive-hub-card">
          <header class="ahub-header">
            <div class="ahub-header-left">
              <span class="ahub-kicker">HỆ SINH THÁI THI ĐẤU CHUYÊN NGHIỆP • 22+ TÍNH NĂNG</span>
              <h2 class="ahub-title">TRUNG TÂM SỰ NGHIỆP &amp; CHẾ ĐỘ ĐẶC BIỆT</h2>
            </div>
            <div class="ahub-header-wallets">
              <div class="ahub-wallet-pill">
                <span class="ahub-w-label">QUỸ XU</span>
                <strong class="ahub-w-val" data-shop-coins>0</strong>
              </div>
              <div class="ahub-wallet-pill vip">
                <span class="ahub-w-label">QUỸ VIP</span>
                <strong class="ahub-w-val" data-shop-vip-coins>0</strong>
              </div>
              <button type="button" id="btn-close-ahub" class="ahub-close-btn">ĐÓNG</button>
            </div>
          </header>

          <nav class="ahub-tabs" role="tablist">
            <button type="button" class="ahub-tab active" data-ahub-tab="overview">TỔNG QUAN &amp; RANK ELO</button>
            <button type="button" class="ahub-tab" data-ahub-tab="missions">NHIỆM VỤ &amp; THÀNH TỰU</button>
            <button type="button" class="ahub-tab" data-ahub-tab="season">BATTLE PASS 30 CẤP</button>
            <button type="button" class="ahub-tab" data-ahub-tab="modes">THÁP BOSS &amp; CHẾ ĐỘ MỚI</button>
            <button type="button" class="ahub-tab" data-ahub-tab="rewards">ĐIỂM DANH &amp; QUAY THƯỞNG</button>
            <button type="button" class="ahub-tab" data-ahub-tab="mutators">ĐỘT BIẾN VẬT LÝ &amp; ĐỘI HÌNH</button>
            <button type="button" class="ahub-tab" data-ahub-tab="telemetry">BẢN ĐỒ NHIỆT &amp; THỐNG KÊ</button>
          </nav>

          <div class="ahub-body" id="ahub-body-content"></div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById("btn-close-ahub")?.addEventListener("click", () => this.closeHubModal());
      modal.addEventListener("click", (e) => {
        if (e.target === modal) this.closeHubModal();
      });

      modal.querySelectorAll("[data-ahub-tab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const tab = btn.getAttribute("data-ahub-tab");
          this.switchTab(tab);
        });
      });
    }

    // Keyboard shortcut B to switch partner stance quickly
    window.addEventListener("keydown", (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.code === "KeyB") {
        this.cyclePartnerStance();
      } else if (e.code === "KeyF" && this.feverGauge >= 100 && this.feverActiveTimer <= 0) {
        this.activateFeverOverdrive();
      }
    });
  }

  openHubModal(tabName = null) {
    if (tabName) this.activeTab = tabName;
    const modal = document.getElementById("addictive-hub-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    this.switchTab(this.activeTab);
    characterShopManager._notifyChange?.();
  }

  closeHubModal() {
    const modal = document.getElementById("addictive-hub-modal");
    if (modal) modal.classList.add("hidden");
  }

  switchTab(tabName) {
    this.activeTab = tabName || "overview";
    const modal = document.getElementById("addictive-hub-modal");
    if (!modal) return;
    modal.querySelectorAll("[data-ahub-tab]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-ahub-tab") === this.activeTab);
    });
    this._renderActiveTabContent();
  }

  _syncLiveStripHUD() {
    const rank = this.getCurrentRankTier();
    const titleObj = this.getEquippedTitle();
    const stance = this.getActivePartnerStance();

    const titleEl = document.getElementById("ahud-title-label");
    if (titleEl) titleEl.textContent = titleObj.name;

    const rankEl = document.getElementById("ahud-rank-label");
    if (rankEl) rankEl.textContent = `${rank.name} • ${this.state.elo} ELO`;

    const titleEloBadge = document.getElementById("title-elo-badge");
    if (titleEloBadge) titleEloBadge.textContent = `${rank.name} • ${this.state.elo} ELO`;

    const comboEl = document.getElementById("ahud-combo-val");
    if (comboEl) {
      comboEl.textContent = `${this.currentRallyCombo} CHẠM (x${this.comboMultiplier.toFixed(2)})`;
    }

    const feverText = document.getElementById("ahud-fever-text");
    const feverFill = document.getElementById("ahud-fever-fill");
    const feverBtn = document.getElementById("ahud-fever-btn");
    if (feverText && feverFill) {
      if (this.feverActiveTimer > 0) {
        feverText.textContent = `BÙNG NỔ ${this.feverActiveTimer.toFixed(0)}S`;
        feverFill.style.width = `${Math.round((this.feverActiveTimer / 15) * 100)}%`;
        feverBtn?.classList.add("fever-active");
      } else {
        feverText.textContent = `${Math.round(this.feverGauge)}%`;
        feverFill.style.width = `${Math.round(this.feverGauge)}%`;
        feverBtn?.classList.remove("fever-active");
      }
    }

    const stanceEl = document.getElementById("ahud-stance-label");
    if (stanceEl && stance) stanceEl.textContent = stance.short;

    // Also update VS overlay player title with equipped title
    const vsP1Title = document.getElementById("vs-p1-title");
    if (vsP1Title && titleObj) {
      vsP1Title.textContent = `${titleObj.name} (+${titleObj.bonusPct}% XU)`;
    }
  }

  _syncAllHudReadouts() {
    this._syncLiveStripHUD();
    const modal = document.getElementById("addictive-hub-modal");
    if (modal && !modal.classList.contains("hidden")) {
      this._renderActiveTabContent();
    }
  }

  // =========================================================================
  // TAB CONTENT RENDERERS (PURE TYPOGRAPHIC DESIGN - ZERO ICONS)
  // =========================================================================
  _renderActiveTabContent() {
    const container = document.getElementById("ahub-body-content");
    if (!container) return;

    if (this.activeTab === "overview") {
      container.innerHTML = this._renderOverviewTab();
      this._bindOverviewEvents(container);
    } else if (this.activeTab === "missions") {
      container.innerHTML = this._renderMissionsTab();
      this._bindMissionsEvents(container);
    } else if (this.activeTab === "season") {
      container.innerHTML = this._renderSeasonPassTab();
      this._bindSeasonPassEvents(container);
    } else if (this.activeTab === "modes") {
      container.innerHTML = this._renderModesTab();
      this._bindModesEvents(container);
    } else if (this.activeTab === "rewards") {
      container.innerHTML = this._renderRewardsTab();
      this._bindRewardsEvents(container);
    } else if (this.activeTab === "mutators") {
      container.innerHTML = this._renderMutatorsTab();
      this._bindMutatorsEvents(container);
    } else if (this.activeTab === "telemetry") {
      container.innerHTML = this._renderTelemetryTab();
      this._bindTelemetryEvents(container);
    }
  }

  _renderOverviewTab() {
    const rank = this.getCurrentRankTier();
    const nextRank = this.getNextRankTier();
    const passInfo = this.getSeasonLevelInfo();
    const eqTitle = this.getEquippedTitle();
    const nextElo = nextRank ? nextRank.minElo : rank.minElo + 500;
    const eloPct = nextRank
      ? Math.min(100, Math.max(0, Math.round(((this.state.elo - rank.minElo) / (nextRank.minElo - rank.minElo)) * 100)))
      : 100;

    return `
      <div class="ahub-grid-2col">
        <!-- Card 1: Ranked ELO & Division -->
        <div class="ahub-panel ahub-panel-highlight">
          <div class="ahub-panel-head">
            <span class="ahub-tag">HỆ THỐNG XẾP HẠNG ELO CHUYÊN NGHIỆP</span>
            <span class="ahub-badge-accent">${this.state.elo} ĐIỂM ELO</span>
          </div>
          <div class="ahub-rank-hero">
            <div class="ahub-rank-name" style="color:${rank.color}">${rank.name}</div>
            <div class="ahub-rank-sub">
              ${nextRank ? `Còn ${nextRank.minElo - this.state.elo} ELO để thăng hạng lên ${nextRank.name} (Thưởng +${nextRank.rewardCoins.toLocaleString("vi-VN")} XU)` : "Bạn đã đạt cấp bậc Xếp Hạng cao nhất toàn máy chủ!"}
            </div>
          </div>
          <div class="ahub-progress-wrap">
            <div class="ahub-progress-bar">
              <div class="ahub-progress-fill" style="width:${eloPct}%;background:${rank.color}"></div>
            </div>
            <div class="ahub-progress-meta">
              <span>Mốc hiện tại: ${rank.minElo} ELO</span>
              <span>Tiến độ: ${eloPct}%</span>
              <span>Mốc kế: ${nextElo} ELO</span>
            </div>
          </div>

          <!-- Sponsor Vault -->
          <div class="ahub-sponsor-box">
            <div>
              <div class="ahub-box-title">QUỸ TÀI TRỢ CÂU LẠC BỘ TÍCH LŨY TỰ ĐỘNG</div>
              <div class="ahub-box-desc">Tự động sinh lời theo thời gian thực dựa trên Danh Hiệu đang đeo (+${eqTitle.bonusPct}% tốc độ).</div>
            </div>
            <div class="ahub-sponsor-actions">
              <strong id="hub-vault-amount" class="ahub-vault-num">${(this.state.sponsorVaultCoins || 0).toLocaleString("vi-VN")} XU</strong>
              <button type="button" id="btn-claim-sponsor-vault" class="ahub-btn primary">NHẬN QUỸ</button>
            </div>
          </div>
        </div>

        <!-- Card 2: Match Wager Pot (Double or Nothing) & Quick Summary -->
        <div class="ahub-panel">
          <div class="ahub-panel-head">
            <span class="ahub-tag">QUỸ CƯỢC TRẬN ĐẤU (NHÂN 2.5 LẦN XU)</span>
            <span class="ahub-badge-gold">${this.state.wagerAmount > 0 ? `ĐANG CƯỢC: ${this.state.wagerAmount.toLocaleString("vi-VN")} XU` : "CHƯA ĐẶT CƯỢC"}</span>
          </div>
          <p class="ahub-desc">
            Đặt cược Xu trước trận đấu. Nếu giành chiến thắng chung cuộc, bạn nhận ngay <strong>2.5 LẦN</strong> số Xu đã cược!
          </p>
          <div class="ahub-wager-row">
            <button type="button" class="ahub-btn ${this.state.wagerAmount === 10000 ? "active" : ""}" data-wager="10000">CƯỢC 10.000 XU</button>
            <button type="button" class="ahub-btn ${this.state.wagerAmount === 50000 ? "active" : ""}" data-wager="50000">CƯỢC 50.000 XU</button>
            <button type="button" class="ahub-btn ${this.state.wagerAmount === 200000 ? "active" : ""}" data-wager="200000">CƯỢC 200.000 XU</button>
          </div>

          <div class="ahub-divider"></div>

          <div class="ahub-panel-head">
            <span class="ahub-tag">KHO DANH HIỆU ĐEO TRƯỚC TÊN (+% XU THƯỞNG)</span>
            <span class="ahub-badge-accent">ĐANG ĐEO: ${eqTitle.name}</span>
          </div>
          <div class="ahub-titles-list">
            ${PRESTIGE_TITLES.map((t) => {
              const unlocked = !t.reqStat || (this.state.stats[t.reqStat] || 0) >= t.reqVal;
              const isEquipped = this.state.equippedTitleId === t.id;
              return `
                <div class="ahub-title-item ${isEquipped ? "equipped" : ""} ${unlocked ? "unlocked" : "locked"}">
                  <div class="ahub-title-info">
                    <div class="ahub-title-name">${t.name} <span class="ahub-title-buff">+${t.bonusPct}% XU</span></div>
                    <div class="ahub-title-sub">${t.desc} (${t.unlockRule})</div>
                  </div>
                  <button type="button" class="ahub-btn ${isEquipped ? "active" : "secondary"}" data-equip-title="${t.id}" ${!unlocked ? "disabled" : ""}>
                    ${isEquipped ? "ĐANG ĐEO" : unlocked ? "TRANG BỊ" : "CHƯA MỞ"}
                  </button>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>

      <!-- Bottom Quick Overview of 22 Active Systems -->
      <div class="ahub-panel ahub-mt">
        <div class="ahub-panel-head">
          <span class="ahub-tag">TRẠNG THÁI HOẠT ĐỘNG CỦA 22+ TÍNH NĂNG GÂY NGHIỆN TRONG GAME</span>
          <span class="ahub-badge-accent">CẤP BATTLE PASS: CẤP ${passInfo.level}/30</span>
        </div>
        <div class="ahub-feature-pills-grid">
          <div class="ahub-fpill"><span>01. CHUỖI COMBO NHÂN HỆ SỐ</span><strong>HOẠT ĐỘNG (TỐI ĐA X5.0)</strong></div>
          <div class="ahub-fpill"><span>02. ĐỒNG HỒ NỘ KHÍ OVERDRIVE</span><strong>ĐẦY 100% TĂNG TỐC + X2 XU</strong></div>
          <div class="ahub-fpill"><span>03. VÒNG TÂM ĐIỂM TRÊN SÂN 3D</span><strong>THƯỞNG NÓNG TỚI 2.500 XU/CÚ</strong></div>
          <div class="ahub-fpill"><span>04. PHẢN CÔNG ĐIỂM NGỌT</span><strong>THƯỞNG XU LIÊN HOÀN</strong></div>
          <div class="ahub-fpill"><span>05. XẾP HẠNG RANK ELO 7 BẬC</span><strong>${rank.name} (${this.state.elo} ELO)</strong></div>
          <div class="ahub-fpill"><span>06. BATTLE PASS 30 CẤP ĐỘ</span><strong>CẤP ${passInfo.level} (${passInfo.totalXp} XP)</strong></div>
          <div class="ahub-fpill"><span>07. NHIỆM VỤ NGÀY TỰ ĐỘNG</span><strong>6 NHIỆM VỤ MỖI NGÀY</strong></div>
          <div class="ahub-fpill"><span>08. THỬ THÁCH TUẦN SIÊU CẤP</span><strong>THƯỞNG XU &amp; VIP LỚN</strong></div>
          <div class="ahub-fpill"><span>09. THÁP ĐẤU TRÙM 10 TẦNG</span><strong>ĐANG Ở TẦNG ${this.state.activeBossFloor}/10</strong></div>
          <div class="ahub-fpill"><span>10. CHẾ ĐỘ SINH TỒN 3 MẠNG</span><strong>KỶ LỤC: ${this.state.stats.bestSurvivalStreak} ĐIỂM</strong></div>
          <div class="ahub-fpill"><span>11. CHẾ ĐỘ MARATHON ĐÔI CÔNG</span><strong>KỶ LỤC: ${this.state.stats.longestRally} CHẠM</strong></div>
          <div class="ahub-fpill"><span>12. ĐẶT CƯỢC QUỸ THƯỞNG 2.5X</span><strong>NHÂN 2.5 LẦN TIỀN CƯỢC</strong></div>
        </div>
      </div>
    `;
  }

  _bindOverviewEvents(container) {
    container.querySelector("#btn-claim-sponsor-vault")?.addEventListener("click", () => {
      const amt = this.state.sponsorVaultCoins || 0;
      if (amt <= 0) return;
      this.state.sponsorVaultCoins = 0;
      characterShopManager.addCoins(amt, "Nhận Quỹ Tài Trợ CLB");
      this.saveState();
      this._renderActiveTabContent();
    });

    container.querySelectorAll("[data-wager]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = Number(btn.getAttribute("data-wager") || 0);
        if (this.state.wagerAmount === val) {
          // Refund active wager
          characterShopManager.addCoins(val, "Hoàn Quỹ Cược");
          this.state.wagerAmount = 0;
        } else {
          if ((characterShopManager.state.coins || 0) < val) {
            this.engine?._spawnFloatingCoinToast?.(0, "KHÔNG ĐỦ XU ĐỂ ĐẶT CƯỢC!");
            return;
          }
          if (this.state.wagerAmount > 0) {
            characterShopManager.addCoins(this.state.wagerAmount, "Hoàn Quỹ Cược Cũ");
          }
          characterShopManager.state.coins -= val;
          characterShopManager.saveState();
          characterShopManager._notifyChange?.();
          this.state.wagerAmount = val;
        }
        this.saveState();
        this._renderActiveTabContent();
      });
    });

    container.querySelectorAll("[data-equip-title]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tid = btn.getAttribute("data-equip-title");
        if (!tid) return;
        this.state.equippedTitleId = tid;
        this.saveState();
        this._syncAllHudReadouts();
      });
    });
  }

  _renderMissionsTab() {
    return `
      <div class="ahub-grid-2col">
        <!-- Daily Missions -->
        <div class="ahub-panel">
          <div class="ahub-panel-head">
            <span class="ahub-tag">NHIỆM VỤ HÀNG NGÀY (LÀM MỚI MỖI NGÀY)</span>
            <span class="ahub-badge-accent">6 NHIỆM VỤ</span>
          </div>
          <div class="ahub-mission-list">
            ${DAILY_MISSIONS_CATALOG.map((m) => {
              const cur = this.state.stats[m.statKey] || 0;
              const pct = Math.min(100, Math.round((cur / m.target) * 100));
              const claimed = !!this.state.claimedDailyMissions[m.id];
              const canClaim = cur >= m.target && !claimed;
              return `
                <div class="ahub-mission-card ${claimed ? "claimed" : canClaim ? "ready" : ""}">
                  <div class="ahub-m-top">
                    <div>
                      <div class="ahub-m-title">${m.title}</div>
                      <div class="ahub-m-desc">${m.desc}</div>
                    </div>
                    <div class="ahub-m-reward">+${m.rewardCoins.toLocaleString("vi-VN")} XU • +${m.rewardXp} XP</div>
                  </div>
                  <div class="ahub-m-bottom">
                    <div class="ahub-progress-bar small">
                      <div class="ahub-progress-fill" style="width:${pct}%"></div>
                    </div>
                    <span class="ahub-m-count">${Math.min(cur, m.target)}/${m.target}</span>
                    <button type="button" class="ahub-btn ${canClaim ? "primary" : "secondary"}" data-claim-daily="${m.id}" ${!canClaim ? "disabled" : ""}>
                      ${claimed ? "ĐÃ NHẬN" : canClaim ? "NHẬN THƯỞNG" : "ĐANG LÀM"}
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Weekly Challenges & Career Achievements -->
        <div class="ahub-panel">
          <div class="ahub-panel-head">
            <span class="ahub-tag">THỬ THÁCH TUẦN &amp; THÀNH TỰU SỰ NGHIỆP</span>
            <span class="ahub-badge-gold">THƯỞNG XU + VIP</span>
          </div>
          <div class="ahub-mission-list">
            ${WEEKLY_CHALLENGES_CATALOG.map((w) => {
              const cur = this.state.stats[w.statKey] || 0;
              const pct = Math.min(100, Math.round((cur / w.target) * 100));
              const claimed = !!this.state.claimedWeeklyChallenges[w.id];
              const canClaim = cur >= w.target && !claimed;
              return `
                <div class="ahub-mission-card ${claimed ? "claimed" : canClaim ? "ready" : ""}">
                  <div class="ahub-m-top">
                    <div>
                      <div class="ahub-m-title">[TUẦN] ${w.title}</div>
                      <div class="ahub-m-desc">${w.desc}</div>
                    </div>
                    <div class="ahub-m-reward">+${w.rewardCoins.toLocaleString("vi-VN")} XU • +${w.rewardVip.toLocaleString("vi-VN")} VIP</div>
                  </div>
                  <div class="ahub-m-bottom">
                    <div class="ahub-progress-bar small">
                      <div class="ahub-progress-fill" style="width:${pct}%"></div>
                    </div>
                    <span class="ahub-m-count">${Math.min(cur, w.target)}/${w.target}</span>
                    <button type="button" class="ahub-btn ${canClaim ? "primary" : "secondary"}" data-claim-weekly="${w.id}" ${!canClaim ? "disabled" : ""}>
                      ${claimed ? "ĐÃ NHẬN" : canClaim ? "NHẬN THƯỞNG" : "ĐANG LÀM"}
                    </button>
                  </div>
                </div>
              `;
            }).join("")}

            ${ACHIEVEMENTS_CATALOG.map((a) => {
              const cur = this.state.stats[a.statKey] || 0;
              const pct = Math.min(100, Math.round((cur / a.target) * 100));
              const claimed = !!this.state.claimedAchievements[a.id];
              const canClaim = cur >= a.target && !claimed;
              return `
                <div class="ahub-mission-card ${claimed ? "claimed" : canClaim ? "ready" : ""}">
                  <div class="ahub-m-top">
                    <div>
                      <div class="ahub-m-title">[THÀNH TỰU] ${a.title}</div>
                      <div class="ahub-m-desc">${a.desc}</div>
                    </div>
                    <div class="ahub-m-reward">+${a.rewardCoins.toLocaleString("vi-VN")} XU</div>
                  </div>
                  <div class="ahub-m-bottom">
                    <div class="ahub-progress-bar small">
                      <div class="ahub-progress-fill" style="width:${pct}%"></div>
                    </div>
                    <span class="ahub-m-count">${Math.min(cur, a.target)}/${a.target}</span>
                    <button type="button" class="ahub-btn ${canClaim ? "primary" : "secondary"}" data-claim-ach="${a.id}" ${!canClaim ? "disabled" : ""}>
                      ${claimed ? "ĐÃ NHẬN" : canClaim ? "NHẬN THƯỞNG" : "CHƯA ĐẠT"}
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }

  _bindMissionsEvents(container) {
    container.querySelectorAll("[data-claim-daily]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-claim-daily");
        const m = DAILY_MISSIONS_CATALOG.find((x) => x.id === id);
        if (!m || this.state.claimedDailyMissions[id]) return;
        this.state.claimedDailyMissions[id] = true;
        characterShopManager.addCoins(m.rewardCoins, `Nhiệm Vụ Ngày: ${m.title}`);
        this.addSeasonXp(m.rewardXp);
        this.saveState();
        this._renderActiveTabContent();
      });
    });

    container.querySelectorAll("[data-claim-weekly]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-claim-weekly");
        const w = WEEKLY_CHALLENGES_CATALOG.find((x) => x.id === id);
        if (!w || this.state.claimedWeeklyChallenges[id]) return;
        this.state.claimedWeeklyChallenges[id] = true;
        characterShopManager.addCoins(w.rewardCoins, `Thử Thách Tuần: ${w.title}`);
        characterShopManager.addVipCoins(w.rewardVip, `Thử Thách Tuần: ${w.title}`);
        this.addSeasonXp(w.rewardXp);
        this.saveState();
        this._renderActiveTabContent();
      });
    });

    container.querySelectorAll("[data-claim-ach]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-claim-ach");
        const a = ACHIEVEMENTS_CATALOG.find((x) => x.id === id);
        if (!a || this.state.claimedAchievements[id]) return;
        this.state.claimedAchievements[id] = true;
        characterShopManager.addCoins(a.rewardCoins, `Thành Tựu: ${a.title}`);
        this.addSeasonXp(120);
        this.saveState();
        this._renderActiveTabContent();
      });
    });
  }

  _renderSeasonPassTab() {
    const info = this.getSeasonLevelInfo();
    const isVipActive = characterShopManager.isVipActive?.() || (characterShopManager.state?.vipCoins || 0) >= 50000;
    const tiersHtml = [];
    for (let lv = 1; lv <= 30; lv++) {
      const unlocked = info.level >= lv;
      const claimed = !!this.state.claimedPassLevels[lv];
      const freeCoins = lv * 12000;
      const vipBonus = lv * 8000;
      tiersHtml.push(`
        <div class="ahub-pass-card ${unlocked ? "unlocked" : "locked"} ${claimed ? "claimed" : ""}">
          <div class="ahub-pass-lv">CẤP ${lv}</div>
          <div class="ahub-pass-rewards">
            <div class="ahub-pass-r-free">MIỄN PHÍ: <strong>+${freeCoins.toLocaleString("vi-VN")} XU</strong></div>
            <div class="ahub-pass-r-vip">ĐẶC QUYỀN VIP: <strong>+${vipBonus.toLocaleString("vi-VN")} VIP</strong></div>
          </div>
          <button type="button" class="ahub-btn ${unlocked && !claimed ? "primary" : "secondary"}" data-claim-pass="${lv}" ${!unlocked || claimed ? "disabled" : ""}>
            ${claimed ? "ĐÃ NHẬN" : unlocked ? "NHẬN QUÀ" : `CẦN ${lv * 500} XP`}
          </button>
        </div>
      `);
    }

    return `
      <div class="ahub-panel ahub-panel-highlight">
        <div class="ahub-panel-head">
          <span class="ahub-tag">HÀNH TRÌNH BATTLE PASS MÙA GIẢI PRO TOUR (30 CẤP ĐỘ)</span>
          <span class="ahub-badge-gold">CẤP HIỆN TẠI: ${info.level} / 30 (${info.totalXp} XP)</span>
        </div>
        <div class="ahub-progress-wrap">
          <div class="ahub-progress-bar">
            <div class="ahub-progress-fill" style="width:${info.progressPct}%"></div>
          </div>
          <div class="ahub-progress-meta">
            <span>XP Cấp hiện tại: ${info.currentLevelXp} / ${info.xpPerLevel} XP</span>
            <span>${isVipActive ? "ĐẶC QUYỀN VIP: ĐÃ KÍCH HOẠT (NHẬN CẢ 2 NHÁNH)" : "MẸO: KÍCH HOẠT VIP ĐỂ NHẬN THÊM XU VIP MỖI CẤP"}</span>
          </div>
        </div>
        <div class="ahub-pass-grid">
          ${tiersHtml.join("")}
        </div>
      </div>
    `;
  }

  _bindSeasonPassEvents(container) {
    container.querySelectorAll("[data-claim-pass]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lv = Number(btn.getAttribute("data-claim-pass"));
        if (!lv || this.state.claimedPassLevels[lv]) return;
        this.state.claimedPassLevels[lv] = true;
        const freeCoins = lv * 12000;
        const vipBonus = lv * 8000;
        characterShopManager.addCoins(freeCoins, `Battle Pass Cấp ${lv}`);
        characterShopManager.addVipCoins(vipBonus, `Battle Pass VIP Cấp ${lv}`);
        this.saveState();
        this._renderActiveTabContent();
      });
    });
  }

  _renderModesTab() {
    const curMode = this.state.specialGameMode || "standard";
    return `
      <div class="ahub-grid-2col">
        <!-- Left: Special Game Modes Switcher -->
        <div class="ahub-panel">
          <div class="ahub-panel-head">
            <span class="ahub-tag">CHẾ ĐỘ CHƠI ĐẶC BIỆT GÂY NGHIỆN</span>
            <span class="ahub-badge-accent">ĐANG CHỌN: ${curMode.toUpperCase()}</span>
          </div>
          <div class="ahub-mode-cards">
            <div class="ahub-mode-card ${curMode === "standard" ? "selected" : ""}">
              <div>
                <div class="ahub-m-title">CHẾ ĐỘ ĐẤU GIẢI TIÊU CHUẨN</div>
                <div class="ahub-m-desc">Thi đấu tính điểm Set/Game truyền thống kết hợp Vòng Tâm Điểm 3D và Nộ Khí Overdrive.</div>
              </div>
              <button type="button" class="ahub-btn ${curMode === "standard" ? "active" : "secondary"}" data-select-mode="standard">
                ${curMode === "standard" ? "ĐANG BẬT" : "CHỌN CHẾ ĐỘ"}
              </button>
            </div>

            <div class="ahub-mode-card ${curMode === "survival" ? "selected" : ""}">
              <div>
                <div class="ahub-m-title">CHẾ ĐỘ SINH TỒN CHUỖI BẤT BẠI (3 MẠNG)</div>
                <div class="ahub-m-desc">Mỗi điểm thắng liên tiếp cộng dồn Tiền Thưởng Sinh Tồn. Mất 3 điểm sẽ đặt lại chuỗi. Kỷ lục hiện tại: <strong>${this.state.stats.bestSurvivalStreak || 0} điểm thông</strong>.</div>
              </div>
              <button type="button" class="ahub-btn ${curMode === "survival" ? "active" : "secondary"}" data-select-mode="survival">
                ${curMode === "survival" ? "ĐANG BẬT" : "CHỌN CHẾ ĐỘ"}
              </button>
            </div>

            <div class="ahub-mode-card ${curMode === "marathon" ? "selected" : ""}">
              <div>
                <div class="ahub-m-title">THỬ THÁCH MARATHON ĐÔI CÔNG LIÊN HOÀN</div>
                <div class="ahub-m-desc">Giữ bóng không chạm đất lần 2 càng lâu càng tốt! Cứ mỗi mốc 10 chạm liên tiếp nổ hũ thưởng nóng trực tiếp trên sân. Kỷ lục: <strong>${this.state.stats.longestRally} chạm</strong>.</div>
              </div>
              <button type="button" class="ahub-btn ${curMode === "marathon" ? "active" : "secondary"}" data-select-mode="marathon">
                ${curMode === "marathon" ? "ĐANG BẬT" : "CHỌN CHẾ ĐỘ"}
              </button>
            </div>
          </div>
        </div>

        <!-- Right: 10-Floor Boss Rush Tower -->
        <div class="ahub-panel ahub-panel-highlight">
          <div class="ahub-panel-head">
            <span class="ahub-tag">THÁP ĐẤU TRÙM LIÊN HOÀN 10 TẦNG (BOSS RUSH TOWER)</span>
            <span class="ahub-badge-gold">TẦNG CAO NHẤT ĐÃ QUA: ${this.state.stats.bossTowerFloor || 0}/10</span>
          </div>
          <div class="ahub-mission-list">
            ${BOSS_TOWER_FLOORS.map((f) => {
              const unlocked = f.floor <= (this.state.stats.bossTowerFloor || 0) + 1;
              const cleared = f.floor <= (this.state.stats.bossTowerFloor || 0);
              return `
                <div class="ahub-mission-card ${cleared ? "claimed" : unlocked ? "ready" : ""}">
                  <div class="ahub-m-top">
                    <div>
                      <div class="ahub-m-title">${f.name}</div>
                      <div class="ahub-m-desc">${f.desc}</div>
                    </div>
                    <div class="ahub-m-reward">+${f.rewardCoins.toLocaleString("vi-VN")} XU • +${f.rewardVip.toLocaleString("vi-VN")} VIP</div>
                  </div>
                  <div class="ahub-m-bottom">
                    <span class="ahub-m-count">${cleared ? "ĐÃ VƯỢT QUA" : unlocked ? "SẴN SÀNG KHIÊU CHIẾN" : "KHÓA"}</span>
                    <button type="button" class="ahub-btn ${unlocked ? "primary" : "secondary"}" data-start-boss-floor="${f.floor}" ${!unlocked ? "disabled" : ""}>
                      ${cleared ? "ĐÁNH LẠI" : "VÀO KHIÊU CHIẾN"}
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }

  _bindModesEvents(container) {
    container.querySelectorAll("[data-select-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-select-mode") || "standard";
        this.state.specialGameMode = mode;
        this.survivalLives = 3;
        this.survivalStreak = 0;
        this.saveState();
        this._renderActiveTabContent();
      });
    });

    container.querySelectorAll("[data-start-boss-floor]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const floorNum = Number(btn.getAttribute("data-start-boss-floor"));
        const floorObj = BOSS_TOWER_FLOORS.find((f) => f.floor === floorNum);
        if (!floorObj || !this.engine) return;
        this.state.specialGameMode = "boss_tower";
        this.state.activeBossFloor = floorNum;
        this.saveState();
        this.closeHubModal();
        const titleModal = document.getElementById("title-modal");
        if (titleModal) titleModal.classList.add("hidden");
        this.engine.startNewMatch({
          difficulty: floorObj.diff,
          gamesToWin: floorObj.games,
        });
      });
    });
  }

  _renderRewardsTab() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const canClaimDailyLogin = this.state.loginClaimedDate !== todayStr;

    return `
      <div class="ahub-grid-2col">
        <!-- 7-Day Login Streak -->
        <div class="ahub-panel">
          <div class="ahub-panel-head">
            <span class="ahub-tag">ĐIỂM DANH CHUỖI 7 NGÀY LIÊN TIẾP</span>
            <span class="ahub-badge-gold">NGÀY HIỆN TẠI: NGÀY ${this.state.loginStreakDay}/7</span>
          </div>
          <div class="ahub-login-grid">
            ${LOGIN_STREAK_REWARDS.map((r) => {
              const isToday = r.day === this.state.loginStreakDay;
              const isPast = r.day < this.state.loginStreakDay || (isToday && !canClaimDailyLogin);
              return `
                <div class="ahub-login-card ${isToday ? "today" : ""} ${isPast ? "claimed" : ""}">
                  <div class="ahub-l-day">${r.label}</div>
                  <div class="ahub-l-coins">+${r.coins.toLocaleString("vi-VN")} XU</div>
                  <div class="ahub-l-vip">+${r.vip.toLocaleString("vi-VN")} VIP</div>
                  <div class="ahub-l-status">${isPast ? "ĐÃ NHẬN" : isToday ? "HÔM NAY" : "SẮP TỚI"}</div>
                </div>
              `;
            }).join("")}
          </div>
          <div class="ahub-mt">
            <button type="button" id="btn-claim-login-streak" class="ahub-btn primary full" ${!canClaimDailyLogin ? "disabled" : ""}>
              ${canClaimDailyLogin ? `NHẬN QUÀ ĐIỂM DANH NGÀY ${this.state.loginStreakDay}` : "BẠN ĐÃ NHẬN QUÀ ĐIỂM DANH HÔM NAY"}
            </button>
          </div>
        </div>

        <!-- Precision Energy Matrix Spin -->
        <div class="ahub-panel ahub-panel-highlight">
          <div class="ahub-panel-head">
            <span class="ahub-tag">MA TRẬN NĂNG LƯỢNG QUAY THƯỞNG MỖI NGÀY</span>
            <span class="ahub-badge-accent">LƯỢT MIỄN PHÍ HÔM NAY: ${this.state.freeSpinsLeft}</span>
          </div>
          <p class="ahub-desc">
            Kích hoạt Ma Trận Năng Lượng để nhận ngẫu nhiên các gói Quỹ Xu hoặc Quỹ VIP giá trị cao.
          </p>
          <div class="ahub-matrix-grid" id="ahub-matrix-grid">
            ${MATRIX_REWARDS.map(
              (item, idx) => `
              <div class="ahub-matrix-cell" data-matrix-idx="${idx}">
                <span class="ahub-mc-tier">Ô SỐ 0${idx + 1}</span>
                <strong class="ahub-mc-label">${item.label}</strong>
              </div>
            `,
            ).join("")}
          </div>
          <div id="ahub-matrix-result" class="ahub-matrix-result">NHẤN NÚT BÊN DƯỚI ĐỂ KÍCH HOẠT MA TRẬN</div>
          <div class="ahub-wager-row">
            <button type="button" id="btn-matrix-spin-free" class="ahub-btn primary" ${this.state.freeSpinsLeft <= 0 ? "disabled" : ""}>
              QUAY MIỄN PHÍ (${this.state.freeSpinsLeft} LƯỢT)
            </button>
            <button type="button" id="btn-matrix-spin-paid" class="ahub-btn secondary">
              QUAY BẰNG 5.000 XU
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _bindRewardsEvents(container) {
    container.querySelector("#btn-claim-login-streak")?.addEventListener("click", () => {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (this.state.loginClaimedDate === todayStr) return;
      const reward =
        LOGIN_STREAK_REWARDS.find((r) => r.day === this.state.loginStreakDay) ||
        LOGIN_STREAK_REWARDS[0];
      this.state.loginClaimedDate = todayStr;
      characterShopManager.addCoins(reward.coins, `Điểm Danh Ngày ${reward.day}`);
      characterShopManager.addVipCoins(reward.vip, `Điểm Danh VIP Ngày ${reward.day}`);
      this.state.loginStreakDay = (this.state.loginStreakDay % 7) + 1;
      this.addSeasonXp(100);
      this.saveState();
      this._renderActiveTabContent();
    });

    const executeMatrixSpin = (isFree) => {
      if (isFree) {
        if (this.state.freeSpinsLeft <= 0) return;
        this.state.freeSpinsLeft -= 1;
      } else {
        if ((characterShopManager.state.coins || 0) < 5000) {
          const resEl = container.querySelector("#ahub-matrix-result");
          if (resEl) resEl.textContent = "KHÔNG ĐỦ 5.000 XU ĐỂ QUAY THÊM!";
          return;
        }
        characterShopManager.state.coins -= 5000;
        characterShopManager.saveState();
        characterShopManager._notifyChange?.();
      }

      // Weighted random pick
      const totalWeight = MATRIX_REWARDS.reduce((acc, r) => acc + r.weight, 0);
      let roll = Math.random() * totalWeight;
      let chosenIdx = 0;
      for (let i = 0; i < MATRIX_REWARDS.length; i++) {
        roll -= MATRIX_REWARDS[i].weight;
        if (roll <= 0) {
          chosenIdx = i;
          break;
        }
      }
      const prize = MATRIX_REWARDS[chosenIdx];
      if (prize.type === "vip") {
        characterShopManager.addVipCoins(prize.amount, `Trúng Ma Trận: ${prize.label}`);
      } else {
        characterShopManager.addCoins(prize.amount, `Trúng Ma Trận: ${prize.label}`);
      }
      this.addSeasonXp(30);
      this.saveState();

      this._renderActiveTabContent();
      const updatedContainer = document.getElementById("ahub-body-content");
      const cells = updatedContainer?.querySelectorAll(".ahub-matrix-cell");
      if (cells && cells[chosenIdx]) {
        cells[chosenIdx].classList.add("won");
      }
      const resEl = updatedContainer?.querySelector("#ahub-matrix-result");
      if (resEl) {
        resEl.textContent = `CHÚC MỪNG! BẠN NHẬN ĐƯỢC: ${prize.label}`;
      }
    };

    container.querySelector("#btn-matrix-spin-free")?.addEventListener("click", () => executeMatrixSpin(true));
    container.querySelector("#btn-matrix-spin-paid")?.addEventListener("click", () => executeMatrixSpin(false));
  }

  _renderMutatorsTab() {
    return `
      <div class="ahub-grid-2col">
        <!-- Physics Mutators -->
        <div class="ahub-panel">
          <div class="ahub-panel-head">
            <span class="ahub-tag">ĐỘT BIẾN VẬT LÝ SÂN ĐẤU (CUSTOM PHYSICS MUTATORS)</span>
            <span class="ahub-badge-accent">TÙY CHỈNH TRỰC TIẾP</span>
          </div>
          <div class="ahub-mode-cards">
            ${PHYSICS_MUTATORS.map((m) => {
              const active = this.state.physicsMutator === m.id;
              return `
                <div class="ahub-mode-card ${active ? "selected" : ""}">
                  <div>
                    <div class="ahub-m-title">${m.name}</div>
                    <div class="ahub-m-desc">${m.desc}</div>
                  </div>
                  <button type="button" class="ahub-btn ${active ? "active" : "secondary"}" data-set-mutator="${m.id}">
                    ${active ? "ĐANG ÁP DỤNG" : "BẬT CHẾ ĐỘ"}
                  </button>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Weather & Partner Tactical Stance -->
        <div class="ahub-panel">
          <div class="ahub-panel-head">
            <span class="ahub-tag">THỜI TIẾT KHÍ ĐỘNG HỌC &amp; ĐỘI HÌNH BOT ĐỒNG ĐỘI</span>
            <span class="ahub-badge-gold">PHÍM TẮT ĐỔI ĐỘI HÌNH: [B]</span>
          </div>
          <div class="ahub-mode-cards">
            ${WEATHER_MODES.map((w) => {
              const active = this.state.weatherMode === w.id;
              return `
                <div class="ahub-mode-card ${active ? "selected" : ""}">
                  <div>
                    <div class="ahub-m-title">THỜI TIẾT: ${w.name}</div>
                    <div class="ahub-m-desc">${w.desc}</div>
                  </div>
                  <button type="button" class="ahub-btn ${active ? "active" : "secondary"}" data-set-weather="${w.id}">
                    ${active ? "ĐANG BẬT" : "CHỌN"}
                  </button>
                </div>
              `;
            }).join("")}
          </div>

          <div class="ahub-divider"></div>

          <div class="ahub-mode-cards">
            ${PARTNER_STANCES.map((s) => {
              const active = this.state.partnerStance === s.id;
              return `
                <div class="ahub-mode-card ${active ? "selected" : ""}">
                  <div>
                    <div class="ahub-m-title">CHIẾN THUẬT BOT: ${s.name}</div>
                    <div class="ahub-m-desc">${s.desc}</div>
                  </div>
                  <button type="button" class="ahub-btn ${active ? "active" : "secondary"}" data-set-stance="${s.id}">
                    ${active ? "ĐANG DÙNG" : "ÁP DỤNG"}
                  </button>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }

  _bindMutatorsEvents(container) {
    container.querySelectorAll("[data-set-mutator]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.state.physicsMutator = btn.getAttribute("data-set-mutator") || "standard";
        this.saveState();
        this._applyEnvironmentAndMutators();
      });
    });

    container.querySelectorAll("[data-set-weather]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.state.weatherMode = btn.getAttribute("data-set-weather") || "clear";
        this.saveState();
        this._applyEnvironmentAndMutators();
      });
    });

    container.querySelectorAll("[data-set-stance]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.state.partnerStance = btn.getAttribute("data-set-stance") || "interceptor";
        this.saveState();
        this._applyEnvironmentAndMutators();
      });
    });
  }

  _renderTelemetryTab() {
    const s = this.state.stats;
    const winRate =
      s.matchesPlayed > 0 ? Math.round((s.matchesWon / s.matchesPlayed) * 100) : 100;
    const sweetRate =
      s.totalStrokes > 0 ? Math.min(100, Math.round((s.sweetSpots / s.totalStrokes) * 100)) : 0;

    const dotsHtml = (this.state.shotLandings || [])
      .map((pt) => {
        // Map court x (-4.5..4.5) to 5%..95%, z (-12..0) to 5%..95%
        const leftPct = Math.min(95, Math.max(5, Math.round(((pt.x + 4.5) / 9.0) * 90 + 5)));
        const topPct = Math.min(95, Math.max(5, Math.round(((Math.abs(pt.z)) / 12.0) * 90 + 5)));
        return `<span class="ahub-heat-dot" style="left:${leftPct}%;top:${topPct}%" title="${pt.shotType} (${pt.x}, ${pt.z})"></span>`;
      })
      .join("");

    return `
      <div class="ahub-grid-2col">
        <!-- Left: Career Telemetry -->
        <div class="ahub-panel">
          <div class="ahub-panel-head">
            <span class="ahub-tag">HỒ SƠ THỐNG KÊ CHUYÊN SÂU (PRO TELEMETRY)</span>
            <span class="ahub-badge-accent">TỶ LỆ THẮNG: ${winRate}%</span>
          </div>
          <div class="ahub-stats-grid">
            <div class="ahub-stat-box">
              <span class="ahub-s-lbl">TỔNG SỐ TRẬN THẮNG</span>
              <strong class="ahub-s-val">${s.matchesWon} / ${s.matchesPlayed}</strong>
            </div>
            <div class="ahub-stat-box">
              <span class="ahub-s-lbl">TỐC ĐỘ BÓNG KỶ LỤC</span>
              <strong class="ahub-s-val">${s.fastestShotKmh} KM/H</strong>
            </div>
            <div class="ahub-stat-box">
              <span class="ahub-s-lbl">CHUỖI ĐÔI CÔNG DÀI NHẤT</span>
              <strong class="ahub-s-val">${s.longestRally} CHẠM</strong>
            </div>
            <div class="ahub-stat-box">
              <span class="ahub-s-lbl">ĐỘ CHUẨN ĐIỂM NGỌT</span>
              <strong class="ahub-s-val">${sweetRate}% (${s.sweetSpots})</strong>
            </div>
            <div class="ahub-stat-box">
              <span class="ahub-s-lbl">CÚ ĐẬP SMASH UY LỰC</span>
              <strong class="ahub-s-val">${s.totalSmashes} CÚ</strong>
            </div>
            <div class="ahub-stat-box">
              <span class="ahub-s-lbl">TRÚNG VÒNG TÂM ĐIỂM</span>
              <strong class="ahub-s-val">${s.bullseyeHits} LẦN</strong>
            </div>
            <div class="ahub-stat-box">
              <span class="ahub-s-lbl">KÍCH HOẠT OVERDRIVE</span>
              <strong class="ahub-s-val">${s.feverActivations} LẦN</strong>
            </div>
            <div class="ahub-stat-box">
              <span class="ahub-s-lbl">TẦNG THÁP BOSS CAO NHẤT</span>
              <strong class="ahub-s-val">TẦNG ${s.bossTowerFloor || 0}/10</strong>
            </div>
          </div>
        </div>

        <!-- Right: 2D Court Shot Landing Heatmap -->
        <div class="ahub-panel ahub-panel-highlight">
          <div class="ahub-panel-head">
            <span class="ahub-tag">BẢN ĐỒ NHIỆT ĐIỂM RƠI BÓNG TRÊN SÂN ĐỐI THỦ</span>
            <span class="ahub-badge-gold">${(this.state.shotLandings || []).length} ĐIỂM GẦN NHẤT</span>
          </div>
          <div class="ahub-heatmap-court">
            <div class="ahub-hc-line-service"></div>
            <div class="ahub-hc-line-center"></div>
            <div class="ahub-hc-net-label">LƯỚI SÂN ĐẤU (NET)</div>
            <div class="ahub-hc-base-label">VẠCH ĐÁY SÂN ĐỐI THỦ (BASELINE)</div>
            ${dotsHtml}
          </div>
        </div>
      </div>
    `;
  }

  _bindTelemetryEvents() {}
}

export const addictiveFeaturesManager = new AddictiveFeaturesManager();
