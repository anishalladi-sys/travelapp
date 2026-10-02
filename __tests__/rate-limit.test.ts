import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  enforceRateLimit,
  resetRateLimits,
  normalizeEmail,
  MemoryStore,
  configureRateLimitStore,
} from "@/lib/rate-limit";

// The auth server actions had no throttling. These specs pin the behaviour the
// actions depend on before that wiring exists, so a refactor cannot quietly
// widen a limit.

beforeEach(() => {
  resetRateLimits();
  vi.stubEnv("RATE_LIMIT_LOGIN", "");
  vi.stubEnv("RATE_LIMIT_LOGIN_EMAIL", "");
  vi.stubEnv("RATE_LIMIT_MAGIC", "");
  vi.stubEnv("RATE_LIMIT_MAGIC_EMAIL", "");
  vi.stubEnv("RATE_LIMIT_RESET", "");
  vi.stubEnv("RATE_LIMIT_RESET_EMAIL", "");
});

describe("normalizeEmail", () => {
  it("lowercases and trims so casing cannot buy a fresh bucket", () => {
    expect(normalizeEmail("  Anish.Alladi@Gmail.COM ")).toBe(
      "anish.alladi@gmail.com",
    );
  });

  it("treats differently cased addresses as the same caller", () => {
    expect(normalizeEmail("A@B.com")).toBe(normalizeEmail("a@b.com"));
  });
});

describe("enforceRateLimit", () => {
  it("allows attempts below the limit", async () => {
    const results = [];
    for (let i = 0; i < 3; i++) {
      results.push(
        await enforceRateLimit([
          { scope: "login", limit: 5, windowMs: 60_000 },
        ]),
      );
    }

    expect(results.every((r) => r.ok)).toBe(true);
  });

  it("blocks once the limit is exceeded", async () => {
    const rule = { scope: "login", limit: 3, windowMs: 60_000 };
    const decisions = [];
    for (let i = 0; i < 5; i++) {
      decisions.push(await enforceRateLimit([rule]));
    }

    expect(decisions.map((d) => d.ok)).toEqual([
      true,
      true,
      true,
      false,
      false,
    ]);
  });

  it("reports a positive retryAfterSeconds when blocked", async () => {
    const rule = { scope: "login", limit: 1, windowMs: 60_000 };
    await enforceRateLimit([rule]);
    const blocked = await enforceRateLimit([rule]);

    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("keys by email so one attacker cannot spread attempts across many addresses", async () => {
    const rule = {
      scope: "login",
      limit: 2,
      windowMs: 60_000,
      identifier: "victim@x.com",
    };
    const sameTarget = [
      await enforceRateLimit([rule]),
      await enforceRateLimit([rule]),
      await enforceRateLimit([rule]),
    ];
    const otherTarget = await enforceRateLimit([
      { ...rule, identifier: "someone-else@x.com" },
    ]);

    expect(sameTarget.map((d) => d.ok)).toEqual([true, true, false]);
    // A different account still has its own budget...
    expect(otherTarget.ok).toBe(true);
  });

  it("gives different scopes independent budgets", async () => {
    const login = { scope: "login", limit: 1, windowMs: 60_000 };
    await enforceRateLimit([login]);
    await enforceRateLimit([login]);

    const magic = await enforceRateLimit([
      { scope: "magic", limit: 5, windowMs: 60_000 },
    ]);

    expect(magic.ok).toBe(true);
  });

  it("returns the first tripped rule when several are supplied", async () => {
    const decision = await enforceRateLimit([
      { scope: "magic", limit: 10, windowMs: 60_000 },
      { scope: "reset", limit: 0, windowMs: 60_000 },
    ]);

    expect(decision.ok).toBe(false);
    expect(decision.scope).toBe("reset");
  });

  it("honours a limit override from the environment", async () => {
    vi.stubEnv("RATE_LIMIT_LOGIN", "1");
    const rule = { scope: "login", limit: 99, windowMs: 60_000 };

    expect((await enforceRateLimit([rule])).ok).toBe(true);
    expect((await enforceRateLimit([rule])).ok).toBe(false);
  });

  it("starts a fresh window after the old one expires", async () => {
    vi.useFakeTimers();
    const rule = { scope: "login", limit: 1, windowMs: 1000 };

    expect((await enforceRateLimit([rule])).ok).toBe(true);
    expect((await enforceRateLimit([rule])).ok).toBe(false);

    vi.advanceTimersByTime(1500);

    expect((await enforceRateLimit([rule])).ok).toBe(true);
    vi.useRealTimers();
  });
});

describe("store seam", () => {
  it("can be swapped for a shared store without touching call sites", async () => {
    const original = new MemoryStore();
    configureRateLimitStore(original);

    const shared = new MemoryStore();
    configureRateLimitStore(shared);

    await enforceRateLimit([{ scope: "login", limit: 5, windowMs: 60_000 }]);

    // The new store received the hit.
    const blocked = await enforceRateLimit([
      { scope: "login", limit: 0, windowMs: 60_000 },
    ]);
    expect(blocked.ok).toBe(false);

    // ...and the old one is untouched.
    shared.clear();
    const afterClear = await enforceRateLimit([
      { scope: "login", limit: 5, windowMs: 60_000 },
    ]);
    expect(afterClear.ok).toBe(true);
  });
});
