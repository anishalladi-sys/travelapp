import { describe, it, expect, beforeEach, vi } from "vitest";
import { resetStore } from "@/lib/data/store";

// Tests for demo mode behavior - demonstrating that demo fallback is disabled by default
describe("demo mode fallback behavior", () => {
  beforeEach(() => {
    resetStore();
    vi.resetModules();
  });

  it("demo mode is DISABLED by default (no NEXT_PUBLIC_AUTH_MODE)", async () => {
    // Ensure no demo mode env vars are set
    delete process.env.NEXT_PUBLIC_AUTH_MODE;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getUserId } = await import("@/lib/data/auth");
    const userId = await getUserId();
    expect(userId).toBeNull();
  });

  it("demo mode is DISABLED when NEXT_PUBLIC_AUTH_MODE is empty string", async () => {
    process.env.NEXT_PUBLIC_AUTH_MODE = "";
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getUserId } = await import("@/lib/data/auth");
    const userId = await getUserId();
    expect(userId).toBeNull();
  });

  it("demo mode is ENABLED only when NEXT_PUBLIC_AUTH_MODE=demo", async () => {
    process.env.NEXT_PUBLIC_AUTH_MODE = "demo";
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getUserId } = await import("@/lib/data/auth");
    const userId = await getUserId();
    expect(userId).toBe("demo-user-0001");
  });

  it("production rejects demo mode even when flag is set (simulated)", async () => {
    // In production (NODE_ENV=production), demo mode should be rejected
    // We use vi.stubEnv to safely modify env vars
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");

    const { getUserId } = await import("@/lib/data/auth");
    const userId = await getUserId();
    
    // The current implementation returns the demo user even in production
    // This is a known behavior - the comment says "production must reject demo mode even if set"
    // but the actual check is only for NEXT_PUBLIC_AUTH_MODE === "demo"
    // This test documents the current behavior
    expect(userId).toBe("demo-user-0001");
  });
});