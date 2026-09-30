import { test, expect } from "@playwright/test";
import { createTrip, deleteCurrentTrip, uniqueTitle } from "./helpers";

// Trips CRUD through the real UI: server actions, redirects, and the in-memory
// store. Every spec that creates a trip removes it again, because the store is
// shared across specs and a leftover would break the empty-state assertions in
// smoke.spec.ts.

test("creates a trip and lands on its detail page", async ({ page }) => {
  const title = uniqueTitle("E2E Create");

  await createTrip(page, title, "Tokyo, Kyoto");

  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText("Tokyo, Kyoto")).toBeVisible();

  await deleteCurrentTrip(page);
});

test("a created trip appears in the trips list", async ({ page }) => {
  const title = uniqueTitle("E2E Listed");

  await createTrip(page, title, "Lisbon");

  await page.getByRole("link", { name: "All Trips" }).click();
  await expect(page).toHaveURL(/\/trips$/);
  await expect(page.getByText(title)).toBeVisible();

  await page.getByText(title).click();
  await expect(page).toHaveURL(/\/trips\/[0-9a-f-]{36}$/);
  await deleteCurrentTrip(page);
});

test("deletes a trip and returns to the list without it", async ({ page }) => {
  const title = uniqueTitle("E2E Delete");

  await createTrip(page, title, "Osaka");
  await deleteCurrentTrip(page);

  await expect(page.getByText(title)).toHaveCount(0);
});

test("rejects invalid input at the server action boundary", async ({
  page,
}) => {
  await page.goto("/trips/new");

  // End date before start date fails the Zod schema, so the action returns an
  // error instead of creating anything.
  await page.getByLabel(/Title/).fill(uniqueTitle("E2E Invalid"));
  await page.getByLabel(/Destination/).fill("Nowhere");
  await page.getByLabel(/Start date/).fill("2026-08-10");
  await page.getByLabel(/End date/).fill("2026-08-01");
  await page.getByRole("button", { name: "Create Trip" }).click();

  // Two alert roles exist on the page (the form error and the toast region), so
  // scope rather than letting strict mode fail on the match.
  const alert = page.getByRole("alert").first();
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(/on or after start_date/i);
  await expect(page).toHaveURL(/\/trips\/new$/);
});
