import * as React from "react";
import { cn } from "@/lib/utils";

export interface TimelineItemProps {
  time?: string;
  title: string;
  description?: string;
  location?: string;
  children?: React.ReactNode;
  marker?: React.ReactNode;
  variant?: "default" | "dashed" | "solid";
  className?: string;
}

export function TimelineItem({ time, title, description, location, children, marker, variant = "default", className }: TimelineItemProps) {
  const connectors = {
    default: "border-l-2 border-clay-border",
    dashed: "border-l-2 border-dashed border-clay-border",
    solid: "border-l-2 border-primary",
  };

  return (
    <div className={cn("relative pl-6 pb-8 last:pb-0", className)}>
      <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center">
        <div className={cn(
          "h-3 w-3 rounded-full border-2 border-clay-raised bg-clay-raised transition-colors shadow-clay",
          "bg-primary border-primary",
          marker && "bg-transparent border-none"
        )}>
          {marker}
        </div>
      </div>
      <div className={cn("absolute left-1 top-7 bottom-0", connectors[variant])} aria-hidden="true" data-testid="timeline-connector" />
      <div className="relative">
        {time && <time className="text-caption text-primary font-medium">{time}</time>}
        <h4 className="text-body-md font-medium text-foreground mt-0.5">{title}</h4>
        {location && <p className="text-body-sm text-muted-foreground flex items-center gap-1 mt-0.5"><span aria-hidden="true">📍</span>{location}</p>}
        {description && <p className="text-body-sm text-muted-foreground mt-1">{description}</p>}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
}

export interface TimelineProps {
  items: Array<{
    time?: string;
    title: string;
    description?: string;
    location?: string;
    marker?: React.ReactNode;
    variant?: "default" | "dashed" | "solid";
  }>;
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)} role="list" aria-label="Timeline">
      {items.map((item, index) => (
        <TimelineItem
          key={`${item.title}-${index}`}
          time={item.time}
          title={item.title}
          description={item.description}
          location={item.location}
          marker={item.marker}
          variant={item.variant}
        />
      ))}
    </div>
  );
}