import { describe, it, expect, beforeEach, vi } from "vitest";
import { resetStore } from "@/lib/data/store";

// Tests for server action validation (Zod rejections)
describe("server action validation", () => {
  beforeEach(() => {
    resetStore();
    vi.resetModules();
    process.env.NEXT_PUBLIC_AUTH_MODE = "demo";
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it("createTripAction rejects missing title", async () => {
    const { createTripAction } = await import("@/app/trips/actions");
    const formData = new FormData();
    formData.set("title", "");
    formData.set("destination", "Tokyo");
    formData.set("start_date", "2026-04-01");
    formData.set("end_date", "2026-04-05");
    formData.set("trip_type", "leisure");
    formData.set("traveler_count", "1");
    formData.set("status", "planning");

    const result = await createTripAction(null, formData);
    expect(result).toHaveProperty("error");
    expect(result.error).toContain("required");
  });

  it("createTripAction rejects empty destination", async () => {
    const { createTripAction } = await import("@/app/trips/actions");
    const formData = new FormData();
    formData.set("title", "Trip");
    formData.set("destination", "");
    formData.set("start_date", "2026-04-01");
    formData.set("end_date", "2026-04-05");
    formData.set("trip_type", "leisure");
    formData.set("traveler_count", "1");
    formData.set("status", "planning");

    const result = await createTripAction(null, formData);
    expect(result).toHaveProperty("error");
    expect(result.error).toContain("required");
  });

  it("createTripAction rejects invalid date range (end before start)", async () => {
    const { createTripAction } = await import("@/app/trips/actions");
    const formData = new FormData();
    formData.set("title", "Trip");
    formData.set("destination", "Tokyo");
    formData.set("start_date", "2026-04-05");
    formData.set("end_date", "2026-04-01");
    formData.set("trip_type", "leisure");
    formData.set("traveler_count", "1");
    formData.set("status", "planning");

    const result = await createTripAction(null, formData);
    expect(result).toHaveProperty("error");
    expect(result.error).toContain("on or after start_date");
  });

  it("createTripAction rejects invalid trip_type", async () => {
    const { createTripAction } = await import("@/app/trips/actions");
    const formData = new FormData();
    formData.set("title", "Trip");
    formData.set("destination", "Tokyo");
    formData.set("start_date", "2026-04-01");
    formData.set("end_date", "2026-04-05");
    formData.set("trip_type", "invalid_type");
    formData.set("traveler_count", "1");
    formData.set("status", "planning");

    const result = await createTripAction(null, formData);
    expect(result).toHaveProperty("error");
    expect(result.error).toContain("Invalid enum value");
  });

  it("createTripAction rejects invalid traveler_count (less than 1)", async () => {
    const { createTripAction } = await import("@/app/trips/actions");
    const formData = new FormData();
    formData.set("title", "Trip");
    formData.set("destination", "Tokyo");
    formData.set("start_date", "2026-04-01");
    formData.set("end_date", "2026-04-05");
    formData.set("trip_type", "leisure");
    formData.set("traveler_count", "0");
    formData.set("status", "planning");

    const result = await createTripAction(null, formData);
    expect(result).toHaveProperty("error");
    expect(result.error).toContain("greater than or equal to 1");
  });

  it("itinerary validation rejects missing required fields (direct schema test)", async () => {
    const { itinerarySchema } = await import("@/lib/validations/itinerary");
    const result = itinerarySchema.safeParse({
      trip_id: "00000000-0000-0000-0000-000000000000",
      date: "",
      time: "09:00",
      activity: "",
      location: "Location",
      notes: "Notes",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const dateErrors = result.error.flatten().fieldErrors.date;
      const activityErrors = result.error.flatten().fieldErrors.activity;
      expect(String(dateErrors)).toContain("YYYY-MM-DD");
      expect(String(activityErrors)).toContain("required");
    }
  });

  it("itinerary validation rejects invalid status (trip update schema)", async () => {
    const { tripUpdateSchema } = await import("@/lib/validations/trip");
    const result = tripUpdateSchema.safeParse({
      status: "invalid_status",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const statusErrors = result.error.flatten().fieldErrors.status;
      expect(String(statusErrors)).toContain("Invalid enum value");
    }
  });

  it("itinerary validation rejects activity longer than 200 chars", async () => {
    const { itinerarySchema } = await import("@/lib/validations/itinerary");
    const result = itinerarySchema.safeParse({
      trip_id: "00000000-0000-0000-0000-000000000000",
      date: "2026-04-01",
      time: "09:00",
      activity: "a".repeat(201),
      location: "Location",
      notes: "Notes",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const activityErrors = result.error.flatten().fieldErrors.activity;
      expect(String(activityErrors)).toContain("at most 200");
    }
  });
});