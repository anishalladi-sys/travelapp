import { describe, it, expect, beforeEach } from "vitest";
import { resetStore } from "@/lib/data/store";
import { deleteTrip, listItinerary } from "@/lib/data/trips";

describe("itinerary cascade/delete behavior", () => {
  beforeEach(() => {
    resetStore();
    process.env.NEXT_PUBLIC_AUTH_MODE = "demo";
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it("deleteTrip cascades and removes associated itinerary items", async () => {
    // Create a trip
    const { createTrip, createItinerary, getTrip } = await import("@/lib/data/trips");
    
    const trip = await createTrip({
      title: "Test Trip",
      destination: "Tokyo",
      start_date: "2026-04-01",
      end_date: "2026-04-05",
      trip_type: "leisure",
      traveler_count: 1,
      status: "planning",
    });

    // Add itinerary items
    await createItinerary({
      trip_id: trip.id,
      date: "2026-04-01",
      time: "09:00",
      activity: "Arrival",
      location: "Airport",
      notes: "Land at NRT",
      sort_order: 0,
    });

    await createItinerary({
      trip_id: trip.id,
      date: "2026-04-02",
      time: "10:00",
      activity: "Sightseeing",
      location: "Shibuya",
      notes: "Cross the famous intersection",
      sort_order: 1,
    });

    // Verify items exist
    const itemsBefore = await listItinerary(trip.id);
    expect(itemsBefore).toHaveLength(2);

    // Delete the trip
    await deleteTrip(trip.id);

    // Verify trip is gone
    const deletedTrip = await getTrip(trip.id);
    expect(deletedTrip).toBeNull();

    // Verify itinerary items are cascaded/deleted
    const itemsAfter = await listItinerary(trip.id);
    expect(itemsAfter).toHaveLength(0);
  });

  it("deleteItinerary removes single item without affecting others", async () => {
    const { createTrip, createItinerary, deleteItinerary, listItinerary } = await import("@/lib/data/trips");
    
    const trip = await createTrip({
      title: "Test Trip",
      destination: "Tokyo",
      start_date: "2026-04-01",
      end_date: "2026-04-05",
      trip_type: "leisure",
      traveler_count: 1,
      status: "planning",
    });

    const item1 = await createItinerary({
      trip_id: trip.id,
      date: "2026-04-01",
      time: "09:00",
      activity: "Activity 1",
      location: "Loc 1",
      notes: null,
      sort_order: 0,
    });

    const item2 = await createItinerary({
      trip_id: trip.id,
      date: "2026-04-02",
      time: "10:00",
      activity: "Activity 2",
      location: "Loc 2",
      notes: null,
      sort_order: 1,
    });

    // Delete one item
    await deleteItinerary(item1.id);

    const remaining = await listItinerary(trip.id);
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.id).toBe(item2.id);
  });

  it("itinerary items persist after trip update (no cascade on update)", async () => {
    const { createTrip, createItinerary, updateTrip, listItinerary } = await import("@/lib/data/trips");
    
    const trip = await createTrip({
      title: "Test Trip",
      destination: "Tokyo",
      start_date: "2026-04-01",
      end_date: "2026-04-05",
      trip_type: "leisure",
      traveler_count: 1,
      status: "planning",
    });

    await createItinerary({
      trip_id: trip.id,
      date: "2026-04-01",
      time: "09:00",
      activity: "Activity",
      location: "Loc",
      notes: null,
      sort_order: 0,
    });

    // Update the trip
    await updateTrip(trip.id, { title: "Updated Title" });

    // Itinerary should still exist
    const items = await listItinerary(trip.id);
    expect(items).toHaveLength(1);
  });
});