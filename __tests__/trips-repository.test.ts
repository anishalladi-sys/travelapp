import { describe, it, expect, vi, beforeEach } from "vitest";

// Guards the Supabase adapter specifically.
//
// The unit harness pins NEXT_PUBLIC_SUPABASE_* to empty strings, so every other
// test in the repo exercises the in-memory adapter. The queries the Supabase
// adapter actually builds are therefore untested, and a scoping regression
// there would ship silently. The in-memory adapter's scoping is covered by
// trips-ownership.test.ts; this covers the generated query.
//
// Verified meaningful: deleting the trip_id predicate from the adapter makes
// the two scoping tests below fail.

interface QueryCall {
  column: string;
  value: unknown;
}

const selectQueries: QueryCall[] = [];
const updateQueries: QueryCall[] = [];
const deleteQueries: QueryCall[] = [];

vi.mock("@/lib/supabase/server", () => {
  // A flat query builder: each terminal call records the mode it was in, and
  // `.eq()` records into that mode's list. No thenables.
  const makeQuery = () => {
    const mode = { current: "select" as "select" | "update" | "delete" };
    const query = {
      select() {
        mode.current = "select";
        return query;
      },
      insert() {
        mode.current = "select";
        return query;
      },
      update() {
        mode.current = "update";
        return query;
      },
      delete() {
        mode.current = "delete";
        return query;
      },
      eq(column: string, value: unknown) {
        const entry = { column, value };
        if (mode.current === "update") updateQueries.push(entry);
        else if (mode.current === "delete") deleteQueries.push(entry);
        else selectQueries.push(entry);
        return query;
      },
      order() {
        return query;
      },
      maybeSingle() {
        return Promise.resolve({ data: null, error: null });
      },
      single() {
        return Promise.resolve({ data: null, error: null });
      },
    };
    return query;
  };

  return {
    createClient: async () => ({ from: () => makeQuery() }),
  };
});

async function supabaseRepository() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  vi.resetModules();
  const { getTripsRepository } = await import("@/lib/data/trips-repository");
  return getTripsRepository();
}

const columns = (calls: QueryCall[]) =>
  calls.map((c) => `${c.column}=${String(c.value)}`);

describe("Supabase adapter scopes every query", () => {
  beforeEach(() => {
    selectQueries.length = 0;
    updateQueries.length = 0;
    deleteQueries.length = 0;
  });

  it("updateItineraryForTrip constrains the write by trip_id and id", async () => {
    const repo = await supabaseRepository();
    await repo.updateItineraryForTrip("trip-owned", "item-7", {
      activity: "x",
    });

    // The write statement itself must carry the trip scope. With only `id`, the
    // ownership check happens elsewhere and the write is unguarded.
    expect(columns(updateQueries)).toEqual(
      expect.arrayContaining(["trip_id=trip-owned", "id=item-7"]),
    );
  });

  it("deleteItineraryForTrip constrains the delete by trip_id and id", async () => {
    const repo = await supabaseRepository();
    await repo.deleteItineraryForTrip("trip-owned", "item-7");

    expect(columns(deleteQueries)).toEqual(
      expect.arrayContaining(["trip_id=trip-owned", "id=item-7"]),
    );
  });

  it("trip reads are constrained by user_id", async () => {
    const repo = await supabaseRepository();

    await repo.listTrips("user-a");
    expect(columns(selectQueries)).toContain("user_id=user-a");

    selectQueries.length = 0;
    await repo.getTrip("user-a", "trip-1");
    expect(columns(selectQueries)).toEqual(
      expect.arrayContaining(["id=trip-1", "user_id=user-a"]),
    );
  });

  it("trip updates and deletes are constrained by user_id", async () => {
    const repo = await supabaseRepository();

    await repo.updateTrip("user-a", "trip-1", { title: "y" });
    expect(columns(updateQueries)).toEqual(
      expect.arrayContaining(["id=trip-1", "user_id=user-a"]),
    );

    deleteQueries.length = 0;
    await repo.deleteTrip("user-a", "trip-1");
    expect(columns(deleteQueries)).toEqual(
      expect.arrayContaining(["id=trip-1", "user_id=user-a"]),
    );
  });
});
