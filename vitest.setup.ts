import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@/app/globals.css";

// The data layer selects its backend at call time from ambient env
// (lib/data/trips.ts `hasSupabase`). Vitest never loads `.env.local`, so a
// developer shell and CI disagree about which backend is under test: CI injects
// NEXT_PUBLIC_SUPABASE_* into the test job, which flips unit tests onto the
// Supabase path, where `cookies()` from next/headers is unavailable outside a
// request scope. The harness owns that decision so no individual test file has
// to delete these vars itself. A test may still opt in by setting them locally.
process.env.NEXT_PUBLIC_SUPABASE_URL = "";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// jsdom implements neither ResizeObserver nor IntersectionObserver, and Radix
// primitives (@radix-ui/react-use-size via Checkbox, Select, Popover) subscribe
// to ResizeObserver in a layout effect. Without a stub every test that mounts
// a Radix-based component throws "ResizeObserver is not defined" and fails for
// a reason that has nothing to do with the code under test.
class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: MockObserver,
});

Object.defineProperty(globalThis, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: MockObserver,
});

if (typeof globalThis.IntersectionObserver === "undefined") {
  class MockIntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: readonly number[] = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
  Object.defineProperty(globalThis, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, "localStorage", {
  writable: true,
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
  createServerClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
}));
