import type { Database } from "@/types/supabase";
import { createServerClient } from "@supabase/ssr";
import { readSupabaseEnv } from "@/lib/supabase/env";

export type TripRow = Database["public"]["Tables"]["trips"]["Insert"];
export type TripUpdate = Database["public"]["Tables"]["trips"]["Update"];
export type TripRowDB = Database["public"]["Tables"]["trips"]["Row"];

export type ItineraryRow =
  Database["public"]["Tables"]["itinerary_items"]["Insert"];
export type ItineraryUpdate =
  Database["public"]["Tables"]["itinerary_items"]["Update"];
export type ItineraryRowDB =
  Database["public"]["Tables"]["itinerary_items"]["Row"];

// Re-export the Row types for external use
export type Trip = TripRowDB;
export type ItineraryItem = ItineraryRowDB;

export interface RepositoryResult<T> {
  value: T;
  error: unknown;
}

export interface TripsRepository {
  listTrips(userId: string): Promise<RepositoryResult<Trip[]>>;
  getTrip(userId: string, id: string): Promise<RepositoryResult<Trip | null>>;
  insertTrip(row: TripRow): Promise<RepositoryResult<Trip>>;
  updateTrip(
    userId: string,
    id: string,
    patch: TripUpdate,
  ): Promise<RepositoryResult<Trip | null>>;
  deleteTrip(userId: string, id: string): Promise<RepositoryResult<undefined>>;
  listItinerary(tripId: string): Promise<RepositoryResult<ItineraryItem[]>>;
  insertItinerary(row: ItineraryRow): Promise<RepositoryResult<ItineraryItem>>;
  findItineraryTripId(id: string): Promise<RepositoryResult<string | null>>;
  updateItineraryForTrip(
    tripId: string,
    id: string,
    patch: ItineraryUpdate,
  ): Promise<RepositoryResult<ItineraryItem | null>>;
  deleteItineraryForTrip(
    tripId: string,
    id: string,
  ): Promise<RepositoryResult<undefined>>;
}

async function createSupabaseClient() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check .env.local",
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Ignore cookie setting errors in Server Components
        }
      },
    },
  });
}

async function supabaseRepository(): Promise<TripsRepository> {
  const supabase = await createSupabaseClient();

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
      return { value: data as Trip, error };
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
      return { value: data as unknown as ItineraryItem, error };
    },

    async findItineraryTripId(id) {
      const { data, error } = await supabase
        .from("itinerary_items")
        .select("trip_id")
        .eq("id", id)
        .maybeSingle();
      return {
        value: data?.trip_id ?? null,
        error,
      };
    },

    async updateItineraryForTrip(tripId, id, patch) {
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
      const trip: Trip = {
        id: (row as { id?: string }).id ?? crypto.randomUUID(),
        user_id: row.user_id,
        title: row.title,
        destination: row.destination,
        start_date: row.start_date,
        end_date: row.end_date,
        trip_type: row.trip_type ?? "leisure",
        traveler_count: row.traveler_count ?? 1,
        status: row.status ?? "planning",
        created_at: new Date().toISOString(),
      };
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
      const updated = { ...existing, ...patch };
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
      // The row is an Insert type (partial); we need to return the full Row type.
      // In the in-memory store, we construct the full row by adding the generated
      // fields that the database would normally provide.
      const item: ItineraryItem = {
        id: (row as { id?: string }).id ?? crypto.randomUUID(),
        trip_id: row.trip_id,
        date: row.date,
        time: row.time ?? null,
        activity: row.activity,
        location: row.location ?? null,
        notes: row.notes ?? null,
        sort_order: row.sort_order ?? 0,
        created_at: new Date().toISOString(),
      };
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
      const updated = { ...existing, ...patch };
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
    const env = readSupabaseEnv();

    // The production hard-fail already lives in middleware, but a request path
    // that does not traverse middleware (a future worker, a webhook, a script, a
    // page that forgets force-dynamic) would otherwise silently get the per-
    // process in-memory store and lose every row on each cold start. Fail here
    // too, so the bug is impossible regardless of the caller.
    if (!env.configured && env.reason === "missing-env-in-production") {
      throw new Error(
        "Supabase is not configured while NODE_ENV=production. Refusing to " +
          "fall back to the in-memory store, which would lose trip data. Set " +
          "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
    }

    repositoryPromise = env.configured
      ? supabaseRepository()
      : Promise.resolve(inMemoryRepository());
  }
  return repositoryPromise;
}
