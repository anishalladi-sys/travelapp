import { test, expect } from "@playwright/test";
import { createTrip, deleteCurrentTrip, uniqueTitle } from "./helpers";

// Itinerary items on a trip detail page. Exercises createItineraryAction, which
// returns { ok } rather than redirecting, so the page stays put and revalidates.
// Every spec deletes its trip afterwards; see the note in helpers.ts.

test("a new trip shows the empty itinerary state", async ({ page }) => {
  await createTrip(page, uniqueTitle("E2E Itinerary Empty"), "Kyoto");

  await expect(page.getByText("No itinerary items yet")).toBeVisible();

  await deleteCurrentTrip(page);
});

test("adds an itinerary item and shows it grouped by date", async ({
  page,
}) => {
  await createTrip(page, uniqueTitle("E2E Itinerary Add"), "Kyoto");

  await page.getByLabel(/Date/).fill("2027-01-10");
  await page.getByLabel(/Time/).fill("09:30");
  await page.getByLabel(/Activity/).fill("Visit Fushimi Inari");
  await page.getByLabel(/Location/).fill("Fushimi, Kyoto");
  await page.getByLabel(/Notes/).fill("Go early to beat the crowds");
  await page.getByRole("button", { name: "Add to itinerary" }).click();

  // createItineraryAction does not redirect, so assert the item appears in place.
  await expect(page.getByText("Visit Fushimi Inari")).toBeVisible();
  await expect(page.getByRole("heading", { name: "2027-01-10" })).toBeVisible();
  await expect(page.getByText("Fushimi, Kyoto")).toBeVisible();

  await deleteCurrentTrip(page);
});

test("a second item groups under its own date", async ({ page }) => {
  await createTrip(page, uniqueTitle("E2E Itinerary Two Days"), "Kyoto");

  await page.getByLabel(/Date/).fill("2027-01-10");
  await page.getByLabel(/Activity/).fill("Check into hotel");
  await page.getByRole("button", { name: "Add to itinerary" }).click();
  await expect(page.getByText("Check into hotel")).toBeVisible();

  await page.getByLabel(/Date/).fill("2027-01-11");
  await page.getByLabel(/Activity/).fill("Arashiyama bamboo grove");
  await page.getByRole("button", { name: "Add to itinerary" }).click();
  await expect(page.getByText("Arashiyama bamboo grove")).toBeVisible();

  // Both items are listed, each under its own date heading.
  await expect(page.getByRole("heading", { name: "2027-01-10" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "2027-01-11" })).toBeVisible();

  await deleteCurrentTrip(page);
});

// There is deliberately no E2E spec for a malformed itinerary date. The field
// is <input type="date">, so the browser rejects anything that is not a real
// date before the form can submit, and it is also marked required. The
// server-side YYYY-MM-DD rule is therefore unreachable through the UI and stays
// covered by __tests__/server-action-validation.test.ts.
