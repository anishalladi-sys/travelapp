import { ServiceWorkerRegister } from "./sw-register";

// Registers /sw.js in production only.
//
// This is deliberately a hand-rolled registration rather than next-pwa: that
// package was removed in the dependency work because it was never imported yet
// still dragged in workbox-build, rollup and serialize-javascript. The worker
// itself is ~40 lines of cache-first-for-static-assets, and caching
// authenticated HTML would risk serving one user's trips to another, so it
// caches nothing but build output and icons.
//
// In development the worker is not registered at all: a cached shell will
// serve stale code and make every change look like it did not apply.
export function ServiceWorker() {
  return <ServiceWorkerRegister />;
}
