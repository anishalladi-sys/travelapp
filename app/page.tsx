import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardWithMedia } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal, Parallax, StickyHeader, ScrollProgress } from "@/components/motion";
import { Plane, Shield, MapPin } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Plane className="h-8 w-8" />,
      title: "Smart Itinerary",
      description: "Day-by-day timeline with drag-drop reordering, time-based sorting, and location details.",
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Trip Planning",
      description: "Create trips with destinations, dates, travelers, and type. Everything organized in one place.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Private",
      description: "Your data is protected with Supabase RLS. Only you can see your trips and itinerary.",
    },
  ];

  return (
    <div className="min-h-screen bg-clay-surface">
      <ScrollProgress color="hsl(var(--clay-ring))" height={3} />
      <StickyHeader>
        <header className="border-b border-clay-border bg-clay-surface/80 backdrop-blur-sm">
          <div className="container flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-clay-full bg-clay-raised p-2 shadow-clay">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <span className="font-serif text-xl font-bold text-foreground">Travel App</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/trips" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Trips</Link>
              <Link href="/trips/new" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">New Trip</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/trips/new"><Button size="sm"><Plane className="mr-2 h-4 w-4" /> Create Trip</Button></Link>
            </div>
          </div>
        </header>
      </StickyHeader>

      <main className="container py-20 px-4 sm:px-6 lg:px-8">
        <Reveal direction="up" stagger={100}>
          <Parallax speed={0.15}>
            <div className="rounded-clay-lg bg-clay-raised shadow-clay-raised p-12 md:p-20 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-clay-full bg-clay-pressed shadow-clay mx-auto mb-8">
                <Plane className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Plan Your Perfect Journey
              </h1>
              <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                Organize trips, build day-by-day itineraries, and travel with confidence.
                All your travel details in one beautiful, secure place.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/trips/new">
                  <Button size="lg"><Plane className="mr-2 h-5 w-5" /> Start Planning</Button>
                </Link>
                <Link href="/trips">
                  <Button variant="outline" size="lg">View Demo Trips</Button>
                </Link>
              </div>
            </div>
          </Parallax>
        </Reveal>

        <Reveal direction="up" stagger={100}>
          <SectionHeader
            title="Why Travelers Choose Us"
            lede="Built for modern explorers who value simplicity, privacy, and delightful details."
          />
        </Reveal>

        <Reveal direction="up" stagger={150}>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <CardWithMedia key={feature.title} className="group hover:shadow-clay-modal transition-shadow duration-300">
                <div className="flex flex-col items-center text-center p-8">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-clay-full bg-clay-pressed shadow-clay mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-body-md text-muted-foreground">{feature.description}</p>
                </div>
              </CardWithMedia>
            ))}
          </div>
        </Reveal>

        <Reveal direction="up" stagger={100}>
          <div className="mt-16 rounded-clay-lg bg-clay-raised shadow-clay-raised p-8 md:p-12 text-center border border-clay-border">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-body-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Join travelers who plan smarter. Create your first trip in minutes.
            </p>
            <Link href="/trips/new">
              <Button size="xl"><Plane className="mr-2 h-5 w-5" /> Create Your First Trip</Button>
            </Link>
          </div>
        </Reveal>

        <div className="mt-16 pt-8 border-t border-clay-border text-center">
          <p className="text-sm text-muted-foreground">
            Built with Next.js 15, Supabase, and claymorphism design. 
            <Link href="/design" className="text-primary underline-offset-2 hover:underline ml-1">
              View Design System
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}