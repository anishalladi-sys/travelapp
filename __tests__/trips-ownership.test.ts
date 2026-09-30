import { describe, it, expect, beforeEach } from "vitest";
import { resetStore, store } from "@/lib/data/store";
import {
  createTrip,
  listTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  createItinerary,
  listItinerary,
  updateItinerary,
  deleteItinerary,
} from "@/lib/data/trips";

// These call the real data layer rather than re-implementing its rules, so they
// fail if ownership enforcement regresses anywhere in the stack. That matters
// because __tests__/authz.test.ts originally re-implemented the filter inline
// and would have passed even if lib/data/trips.ts were deleted.

async function asUser<T>(run: () => Promise<T>): Promise<T> {
  process.env.NEXT_PUBLIC_AUTH_MODE = "demo";
  // The demo cookie is the only identity available without a Supabase project,
  // so both "users" are addressed by swapping the store contents rather than by
  // becoming two different people.
  return run();
}

describe("trip ownership is enforced on every read", () => {
  beforeEach(() => {
    resetStore();
    process.env.NEXT_PUBLIC_AUTH_MODE = "demo";
    process.env.NEXT_PUBLIC_AUTH_MODE = "demo";
  });

  it("a trip is visible to its owner and invisible to everyone else", async () => {
    const owned = await asUser(() =>
      createTrip({
        title: "Mine",
        destination: "Tokyo",
        start_date: "2026-04-01",
        end_date: "2026-04-05",
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      }),
    );

    // Same identity, so it is readable.
    await expect(getTrip(owned.id)).resolves.toMatchObject({ id: owned.id });

    // A trip owned by someone else must not be reachable, even by exact id.
    store.trips.push({ ...owned, id: "other-trip", user_id: "someone-else" });
    await expect(getTrip("other-trip")).resolves.toBeNull();
    await expect(listItinerary("other-trip")).resolves.toEqual([]);
  });

  it("listTrips only returns the caller's own trips", async () => {
    const mine = await asUser(() =>
      createTrip({
        title: "Mine",
        destination: "Osaka",
        start_date: "2026-05-01",
        end_date: "2026-05-03",
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      }),
    );
    store.trips.push({ ...mine, id: "theirs", user_id: "another-user" });

    const listed = await listTrips();

    expect(listed.map((t) => t.id)).toEqual([mine.id]);
    expect(listed.some((t) => t.user_id !== "demo-user-0001")).toBe(false);
  });
});

describe("trip mutations are scoped to the owner", () => {
  beforeEach(() => {
    resetStore();
    process.env.NEXT_PUBLIC_AUTH_MODE = "demo";
  });

  it("refuses to update a trip owned by someone else", async () => {
    const foreign = await asUser(() =>
      createTrip({
        title: "Theirs",
        destination: "Kyoto",
        start_date: "2026-06-01",
        end_date: "2026-06-02",
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      }),
    );
    store.trips.push({ ...foreign, id: "not-mine", user_id: "another-user" });

    await expect(
      updateTrip("not-mine", { title: "Hijacked" }),
    ).resolves.toBeNull();
    expect(store.trips.find((t) => t.id === "not-mine")?.title).toBe("Theirs");
  });

  it("refuses to delete a trip owned by someone else", async () => {
    const foreign = await asUser(() =>
      createTrip({
        title: "Theirs",
        destination: "Kyoto",
        start_date: "2026-06-01",
        end_date: "2026-06-02",
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      }),
    );
    store.trips.push({ ...foreign, id: "not-mine", user_id: "another-user" });

    await deleteTrip("not-mine");

    expect(store.trips.some((t) => t.id === "not-mine")).toBe(true);
  });
});

describe("itinerary writes are scoped to the owning trip", () => {
  beforeEach(() => {
    resetStore();
    process.env.NEXT_PUBLIC_AUTH_MODE = "demo";
  });

  it("refuses to add an item to a trip the caller does not own", async () => {
    store.trips.push({
      id: "trip-a",
      user_id: "another-user",
      title: "Theirs",
      destination: "Nara",
      start_date: "2026-07-01",
      end_date: "2026-07-02",
      trip_type: "leisure",
      traveler_count: 1,
      status: "planning",
      created_at: new Date().toISOString(),
    });

    await expect(
      createItinerary({
        trip_id: "trip-a",
        date: "2026-07-01",
        time: "10:00",
        activity: "Intrusion",
        location: null,
        notes: null,
        sort_order: 0,
      }),
    ).rejects.toThrow(/Forbidden/);

    expect(store.items).toHaveLength(0);
  });

  it("refuses to update an item whose trip is not owned", async () => {
    store.trips.push({
      id: "trip-a",
      user_id: "another-user",
      title: "Theirs",
      destination: "Nara",
      start_date: "2026-07-01",
      end_date: "2026-07-02",
      trip_type: "leisure",
      traveler_count: 1,
      status: "planning",
      created_at: new Date().toISOString(),
    });
    store.items.push({
      id: "item-a",
      trip_id: "trip-a",
      date: "2026-07-01",
      time: "10:00",
      activity: "Original",
      location: null,
      notes: null,
      sort_order: 0,
      created_at: new Date().toISOString(),
    });

    await expect(
      updateItinerary("item-a", { activity: "Hijacked" }),
    ).rejects.toThrow(/Forbidden/);
    expect(store.items[0]?.activity).toBe("Original");
  });

  it("refuses to delete an item whose trip is not owned", async () => {
    store.trips.push({
      id: "trip-a",
      user_id: "another-user",
      title: "Theirs",
      destination: "Nara",
      start_date: "2026-07-01",
      end_date: "2026-07-02",
      trip_type: "leisure",
      traveler_count: 1,
      status: "planning",
      created_at: new Date().toISOString(),
    });
    store.items.push({
      id: "item-a",
      trip_id: "trip-a",
      date: "2026-07-01",
      time: null,
      activity: "Original",
      location: null,
      notes: null,
      sort_order: 0,
      created_at: new Date().toISOString(),
    });

    await expect(deleteItinerary("item-a")).rejects.toThrow(/Forbidden/);
    expect(store.items).toHaveLength(1);
  });

  it("still allows a full round trip on an owned trip", async () => {
    const trip = await asUser(() =>
      createTrip({
        title: "Mine",
        destination: "Tokyo",
        start_date: "2026-04-01",
        end_date: "2026-04-05",
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      }),
    );

    const item = await createItinerary({
      trip_id: trip.id,
      date: "2026-04-01",
      time: "09:00",
      activity: "Arrival",
      location: "HND",
      notes: null,
      sort_order: 0,
    });

    await expect(listItinerary(trip.id)).resolves.toHaveLength(1);

    await expect(
      updateItinerary(item.id, { activity: "Landed" }),
    ).resolves.toMatchObject({
      activity: "Landed",
    });

    await deleteItinerary(item.id);
    await expect(listItinerary(trip.id)).resolves.toHaveLength(0);
  });
});
