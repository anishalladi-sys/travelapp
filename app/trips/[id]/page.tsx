import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, listItinerary } from "@/lib/data/trips";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteTripAction, createItineraryAction } from "@/app/trips/actions";
import { ItineraryForm } from "@/components/itinerary-form";
import { ItineraryItemRow } from "@/components/itinerary-item-row";

export const dynamic = "force-dynamic";

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) notFound();
  const items = await listItinerary(id);

  // group by date
  const grouped = items.reduce<Record<string, typeof items>>((acc, it) => {
    (acc[it.date] ??= []).push(it);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort();

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <Link href="/trips" className="text-sm text-zinc-600 hover:underline">← All trips</Link>

      <Card className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{trip.title}</h1>
            <p className="text-zinc-600">{trip.destination} · {trip.start_date} → {trip.end_date}</p>
            <p className="text-xs text-zinc-500 capitalize mt-1">{trip.trip_type} · {trip.traveler_count} traveler{trip.traveler_count > 1 ? "s" : ""} · {trip.status}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href={`/trips/${trip.id}/edit`}><Button variant="outline" size="sm">Edit</Button></Link>
            <form action={deleteTripAction.bind(null, trip.id)}>
              <Button variant="destructive" size="sm" type="submit" aria-label="Delete trip">Delete</Button>
            </form>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Itinerary</h2>
        <p className="text-sm text-zinc-500">Add day-by-day items. Grouped by date, sorted by time.</p>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Add item</h3>
          <ItineraryForm action={createItineraryAction.bind(null, trip.id) as never} submitLabel="Add to itinerary" />
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-zinc-500">No itinerary items yet. Add your first activity above.</div>
        ) : (
          <div className="space-y-6">
            {dates.map((date) => {
              const dayItems = grouped[date];
              if (!dayItems) return null;
              return (
                <div key={date} className="space-y-2">
                  <h3 className="text-sm font-semibold bg-zinc-100 px-3 py-1 rounded-md">{date}</h3>
                  <ul className="space-y-2">
                    {dayItems.map((it) => (
                      <ItineraryItemRow key={it.id} item={it} tripId={trip.id} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}