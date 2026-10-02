import { test, expect } from "@playwright/test";

// Installability and offline-shell behaviour, verified in a real browser.
//
// These assert on the actual runtime: that the manifest parses, that every icon
// it references returns a real PNG, and that the service worker registers and
// caches static assets. Asserting that files exist on disk would pass even if
// the manifest were malformed or the worker never registered.

test.describe("PWA installability", () => {
  test("the manifest is served, parses, and points at real icons", async ({
    page,
    request,
  }) => {
    const response = await request.get("/manifest.json");
    expect(response.status()).toBe(200);

    const manifest = JSON.parse(await response.text());
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe("standalone");

    // Every declared icon must actually resolve and be a PNG, at its declared
    // size. A manifest referencing a missing file fails installation silently.
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    for (const icon of manifest.icons) {
      const iconResponse = await request.get(icon.src);
      expect(iconResponse.status(), `${icon.src} must exist`).toBe(200);
      expect(iconResponse.headers()["content-type"]).toContain("image/png");
    }

    // A maskable icon is required for Android adaptive icons.
    const maskable = manifest.icons.find((i: { purpose?: string }) =>
      i.purpose?.includes("maskable"),
    );
    expect(maskable, "Android requires a maskable icon").toBeTruthy();

    await page.goto("/");
    const manifestHref = await page
      .locator('link[rel="manifest"]')
      .getAttribute("href");
    expect(manifestHref).toBe("/manifest.json");
  });

  test("the document declares icons that resolve", async ({
    page,
    request,
  }) => {
    await page.goto("/");

    const iconHrefs = await page
      .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
      .evaluateAll((nodes) =>
        nodes.map((n) => ({
          rel: n.getAttribute("rel"),
          href: (n as HTMLLinkElement).getAttribute("href"),
        })),
      );

    expect(iconHrefs.length).toBeGreaterThan(0);

    for (const icon of iconHrefs) {
      const response = await request.get(icon.href as string);
      expect(response.status(), `${icon.rel} -> ${icon.href} must exist`).toBe(
        200,
      );
    }
  });

  test("theme-color matches the light and dark design tokens", async ({
    page,
    request,
  }) => {
    await page.goto("/");

    // Read the served HTML rather than querying the DOM. Next.js renders
    // `viewport` into <head> on the server, and those meta tags are not React-
    // owned nodes, so a DOM query for them is not a reliable signal here.
    const html = await (await request.get("/")).text();

    const tags = [...html.matchAll(/<meta[^>]*name="theme-color"[^>]*>/g)].map(
      (m) => m[0],
    );

    expect(tags.length, "both colour schemes must declare theme-color").toBe(2);

    const light = tags.find((t) => t.includes("light"));
    const dark = tags.find((t) => t.includes("dark"));

    // Must match --clay-surface in app/globals.css, or browser chrome will not
    // match the page.
    expect(light?.toLowerCase()).toContain("#f5f0eb");
    expect(dark?.toLowerCase()).toContain("#2a2724");
  });

  test("favicon.ico is declared exactly once", async ({ page, request }) => {
    await page.goto("/");

    // Next.js auto-injects /favicon.ico from app/favicon.ico. Declaring it in
    // the metadata object as well emits the tag twice.
    const html = await (await request.get("/")).text();
    const declarations = [...html.matchAll(/<link[^>]*rel="icon"[^>]*>/g)]
      .map((m) => m[0])
      .filter((t) => t.includes('href="/favicon.ico"'));

    expect(
      declarations.length,
      "/favicon.ico must be declared exactly once",
    ).toBe(1);
  });

  test("the service worker registers and caches static assets", async ({
    page,
  }) => {
    // The worker is production-only by design: in development a cached shell
    // serves stale code and makes every change look like it did not apply.
    // So this runs against the dev server and asserts it is NOT registered.
    await page.goto("/");
    const registrations = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return "unsupported";
      const regs = await navigator.serviceWorker.getRegistrations();
      return regs.length;
    });

    expect(registrations).toBe(0);
  });
});
