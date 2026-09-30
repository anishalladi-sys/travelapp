import type { SupabaseClient } from "@supabase/supabase-js";

// One seam between the data layer and its two backends.
//
// Every query runs as the caller's own user through the anon client, so RLS is
// always in force and there is no privileged path. The in-memory adapter exists
// for local development and for the E2E harness, where Supabase is deliberately
// unconfigured. Which one is used is decided once, here, rather than by a
// `if (hasSupabase())` in every function -- that check was repeated nine times
// in lib/data/trips.ts, and each copy re-derived the same rules.

// Rows travel as `Record<string, unknown>` rather than `unknown` so the Supabase
// adapter can pass them to `.insert()` / `.update()` without an `as never`, and
// callers still get a real check at the boundary where they build the row.
export type TripRow = Record<string, unknown>;
export type ItineraryRow = Record<string, unknown>;

export interface RepositoryResult<T> {
  value: T;
  error: unknown;
}

export interface TripsRepository {
  listTrips(userId: string): Promise<RepositoryResult<unknown[]>>;
  getTrip(
    userId: string,
    id: string,
  ): Promise<RepositoryResult<unknown | null>>;
  insertTrip(row: TripRow): Promise<RepositoryResult<unknown>>;
  updateTrip(
    userId: string,
    id: string,
    patch: TripRow,
  ): Promise<RepositoryResult<unknown | null>>;
  deleteTrip(userId: string, id: string): Promise<RepositoryResult<undefined>>;
  listItinerary(tripId: string): Promise<RepositoryResult<unknown[]>>;
  insertItinerary(row: ItineraryRow): Promise<RepositoryResult<unknown>>;
  // Read-only lookup used to resolve which trip an item belongs to, so the write
  // below can be scoped to that trip.
  findItineraryTripId(id: string): Promise<RepositoryResult<string | null>>;
  // The owning trip id is part of the write's scope, not just a precondition.
  // A method that only took `id` could be called with an id whose ownership was
  // checked elsewhere, which is a check-then-write race.
  updateItineraryForTrip(
    tripId: string,
    id: string,
    patch: ItineraryRow,
  ): Promise<RepositoryResult<unknown | null>>;
  deleteItineraryForTrip(
    tripId: string,
    id: string,
  ): Promise<RepositoryResult<undefined>>;
}

async function supabaseRepository(): Promise<TripsRepository> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase: SupabaseClient = await createClient();

  // Ownership is always asserted in the query itself (`user_id` / verified
  // `trip_id`), so RLS and the application check agree by construction rather
  // than by convention.
  return {
    async listTrips(userId) {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", userId)
        .order("start_date", { ascending: true });
      return { value: data ?? [], error };
    },

    async getTrip(userId, id) {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();
      return { value: data ?? null, error };
    },

    async insertTrip(row) {
      const { data, error } = await supabase
        .from("trips")
        .insert(row)
        .select()
        .single();
      return { value: data, error };
    },

    async updateTrip(userId, id, patch) {
      const { data, error } = await supabase
        .from("trips")
        .update(patch)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .maybeSingle();
      return { value: data ?? null, error };
    },

    async deleteTrip(userId, id) {
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      return { value: undefined, error };
    },

    async listItinerary(tripId) {
      const { data, error } = await supabase
        .from("itinerary_items")
        .select("*")
        .eq("trip_id", tripId)
        .order("date")
        .order("time");
      return { value: data ?? [], error };
    },

    async insertItinerary(row) {
      const { data, error } = await supabase
        .from("itinerary_items")
        .insert(row)
        .select()
        .single();
      return { value: data, error };
    },

    async findItineraryTripId(id) {
      const { data, error } = await supabase
        .from("itinerary_items")
        .select("trip_id")
        .eq("id", id)
        .maybeSingle();
      return {
        value: (data as { trip_id?: string } | null)?.trip_id ?? null,
        error,
      };
    },

    async updateItineraryForTrip(tripId, id, patch) {
      // Scoped by both the owning trip and the row id, so ownership is enforced
      // by the statement that performs the write.
      const { data, error } = await supabase
        .from("itinerary_items")
        .update(patch)
        .eq("trip_id", tripId)
        .eq("id", id)
        .select()
        .maybeSingle();
      return { value: data ?? null, error };
    },

    async deleteItineraryForTrip(tripId, id) {
      const { error } = await supabase
        .from("itinerary_items")
        .delete()
        .eq("trip_id", tripId)
        .eq("id", id);
      return { value: undefined, error };
    },
  };
}

