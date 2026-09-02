// In-memory fallback when Supabase env is missing (local dev without Supabase)
// This is NOT for production — production uses Supabase + RLS.
export type Trip = {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
  traveler_count: number;
  status: string;
  created_at: string;
};

export type ItineraryItem = {
  id: string;
  trip_id: string;
  date: string;
  time: string | null;
  activity: string;
  location: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
};

// globalThis used so HMR / server actions share same store in dev
const g = globalThis as unknown as { __travelStore?: { trips: Trip[]; items: ItineraryItem[] } };
if (!g.__travelStore) g.__travelStore = { trips: [], items: [] };
export const store = g.__travelStore;

export function resetStore() {
  store.trips.length = 0;
  store.items.length = 0;
}
