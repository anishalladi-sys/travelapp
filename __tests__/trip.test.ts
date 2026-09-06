import { describe, it, expect } from "vitest";
import { tripSchema } from "@/lib/validations/trip";

describe("tripSchema", () => {
  it("accepts valid trip", () => {
    const r = tripSchema.safeParse({
      title: "Japan 2026",
      destination: "Tokyo",
      start_date: "2026-04-01",
      end_date: "2026-04-10",
      trip_type: "leisure",
      traveler_count: 2,
      status: "planning",
    });
    expect(r.success).toBe(true);
  });
  it("rejects missing title", () => {
    const r = tripSchema.safeParse({ title: "", destination: "Paris", start_date: "2026-01-01", end_date: "2026-01-02" });
    expect(r.success).toBe(false);
  });
  it("rejects end before start", () => {
    const r = tripSchema.safeParse({ title: "X", destination: "Y", start_date: "2026-04-10", end_date: "2026-04-01" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toMatch(/end_date/);
  });
  it("coerces traveler_count", () => {
    const r = tripSchema.safeParse({ title: "T", destination: "D", start_date: "2026-01-01", end_date: "2026-01-02", traveler_count: "3" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.traveler_count).toBe(3);
  });
});