import { describe, it, expect } from "vitest";
import { itinerarySchema } from "@/lib/validations/itinerary";

describe("itinerarySchema", () => {
  it("accepts valid item", () => {
    const r = itinerarySchema.safeParse({
      trip_id: "550e8400-e29b-41d4-a716-446655440000",
      date: "2026-04-01",
      time: "09:00",
      activity: "Shibuya crossing",
      location: "Shibuya",
      notes: "photo spot",
    });
    expect(r.success).toBe(true);
  });
  it("rejects missing activity", () => {
    const r = itinerarySchema.safeParse({ trip_id: "550e8400-e29b-41d4-a716-446655440000", date: "2026-04-01", activity: "" });
    expect(r.success).toBe(false);
  });
  it("allows empty time", () => {
    const r = itinerarySchema.safeParse({ trip_id: "550e8400-e29b-41d4-a716-446655440000", date: "2026-04-01", activity: "Free day" });
    expect(r.success).toBe(true);
  });
});
