import Link from "next/link";
import { listTrips } from "@/lib/data/trips";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/user-menu";
import { Reveal, StickyHeader, ScrollProgress } from "@/components/motion";
import { Plus, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const trips = await listTrips();
  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress color="hsl(var(--accent))" height={3} />
      <StickyHeader>
        <header className="border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="container flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-xl font-bold text-foreground">Your Trips</h1>
            <div className="flex items-center gap-4">
              <UserMenu />
              <Link href="/trips/new"><Button><Plus className="mr-2 h-4 w-4" /> Create Trip</Button></Link>
            </div>
          </div>
        </header>
      </StickyHeader>
      <main className="container py-12 px-4 sm:px-6 lg:px-8">
        <Reveal direction="up" stagger={100}>
          <SectionHeader
            title="Your Trips"
            lede={trips.length === 0 ? "Start planning your next adventure" : `${trips.length} trip${trips.length !== 1 ? "s" : ""} planned`}
            action={<Link href="/trips/new"><Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Trip</Button></Link>}
          />
          <div className="mt-6">
            {trips.length === 0 ? (
              <EmptyState
                illustration={<div className="text-6xl">🧳</div>}
                title="No trips yet"
                description="Create your first trip to start building your itinerary."
                action={{ label: "Create Trip", onClick: () => { window.location.href = "/trips/new"; }, variant: "default" }}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trips.map((t) => (
                  <Reveal key={t.id} direction="up" delay={50}>
                    <Link href={`/trips/${t.id}`}>
                      <Card className="group p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-accent/30 h-full">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display text-lg font-semibold text-foreground truncate">{t.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{t.destination}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0 capitalize">{t.status}</Badge>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{t.start_date}</span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                            <span className="font-mono">{t.end_date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="capitalize">{t.trip_type}</span>
                            <span className="text-muted-foreground/50">·</span>
                            <span>{t.traveler_count} traveler{t.traveler_count > 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Authz: you only see your own trips. Server-side RLS + ownership check on every mutation.
            </p>
          </div>
        </Reveal>
      </main>
    </div>
  );
}