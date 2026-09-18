"use client";

import * as React from "react";
import Link from "next/link";
import { ScrollProgress, StickyHeader, Reveal, Parallax, TimelineProgress } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardWithMedia } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { Timeline } from "@/components/ui/timeline";
import { useReducedMotion, useScrollPosition, useInViewport } from "@/hooks/use-motion";
import {
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Sun,
  LayoutDashboard,
  Palette,
  Zap,
  ScrollText,
  Layers,
  Grid,
  Sparkles,
  Menu,
  X as XIcon,
} from "lucide-react";

const colors = [
  { name: "Background", token: "--background", light: "#faf6f0", dark: "#1a1816", usage: "Page background" },
  { name: "Foreground", token: "--foreground", light: "#1a1816", dark: "#faf6f0", usage: "Primary text" },
  { name: "Muted", token: "--muted", light: "#e8e0d4", dark: "#2a2622", usage: "Secondary backgrounds" },
  { name: "Muted Foreground", token: "--muted-foreground", light: "#5a5248", dark: "#a8a094", usage: "Secondary text" },
  { name: "Accent", token: "--accent", light: "#c4724a", dark: "#d48a5e", usage: "Primary actions, links" },
  { name: "Accent Foreground", token: "--accent-foreground", light: "#ffffff", dark: "#1a1816", usage: "Text on accent" },
  { name: "Card", token: "--card", light: "#ffffff", dark: "#22201e", usage: "Card backgrounds" },
  { name: "Card Foreground", token: "--card-foreground", light: "#1a1816", dark: "#faf6f0", usage: "Card text" },
  { name: "Border", token: "--border", light: "#d4c8b8", dark: "#3a3430", usage: "Borders, dividers" },
  { name: "Ring", token: "--ring", light: "#c4724a", dark: "#d48a5e", usage: "Focus rings" },
  { name: "Destructive", token: "--destructive", light: "#b33a3a", dark: "#d45a5a", usage: "Errors, dangerous actions" },
];

const typeScale = [
  { name: "display-xl", value: "clamp(2.5rem, 5vw, 4rem)", usage: "Hero headlines" },
  { name: "display-lg", value: "clamp(2rem, 4vw, 3rem)", usage: "Section headers" },
  { name: "display-md", value: "clamp(1.5rem, 3vw, 2rem)", usage: "Card titles" },
  { name: "display-sm", value: "clamp(1.25rem, 2.5vw, 1.5rem)", usage: "Subsection headers" },
  { name: "body-lg", value: "1.125rem / 1.7", usage: "Lead paragraphs" },
  { name: "body", value: "1rem / 1.6", usage: "Default body" },
  { name: "body-sm", value: "0.875rem / 1.5", usage: "Captions, meta" },
  { name: "caption", value: "0.75rem / 1.4", usage: "Fine print" },
];

const spacingScale = [
  { name: "space-1", value: "0.25rem (4px)" },
  { name: "space-2", value: "0.5rem (8px)" },
  { name: "space-3", value: "0.75rem (12px)" },
  { name: "space-4", value: "1rem (16px)" },
  { name: "space-5", value: "1.25rem (20px)" },
  { name: "space-6", value: "1.5rem (24px)" },
  { name: "space-8", value: "2rem (32px)" },
  { name: "space-10", value: "2.5rem (40px)" },
  { name: "space-12", value: "3rem (48px)" },
  { name: "space-16", value: "4rem (64px)" },
  { name: "space-20", value: "5rem (80px)" },
  { name: "space-24", value: "6rem (96px)" },
];

const radii = [
  { name: "radius-sm", value: "0.25rem (4px)" },
  { name: "radius", value: "0.5rem (8px) — default" },
  { name: "radius-md", value: "0.75rem (12px)" },
  { name: "radius-lg", value: "1rem (16px)" },
  { name: "radius-full", value: "9999px" },
];

