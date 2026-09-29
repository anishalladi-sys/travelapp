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

  it("production rejects demo mode even when the flag is set", async () => {
    // Demo auth resolves every visitor to one shared identity, so a production
    // deploy that still has the flag set is a live auth bypass, not a dormant
    // setting. It must fail loudly rather than degrade quietly.
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");

    const { getUserId } = await import("@/lib/data/auth");
    await expect(getUserId()).rejects.toThrow(/production/i);
  });

  it("demo mode stays enabled in a non-production runtime", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");

    const { getUserId } = await import("@/lib/data/auth");
    await expect(getUserId()).resolves.toBe("demo-user-0001");
  });
});
