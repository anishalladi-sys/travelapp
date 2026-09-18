"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect `prefers-reduced-motion` media query.
 * Returns true if the user prefers reduced motion.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to track scroll position and progress.
 * Returns { y: scrollY, progress: 0-1, direction: 'up' | 'down' }
 */
export function useScrollPosition(): {
  y: number;
  progress: number;
  direction: "up" | "down";
} {
  const [state, setState] = useState({ y: 0, progress: 0, direction: "down" as "up" | "down" });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastY = -1;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(Math.max(y / maxScroll, 0), 1) : 0;
      const direction = y > lastY ? "down" : "up";
      lastY = y;
      setState({ y, progress, direction });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // initial
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return state;
}

/**
 * Hook to check if an element is in viewport (for StickyHeader active state).
 * Returns a ref setter and the current IntersectionObserverEntry.
 */
export function useInViewport(rootMargin = "0px"): [
  (element: Element | null) => void,
  IntersectionObserverEntry | null
] {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([observedEntry]) => {
        if (observedEntry) setEntry(observedEntry);
      },
      { rootMargin, threshold: [0, 0.5, 1] }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, rootMargin]);

  return [setElement, entry];
}