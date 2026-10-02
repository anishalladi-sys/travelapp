import { headers } from "next/headers";

/**
 * Fixed-window rate limiting for the authentication server actions.
 *
 * Why this exists: `loginAction`, `signupAction`, `magicLinkAction` and
 * `resetPasswordRequestAction` had no throttling of any kind. `/login` accepted
 * unlimited password guesses and `/auth/reset-password` could be used to
 * enumerate which email addresses have accounts by watching the response
 * difference. Both are OWASP A07 (identification and authentication failures).
 *
 * ## Storage caveat -- read this before deploying to more than one instance
 *
 * The default store is an in-process `Map`. That is deliberate and honest:
 *   - it is correct and sufficient for local development and single-instance
 *     deployments, with no new dependency and no schema change;
 *   - it is NOT sufficient for serverless or multi-instance deployment, where
 *     every cold start gets an empty map and concurrent requests land on
 *     different instances. On Vercel this limiter will therefore be far weaker
 *     than the numbers below suggest.
 *
 * To make it real in production, swap `MemoryStore` for a shared store (Upstash
 * Redis, Vercel KV, or a Supabase table). `RateLimitStore` is the seam: supply
 * a different `store` to `configureRateLimitStore()` and nothing else changes.
 */

export interface RateLimitDecision {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets. Only meaningful when ok is false. */
  retryAfterSeconds: number;
  /** Which limiter tripped, for internal logging. */
  scope: string;
}

export interface RateLimitStore {
  hit(
    key: string,
    windowMs: number,
    now: number,
  ): { count: number; resetAt: number };
  clear(): void;
}

/**
 * Fixed-window counter. Deliberately not a sliding window: a fixed window can
 * permit up to 2x the limit across a window boundary, which is an acceptable
 * trade for a limiter whose job is to make brute force impractical rather than
 * to meter traffic precisely.
 */
export class MemoryStore implements RateLimitStore {
  private buckets = new Map<string, { count: number; resetAt: number }>();

  hit(key: string, windowMs: number, now: number) {
    const existing = this.buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      const fresh = { count: 1, resetAt: now + windowMs };
      this.buckets.set(key, fresh);
      return fresh;
    }
    existing.count += 1;
    return existing;
  }

  clear() {
    this.buckets.clear();
  }
}

// Held on globalThis so Next's dev-mode module reloading does not reset the
// counters on every edit, which would make local testing useless.
const globalRef = globalThis as typeof globalThis & {
  __travelAppRateLimitStore?: RateLimitStore;
};

let store: RateLimitStore =
  globalRef.__travelAppRateLimitStore ??
  (globalRef.__travelAppRateLimitStore = new MemoryStore());

export function configureRateLimitStore(next: RateLimitStore) {
  store = next;
  globalRef.__travelAppRateLimitStore = next;
}

/** Test-only. Clears every counter. */
export function resetRateLimits() {
  store.clear();
}

const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;

export interface RateLimitRule {
  /** Short label used in logs and error messages. */
  scope: string;
  /** Unique part of the key, normally an email address or route name. */
  identifier: string;
  limit: number;
  windowMs: number;
}

/**
 * Best-effort client IP. `x-forwarded-for` is a comma-separated chain appended to
 * by each proxy; the left-most entry is the original client. On Vercel/Cloudflare
 * this is trustworthy because the platform overwrites the header. Locally there
 * is no proxy, so it falls back to a constant -- which is correct, since a local
 * single user should not be rate limited against a whole office NAT.
 */
export async function getClientIp(): Promise<string> {
  try {
    const requestHeaders = await headers();
    const forwarded = requestHeaders.get("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
    const realIp = requestHeaders.get("x-real-ip");
    if (realIp) return realIp;
  } catch {
    // headers() throws outside a request scope (e.g. a unit test invoking the
    // action directly). Falling through to the constant is the safe choice.
  }
  return "unknown";
}

/** Normalises an email so casing/whitespace cannot be used to get a fresh bucket. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Resolves the effective limit, allowing an operator to tune it per environment
 * without a deploy.
 *
 * An empty-string override must fall back to the code default rather than to 0.
 * `Number("")` is 0, not NaN, so `process.env.X ?? fallback` would silently turn
 * any blanked-out variable into "block everything". Only a value that actually
 * parses as a positive integer is honoured.
 */
function resolveLimit(scope: string, fallback: number): number {
  const raw = process.env[`RATE_LIMIT_${scope.toUpperCase()}`];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

/**
 * Checks every rule and returns the first that trips. Passing all rules keeps
 * the caller honest: adding a rule is one array entry.
 */
export async function enforceRateLimit(
  rules: Array<Omit<RateLimitRule, "identifier"> & { identifier?: string }>,
): Promise<RateLimitDecision> {
  const ip = await getClientIp();
  const now = Date.now();

  for (const rule of rules) {
    const identifier = rule.identifier ?? ip;
    const { count, resetAt } = store.hit(
      `${rule.scope}:${ip}:${normalizeEmail(identifier)}`,
      rule.windowMs,
      now,
    );
    const limit = resolveLimit(rule.scope, rule.limit);
    if (count > limit) {
      return {
        ok: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
        scope: rule.scope,
      };
    }
  }

  return { ok: true, remaining: 0, retryAfterSeconds: 0, scope: "" };
}

/**
 * Fixed message shown to the user. It deliberately does not include the scope or
 * the remaining count, so the response cannot be used as an oracle for how close
 * a limit is to tripping, nor to distinguish which limiter fired.
 */
export function tooManyAttemptsMessage(): string {
  return "Too many attempts. Please wait a few minutes and try again.";
}
