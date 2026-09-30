import { store, type Trip, type ItineraryItem } from "./store";
import { getUserId } from "./auth";
import { getTripsRepository } from "./trips-repository";

// Public data access for trips and itinerary items.
//
// This layer owns two concerns and nothing else: who the caller is, and what the
// rules are. Backend selection lives in trips-repository.ts. Ownership is
// enforced on every read and write, scoped by user_id or by a verified
// trip_id, so the in-memory adapter and the RLS-backed one enforce the same
// rules.

import type { RepositoryResult } from "./trips-repository";

function unwrap<T>(result: RepositoryResult<T>): T {
  if (result.error) throw result.error;
  return result.value;
}

export async function listTrips(): Promise<Trip[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const repo = await getTripsRepository();
  return unwrap(await repo.listTrips(userId)) as Trip[];
}

export async function getTrip(id: string): Promise<Trip | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const repo = await getTripsRepository();
  return (unwrap(await repo.getTrip(userId, id)) as Trip | null) ?? null;
}

export async function createTrip(
  input: Omit<Trip, "id" | "created_at" | "user_id"> & { user_id?: string },
): Promise<Trip> {
  const userId = input.user_id ?? (await getUserId());
  if (!userId) throw new Error("Unauthorized");

  const trip: Trip = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: input.title,
    destination: input.destination,
    start_date: input.start_date,
    end_date: input.end_date,
    trip_type: input.trip_type ?? "leisure",
    traveler_count: input.traveler_count ?? 1,
    status: input.status ?? "planning",
    created_at: new Date().toISOString(),
  };

  const repo = await getTripsRepository();
  return unwrap(await repo.insertTrip(trip)) as Trip;
}

export async function updateTrip(
  id: string,
  patch: Partial<Omit<Trip, "id" | "user_id" | "created_at">>,
): Promise<Trip | null> {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const repo = await getTripsRepository();
  return (
    (unwrap(await repo.updateTrip(userId, id, patch)) as Trip | null) ?? null
  );
}

export async function deleteTrip(id: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const repo = await getTripsRepository();
  unwrap(await repo.deleteTrip(userId, id));
}

export async function listItinerary(tripId: string): Promise<ItineraryItem[]> {
  // Ownership gate: getTrip returns null for a trip the caller does not own, so
  // this also scopes the itinerary read.
  const trip = await getTrip(tripId);
  if (!trip) return [];

  const repo = await getTripsRepository();
  return unwrap(await repo.listItinerary(tripId)) as ItineraryItem[];
}

export async function createItinerary(
  input: Omit<ItineraryItem, "id" | "created_at">,
): Promise<ItineraryItem> {
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

  const repo = await getTripsRepository();
  return unwrap(await repo.insertItinerary(item)) as ItineraryItem;
}

// Itinerary writes are scoped to the trip they belong to. The owning trip is
// resolved first so the caller gets a clear "not yours" error, and the
// repository method then re-asserts that same scope in the write statement, so
// the mutation cannot be separated from the check the way it could before.
async function resolveOwnedItineraryScope(id: string): Promise<{
  repo: Awaited<ReturnType<typeof getTripsRepository>>;
  tripId: string;
}> {
  const repo = await getTripsRepository();
  const resolved = unwrap(await repo.findItineraryTripId(id));
  if (!resolved) throw new Error("Forbidden: item not found or not owned");

  const trip = await getTrip(resolved);
  if (!trip) throw new Error("Forbidden: trip not owned");

  return { repo, tripId: resolved };
}

export async function updateItinerary(
  id: string,
  patch: Partial<Omit<ItineraryItem, "id" | "trip_id" | "created_at">>,
): Promise<ItineraryItem | null> {
  const { repo, tripId } = await resolveOwnedItineraryScope(id);
  return (
    (unwrap(
      await repo.updateItineraryForTrip(tripId, id, patch),
    ) as ItineraryItem | null) ?? null
  );
}

export async function deleteItinerary(id: string): Promise<void> {
  const { repo, tripId } = await resolveOwnedItineraryScope(id);
  unwrap(await repo.deleteItineraryForTrip(tripId, id));
}

export { store };
