import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-black py-16 px-6">
      <main className="w-full max-w-2xl rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Travel App</h1>
        <p className="mt-2 text-zinc-600">Capture trips and day-by-day itinerary — all in one place per trip.</p>
        <p className="mt-1 text-sm text-zinc-500">v1: Trip Basics + Itinerary. Backlog (accommodation, transport, budget, docs, packing, POI, emergency, media) → v2.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/trips"><Button>View trips</Button></Link>
          <Link href="/trips/new" className="inline-flex h-10 items-center rounded-md border px-4 text-sm">Create trip</Link>
        </div>
      </main>
    </div>
  );
}
