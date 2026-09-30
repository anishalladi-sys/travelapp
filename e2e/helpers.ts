import { expect, type Page } from "@playwright/test";

// The demo backend is a single in-memory store shared by every browser context
// for the lifetime of the dev server, so a spec that creates a trip and does not
// remove it changes what later specs see. These helpers create with a unique
// title and delete again, which keeps the suite order-independent and leaves the
// store empty for specs that assert on the empty state.

export function uniqueTitle(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

export async function createTrip(
  page: Page,
  title: string,
  destination = "Tokyo",
): Promise<void> {
  await page.goto("/trips/new");
  await page.getByLabel(/Title/).fill(title);
  await page.getByLabel(/Destination/).fill(destination);
  await page.getByLabel(/Start date/).fill("2027-01-10");
  await page.getByLabel(/End date/).fill("2027-01-14");
  await page.getByRole("button", { name: "Create Trip" }).click();
  await expect(page).toHaveURL(/\/trips\/[0-9a-f-]{36}$/);
}

export async function deleteCurrentTrip(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Delete trip" }).click();
  await expect(page).toHaveURL(/\/trips$/);
}
