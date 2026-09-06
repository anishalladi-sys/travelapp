# ADR 0007 — PWA with Workbox (next-pwa)

Date: 2026-09-05
Status: Accepted

## Context
Travel app needs offline support (flights, remote areas) and installability. Requirements:
- Cache static assets for offline
- Cache API responses for offline viewing
- Installable on mobile/desktop
- Background sync for mutations (future)
- Lighthouse PWA score > 90

## Decision
Use **next-pwa** (Workbox) for service worker generation with **next.js App Router** compatible config.

## Alternatives Considered
- **Custom Workbox config** — rejected: next-pwa handles Next.js specifics
- **Vite PWA / Vite only** — rejected: Next.js app
- **No PWA** — rejected: core travel use case needs offline
- **Service Worker manual** — rejected: error-prone, hard to maintain

## Consequences
- Positive: zero-config Workbox, automatic precaching, runtime caching strategies, install prompt
- Negative: next-pwa adds build complexity, App Router support evolving, cache invalidation tricky
- Migration path: can eject to custom SW if needed

## Verification
- `public/manifest.json` with icons, theme_color, display: standalone
- Service worker registers in production
- Offline fallback page works
- Lighthouse PWA audit > 90
- Install prompt appears on mobile