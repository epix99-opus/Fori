const CACHE_VERSION = "fori-prototype-v31";
const READ_CACHE = `${CACHE_VERSION}-read`;
const CORE_ROUTES = [
  "/",
  "/home",
  "/explore/search",
  "/explore/map",
  "/explore/dict",
  "/price",
  "/workspace/agent",
  "/profile/transactions",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(READ_CACHE).then((cache) => cache.addAll(CORE_ROUTES)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("fori-prototype-") && !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method === "GET") {
    event.respondWith(readThroughCache(request));
    return;
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    event.respondWith(queueWriteWhenOffline(request));
  }
});

async function readThroughCache(request) {
  const cache = await caches.open(READ_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok && isCacheable(request)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (_error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return cache.match("/home") || new Response("Fori 离线只读缓存暂不可用", { status: 503 });
  }
}

function isCacheable(request) {
  const url = new URL(request.url);
  return url.origin === self.location.origin && !url.pathname.startsWith("/_next/webpack");
}

async function queueWriteWhenOffline(request) {
  try {
    return await fetch(request.clone());
  } catch (_error) {
    const body = await request.clone().text().catch(() => "");
    await saveOfflineQueue({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      url: request.url,
      method: request.method,
      body,
      createdAt: new Date().toISOString(),
    });
    return new Response(JSON.stringify({ queued: true, message: "已写入离线队列，恢复网络后同步" }), {
      status: 202,
      headers: { "content-type": "application/json" },
    });
  }
}

function saveOfflineQueue(record) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("fori-offline", 1);
    open.onupgradeneeded = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains("drafts")) db.createObjectStore("drafts", { keyPath: "id" });
      if (!db.objectStoreNames.contains("offlineQueue")) db.createObjectStore("offlineQueue", { keyPath: "id" });
    };
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction("offlineQueue", "readwrite");
      tx.objectStore("offlineQueue").put(record);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    };
  });
}
