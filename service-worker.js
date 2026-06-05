const SHELL_CACHE = "jianbihua-shell-v11";
const IMAGE_CACHE = "jianbihua-images-v1";
const LEGACY_CACHES = [
  "name-number-lookup-v1",
  "name-number-lookup-v2",
  "name-number-lookup-v3",
  "name-number-lookup-v4",
  "name-number-lookup-v5"
];

const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./assets/css/styles.css",
  "./assets/js/main.js",
  "./manifest.webmanifest",
  "./version.json",
  "./data/catalog-data.json",
  "./data/app-data.json",
  "./data/offline-assets.json",
  "./assets/icons/icon-192-v2.png",
  "./assets/icons/icon-512-v2.png",
  "./assets/icons/apple-touch-icon-v2.png",
  "./assets/icons/icon.svg",
  "./assets/easter-eggs/yang-flower-card.jpg",
  "./assets/easter-eggs/yang-notebook-face.jpg",
  "./assets/easter-eggs/yang-blackboard.jpg",
  "./assets/easter-eggs/xiang-little-friends.jpg"
];

const IMAGE_EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png", ".gif", ".avif"];
const DATA_FILES = ["/version.json", "/data/app-data.json", "/data/offline-assets.json", "/data/catalog-data.json"];
const SHELL_EXTENSIONS = [".html", ".css", ".js", ".webmanifest"];

async function cacheShell() {
  const cache = await caches.open(SHELL_CACHE);
  await cache.addAll(SHELL_ASSETS);
}

self.addEventListener("install", event => {
  event.waitUntil(cacheShell());
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== SHELL_CACHE && key !== IMAGE_CACHE)
          .filter(key => LEGACY_CACHES.includes(key) || key.startsWith("jianbihua-"))
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isImageRequest(url) {
  const path = url.pathname.toLowerCase();
  return IMAGE_EXTENSIONS.some(extension => path.endsWith(extension));
}

function isDataFile(url) {
  return DATA_FILES.some(path => url.pathname.endsWith(path));
}

function isShellFile(url) {
  if (url.pathname === "/" || url.pathname.endsWith("/index.html")) return true;
  const path = url.pathname.toLowerCase();
  return SHELL_EXTENSIONS.some(extension => path.endsWith(extension));
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isImageRequest(url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  if (isDataFile(url)) {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }

  if (isShellFile(url)) {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }

  event.respondWith(cacheFirst(request, SHELL_CACHE));
});

self.addEventListener("message", event => {
  if (!event.data || event.data.type !== "CLEAR_IMAGE_CACHE") return;
  event.waitUntil(caches.delete(IMAGE_CACHE));
});
