import { describe, it, expect } from "vitest";
import { resolveDemoSession } from "@/lib/data/demo-cookie";
import {
  DEMO_COOKIE,
  DEMO_USER,
  verifyDemoSession,
} from "@/lib/data/demo-session";

// Middleware is the only place on the read path that can write a cookie, so the
// signed demo session is issued there. The data layer only ever verifies.

describe("resolveDemoSession", () => {
  it("issues a session when none is present", async () => {
    const session = await resolveDemoSession(undefined);

    expect(session.shouldSet).toBe(true);
    expect(session.userId).toBe(DEMO_USER);
    await expect(verifyDemoSession(session.value)).resolves.toBe(DEMO_USER);
  });

  it("never stores a bare user id as the cookie value", async () => {
    const session = await resolveDemoSession(undefined);

    expect(session.value).not.toBe(DEMO_USER);
    expect(session.value).toContain(".");
  });

  it("reuses a valid session instead of reissuing", async () => {
    const issued = await resolveDemoSession(undefined);
    const second = await resolveDemoSession(issued.value);

    expect(second.shouldSet).toBe(false);
    expect(second.value).toBe(issued.value);
    expect(second.userId).toBe(DEMO_USER);
  });

  it("replaces a forged cookie with one of its own", async () => {
    const session = await resolveDemoSession("attacker-chosen-id");

    expect(session.shouldSet).toBe(true);
    expect(session.userId).toBe(DEMO_USER);
    expect(session.value).not.toBe("attacker-chosen-id");
  });

  it("replaces a cookie whose signature was tampered with", async () => {
    const issued = await resolveDemoSession(undefined);
    const signature = issued.value.slice(issued.value.lastIndexOf(".") + 1);

    const session = await resolveDemoSession(`someone-else.${signature}`);

    expect(session.shouldSet).toBe(true);
    expect(session.userId).toBe(DEMO_USER);
  });

  it("replaces an empty cookie value", async () => {
    const session = await resolveDemoSession("");

    expect(session.shouldSet).toBe(true);
  });

  it("does not use the legacy unsigned cookie name", () => {
    expect(DEMO_COOKIE).not.toBe("travelapp_user_id");
  });
});
