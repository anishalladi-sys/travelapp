import { createTripAction } from "@/app/trips/actions";
import { TripForm } from "@/components/trip-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewTripPage() {
  return (
    <div className="min-h-screen bg-clay-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/trips" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Trips</span>
          </Link>
        </div>
        <div className="rounded-clay-lg border border-clay-border bg-clay-raised p-8 shadow-clay-raised">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">Create Trip</h1>
          <TripForm action={createTripAction as never} submitLabel="Create Trip" />
        </div>
      </div>
    </div>
  );
}