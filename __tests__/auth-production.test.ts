import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  DEMO_COOKIE,
  DEMO_USER,
  signDemoSession,
  verifyDemoSession,
} from "@/lib/data/demo-session";

const mocks = vi.hoisted(() => ({ jar: new Map<string, string>() }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      mocks.jar.has(name) ? { name, value: mocks.jar.get(name) } : undefined,
    set: (name: string, value: string) => {
      mocks.jar.set(name, value);
    },
  }),
}));

const ENV_KEYS = ["NODE_ENV", "NEXT_PUBLIC_AUTH_MODE"] as const;

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

  it("issues a signed session rather than a bare user id", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");

    await expect(getUserId()).resolves.toBe(DEMO_USER);

    const issued = mocks.jar.get(DEMO_COOKIE);
    expect(issued).toBeDefined();
    expect(issued).not.toBe(DEMO_USER);
    await expect(verifyDemoSession(issued)).resolves.toBe(DEMO_USER);
  });

  it("ignores a forged session cookie and reissues its own", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");
    mocks.jar.set(DEMO_COOKIE, "attacker-chosen-id");

    await expect(getUserId()).resolves.toBe(DEMO_USER);

    const issued = mocks.jar.get(DEMO_COOKIE);
    expect(issued).not.toBe("attacker-chosen-id");
    await expect(verifyDemoSession(issued)).resolves.toBe(DEMO_USER);
  });

  it("keeps a valid session across calls", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");

    await getUserId();
    const first = mocks.jar.get(DEMO_COOKIE);

    await expect(getUserId()).resolves.toBe(DEMO_USER);
    expect(mocks.jar.get(DEMO_COOKIE)).toBe(first);
  });

  it("accepts a session minted for the demo user", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");
    mocks.jar.set(DEMO_COOKIE, await signDemoSession(DEMO_USER));

    await expect(getUserId()).resolves.toBe(DEMO_USER);
    expect(mocks.jar.get(DEMO_COOKIE)).toContain(DEMO_USER);
  });

  it("refuses to resolve any user in production when demo auth is set", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");
    mocks.jar.set(DEMO_COOKIE, "attacker-chosen-id");

    await expect(getUserId()).rejects.toThrow(/production/i);
  });

  it("resolves no user in production when demo auth was never requested", async () => {
    for (const key of ENV_KEYS) {
      if (key === "NODE_ENV") vi.stubEnv("NODE_ENV", "production");
      else vi.stubEnv(key, "");
    }

    await expect(getUserId()).resolves.toBeNull();
  });
});
