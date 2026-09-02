import Link from "next/link";
import { listTrips } from "@/lib/data/trips";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const trips = await listTrips();
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your trips</h1>
        <Link href="/trips/new"><Button>Create trip</Button></Link>
      </div>
      {trips.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-zinc-600">No trips yet.</p>
          <p className="text-sm text-zinc-500 mt-1">Create your first trip to start building your itinerary.</p>
          <Link href="/trips/new" className="inline-flex mt-4 h-10 items-center rounded-md bg-black px-4 text-sm text-white">Create trip</Link>
        </div>
      ) : (
        <ul className="grid gap-4">
          {trips.map((t) => (
            <li key={t.id}>
              <Link href={`/trips/${t.id}`}>
                <Card className="hover:bg-zinc-50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{t.title}</span>
                      <span className="text-xs font-normal rounded-full bg-zinc-100 px-2 py-1 capitalize">{t.status}</span>
                    </CardTitle>
                  </CardHeader>
                  <div className="text-sm text-zinc-600">
                    <div>{t.destination} · {t.start_date} → {t.end_date}</div>
                    <div className="text-xs text-zinc-500 mt-1 capitalize">{t.trip_type} · {t.traveler_count} traveler{t.traveler_count > 1 ? "s" : ""}</div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="text-xs text-zinc-400 border-t pt-4">Authz: you only see your own trips. Server-side RLS + ownership check on every mutation.</div>
    </div>
  );
}