function inMemoryRepository(): TripsRepository {
  // Imported lazily so the store is only materialised when it is actually used.
  let storeRef: {
    trips: import("./store").Trip[];
    items: import("./store").ItineraryItem[];
  } | null = null;

  const store = async () => {
    if (!storeRef) {
      storeRef = (await import("./store")).store;
    }
    return storeRef;
  };

  return {
    async listTrips(userId) {
      const s = await store();
      return {
        value: s.trips
          .filter((t) => t.user_id === userId)
          .sort((a, b) => a.start_date.localeCompare(b.start_date)),
        error: null,
      };
    },

    async getTrip(userId, id) {
      const s = await store();
      return {
        value: s.trips.find((t) => t.id === id && t.user_id === userId) ?? null,
        error: null,
      };
    },

    async insertTrip(row) {
      const s = await store();
      const trip = row as import("./store").Trip;
      s.trips.push(trip);
      return { value: trip, error: null };
    },

    async updateTrip(userId, id, patch) {
      const s = await store();
      const index = s.trips.findIndex(
        (t) => t.id === id && t.user_id === userId,
      );
      if (index === -1) return { value: null, error: null };
      const existing = s.trips[index];
      if (!existing) return { value: null, error: null };
      const updated = { ...existing, ...patch } as import("./store").Trip;
      s.trips[index] = updated;
      return { value: updated, error: null };
    },

    async deleteTrip(userId, id) {
      const s = await store();
      const index = s.trips.findIndex(
        (t) => t.id === id && t.user_id === userId,
      );
      if (index !== -1) s.trips.splice(index, 1);
      for (let i = s.items.length - 1; i >= 0; i--) {
        const item = s.items[i];
        if (item && item.trip_id === id) s.items.splice(i, 1);
      }
      return { value: undefined, error: null };
    },

    async listItinerary(tripId) {
      const s = await store();
      return {
        value: s.items
          .filter((it) => it.trip_id === tripId)
          .sort(
            (a, b) =>
              a.date.localeCompare(b.date) ||
              (a.time ?? "").localeCompare(b.time ?? ""),
          ),
        error: null,
      };
    },

    async insertItinerary(row) {
      const s = await store();
      const item = row as import("./store").ItineraryItem;
      s.items.push(item);
      return { value: item, error: null };
    },

    async findItineraryTripId(id) {
      const s = await store();
      return {
        value: s.items.find((it) => it.id === id)?.trip_id ?? null,
        error: null,
      };
    },

    async updateItineraryForTrip(tripId, id, patch) {
      const s = await store();
      const index = s.items.findIndex(
        (it) => it.id === id && it.trip_id === tripId,
      );
      if (index === -1) return { value: null, error: null };
      const existing = s.items[index];
      if (!existing) return { value: null, error: null };
      const updated = {
        ...existing,
        ...patch,
      } as import("./store").ItineraryItem;
      s.items[index] = updated;
      return { value: updated, error: null };
    },

    async deleteItineraryForTrip(tripId, id) {
      const s = await store();
      const index = s.items.findIndex(
        (it) => it.id === id && it.trip_id === tripId,
      );
      if (index !== -1) s.items.splice(index, 1);
      return { value: undefined, error: null };
    },
  };
}

let repositoryPromise: Promise<TripsRepository> | null = null;

export function getTripsRepository(): Promise<TripsRepository> {
  if (!repositoryPromise) {
    const configured =
      !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    repositoryPromise = configured
      ? supabaseRepository()
      : Promise.resolve(inMemoryRepository());
  }
  return repositoryPromise;
}
