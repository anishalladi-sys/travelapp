"use client";

import * as React from "react";
import { useReducedMotion, useScrollPosition } from "@/hooks/use-motion";

interface ScrollProgressProps {
  /** Height of progress bar */
  height?: number;
  /** Color (uses CSS variable if not specified) */
  color?: string;
  /** Show as fixed top bar */
  fixed?: boolean;
  /** Custom className */
  className?: string;
  /** Style overrides */
  style?: React.CSSProperties;
}

export function ScrollProgress({
  height = 3,
  color = "hsl(var(--clay-ring))",
  fixed = true,
  className,
  style,
}: ScrollProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const { progress } = useScrollPosition();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        position: fixed ? "fixed" : "absolute",
        top: 0,
        left: 0,
        right: 0,
        height,
        zIndex: 100,
        pointerEvents: "none",
        overflow: "hidden",
        ...style,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          backgroundColor: color,
          transformOrigin: "left center",
          transform: `scaleX(${progress})`,
          transition: prefersReducedMotion ? "none" : "transform 0ms linear",
          willChange: "transform",
        }}
      />
    </div>
  );
}