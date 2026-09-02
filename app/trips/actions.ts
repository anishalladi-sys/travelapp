"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { tripSchema, tripUpdateSchema } from "@/lib/validations/trip";
import { itinerarySchema, itineraryUpdateSchema } from "@/lib/validations/itinerary";
import { createTrip, updateTrip, deleteTrip, createItinerary, updateItinerary, deleteItinerary } from "@/lib/data/trips";

export async function createTripAction(_prev: unknown, formData: FormData) {
  const raw = {
    title: String(formData.get("title") ?? ""),
    destination: String(formData.get("destination") ?? ""),
    start_date: String(formData.get("start_date") ?? ""),
    end_date: String(formData.get("end_date") ?? ""),
    trip_type: String(formData.get("trip_type") ?? "leisure"),
    traveler_count: String(formData.get("traveler_count") ?? "1"),
    status: String(formData.get("status") ?? "planning"),
  };
  const parsed = tripSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  const trip = await createTrip(parsed.data);
  revalidatePath("/trips");
  redirect(`/trips/${trip.id}`);
}

export async function updateTripAction(id: string, _prev: unknown, formData: FormData) {
  const raw: Record<string, unknown> = {};
  for (const k of ["title", "destination", "start_date", "end_date", "trip_type", "traveler_count", "status"]) {
    const v = formData.get(k);
    if (v !== null && String(v).length > 0) raw[k] = String(v);
  }
  if (raw["traveler_count"]) raw["traveler_count"] = String(raw["traveler_count"]);
  const parsed = tripUpdateSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  const updated = await updateTrip(id, parsed.data as never);
  if (!updated) return { error: "Trip not found or not owned" };
  revalidatePath("/trips");
  revalidatePath(`/trips/${id}`);
  redirect(`/trips/${id}`);
}

export async function deleteTripAction(id: string) {
  await deleteTrip(id);
  revalidatePath("/trips");
  redirect("/trips");
}

export async function createItineraryAction(tripId: string, _prev: unknown, formData: FormData) {
  const raw = {
    trip_id: tripId,
    date: String(formData.get("date") ?? ""),
    time: String(formData.get("time") ?? ""),
    activity: String(formData.get("activity") ?? ""),
    location: String(formData.get("location") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
  const parsed = itinerarySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  const cleaned = { ...parsed.data, time: parsed.data.time || null, location: parsed.data.location || null, notes: parsed.data.notes || null };
  await createItinerary(cleaned as never);
  revalidatePath(`/trips/${tripId}`);
  return { ok: true };
}

export async function updateItineraryAction(id: string, tripId: string, _prev: unknown, formData: FormData) {
  const raw: Record<string, unknown> = {};
  for (const k of ["date", "time", "activity", "location", "notes"]) {
    const v = formData.get(k);
    if (v !== null) raw[k] = String(v);
  }
  if (raw["time"] === "") raw["time"] = null;
  if (raw["location"] === "") raw["location"] = null;
  if (raw["notes"] === "") raw["notes"] = null;
  const parsed = itineraryUpdateSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  const updated = await updateItinerary(id, parsed.data as never);
  if (!updated) return { error: "Item not found or not owned" };
  revalidatePath(`/trips/${tripId}`);
  return { ok: true };
}

export async function deleteItineraryAction(id: string, tripId: string) {
  await deleteItinerary(id);
  revalidatePath(`/trips/${tripId}`);
}