const shadows = [
  { name: "shadow-sm", value: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
  { name: "shadow", value: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)" },
  { name: "shadow-md", value: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" },
  { name: "shadow-lg", value: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
  { name: "shadow-xl", value: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" },
];

function ColorSwatch({ name, token, light, dark, usage }: typeof colors[0]) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
      <div className="flex gap-2">
        <div className="w-16 h-10 rounded border border-border" style={{ backgroundColor: light }} title={`Light: ${light}`} />
        <div className="w-16 h-10 rounded border border-border" style={{ backgroundColor: dark }} title={`Dark: ${dark}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground">{name}</div>
        <div className="text-sm text-muted-foreground font-mono">{token}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{usage}</div>
      </div>
      <div className="text-right">
        <div className="text-xs text-muted-foreground">Light</div>
        <div className="text-xs text-muted-foreground">Dark</div>
      </div>
    </div>
  );
}

function TypeScaleRow({ name, value, usage }: typeof typeScale[0]) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
      <div className="w-32 font-mono text-sm text-muted-foreground">{name}</div>
      <div className="w-48 font-mono text-sm text-foreground">{value}</div>
      <div className="flex-1 text-sm text-muted-foreground">{usage}</div>
      <div className="px-4 py-2 bg-muted rounded font-sans" style={{ fontSize: value.split(" ")[0], lineHeight: value.split("/")[1]?.trim() || "1.5" }}>
        The quick brown fox jumps over the lazy dog.
      </div>
    </div>
  );
}

function SpacingRow({ name, value }: typeof spacingScale[0]) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
      <div className="w-24 font-mono text-sm text-muted-foreground">{name}</div>
      <div className="w-40 font-mono text-sm text-foreground">{value}</div>
      <div className="flex-1 h-2 bg-muted rounded-full relative">
        <div className="h-full bg-accent rounded-full" style={{ width: `${parseFloat(value) * 16}px` }} />
      </div>
    </div>
  );
}

function RadiusRow({ name, value }: typeof radii[0]) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
      <div className="w-28 font-mono text-sm text-muted-foreground">{name}</div>
      <div className="w-36 font-mono text-sm text-foreground">{value}</div>
      <div className="w-16 h-16 bg-accent/20 border border-accent flex items-center justify-center" style={{ borderRadius: value.split(" ")[0] }} />
    </div>
  );
}

function ShadowRow({ name, value }: typeof shadows[0]) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
      <div className="w-24 font-mono text-sm text-muted-foreground">{name}</div>
      <div className="flex-1 font-mono text-xs text-foreground">{value}</div>
      <div className="w-32 h-20 bg-white dark:bg-card border border-border" style={{ boxShadow: value }} />
    </div>
  );
}

function SectionHeaderWrapper({ icon, title, description, action, children }: { icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-2">
        {icon && <span className="text-accent">{icon}</span>}
        <SectionHeader title={title} lede={description} action={action} />
      </div>
      <div className="mt-6">{children}</div>
    </Card>
  );
}

function ButtonDemo() {
  return (
    <SectionHeaderWrapper
      icon={<Grid className="h-5 w-5 text-accent" />}
      title="Button"
      description="All variants, sizes, and states"
      action={<Badge variant="outline" size="sm">Primitive</Badge>}
    >
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Variants</h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="default"><Plus className="mr-2 h-4 w-4" /> Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive"><AlertCircle className="mr-2 h-4 w-4" /> Destructive</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Sizes</h4>
          <div className="flex items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
            <Button size="icon"><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">States</h4>
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
        </div>
      </div>
    </SectionHeaderWrapper>
  );
}

function CardDemo() {
  return (
    <SectionHeaderWrapper
      icon={<LayoutDashboard className="h-5 w-5 text-accent" />}
      title="Card"
      description="Base card and CardWithMedia for media-rich content"
      action={<Badge variant="outline" size="sm">Primitive</Badge>}
    >
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <h4 className="font-medium text-foreground mb-2">Basic Card</h4>
          <p className="text-muted-foreground text-sm mb-4">Content goes here. Cards have consistent padding, border radius, and shadow.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Action</Button>
            <Button size="sm" variant="ghost">Cancel</Button>
          </div>
        </Card>
        <CardWithMedia
          media={<div className="aspect-video bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center"><Zap className="h-12 w-12 text-accent" /></div>}
          className="p-0"
        >
          <div className="p-6">
            <h4 className="font-medium text-foreground mb-2">Card with Media</h4>
            <p className="text-muted-foreground text-sm">Media header with content below. Great for trip cards, destination previews.</p>
          </div>
        </CardWithMedia>
      </div>
    </SectionHeaderWrapper>
  );
}

function InputDemo() {
  return (
    <SectionHeaderWrapper
      icon={<Grid className="h-5 w-5 text-accent" />}
      title="Input & Field"
      description="Form inputs with labels, descriptions, error states"
      action={<Badge variant="outline" size="sm">Primitive</Badge>}
    >
      <div className="mt-6 space-y-6 max-w-md">
        <div className="space-y-2">
          <label htmlFor="demo-email" className="block text-sm font-medium text-foreground">Email Address</label>
          <p className="text-sm text-muted-foreground">We&apos;ll never share your email.</p>
          <Input id="demo-email" type="email" placeholder="you@example.com" className="mt-1" />
        </div>
        <div className="space-y-2">
          <label htmlFor="demo-destination" className="block text-sm font-medium text-foreground">Destination</label>
          <p className="text-sm text-muted-foreground">Where are you headed?</p>
          <Input id="demo-destination" placeholder="Paris, France" className="mt-1 border-destructive" aria-invalid="true" />
          <p className="text-sm text-destructive">Destination is required</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="demo-start-date" className="block text-sm font-medium text-foreground">Travel Dates</label>
          <p className="text-sm text-muted-foreground">Start and end dates for your trip</p>
          <div className="grid gap-2 sm:grid-cols-2 mt-1">
            <Input id="demo-start-date" type="date" />
            <Input id="demo-end-date" type="date" />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="demo-notes" className="block text-sm font-medium text-foreground">Notes</label>
          <p className="text-sm text-muted-foreground">Optional notes about your trip</p>
          <textarea id="demo-notes" className="w-full min-h-[80px] p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors mt-1" placeholder="Add notes..." />
        </div>
      </div>
    </SectionHeaderWrapper>
  );
}

function BadgeDemo() {
  return (
    <SectionHeaderWrapper
      icon={<Palette className="h-5 w-5 text-accent" />}
      title="Badge"
      description="Status indicators, tags, and labels"
      action={<Badge variant="outline" size="sm">Primitive</Badge>}
    >
      <div className="mt-6 flex flex-wrap gap-3">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="accent">Accent</Badge>
        <Badge variant="success"><CheckCircle className="mr-1.5 h-3 w-3" /> Success</Badge>
        <Badge variant="warning"><AlertCircle className="mr-1.5 h-3 w-3" /> Warning</Badge>
        <Badge variant="destructive"><X className="mr-1.5 h-3 w-3" /> Error</Badge>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {["Planning", "Upcoming", "Ongoing", "Completed", "Cancelled"].map((status) => (
          <Badge key={status} variant={status === "Ongoing" ? "success" : status === "Completed" ? "default" : "outline"}>
            {status}
          </Badge>
        ))}
      </div>
    </SectionHeaderWrapper>
  );
}

function DialogDemo() {
  return (
    <SectionHeaderWrapper
      icon={<Layers className="h-5 w-5 text-accent" />}
      title="Dialog & Sheet"
      description="Modal dialogs and mobile bottom sheets"
      action={<Badge variant="outline" size="sm">Primitive</Badge>}
    >
      <div className="mt-6 space-y-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>This action cannot be undone. Please confirm you want to proceed.</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost">Cancel</Button>
              <Button variant="destructive">Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
        <p className="text-sm text-muted-foreground">Sheet component works identically but slides from bottom on mobile.</p>
      </div>
    </SectionHeaderWrapper>
  );
}

function EmptyStateDemo() {
  return (
    <SectionHeaderWrapper
      icon={<Sparkles className="h-5 w-5 text-accent" />}
      title="EmptyState"
      description="Consistent empty states with illustrations and actions"
      action={<Badge variant="outline" size="sm">Primitive</Badge>}
    >
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <EmptyState
          illustration={<LayoutDashboard className="h-12 w-12 text-muted-foreground" />}
          title="No trips yet"
          description="Start planning your next adventure by creating your first trip."
          action={{ label: "Create Trip", onClick: () => {}, variant: "default" }}
        />
        <EmptyState
          illustration={<AlertCircle className="h-12 w-12 text-muted-foreground" />}
          title="No results found"
          description="Try adjusting your search or filter criteria."
          action={{ label: "Clear Filters", onClick: () => {}, variant: "outline" }}
        />
      </div>
    </SectionHeaderWrapper>
  );
}

function SectionHeaderDemo() {
  return (
    <SectionHeaderWrapper
      icon={<ScrollText className="h-5 w-5 text-accent" />}
      title="SectionHeader"
      description="Consistent section headers with optional actions"
      action={<Badge variant="outline" size="sm">Primitive</Badge>}
    >
      <div className="mt-6 space-y-6">
        <SectionHeader title="Upcoming Trips" lede="Your next adventures await" />
        <SectionHeader
          title="Itinerary"
          lede="Day-by-day breakdown of your trip"
          action={<Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Item</Button>}
        />
        <SectionHeader
          title="Accommodations"
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="outline">Filter</Button>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add</Button>
            </div>
          }
        />
      </div>
    </SectionHeaderWrapper>
  );
}

function TimelineDemo() {
  const items = [
    { time: "08:00", title: "Flight to Paris", location: "CDG Airport", notes: "AF 1234 • 2h 30m" },
    { time: "11:30", title: "Check into Hotel", location: "Le Marais District", notes: "Hotel Le Marais • 3 nights" },
    { time: "14:00", title: "Lunch at Café de Flore", location: "Saint-Germain", notes: "Classic French bistro" },
    { time: "16:30", title: "Louvre Museum Visit", location: "1st Arrondissement", notes: "Pre-booked tickets • 3 hours" },
    { time: "20:00", title: "Dinner at Septime", location: "11th Arrondissement", notes: "Michelin starred • Reservation 8pm" },
  ];

  return (
    <SectionHeaderWrapper
      icon={<ScrollText className="h-5 w-5 text-accent" />}
      title="Timeline"
      description="Vertical timeline with dots, connectors, and time badges"
      action={<Badge variant="outline" size="sm">Primitive</Badge>}
    >
      <div className="mt-6">
        <Timeline items={items} />
      </div>
    </SectionHeaderWrapper>
  );
}

function MotionDemo() {
  const prefersReducedMotion = useReducedMotion();
  const { y: scrollY, progress, direction } = useScrollPosition();
  const [stickyRef, stickyEntry] = useInViewport("-1px");
  const isSticky = stickyEntry?.intersectionRatio !== undefined && stickyEntry.intersectionRatio < 1;

  const timelineItems = [
    { id: "1", date: "Day 1", title: "Arrival in Tokyo" },
    { id: "2", date: "Day 2", title: "Shibuya & Harajuku" },
    { id: "3", date: "Day 3", title: "Mt. Fuji Day Trip" },
    { id: "4", date: "Day 4", title: "Kyoto Temples" },
    { id: "5", date: "Day 5", title: "Departure" },
  ];

  const activeTimelineId = "2";

  return (
    <div className="space-y-16">
      <Reveal direction="up" stagger={100}>
        <SectionHeaderWrapper
          icon={<Zap className="h-5 w-5 text-accent" />}
          title="Motion Utilities"
          description="Scroll-triggered animations, parallax, sticky headers, progress indicators"
          action={<Badge variant="outline" size="sm">Motion</Badge>}
        >
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-3xl font-display font-bold text-foreground">{scrollY.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Scroll Y (px)</div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-3xl font-display font-bold text-foreground">{(progress * 100).toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Scroll Progress</div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-3xl font-display font-bold text-foreground capitalize">{direction}</div>
              <div className="text-sm text-muted-foreground">Scroll Direction</div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Badge variant={prefersReducedMotion ? "success" : "outline"}>
                {prefersReducedMotion ? "Reduced Motion: ON" : "Reduced Motion: OFF"}
              </Badge>
              <Badge variant={isSticky ? "success" : "outline"}>
                {isSticky ? "Sticky: ACTIVE" : "Sticky: INACTIVE"}
              </Badge>
            </div>
            <div className="mt-4 h-20 bg-background border border-border rounded" ref={stickyRef} />
          </div>
        </SectionHeaderWrapper>
      </Reveal>

      <Reveal direction="up" delay={100}>
        <SectionHeaderWrapper
          icon={<Sparkles className="h-5 w-5 text-accent" />}
          title="Reveal Animations"
          description="Fade/slide/scale in on scroll with stagger support"
          action={<Badge variant="outline" size="sm">Motion</Badge>}
        >
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {["up", "down", "left", "right", "scale", "none"].map((dir) => (
              <Reveal key={dir} direction={dir as "up" | "down" | "left" | "right" | "scale" | "none"} delay={100}>
                <Card className="p-6 text-center h-full">
                  <div className="text-2xl font-display font-bold text-foreground capitalize">{dir}</div>
                  <p className="text-sm text-muted-foreground mt-2">Direction: {dir}</p>
                </Card>
              </Reveal>
            ))}
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Staggered Children (100ms delay each)</h4>
            <Reveal direction="up" stagger={100}>
              <div className="grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-6 text-center">
                    <div className="text-lg font-semibold text-foreground">Item {i + 1}</div>
                    <p className="text-sm text-muted-foreground mt-1">Staggered reveal</p>
                  </Card>
                ))}
              </div>
            </Reveal>
          </div>
        </SectionHeaderWrapper>
      </Reveal>

      <Reveal direction="up" delay={200}>
        <SectionHeaderWrapper
          icon={<Layers className="h-5 w-5 text-accent" />}
          title="Parallax Effect"
          description="Subtle layered movement on scroll"
          action={<Badge variant="outline" size="sm">Motion</Badge>}
        >
          <div className="mt-6 relative h-64 overflow-hidden rounded-lg">
            <Parallax speed={0.4} offset={-100}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-background to-accent/30 flex items-center justify-center">
                <div className="text-center p-8">
                  <Zap className="h-16 w-16 text-accent mx-auto mb-4" />
                  <h3 className="font-display text-2xl font-bold text-foreground">Parallax Layer</h3>
                  <p className="text-muted-foreground mt-2">Scroll to see subtle movement</p>
                </div>
              </div>
            </Parallax>
          </div>
        </SectionHeaderWrapper>
      </Reveal>

      <Reveal direction="up" delay={300}>
        <SectionHeaderWrapper
          icon={<ScrollText className="h-5 w-5 text-accent" />}
          title="Timeline Progress"
          description="Animated progress line for multi-step flows"
          action={<Badge variant="outline" size="sm">Motion</Badge>}
        >
          <div className="mt-6">
            <TimelineProgress items={timelineItems} activeId={activeTimelineId} />
          </div>
        </SectionHeaderWrapper>
      </Reveal>
    </div>
  );
}

function HooksDemo() {
  const prefersReducedMotion = useReducedMotion();
  const { y, progress, direction } = useScrollPosition();
  const [ref, entry] = useInViewport("100px");

  return (
    <SectionHeaderWrapper
      icon={<Zap className="h-5 w-5 text-accent" />}
      title="Motion Hooks"
      description="Low-level hooks for custom scroll/motion logic"
      action={<Badge variant="outline" size="sm">Hooks</Badge>}
    >
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-mono text-xs text-muted-foreground mb-2">useReducedMotion()</h4>
          <div className="text-2xl font-display font-bold text-foreground">{prefersReducedMotion ? "true" : "false"}</div>
          <p className="text-sm text-muted-foreground mt-1">Respects OS preference</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-mono text-xs text-muted-foreground mb-2">useScrollPosition()</h4>
          <div className="space-y-1 text-sm">
            <div><span className="text-muted-foreground">y: </span><span className="font-mono text-foreground">{y.toFixed(0)}px</span></div>
            <div><span className="text-muted-foreground">progress: </span><span className="font-mono text-foreground">{(progress * 100).toFixed(1)}%</span></div>
            <div><span className="text-muted-foreground">direction: </span><span className="font-mono text-foreground capitalize">{direction}</span></div>
          </div>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-mono text-xs text-muted-foreground mb-2">useInViewport()</h4>
          <div className="space-y-1 text-sm">
            <div><span className="text-muted-foreground">isIntersecting: </span><span className="font-mono text-foreground">{entry?.isIntersecting ? "true" : "false"}</span></div>
            <div><span className="text-muted-foreground">intersectionRatio: </span><span className="font-mono text-foreground">{(entry?.intersectionRatio ?? 0).toFixed(2)}</span></div>
            <div><span className="text-muted-foreground">boundingClientRect: </span><span className="font-mono text-foreground">{entry?.boundingClientRect ? `${entry.boundingClientRect.top.toFixed(0)}px` : "N/A"}</span></div>
          </div>
          <div className="mt-3 h-20 bg-background border border-border rounded" ref={ref} />
        </div>
      </div>
    </SectionHeaderWrapper>
  );
}

function ScrollProgressDemo() {
  return (
    <SectionHeaderWrapper
      icon={<ScrollText className="h-5 w-5 text-accent" />}
      title="ScrollProgress"
      description="Top progress bar bound to scroll position"
      action={<Badge variant="outline" size="sm">Motion</Badge>}
    >
      <div className="mt-6">
        <ScrollProgress color="hsl(var(--accent))" height={3} />
        <p className="text-sm text-muted-foreground mt-3">Scroll this page to see the progress bar at the top. Hidden when reduced motion is enabled.</p>
      </div>
    </SectionHeaderWrapper>
  );
}

function StickyHeaderDemo() {
  return (
    <div className="space-y-6">
      <SectionHeaderWrapper
        icon={<Layers className="h-5 w-5 text-accent" />}
        title="StickyHeader"
        description="Section header that becomes sticky with shadow/blur on scroll"
        action={<Badge variant="outline" size="sm">Motion</Badge>}
      >
        <div className="mt-6">
          <StickyHeader onStickyChange={(sticky) => console.log("Sticky:", sticky)}>
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="font-display text-lg font-semibold text-foreground">Sticky Section Header</h3>
              <Badge variant="accent">Scroll Down</Badge>
            </div>
          </StickyHeader>
        </div>
      </SectionHeaderWrapper>
      <div className="space-y-4" style={{ height: "400px" }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="p-4">
            <p className="text-muted-foreground">Content block {i + 1} — scroll to trigger sticky header</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <ScrollProgress color="hsl(var(--accent))" height={3} />
      
      <StickyHeader>
        <header className="border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="container flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Palette className="h-8 w-8 text-accent" />
              <span className="font-display text-xl font-bold text-foreground">Design System</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#tokens" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tokens</a>
              <a href="#primitives" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Primitives</a>
              <a href="#motion" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Motion</a>
              <a href="#hooks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Hooks</a>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 px-4">
              <nav className="flex flex-col gap-2">
                <a href="#tokens" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tokens</a>
                <a href="#primitives" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Primitives</a>
                <a href="#motion" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Motion</a>
                <a href="#hooks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Hooks</a>
              </nav>
            </div>
          )}
        </header>
      </StickyHeader>

      <main className="container py-12 px-4 sm:px-6 lg:px-8" id="main-content">
        <Reveal direction="up">
          <section className="mb-16">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
                Editorial Travel Design System
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A cohesive design system for travel applications — warm paper tones, serif display headlines,
                soft cards, grainy textures, and performant scroll animations.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 text-center">
                <Palette className="h-10 w-10 text-accent mx-auto mb-3" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">Design Tokens</h3>
                <p className="text-sm text-muted-foreground">Colors, typography, spacing, radii, shadows</p>
              </Card>
              <Card className="p-6 text-center">
                <Grid className="h-10 w-10 text-accent mx-auto mb-3" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">Primitives</h3>
                <p className="text-sm text-muted-foreground">9 accessible components on shadcn/ui</p>
              </Card>
              <Card className="p-6 text-center">
                <Zap className="h-10 w-10 text-accent mx-auto mb-3" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">Motion</h3>
                <p className="text-sm text-muted-foreground">Scroll animations, parallax, progress</p>
              </Card>
            </div>
          </section>
        </Reveal>

        <Reveal direction="up" delay={100}>
          <section id="tokens" className="mb-16">
            <SectionHeader title="Design Tokens" lede="Single source of truth for all visual design decisions" action={<Badge variant="accent">v01.1</Badge>} />
            
            <div className="mt-8 space-y-12">
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><Palette className="h-4 w-4 text-accent" /></span>
                  Color Palette
                </h3>
                <div className="space-y-3">
                  {colors.map((color) => (
                    <ColorSwatch key={color.name} {...color} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><ScrollText className="h-4 w-4 text-accent" /></span>
                  Type Scale
                </h3>
                <div className="space-y-3">
                  {typeScale.map((scale) => (
                    <TypeScaleRow key={scale.name} {...scale} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><Layers className="h-4 w-4 text-accent" /></span>
                  Spacing Scale
                </h3>
                <div className="space-y-3">
                  {spacingScale.map((space) => (
                    <SpacingRow key={space.name} {...space} />
                  ))}
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><LayoutDashboard className="h-4 w-4 text-accent" /></span>
                    Border Radius
                  </h3>
                  <div className="space-y-3">
                    {radii.map((radius) => (
                      <RadiusRow key={radius.name} {...radius} />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><Sun className="h-4 w-4 text-accent" /></span>
                    Shadows
                  </h3>
                  <div className="space-y-3">
                    {shadows.map((shadow) => (
                      <ShadowRow key={shadow.name} {...shadow} />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><Sparkles className="h-4 w-4 text-accent" /></span>
                  Grain Texture
                </h3>
                <Card className="p-8 relative overflow-hidden before:grain before:absolute before:inset-0 before:pointer-events-none">
                  <div className="relative z-10 text-center">
                    <p className="text-muted-foreground mb-4">This card has the grain texture applied via <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">before:grain</code></p>
                    <div className="text-4xl font-display font-bold text-foreground">✨</div>
                    <p className="text-sm text-muted-foreground mt-2">Subtle paper-like texture for editorial feel</p>
                  </div>
                </Card>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal direction="up" delay={200}>
          <section id="primitives" className="mb-16">
            <SectionHeader title="Core Primitives" lede="9 accessible components built on shadcn/ui + Radix" action={<Badge variant="accent">v01.2</Badge>} />
            <div className="mt-8 space-y-8">
              <ButtonDemo />
              <CardDemo />
              <InputDemo />
              <BadgeDemo />
              <DialogDemo />
              <EmptyStateDemo />
              <SectionHeaderDemo />
              <TimelineDemo />
            </div>
          </section>
        </Reveal>

        <Reveal direction="up" delay={300}>
          <section id="motion" className="mb-16">
            <SectionHeader title="Scroll & Motion" lede="Performant scroll animations respecting reduced motion" action={<Badge variant="accent">v01.3</Badge>} />
            <div className="mt-8 space-y-8">
              <MotionDemo />
              <ScrollProgressDemo />
              <StickyHeaderDemo />
            </div>
          </section>
        </Reveal>

        <Reveal direction="up" delay={400}>
          <section id="hooks" className="mb-16">
            <SectionHeader title="Motion Hooks" lede="Low-level hooks for custom scroll-triggered logic" action={<Badge variant="accent">Hooks</Badge>} />
            <div className="mt-8">
              <HooksDemo />
            </div>
          </section>
        </Reveal>

        <Reveal direction="up" delay={500}>
          <section className="mb-16">
            <SectionHeader title="Accessibility Checklist" lede="WCAG 2.2 AA baseline verified" action={<Badge variant="success">A11y</Badge>} />
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: CheckCircle, title: "Semantic HTML", desc: "Landmarks, heading hierarchy" },
                { icon: Palette, title: "Color Contrast", desc: "≥ 4.5:1 normal, ≥ 3:1 large" },
                { icon: Zap, title: "Focus Visible", desc: "2px ring, 2px offset" },
                { icon: LayoutDashboard, title: "Keyboard Nav", desc: "All interactive elements reachable" },
                { icon: Info, title: "ARIA Labels", desc: "Forms, dialogs, icon-only buttons" },
                { icon: ScrollText, title: "Reduced Motion", desc: "Global prefers-reduced-motion respect" },
                { icon: Grid, title: "Screen Reader", desc: "NVDA/VoiceOver tested" },
                { icon: Layers, title: "Form Validation", desc: "aria-describedby, aria-invalid" },
                { icon: Sparkles, title: "Touch Targets", desc: "Minimum 44×44px" },
              ].map((item, i) => (
                <Reveal key={item.title} direction="up" delay={i * 50} stagger={50}>
                  <Card className="p-6 h-full">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal direction="up" delay={600}>
          <section className="mb-16">
            <SectionHeader title="Usage Examples" lede="How to import and use in your pages" action={<Badge variant="accent">Docs</Badge>} />
            <div className="mt-8 space-y-8">
              <Card className="p-6">
                <h4 className="font-medium text-foreground mb-4">Import Pattern</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono text-foreground"><code>{`// Primitives
import { Button } from '@/components/ui/button';
import { Card, CardWithMedia } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

// Motion
import { Reveal, Parallax, StickyHeader, ScrollProgress } from '@/components/motion';

// Hooks
import { useReducedMotion, useScrollPosition, useInViewport } from '@/hooks/use-motion`}</code></pre>
              </Card>
              <Card className="p-6">
                <h4 className="font-medium text-foreground mb-4">Page Template</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono text-foreground"><code>{`export default function TripDetailPage({ params }) {
  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <StickyHeader>
        <TripHeader trip={trip} />
      </StickyHeader>
      <main className="container py-12">
        <Reveal direction="up" stagger={100}>
          <ItineraryList items={itinerary} />
        </Reveal>
      </main>
    </div>
  );
}`}</code></pre>
              </Card>
            </div>
          </section>
        </Reveal>
      </main>

      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Travel App Design System — Built with Next.js 15, Tailwind, shadcn/ui
            </p>
            <div className="flex items-center gap-4">
              <Link href="/trips" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                View Trips App
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}