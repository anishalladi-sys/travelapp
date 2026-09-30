import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3000);
const baseURL = `http://localhost:${PORT}`;

// Specs run against a dev server in demo mode with Supabase deliberately
// unconfigured. That is the only combination that is fully deterministic: the
// data layer falls back to its in-memory store, auth resolves to the shared demo
// user, and nothing depends on a real Supabase project or on the developer's
// shell. The env below is what makes that true regardless of what `.env.local`
// or the surrounding environment provides.
export default defineConfig({
  testDir: "./e2e",

  // The in-memory backend is a single process-global store shared by every
  // browser context, so concurrent specs would observe each other's writes.
  // Specs are additionally written to be order-independent.
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],

  // Generous by design. The app runs a dev server, so a cold route pays
  // on-demand compilation; measured cold first-hit times on a slow Windows
  // machine ran 15-35s per page. The Playwright defaults (30s test / 5s expect)
  // are not enough, and an expect timeout that is too tight produces failures
  // that look like application bugs.
  timeout: 180_000,
  expect: { timeout: 60_000 },
  globalTimeout: process.env.CI ? 30 * 60_000 : 0,

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Mobile projects run the smoke suite only. The CRUD specs drive real
    // server actions and would triple the runtime of a slow dev server without
    // adding coverage the desktop run does not already give.
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testIgnore: /\/(crud|itinerary)\.spec\.ts$/,
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
      testIgnore: /\/(crud|itinerary)\.spec\.ts$/,
    },
  ],

  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      NEXT_PUBLIC_AUTH_MODE: "demo",
      // Blank rather than absent: the data layer and middleware both treat an
      // empty string as unconfigured, so this overrides a developer's shell and
      // `.env.local` without needing to mutate them.
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    },
  },
});
