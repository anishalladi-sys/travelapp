"use client";

import * as React from "react";
import { useReducedMotion, useInViewport } from "@/hooks/use-motion";

interface StickyHeaderProps {
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Style overrides */
  style?: React.CSSProperties;
  /** Callback when sticky state changes */
  onStickyChange?: (isSticky: boolean) => void;
}

export function StickyHeader({
  children,
  className,
  style,
  onStickyChange,
}: StickyHeaderProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isSticky, setIsSticky] = React.useState(false);
  const [setElement, entry] = useInViewport("-1px");

  // Update sticky state based on intersection
  React.useEffect(() => {
    if (!entry) return;
    const sticking = entry.intersectionRatio < 1;
    setIsSticky(sticking);
    onStickyChange?.(sticking);
  }, [entry, onStickyChange]);

  // If reduced motion, just use position: sticky without transitions
  if (prefersReducedMotion) {
    return (
      <div
        ref={setElement}
        className={className}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={setElement}
      className={className}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        transition: "box-shadow 150ms ease-out, background-color 150ms ease-out",
        boxShadow: isSticky ? "4px 4px 8px hsl(var(--clay-shadow) / 0.15), -4px -4px 8px hsl(var(--clay-highlight) / 0.9), 0 0 0 1px hsl(var(--clay-border))" : "none",
        backgroundColor: isSticky ? "hsl(var(--clay-surface) / 0.95)" : "transparent",
        backdropFilter: isSticky ? "blur(8px)" : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}