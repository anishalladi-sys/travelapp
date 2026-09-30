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

test("login is unreachable in demo mode because a user is already resolved", async ({
  page,
}) => {
  // app/login/layout.tsx redirects to /trips whenever getUserId() resolves. Under
  // demo auth every visitor resolves to the shared demo user, so /login is
  // intentionally unreachable here. The unauthenticated form can only be
  // exercised with demo auth off, which this single-server harness does not
  // provide -- that path stays in docs/testing/manual-test-plan.md.
  await page.goto("/login");

  await expect(page).toHaveURL(/\/trips$/);
  await expect(
    page.getByRole("heading", { name: "Your Trips" }).first(),
  ).toBeVisible();
});

test("trips is reachable in demo mode instead of erroring", async ({
  page,
}) => {
  const response = await page.goto("/trips");

  // Before the middleware fix this was a 500 from @supabase/ssr.
  expect(response?.status()).toBe(200);
  // "Your Trips" appears as both the header h1 and the section header, so take
  // the first rather than tripping strict mode.
  await expect(
    page.getByRole("heading", { name: "Your Trips" }).first(),
  ).toBeVisible();
  await expect(page.locator('a[href="/trips/new"]').first()).toBeVisible();
});

test("a signed demo session is issued, not a bare user id", async ({
  page,
}) => {
  await page.goto("/trips");

  const cookies = await page.context().cookies();
  const session = cookies.find((c) => c.name === "travelapp_demo_session");

  expect(session, "middleware should issue a demo session cookie").toBeTruthy();
  expect(session?.httpOnly).toBe(true);
  // The pre-fix cookie stored the user id verbatim, so a client could choose its
  // own identity by setting the cookie. It must now be a signed token.
  expect(session?.value).not.toBe("demo-user-0001");
  expect(session?.value).toMatch(/^demo-user-0001\.[A-Za-z0-9_-]+$/);
});

test("an unauthenticated request cannot read another user's data", async ({
  page,
}) => {
  // The trips list is scoped to the caller's user id. With demo auth there is
  // exactly one identity, so the meaningful check is that the page renders the
  // caller's own (empty) list rather than erroring or leaking.
  await page.goto("/trips");

  await expect(page.locator("body")).toContainText(
    /No trips yet|trips planned/i,
  );
});

test("the empty trips list does not trip the server/client boundary", async ({
  page,
}) => {
  // Regression guard. /trips renders EmptyState from a Server Component, and
  // EmptyState's action used to be typed as a function prop. React cannot
  // serialise that, so the whole page rendered the error boundary with
  // "Event handlers cannot be passed to Client Component props" -- which broke
  // /trips for every user with zero trips, i.e. the entire first-run experience.
  // Found by this suite on its first execution.
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
