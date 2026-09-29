import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  DEMO_COOKIE,
  DEMO_USER,
  signDemoSession,
} from "@/lib/data/demo-session";

const mocks = vi.hoisted(() => ({ jar: new Map<string, string>() }));

// A Server Component render can read cookies but never write them -- Next throws
// on set outside a request/handler/action context. The double therefore exposes
// only `get`, so a test cannot assert against a capability that does not exist
// at this layer. Cookie issuance is middleware's job; see demo-cookie.test.ts.
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      mocks.jar.has(name) ? { name, value: mocks.jar.get(name) } : undefined,
  }),
}));

async function getUserId(): Promise<string | null> {
  const { getUserId: resolve } = await import("@/lib/data/auth");
  return resolve();
}

describe("getUserId demo fallback", () => {
  beforeEach(() => {
    mocks.jar.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves the shared demo user with no cookie present", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");

    await expect(getUserId()).resolves.toBe(DEMO_USER);
  });

  it("ignores a forged session cookie", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");
    mocks.jar.set(DEMO_COOKIE, "attacker-chosen-id");

    await expect(getUserId()).resolves.toBe(DEMO_USER);
  });

  it("ignores a signed-looking cookie with a tampered user id", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");
    mocks.jar.set(DEMO_COOKIE, `${DEMO_USER}.${"A".repeat(43)}`);

    await expect(getUserId()).resolves.toBe(DEMO_USER);
  });

  it("accepts a session minted for the demo user", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");
    mocks.jar.set(DEMO_COOKIE, await signDemoSession(DEMO_USER));

    await expect(getUserId()).resolves.toBe(DEMO_USER);
  });

  it("refuses to resolve any user in production when demo auth is set", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");
    mocks.jar.set(DEMO_COOKIE, "attacker-chosen-id");

    await expect(getUserId()).rejects.toThrow(/production/i);
  });

  it("resolves no user in production when demo auth was never requested", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "");

    await expect(getUserId()).resolves.toBeNull();
  });

  it("never writes a cookie from this layer", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");

    await getUserId();

    expect(mocks.jar.has(DEMO_COOKIE)).toBe(false);
  });
});
