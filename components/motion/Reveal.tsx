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
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, prefersReducedMotion]);

  // Transition and delay are emitted inline on every render. The hidden start
  // state (opacity 0, offset transform) is intentionally NOT in the inline
  // style -- it is applied by the `.reveal-hidden` class, which the stylesheet
  // gates behind `html.js`. That means the server HTML carries the same style
  // and the same class on every pass, so there is no hydration mismatch, and a
  // JS-disabled browser never hides the content at all.
  const transitionStyle: React.CSSProperties = {
    transition: `opacity 600ms ease-out, transform 600ms ease-out`,
    transitionDelay: `${delay}ms`,
  };

  const baseHidden: React.CSSProperties = {
    ...transitionStyle,
    ...style,
  };

  const revealed: React.CSSProperties = {
    ...transitionStyle,
    ...revealedStyle,
    ...style,
  };

  const hideInitial = !prefersReducedMotion && !isVisible;

  const effectiveStyle = prefersReducedMotion
    ? { ...style, opacity: 1, transform: "none", transition: "none" }
    : isVisible
      ? revealed
      : baseHidden;

  const wrapperClass = [className, hideInitial && "reveal-hidden"]
    .filter(Boolean)
    .join(" ");

  // Handle stagger for children
  const childrenWithStagger = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;

    const childDelay = delay + index * stagger;
    const childTransition: React.CSSProperties = {
      transition: `opacity 600ms ease-out, transform 600ms ease-out`,
      transitionDelay: `${childDelay}ms`,
    };

    const hideChild = !prefersReducedMotion && !isVisible;
    const childVisible = prefersReducedMotion
      ? ({
          opacity: 1,
          transform: "none",
          transition: "none",
        } as React.CSSProperties)
      : { ...childTransition, ...revealedStyle };

    const existingClass = (child.props as { className?: string }).className;
    const childClassName = [existingClass, hideChild && "reveal-hidden"]
      .filter(Boolean)
      .join(" ");

    return React.cloneElement(
      child as React.ReactElement,
      {
        style: hideChild ? childTransition : childVisible,
        className: childClassName || undefined,
        // data-direction drives which offset transform the CSS applies. It is only
        // meaningful while the child is hidden (before reveal); harmless otherwise.
        ...(hideChild ? { "data-direction": direction } : {}),
      } as React.Attributes,
    );
  });

  return (
    <div
      ref={elementRef}
      className={wrapperClass || undefined}
      style={effectiveStyle}
      {...(hideInitial ? { "data-direction": direction } : {})}
    >
      {stagger > 0 ? childrenWithStagger : children}
    </div>
  );
}
