import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip } from "@/lib/data/trips";
import { updateTripAction } from "@/app/trips/actions";
import { TripForm } from "@/components/trip-form";

export const dynamic = "force-dynamic";

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) notFound();
  const bound = updateTripAction.bind(null, id);
  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <Link href={`/trips/${id}`} className="text-sm text-zinc-600 hover:underline">← Back to trip</Link>
      <h1 className="text-2xl font-semibold">Edit trip</h1>
      <TripForm
        action={bound as never}
        submitLabel="Save changes"
        defaultValues={{
          title: trip.title,
          destination: trip.destination,
          start_date: trip.start_date,
          end_date: trip.end_date,
          trip_type: trip.trip_type,
          traveler_count: String(trip.traveler_count),
          status: trip.status,
        }}
      />
    </div>
  );
}
