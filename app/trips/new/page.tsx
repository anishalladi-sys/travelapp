import { createTripAction } from "@/app/trips/actions";
import { TripForm } from "@/components/trip-form";
import Link from "next/link";

export default function NewTripPage() {
  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <Link href="/trips" className="text-sm text-zinc-600 hover:underline">← Back to trips</Link>
      <h1 className="text-2xl font-semibold">Create trip</h1>
      <TripForm action={createTripAction as never} submitLabel="Create trip" />
    </div>
  );
}
