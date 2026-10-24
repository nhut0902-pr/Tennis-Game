import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const ROOM_IDLE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function createRacketSlot(role: string) {
  return {
    role,
    seq: 0,
    lastSeenTs: 0,
    connected: false,
    orientation: { pitch: 0, roll: 0, yaw: 0, accelMag: 0, buttonB: false, connected: false },
    lastSwing: null as any,
    swingHistory: [] as any[],
    feedbackSeq: 0,
    lastFeedback: null as any
  };
}

function createRoomEntry(roomId: string, hostName = "Player 1", guestName = "Player 2", gamesToWin = 2) {
  const now = Date.now();
  return {
    roomId,
    hostName,
    guestName,
    gamesToWin,
    rackets: { p1: createRacketSlot("p1"), p2: createRacketSlot("p2") },
    stateSeq: 0,
    matchSnapshot: null as any,
    p1DesktopSeenTs: 0,
    p2DesktopSeenTs: 0,
    createdAtTs: now,
    lastActiveTs: now
  };
}

function serializeRacket(slot: any) {
  const now = Date.now();
  const lastSeenMs = slot.lastSeenTs > 0 ? Math.max(0, now - slot.lastSeenTs) : -1;
  const connected = slot.connected && lastSeenMs >= 0 && lastSeenMs < 12000;
  return {
    role: slot.role,
    connected,
    lastSeenMs,
    orientation: { ...slot.orientation, connected },
    lastSwing: slot.lastSwing ? { ...slot.lastSwing } : null,
    lastFeedback: slot.lastFeedback ? { ...slot.lastFeedback } : null,
    swingHistory: slot.swingHistory.slice(-15)
  };
}

function readJsonBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    const chunks: string[] = [];
    req.on("data", (chunk: any) => chunks.push(String(chunk)));
    req.on("end", () => {
      try {
        const raw = chunks.join("");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function sendJson(res: any, status: number, payload: any) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.end(body);
}

const assetCache = new Map<string, { contentType: string; body: Buffer }>();
const assetInFlight = new Map<string, Promise<{ contentType: string; body: Buffer }>>();

const mimeForPath = (p: string) =>
  p.endsWith(".glb")
    ? "model/gltf-binary"
    : p.endsWith(".mp3")
    ? "audio/mpeg"
    : p.endsWith(".png")
    ? "image/png"
    : p.endsWith(".wasm")
    ? "application/wasm"
    : p.endsWith(".json")
    ? "application/json; charset=utf-8"
    : "application/octet-stream";

function argonTennisRelayPlugin() {
  const rooms = new Map<string, ReturnType<typeof createRoomEntry>>();
  rooms.set("default", createRoomEntry("default"));

  // Auto-clean empty or inactive rooms after 5 minutes
  const purgeExpiredRelayRooms = () => {
    const now = Date.now();
    for (const [key, room] of rooms.entries()) {
      if (key === "default") continue;
      const p1Active = room.p1DesktopSeenTs > 0 && now - room.p1DesktopSeenTs < ROOM_IDLE_TTL_MS;
      const p2Active = room.p2DesktopSeenTs > 0 && now - room.p2DesktopSeenTs < ROOM_IDLE_TTL_MS;
      const recentTouch = now - (room.lastActiveTs || room.createdAtTs || 0) < ROOM_IDLE_TTL_MS;
      if (!p1Active && !p2Active && !recentTouch) {
        rooms.delete(key);
      }
    }
  };
  const cleanupInterval = setInterval(purgeExpiredRelayRooms, 60 * 1000);
  if (typeof (cleanupInterval as any).unref === "function") {
    (cleanupInterval as any).unref();
  }

  const tunnelUrl = "https://argon-tennis-sandbox-170440.uc.r.appspot.com";

  const getOrCreateRoom = (rawRoomId?: string) => {
    purgeExpiredRelayRooms();
    const cleaned = (rawRoomId || "default").replace(/[^A-Za-z0-9_-]/g, "").toUpperCase() || "default";
    const key = cleaned === "DEFAULT" ? "default" : cleaned;
    let room = rooms.get(key);
    if (!room) {
      room = createRoomEntry(key);
      rooms.set(key, room);
    }
    room.lastActiveTs = Date.now();
    return room;
  };

  const attachMiddlewares = (middlewares: any) => {
    middlewares.use(async (req: any, res: any, next: any) => {
      const reqUrl = req.url || "/";
      const parsed = new URL(reqUrl, "http://localhost:3000");
      const pathname = parsed.pathname;

      if (pathname === "/___rPc_sWiTcH___") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end("OK");
        return;
      }

      if (
        pathname.startsWith("/assets/models/") ||
        pathname.startsWith("/assets/audio/") ||
        pathname.startsWith("/assets/textures/") ||
        pathname.startsWith("/assets/mediapipe/")
      ) {
        const targetUrl = `https://www.gstatic.com/aistudio/starter-apps/tennis/${pathname.slice(8)}${parsed.search}`;
        try {
          let entry = assetCache.get(targetUrl);
          if (!entry) {
            let pending = assetInFlight.get(targetUrl);
            if (!pending) {
              pending = fetch(targetUrl)
                .then(async (resp) => {
                  if (!resp.ok) throw new Error(`Upstream ${resp.status}`);
                  const buf = Buffer.from(await resp.arrayBuffer());
                  const item = { contentType: mimeForPath(pathname), body: buf };
                  assetCache.set(targetUrl, item);
                  return item;
                })
                .finally(() => assetInFlight.delete(targetUrl));
              assetInFlight.set(targetUrl, pending);
            }
            entry = await pending;
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", entry.contentType);
          res.setHeader("Content-Length", entry.body.length);
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Cache-Control", "public, max-age=86400");
          res.end(entry.body);
        } catch {
          res.statusCode = 502;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end("Upstream asset fetch failed");
        }
        return;
      }

      if (!pathname.startsWith("/api/")) {
        next();
        return;
      }

      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.end();
        return;
      }

      const roomParam = parsed.searchParams.get("room") || "default";
      const roleRaw = (parsed.searchParams.get("role") || "p1").toLowerCase();
      const role = roleRaw === "p2" || roleRaw === "2" || roleRaw === "opponent" ? "p2" : "p1";

      if (req.method === "GET" && pathname === "/api/racket/state") {
        const room = getOrCreateRoom(roomParam);
        const slot = room.rackets[role];
        sendJson(res, 200, { ...serializeRacket(slot), roomId: room.roomId, tunnelUrl });
        return;
      }

      if (req.method === "GET" && pathname === "/api/tunnel/status") {
        const room = getOrCreateRoom(roomParam);
        const roomQuery = room.roomId !== "default" ? `room=${room.roomId}&` : "";
        sendJson(res, 200, {
          ok: true,
          active: true,
          tunnelUrl,
          companionUrl: `${tunnelUrl}/companion.html?${roomQuery}role=${role}`,
          joinUrl: `${tunnelUrl}/join.html?room=${room.roomId}&role=${role}`
        });
        return;
      }

      if (req.method === "GET" && pathname === "/api/match/state") {
        const room = getOrCreateRoom(roomParam);
        const touch = parsed.searchParams.get("touch");
        if (touch === "p1" || touch === "p2") {
          if (touch === "p2") room.p2DesktopSeenTs = Date.now();
          else room.p1DesktopSeenTs = Date.now();
        }
        const now = Date.now();
        const p1 = serializeRacket(room.rackets.p1);
        const p2 = serializeRacket(room.rackets.p2);
        const p1Online = room.p1DesktopSeenTs > 0 && now - room.p1DesktopSeenTs < 8000;
        const p2Online = room.p2DesktopSeenTs > 0 && now - room.p2DesktopSeenTs < 8000;
        sendJson(res, 200, {
          ok: true,
          roomId: room.roomId,
          hostName: room.hostName,
          guestName: room.guestName,
          gamesToWin: room.gamesToWin,
          p1Online,
          p2Online,
          p1DesktopOnline: p1Online,
          p2DesktopOnline: p2Online,
          p1PhoneConnected: p1.connected,
          p2PhoneConnected: p2.connected,
          p1,
          p2,
          rackets: { p1, p2 },
          snapshotSeq: room.stateSeq,
          snapshot: room.matchSnapshot,
          tunnelUrl
        });
        return;
      }

      if (req.method === "POST") {
        const body = await readJsonBody(req);
        const targetRoom = String(body.room || roomParam || "default");
        const targetRoleRaw = String(body.role || role || "p1").toLowerCase();
        const targetRole = targetRoleRaw === "p2" || targetRoleRaw === "2" || targetRoleRaw === "opponent" ? "p2" : "p1";
        const room = getOrCreateRoom(targetRoom);
        const slot = room.rackets[targetRole];

        if (pathname === "/api/racket/swing") {
          const now = Date.now();
          slot.seq += 1;
          slot.lastSeenTs = now;
          slot.connected = true;
          const swing = {
            seq: slot.seq,
            role: slot.role,
            type: String(body.type || "swing").toLowerCase() === "toss" ? "toss" : "swing",
            shotType: String(body.shotType || "topspin").toLowerCase(),
            speed: Number(body.speed ?? 1),
            angleX: Number(body.angleX ?? body.dirX ?? 0),
            dirX: Number(body.angleX ?? body.dirX ?? 0),
            dirY: Number(body.dirY ?? 0),
            pitch: Number(body.pitch ?? slot.orientation.pitch ?? 0),
            roll: Number(body.roll ?? slot.orientation.roll ?? 0),
            yaw: Number(body.yaw ?? slot.orientation.yaw ?? 0),
            timestamp: Number(body.timestamp ?? now),
            serverTimeMs: now,
            source: String(body.source || "phone")
          };
          slot.lastSwing = swing;
          slot.swingHistory.push(swing);
          if (slot.swingHistory.length > 50) slot.swingHistory.shift();
          sendJson(res, 200, { ok: true, roomId: room.roomId, role: slot.role, swing });
          return;
        }

        if (pathname === "/api/racket/telemetry") {
          slot.lastSeenTs = Date.now();
          slot.connected = Boolean(body.connected ?? true);
          slot.orientation = {
            pitch: Number(body.pitch ?? slot.orientation.pitch ?? 0),
            roll: Number(body.roll ?? slot.orientation.roll ?? 0),
            yaw: Number(body.yaw ?? slot.orientation.yaw ?? 0),
            accelMag: Number(body.accelMag ?? 0),
            buttonB: Boolean(body.buttonB ?? false),
            connected: slot.connected
          };
          sendJson(res, 200, { ok: true, roomId: room.roomId, role: slot.role, orientation: slot.orientation, lastFeedback: slot.lastFeedback });
          return;
        }

        if (pathname === "/api/racket/feedback") {
          slot.feedbackSeq += 1;
          slot.lastFeedback = {
            seq: slot.feedbackSeq,
            role: slot.role,
            kind: String(body.kind || "hit"),
            grade: String(body.grade || "PERFECT"),
            shotType: String(body.shotType || "TOPSPIN"),
            speedKmh: Number(body.speedKmh ?? 160),
            intensity: Number(body.intensity ?? 1),
            serverTimeMs: Date.now()
          };
          sendJson(res, 200, { ok: true, roomId: room.roomId, feedback: slot.lastFeedback });
          return;
        }

        if (pathname === "/api/match/sync") {
          room.stateSeq += 1;
          room.p1DesktopSeenTs = Date.now();
          room.lastActiveTs = Date.now();
          const snap = body.snapshot && typeof body.snapshot === "object" ? body.snapshot : body;
          room.matchSnapshot = { ...snap, seq: room.stateSeq, serverTimeMs: Date.now() };
          sendJson(res, 200, { ok: true, roomId: room.roomId, seq: room.stateSeq, p2Racket: serializeRacket(room.rackets.p2) });
          return;
        }

        if (pathname === "/api/match/create") {
          purgeExpiredRelayRooms();
          const code = "AT-" + Math.random().toString(36).substring(2, 6).toUpperCase();
          const created = createRoomEntry(code, String(body.hostName || "Ammaar"), String(body.guestName || "Challenger"), Number(body.gamesToWin || 2));
          rooms.set(code, created);
          sendJson(res, 200, {
            ok: true,
            roomId: code,
            hostDesktopUrl: `${tunnelUrl}/?room=${code}&role=p1`,
            guestDesktopUrl: `${tunnelUrl}/?room=${code}&role=p2`,
            p1PhoneUrl: `${tunnelUrl}/companion.html?room=${code}&role=p1`,
            p2PhoneUrl: `${tunnelUrl}/companion.html?room=${code}&role=p2`,
            guestJoinHubUrl: `${tunnelUrl}/join.html?room=${code}&role=p2`
          });
          return;
        }
      }

      next();
    });
  };

  return {
    name: "argon-tennis-relay",
    configureServer(server: any) {
      attachMiddlewares(server.middlewares);
    },
    configurePreviewServer(server: any) {
      attachMiddlewares(server.middlewares);
    }
  };
}

export default defineConfig(({ mode }) => {
  loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      hmr: process.env.DISABLE_HMR !== "true"
    },
    plugins: [
      react(),
      argonTennisRelayPlugin(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: {
          enabled: true,
          type: "module"
        },
        includeAssets: [
          "icon.svg",
          "apple-touch-icon.png",
          "pwa-192x192.png",
          "pwa-512x512.png",
          "pwa-maskable-512x512.png"
        ],
        manifest: {
          id: "/",
          name: "Argon Tennis 3D - Mobile & PC",
          short_name: "ArgonTennis",
          description: "Game quần vợt 3D hỗ trợ Chơi Offline với Máy (AI) và Đấu 1v1 Online trên Điện thoại & Máy tính.",
          theme_color: "#0f172a",
          background_color: "#0f172a",
          display: "standalone",
          orientation: "any",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "pwa-maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable"
            }
          ]
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,glb,mp3,wasm,json}"],
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
          navigateFallback: "index.html",
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /\/assets\/(models|audio|textures|mediapipe)\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "argon-3d-assets-cache",
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/www\.gstatic\.com\/aistudio\/starter-apps\/tennis\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "gstatic-tennis-assets-cache",
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "jsdelivr-mediapipe-cache",
                expiration: {
                  maxEntries: 40,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 15,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "gstatic-fonts-cache",
                expiration: {
                  maxEntries: 15,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    define: {},
    resolve: {
      alias: {
        "../assets/vendor/GLTFLoader.js": "three/examples/jsm/loaders/GLTFLoader.js",
        "@": path.resolve(".")
      }
    }
  };
});
