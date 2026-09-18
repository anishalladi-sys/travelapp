"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-motion";

interface RevealProps {
  children: React.ReactNode;
  /** Animation direction */
  direction?: "up" | "down" | "left" | "right" | "scale" | "none";
  /** Delay in ms before starting animation */
  delay?: number;
  /** Stagger delay for children (ms) */
  stagger?: number;
  /** Threshold for intersection observer */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Only animate once (unobserve after reveal) */
  once?: boolean;
  /** Custom className */
  className?: string;
  /** Style overrides */
  style?: React.CSSProperties;
}

const directionStyles: Record<string, React.CSSProperties> = {
  up: { transform: "translateY(30px)", opacity: 0 },
  down: { transform: "translateY(-30px)", opacity: 0 },
  left: { transform: "translateX(30px)", opacity: 0 },
  right: { transform: "translateX(-30px)", opacity: 0 },
  scale: { transform: "scale(0.95)", opacity: 0 },
  none: { opacity: 0 },
};

const revealedStyle: React.CSSProperties = {
  transform: "translateY(0) translateX(0) scale(1)",
  opacity: 1,
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  stagger = 0,
  threshold = 0.1,
  rootMargin = "0px",
  once = true,
  className,
  style,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver effect - always runs, but does nothing when reduced motion
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, prefersReducedMotion]);

  const baseStyle: React.CSSProperties = {
    transition: `opacity 600ms ease-out, transform 600ms ease-out`,
    transitionDelay: `${delay}ms`,
    ...directionStyles[direction],
    ...style,
  };

  const visibleStyle: React.CSSProperties = {
    ...baseStyle,
    ...revealedStyle,
  };

  // When reduced motion, show content immediately without animation
  const effectiveStyle = prefersReducedMotion
    ? { ...style, opacity: 1, transform: "none", transition: "none" }
    : isVisible
    ? visibleStyle
    : baseStyle;

  // Handle stagger for children
  const childrenWithStagger = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    
    const childDelay = delay + index * stagger;
    const childStyle = prefersReducedMotion
      ? { opacity: 1, transform: "none", transition: "none" }
      : isVisible
      ? { ...revealedStyle, transitionDelay: `${childDelay}ms` }
      : directionStyles[direction];
    
    return React.cloneElement(child as React.ReactElement, {
      style: {
        ...(child as React.ReactElement).props.style,
        ...childStyle,
        transition: `opacity 600ms ease-out, transform 600ms ease-out`,
      },
    });
  });

  return (
    <div
      ref={elementRef}
      className={className}
      style={effectiveStyle}
    >
      {stagger > 0 ? childrenWithStagger : children}
    </div>
  );
}