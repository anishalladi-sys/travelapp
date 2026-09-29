import { describe, it, expect, afterEach, vi } from "vitest";
import {
  DEMO_COOKIE,
  DEMO_USER,
  assertDemoAuthAllowed,
  isDemoAuthRequested,
  signDemoSession,
  verifyDemoSession,
} from "@/lib/data/demo-session";

describe("demo auth is refused in production", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when demo auth is requested in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");

    expect(() => assertDemoAuthAllowed()).toThrow(/production/i);
  });

  it("names the offending variable in the failure", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");

    expect(() => assertDemoAuthAllowed()).toThrow(/NEXT_PUBLIC_AUTH_MODE/);
  });

  it("does not throw in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "demo");

    expect(() => assertDemoAuthAllowed()).not.toThrow();
  });

  it("is a no-op when demo auth was never requested", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "");

    expect(isDemoAuthRequested()).toBe(false);
    expect(() => assertDemoAuthAllowed()).not.toThrow();
  });
});

describe("demo session cookie cannot be forged", () => {
  it("round-trips a session it issued", async () => {
    const token = await signDemoSession(DEMO_USER);
    await expect(verifyDemoSession(token)).resolves.toBe(DEMO_USER);
  });

  it("rejects a client-authored cookie with no signature", async () => {
    // The pre-fix behaviour: this exact value was returned verbatim as the user id.
    await expect(verifyDemoSession("attacker-chosen-id")).resolves.toBeNull();
  });

  it("rejects a signed-looking cookie with a tampered user id", async () => {
    const token = await signDemoSession(DEMO_USER);
    const signature = token.slice(token.lastIndexOf(".") + 1);

    await expect(
      verifyDemoSession(`someone-else.${signature}`),
    ).resolves.toBeNull();
  });

  it("rejects a signed cookie whose signature is garbage", async () => {
    await expect(
      verifyDemoSession(`${DEMO_USER}.not-a-signature`),
    ).resolves.toBeNull();
  });

  it("rejects a signature of the right shape that was not produced here", async () => {
    const forged = `${DEMO_USER}.${"A".repeat(43)}`;

    await expect(verifyDemoSession(forged)).resolves.toBeNull();
  });

  it("rejects an empty or missing cookie", async () => {
    await expect(verifyDemoSession(undefined)).resolves.toBeNull();
    await expect(verifyDemoSession("")).resolves.toBeNull();
  });

  it("does not reuse the legacy unsigned cookie name", () => {
    // The old cookie was client-controlled and is no longer read.
    expect(DEMO_COOKIE).not.toBe("travelapp_user_id");
  });
});
