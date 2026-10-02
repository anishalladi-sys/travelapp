/* Travel App service worker.
 *
 * Scope is deliberately narrow. ADR 0007 asked for offline support because of
 * flights and remote areas, but the app stores all data in Supabase behind auth
 * and every query runs as the calling user under RLS. Caching authenticated HTML
 * or API responses would risk serving one person's trips to another on a shared
 * device, which is a worse failure than being offline. So:
 *
 *   - static assets (build output, icons, fonts): cache-first. These are
 *     content-hashed or versioned, so a cached copy can never be stale.
 *   - navigations and anything else: network-only. No HTML is ever cached.
 *
 * If genuine offline trip data is wanted later, it needs an encrypted,
 * per-user store and an explicit decision about what happens on logout. That is
 * a feature, not a default.
 */

const VERSION = "v1";
const STATIC_CACHE = `travelapp-static-${VERSION}`;

const PRECACHE = [
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache navigations or data. See the note above.
  if (request.mode === "navigate" || request.destination === "document") return;

  const isImmutableAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    /\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|json)$/.test(url.pathname);

  if (!isImmutableAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached ?? Response.error());
    }),
  );
});
