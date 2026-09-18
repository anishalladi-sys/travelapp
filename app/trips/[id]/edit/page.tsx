import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip } from "@/lib/data/trips";
import { updateTripAction } from "@/app/trips/actions";
import { TripForm } from "@/components/trip-form";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) notFound();
  const bound = updateTripAction.bind(null, id);
  return (
    <div className="min-h-screen bg-clay-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center justify-between">
          <Link href={`/trips/${id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Trip</span>
          </Link>
        </div>
        <div className="rounded-clay-lg border border-clay-border bg-clay-raised p-8 shadow-clay-raised">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">Edit Trip</h1>
          <TripForm
            action={bound as never}
            submitLabel="Save Changes"
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
      </div>
    </div>
  );
}