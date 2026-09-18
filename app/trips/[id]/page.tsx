import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, listItinerary } from "@/lib/data/trips";
import { CardWithMedia } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/components/ui/timeline";
import { deleteTripAction, createItineraryAction } from "@/app/trips/actions";
import { ItineraryForm } from "@/components/itinerary-form";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal, StickyHeader, ScrollProgress, Parallax } from "@/components/motion";
import { Plus, Calendar, MapPin, Edit, Trash2, ChevronLeft } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <ScrollProgress color="hsl(var(--clay-ring))" height={3} />
      <StickyHeader>
        <header className="border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="container flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <Link href="/trips" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>All Trips</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <Badge variant="outline" className="capitalize">{trip.status}</Badge>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{trip.trip_type} · {trip.traveler_count} traveler{trip.traveler_count > 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>
        </header>
      </StickyHeader>
      <main className="container py-12 px-4 sm:px-6 lg:px-8">
        <Reveal direction="up" stagger={100}>
          <Parallax speed={0.2} offset={-50}>
            <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-transparent" />
          </Parallax>
          <div className="relative">
            <CardWithMedia
              media={
                <div className="aspect-video bg-gradient-to-br from-primary/20 via-clay-surface to-primary/5 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%270%200%20256%20256%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter%20id=%27noise%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.9%27%20numOctaves=%274%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23noise)%27/%3E%3C/svg%3E')] opacity-5 pointer-events-none" />
                  <div className="relative z-10 p-8 text-center">
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">{trip.title}</h2>
                    <p className="text-muted-foreground mt-2 text-lg">{trip.destination}</p>
                    <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-accent" />
                        <span className="font-mono text-sm">{trip.start_date} → {trip.end_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-accent" />
                        <span className="text-sm capitalize">{trip.trip_type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
              className="p-0"
            >
              <div className="p-6 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Link href={`/trips/${trip.id}/edit`}><Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button></Link>
                  <form action={deleteTripAction.bind(null, trip.id)}>
                    <Button variant="destructive" size="sm" type="submit" aria-label="Delete trip"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                  </form>
                </div>
              </div>
            </CardWithMedia>
          </div>
        </Reveal>

        <Reveal direction="up" delay={100} stagger={100}>
          <div className="mt-10 space-y-8">
            <SectionHeader
              title="Itinerary"
              lede="Add day-by-day items. Grouped by date, sorted by time."
              action={
                <div className="flex gap-2">
                  <Button size="sm" variant="outline"><Calendar className="mr-2 h-4 w-4" /> Today</Button>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
                </div>
              }
            />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Add item</h3>
              <ItineraryForm action={createItineraryAction.bind(null, trip.id) as never} submitLabel="Add to itinerary" />
            </div>

            {items.length === 0 ? (
              <Reveal direction="up">
                <EmptyState
                  illustration={<div className="text-6xl">📅</div>}
                  title="No itinerary items yet"
                  description="Add your first activity above to start building your day-by-day plan."
                  action={{ label: "Add Item", onClick: () => {}, variant: "default" }}
                />
              </Reveal>
            ) : (
              <Reveal direction="up" stagger={50}>
                <div className="space-y-6">
                  {dates.map((date) => {
                    const dayItems = grouped[date];
                    if (!dayItems) return null;
                    return (
                      <div key={date} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-px h-8 bg-accent/30" />
                          <div>
                            <h3 className="font-display text-lg font-semibold text-foreground">{date}</h3>
                            <p className="text-sm text-muted-foreground">{dayItems.length} item{dayItems.length !== 1 ? "s" : ""} scheduled</p>
                          </div>
                        </div>
                        <Timeline
                          items={dayItems.map((it) => ({
                            time: it.time ? it.time.slice(0, 5) : undefined,
                            title: it.activity,
                            description: it.notes ?? undefined,
                            location: it.location ?? undefined,
                          }))}
                        />
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            )}
          </div>
        </Reveal>
      </main>
    </div>
  );
}