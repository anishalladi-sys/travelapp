import { store, type Trip, type ItineraryItem } from "./store";
import { getUserId } from "./auth";

function hasSupabase() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export async function listTrips(): Promise<Trip[]> {
  const user_id = await getUserId();
  if (!user_id) return [];
  if (hasSupabase()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase.from("trips").select("*").eq("user_id", user_id).order("start_date", { ascending: true });
    if (error) throw error;
    return (data as Trip[]) ?? [];
  }
  return store.trips.filter((t) => t.user_id === user_id).sort((a, b) => a.start_date.localeCompare(b.start_date));
}

export async function getTrip(id: string): Promise<Trip | null> {
  const user_id = await getUserId();
  if (!user_id) return null;
  if (hasSupabase()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.from("trips").select("*").eq("id", id).eq("user_id", user_id).single();
    return (data as Trip) ?? null;
  }
  return store.trips.find((t) => t.id === id && t.user_id === user_id) ?? null;
}

export async function createTrip(input: Omit<Trip, "id" | "created_at" | "user_id"> & { user_id?: string }): Promise<Trip> {
  const user_id = input.user_id ?? (await getUserId());
  if (!user_id) throw new Error("Unauthorized");
  const trip: Trip = {
    id: crypto.randomUUID(),
    user_id,
    title: input.title,
    destination: input.destination,
    start_date: input.start_date,
    end_date: input.end_date,
    trip_type: input.trip_type ?? "leisure",
    traveler_count: input.traveler_count ?? 1,
    status: input.status ?? "planning",
    created_at: new Date().toISOString(),
  };
  if (hasSupabase()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase.from("trips").insert(trip).select().single();
    if (error) throw error;
    return data as Trip;
  }
  store.trips.push(trip);
  return trip;
}

export async function updateTrip(id: string, patch: Partial<Omit<Trip, "id" | "user_id" | "created_at">>): Promise<Trip | null> {
  const user_id = await getUserId();
  if (!user_id) throw new Error("Unauthorized");
  if (hasSupabase()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase.from("trips").update(patch).eq("id", id).eq("user_id", user_id).select().single();
    if (error) throw error;
    return data as Trip;
  }
  const idx = store.trips.findIndex((t) => t.id === id && t.user_id === user_id);
  if (idx === -1) return null;
  store.trips[idx] = { ...store.trips[idx], ...patch };
  return store.trips[idx];
}

export async function deleteTrip(id: string): Promise<void> {
  const user_id = await getUserId();
  if (!user_id) throw new Error("Unauthorized");
  if (hasSupabase()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.from("trips").delete().eq("id", id).eq("user_id", user_id);
    if (error) throw error;
    return;
  }
  const idx = store.trips.findIndex((t) => t.id === id && t.user_id === user_id);
  if (idx !== -1) store.trips.splice(idx, 1);
  // cascade items
  for (let i = store.items.length - 1; i >= 0; i--) if (store.items[i].trip_id === id) store.items.splice(i, 1);
}

// Itinerary
export async function listItinerary(trip_id: string): Promise<ItineraryItem[]> {
  // ownership check via getTrip (which checks user_id internally)
  await getUserId();
  const trip = await getTrip(trip_id);
  if (!trip) return [];
  if (hasSupabase()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.from("itinerary_items").select("*").eq("trip_id", trip_id).order("date").order("time");
    return (data as ItineraryItem[]) ?? [];
  }
  return store.items
    .filter((it) => it.trip_id === trip_id)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));
}

export async function createItinerary(input: Omit<ItineraryItem, "id" | "created_at">): Promise<ItineraryItem> {
  const trip = await getTrip(input.trip_id);
  if (!trip) throw new Error("Forbidden: trip not owned");
  const item: ItineraryItem = {
    id: crypto.randomUUID(),
    trip_id: input.trip_id,
    date: input.date,
    time: input.time ?? null,
    activity: input.activity,
    location: input.location ?? null,
    notes: input.notes ?? null,
    sort_order: input.sort_order ?? 0,
    created_at: new Date().toISOString(),
  };
  if (hasSupabase()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase.from("itinerary_items").insert(item).select().single();
    if (error) throw error;
    return data as ItineraryItem;
  }
  store.items.push(item);
  return item;
}

export async function updateItinerary(id: string, patch: Partial<Omit<ItineraryItem, "id" | "trip_id" | "created_at">>): Promise<ItineraryItem | null> {
  if (hasSupabase()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    // must verify ownership via trip_id join — fetch first
    const { data: existing } = await supabase.from("itinerary_items").select("trip_id").eq("id", id).single();
    if (!existing) return null;
    const trip = await getTrip((existing as { trip_id: string }).trip_id);
    if (!trip) throw new Error("Forbidden");
    const { data, error } = await supabase.from("itinerary_items").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data as ItineraryItem;
  }
  const idx = store.items.findIndex((it) => it.id === id);
  if (idx === -1) return null;
  const trip = await getTrip(store.items[idx].trip_id);
  if (!trip) throw new Error("Forbidden");
  store.items[idx] = { ...store.items[idx], ...patch };
  return store.items[idx];
}

export async function deleteItinerary(id: string): Promise<void> {
  if (hasSupabase()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: existing } = await supabase.from("itinerary_items").select("trip_id").eq("id", id).single();
    if (!existing) return;
    const trip = await getTrip((existing as { trip_id: string }).trip_id);
    if (!trip) throw new Error("Forbidden");
    const { error } = await supabase.from("itinerary_items").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const idx = store.items.findIndex((it) => it.id === id);
  if (idx === -1) return;
  const trip = await getTrip(store.items[idx].trip_id);
  if (!trip) throw new Error("Forbidden");
  store.items.splice(idx, 1);
}
