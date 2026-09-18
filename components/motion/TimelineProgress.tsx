"use client";

import * as React from "react";
import { useReducedMotion, useScrollPosition } from "@/hooks/use-motion";

interface TimelineProgressProps {
  /** Timeline items for progress calculation */
  items: Array<{ id: string; date: string }>;
  /** Current active item id */
  activeId?: string;
  /** Height of the progress line */
  lineWidth?: number;
  /** Color of the progress line */
  color?: string;
  /** Custom className */
  className?: string;
  /** Style overrides */
  style?: React.CSSProperties;
}

export function TimelineProgress({
  items,
  activeId,
  lineWidth = 2,
  color = "hsl(var(--clay-ring))",
  className,
  style,
}: TimelineProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const { progress } = useScrollPosition();

  // Calculate progress based on active item or scroll
  const itemProgress = React.useMemo(() => {
    if (!activeId || items.length === 0) return 0;
    const index = items.findIndex((item) => item.id === activeId);
    if (index === -1) return 0;
    return (index + 1) / items.length;
  }, [activeId, items]);

  const displayProgress = activeId ? itemProgress : progress;

  if (prefersReducedMotion) {
    return (
      <div
        className={className}
        style={{
          width: "100%",
          height: lineWidth,
          backgroundColor: "hsl(var(--clay-border))",
          borderRadius: lineWidth / 2,
          overflow: "hidden",
          ...style,
        }}
        aria-hidden="true"
      >
        <div
          style={{
            width: `${displayProgress * 100}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: lineWidth / 2,
            transition: "width 0ms",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: lineWidth,
        backgroundColor: "hsl(var(--clay-border))",
        borderRadius: lineWidth / 2,
        overflow: "hidden",
        ...style,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: `${displayProgress * 100}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: lineWidth / 2,
          transformOrigin: "left center",
          transform: `scaleX(${displayProgress})`,
          transition: "transform 300ms ease-out",
          willChange: "transform",
        }}
      />
    </div>
  );
}