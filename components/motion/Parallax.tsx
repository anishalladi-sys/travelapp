"use client";

import * as React from "react";
import { useReducedMotion, useScrollPosition } from "@/hooks/use-motion";

interface ParallaxProps {
  children: React.ReactNode;
  /** Parallax speed (0-1). 0 = no movement, 1 = moves at scroll speed */
  speed?: number;
  /** Offset start position */
  offset?: number;
  /** Custom className */
  className?: string;
  /** Style overrides */
  style?: React.CSSProperties;
}

export function Parallax({
  children,
  speed = 0.3,
  offset = 0,
  className,
  style,
}: ParallaxProps) {
  const prefersReducedMotion = useReducedMotion();
  const { y: scrollY } = useScrollPosition();
  const elementRef = React.useRef<HTMLDivElement>(null);

  // Calculate transform using rAF for smooth animation
  // When reduced motion is preferred, use identity transform (no parallax)
  const transform = React.useMemo(() => {
    if (prefersReducedMotion) {
      return { transform: "translate3d(0, 0, 0)" };
    }
    const translateY = (scrollY + offset) * speed;
    return { transform: `translate3d(0, ${translateY}px, 0)` };
  }, [scrollY, speed, offset, prefersReducedMotion]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        ...style,
        willChange: prefersReducedMotion ? "auto" : "transform",
        ...transform,
      }}
    >
      {children}
    </div>
  );
}