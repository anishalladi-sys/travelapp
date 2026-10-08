import { test, expect } from "@playwright/test";
import { createTrip, deleteCurrentTrip } from "./helpers";

// Smoke coverage for the routes that must render at all. Each of these is a
// regression guard for something that was previously broken:
//   - the app 500'd on every request when Supabase was unconfigured
//   - demo auth had no production guard and an unsigned, client-settable cookie
//   - there were no specs at all, so playwright.config.ts pointed at nothing

test("landing page renders", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toContainText(/travel/i);
});

test("login page renders with Clerk", async ({ page }) => {
  const response = await page.goto("/login");

  expect(response?.status()).toBe(200);
  // Clerk sign-in form should be visible
  await expect(page.locator("text=Sign in")).toBeVisible();
});

test("signup page renders with Clerk", async ({ page }) => {
  const response = await page.goto("/signup");

  expect(response?.status()).toBe(200);
  await expect(page.locator("text=Sign up")).toBeVisible();
});

test("trips page is accessible with Clerk auth", async ({ page }) => {
  const response = await page.goto("/trips");

  // Should be accessible (either shows trips or redirects to login)
  expect(response?.status()).toBe(200);

  // Either shows "Your Trips" (if authenticated) or redirects to login
  // With Clerk in demo mode, user should be able to access trips
  await expect(page.locator("body")).toBeVisible();
});

test("the empty trips list does not trip the server/client boundary", async ({
  page,
}) => {
  // Regression guard. /trips renders EmptyState from a Server Component, and
  // EmptyState's action used to be typed as a function prop. React cannot
  // serialise that, so the whole page rendered the error boundary with
  // "Event handlers cannot be passed to Client Component props" -- which broke
  // /trips for every user with zero trips, i.e. the entire first-run experience.
  //
  // The EmptyState branch only renders when the shared in-memory store is empty,
  // so this spec depends on the creating specs cleaning up after themselves
  // (see e2e/helpers.ts). The boundary assertion below is order-independent
  // either way.
  await page.goto("/trips");

  const body = page.locator("body");
  await expect(body).not.toContainText("Event handlers cannot be passed");
  await expect(body).not.toContainText("Something went wrong");
  await expect(page.getByText("No trips yet")).toBeVisible();
  // The empty state still offers a working way forward.
  await expect(page.locator('a[href="/trips/new"]').first()).toBeVisible();
});

test("the empty itinerary state does not trip the server/client boundary", async ({
  page,
}) => {
  // Same failure mode as the trips list, on the trip detail page.
  const title = `E2E Empty Itinerary ${Date.now()}`;

  await createTrip(page, title, "Reykjavik");

  const body = page.locator("body");
  await expect(body).not.toContainText("Event handlers cannot be passed");
  await expect(page.getByText("No itinerary items yet")).toBeVisible();
  await expect(page.getByRole("link", { name: "Add Item" })).toBeVisible();

  // Remove it again: the store is shared across specs and projects, and a
  // leftover would break the empty-trips assertion for every later run.
  await deleteCurrentTrip(page);
});

test("design system page renders", async ({ page }) => {
  const response = await page.goto("/design");

  expect(response?.status()).toBe(200);
  await expect(page.locator("main, body").first()).toBeVisible();
});

test("privacy page renders", async ({ page }) => {
  const response = await page.goto("/privacy");

  expect(response?.status()).toBe(200);
  await expect(page.locator("main, body").first()).toBeVisible();
});

test("terms page renders", async ({ page }) => {
  const response = await page.goto("/terms");

  expect(response?.status()).toBe(200);
  await expect(page.locator("main, body").first()).toBeVisible();
});

test("robots.txt is served", async ({ page }) => {
  const response = await page.goto("/robots.txt");

  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toContainText("User-agent");
});

test("sitemap.xml is served", async ({ page }) => {
  const response = await page.goto("/sitemap.xml");

  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toContainText("urlset");
});
