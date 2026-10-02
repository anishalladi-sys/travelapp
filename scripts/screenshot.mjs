import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";

// Captures reference screenshots of every page in both themes, for review.
// Not part of the test suite -- run with: node scripts/screenshot.mjs
const OUT = "C:/Users/Anish/AppData/Local/Temp/opencode/shots";
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { path: "/", name: "home" },
  { path: "/trips", name: "trips-empty" },
  { path: "/trips/new", name: "trip-new" },
  { path: "/login", name: "login" },
  { path: "/design", name: "design" },
];

const browser = await chromium.launch();

for (const device of [
  { label: "desktop", options: devices["Desktop Chrome"] },
  { label: "mobile", options: devices["Pixel 5"] },
]) {
  for (const scheme of ["light", "dark"]) {
    for (const page of PAGES) {
      const context = await browser.newContext({
        ...device.options,
        colorScheme: scheme,
      });
      const tab = await context.newPage();
      try {
        await tab.goto(`http://localhost:3000${page.path}`, {
          waitUntil: "domcontentloaded",
          timeout: 180000,
        });
        // Let fonts, motion and the demo cookie settle.
        await tab.waitForTimeout(2500);
        await tab.screenshot({
          path: `${OUT}/${page.name}--${device.label}--${scheme}.png`,
          fullPage: false,
        });
        console.log(`ok   ${page.name} ${device.label} ${scheme}`);
      } catch (error) {
        console.log(`FAIL ${page.name} ${device.label} ${scheme}: ${error.message}`);
      } finally {
        await context.close();
      }
    }
  }
}

// One seeded trip so the trips list is not only ever seen empty.
{
  const context = await browser.newContext({ ...devices["Desktop Chrome"] });
  const tab = await context.newPage();
  await tab.goto("http://localhost:3000/trips/new", { waitUntil: "domcontentloaded", timeout: 180000 });
  await tab.waitForTimeout(2000);
  await tab.getByLabel(/Title/).fill("Japan 2026");
  await tab.getByLabel(/Destination/).fill("Tokyo, Kyoto");
  await tab.getByLabel(/Start date/).fill("2026-04-01");
  await tab.getByLabel(/End date/).fill("2026-04-12");
  await tab.getByRole("button", { name: "Create Trip" }).click();
  await tab.waitForURL(/\/trips\/[0-9a-f-]{36}$/, { timeout: 180000 });
  await tab.waitForTimeout(2500);
  await tab.screenshot({ path: `${OUT}/trip-detail--desktop--light.png` });

  await tab.getByRole("link", { name: "All Trips" }).click();
  await tab.waitForURL(/\/trips$/, { timeout: 180000 });
  await tab.waitForTimeout(2500);
  await tab.screenshot({ path: `${OUT}/trips-populated--desktop--light.png` });
  console.log("ok   seeded trip: detail + populated list");
  await context.close();
}

await browser.close();
console.log(`\nwrote screenshots to ${OUT}`);
