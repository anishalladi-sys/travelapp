import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { listTrips } from "@/lib/data/trips";
import { resetStore, store } from "@/lib/data/store";

describe("unit-test environment isolation", () => {
  beforeEach(() => resetStore());

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_AUTH_MODE;
    resetStore();
  });

  it("neutralises ambient Supabase env so the shell cannot choose the backend", () => {
    const SUPABASE_ENV_KEYS = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ] as const;

    for (const key of SUPABASE_ENV_KEYS) {
      expect(
        process.env[key] ?? "",
        `${key} must be neutralised by the harness before any test runs`,
      ).toBe("");
    }
  });

  it("reads the in-memory store rather than Supabase", async () => {
    process.env.NEXT_PUBLIC_AUTH_MODE = "demo";

    store.trips.push({
      id: "iso-trip-1",
      user_id: "test-user-id",
      title: "Isolation probe",
      destination: "Tokyo",
      start_date: "2026-04-01",
      end_date: "2026-04-05",
      trip_type: "leisure",
      traveler_count: 1,
      status: "planning",
      created_at: new Date().toISOString(),
    });

    const trips = await listTrips();

    expect(trips.map((t) => t.id)).toEqual(["iso-trip-1"]);
  });
});
