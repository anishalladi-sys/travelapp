import { describe, it, expect, afterEach, vi } from "vitest";
import { readSupabaseEnv } from "@/lib/supabase/env";

// middleware.ts ran unconditionally, so with no Supabase configured -- the
// documented quick-start path in README.md -- @supabase/ssr threw "Your
// project's URL and Key are required" on every request and the whole site
// 500'd. Verified against a live dev server.
//
// In production the same absence is a misconfiguration rather than a mode, so
// it has to fail loudly instead of degrading to an ephemeral in-memory store.

const ENV_KEYS = [
  "NODE_ENV",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

function stubEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string>>) {
  for (const key of ENV_KEYS) {
    if (key in values) vi.stubEnv(key, values[key] as string);
    else vi.stubEnv(key, "");
  }
}

describe("readSupabaseEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports configured when both values are present in development", () => {
    stubEnv({
      NODE_ENV: "development",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });

    expect(readSupabaseEnv()).toEqual({
      configured: true,
      url: "https://example.supabase.co",
      anonKey: "anon-key",
    });
  });

  it("reports configured in production", () => {
    stubEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });

    expect(readSupabaseEnv().configured).toBe(true);
  });

  it("reports unconfigured in development so the request passes through", () => {
    stubEnv({ NODE_ENV: "development" });

    expect(readSupabaseEnv()).toEqual({
      configured: false,
      reason: "missing-env",
    });
  });

  it("reports a hard failure when unconfigured in production", () => {
    stubEnv({ NODE_ENV: "production" });

    expect(readSupabaseEnv()).toEqual({
      configured: false,
      reason: "missing-env-in-production",
    });
  });

  it("treats a half-configured pair as unconfigured", () => {
    stubEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    });

    expect(readSupabaseEnv().configured).toBe(false);
  });

  it("treats empty strings as absent rather than as credentials", () => {
    stubEnv({
      NODE_ENV: "development",
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    });

    expect(readSupabaseEnv().configured).toBe(false);
  });

  it("trims surrounding whitespace off supplied values", () => {
    stubEnv({
      NODE_ENV: "development",
      NEXT_PUBLIC_SUPABASE_URL: "  https://example.supabase.co  ",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "  anon-key  ",
    });

    expect(readSupabaseEnv()).toEqual({
      configured: true,
      url: "https://example.supabase.co",
      anonKey: "anon-key",
    });
  });
});
