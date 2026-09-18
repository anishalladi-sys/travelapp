import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReducedMotion, useScrollPosition } from "@/hooks/use-motion";

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  return {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: vi.fn((cb) => listeners.push(cb)),
    removeListener: vi.fn((cb) => {
      const index = listeners.indexOf(cb);
      if (index > -1) listeners.splice(index, 1);
    }),
    addEventListener: vi.fn((_, cb) => listeners.push(cb as any)),
    removeEventListener: vi.fn((_, cb) => {
      const index = listeners.indexOf(cb as any);
      if (index > -1) listeners.splice(index, 1);
    }),
    dispatchEvent: vi.fn((event) => {
      listeners.forEach((cb) => cb(event));
    }),
  };
};

describe("useReducedMotion", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false when prefers-reduced-motion is not set", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue(mockMatchMedia(false)),
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when prefers-reduced-motion is set", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue(mockMatchMedia(true)),
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("updates when media query changes", () => {
    const mql = mockMatchMedia(false);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue(mql),
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      mql.matches = true;
      mql.dispatchEvent({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });
});

describe("useScrollPosition", () => {
  beforeEach(() => {
    vi.resetModules();
    // Mock document.documentElement.scrollHeight
    Object.defineProperty(document.documentElement, "scrollHeight", {
      writable: true,
      value: 5000,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      value: 1000,
    });
    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 0,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns initial position at top", () => {
    Object.defineProperty(window, "scrollY", { writable: true, value: 0 });
    
    const { result } = renderHook(() => useScrollPosition());
    expect(result.current.y).toBe(0);
    expect(result.current.progress).toBe(0);
    expect(result.current.direction).toBe("down");
  });

  it("calculates progress correctly", () => {
    Object.defineProperty(window, "scrollY", { writable: true, value: 2000 });
    
    const { result } = renderHook(() => useScrollPosition());
    // progress = 2000 / (5000 - 1000) = 0.5
    expect(result.current.progress).toBeCloseTo(0.5, 1);
  });

  it("detects scroll direction (initial)", () => {
    Object.defineProperty(window, "scrollY", { writable: true, value: 100 });
    
    const { result } = renderHook(() => useScrollPosition());
    expect(result.current.direction).toBe("down");
  });

  it("clamps progress between 0 and 1", () => {
    Object.defineProperty(window, "scrollY", { writable: true, value: -100 });
    
    const { result } = renderHook(() => useScrollPosition());
    expect(result.current.progress).toBe(0);

    Object.defineProperty(window, "scrollY", { writable: true, value: 10000 });
    // Note: Hook uses rAF, so progress update requires async flush
    // For testing, we verify the clamp logic via the formula
    const { result: result2 } = renderHook(() => useScrollPosition());
    expect(result2.current.progress).toBe(1);
  });
});