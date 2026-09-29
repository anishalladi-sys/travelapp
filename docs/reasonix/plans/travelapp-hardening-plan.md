# Travel App — Hardening Plan

**Status:** In Progress
**Origin:** project review on `chore/travelapp-improvement-plan` (commit `e84d3d2`)
**Branch strategy:** one branch per section, branched off `chore/travelapp-improvement-plan`. Never touch `main`.

Sections are ordered by **risk if unfixed**, then by **whether later sections depend on earlier ones being trustworthy**. Section 1 comes first not because it is the worst bug, but because every other fix must be verifiable — and right now the test harness decides for itself which backend it is testing.

---

## Section 1 — Deterministic test harness _(IN PROGRESS)_

**Findings addressed:** C-2 (corrected), plus the false-confidence problem in `authz.test.ts`.

### Root cause

`lib/data/trips.ts:4-6` selects a backend at call time from ambient env:

```ts
function hasSupabase() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
```

Vitest does not load `.env.local`, so locally `hasSupabase()` is `false` and unit tests exercise the in-memory store. CI injects real `NEXT_PUBLIC_SUPABASE_*` into the `test` job, flipping it to `true`. Nothing in the harness reconciles this. Instead, five test files each patch around it independently:

- `__tests__/itinerary-cascade.test.ts:9-10`
- `__tests__/server-action-validation.test.ts:10-11`
- `__tests__/auth.test.ts`
- `__tests__/qa-integration.test.ts`
- `__tests__/demo-mode.test.ts:14-15,24-25,34-35`

Consequences:

1. A new test file that omits those two `delete` lines silently takes the Supabase path and throws `` `cookies` was called outside a request scope `` (verified by probe against `lib/supabase/server.ts:5`).
2. `__tests__/authz.test.ts:18,35-40` **re-implements** the ownership filter and cascade delete inline in the test body instead of calling `listTrips` / `deleteTrip`. It would pass unchanged if `lib/data/trips.ts` were emptied. It provides no protection for the thing it names.
3. `vi.stubEnv` in `__tests__/demo-mode.test.ts:45-46` is never unstubbed — `vitest.config.ts` does not set `unstubEnvs`, so stubbed env can leak between test files in the same worker.

### Fix

1. **`vitest.setup.ts`** — the harness owns the backend decision. Pin `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_ANON_KEY` to `""` at setup, making `hasSupabase()` deterministically `false` for every unit test file. Tests may still opt in per-test.
2. **`vitest.config.ts`** — set `unstubEnvs: true` so `vi.stubEnv` cannot leak across files.
3. **New `__tests__/test-isolation.test.ts`** — regression protection for the contract, so the guarantee cannot silently erode.
4. Retire the duplicated per-file `delete` lines in a follow-up commit once the guard test proves the central fix (deferred to keep this section atomic).

### Acceptance criteria

- `npx vitest run` green.
- `npx vitest run` green **with** `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` exported in the shell (reproduces the CI condition).
- `npx tsc --noEmit` clean, `npx next lint` clean.
- Guard test fails if the setup pin is removed and ambient env is present.

---

## Section 2 — Demo-mode auth bypass _(the real vulnerability)_

**Findings addressed:** C-1. **Branch:** `fix/section-2-demo-auth-bypass`.

### What was wrong

`lib/data/auth.ts` gated the demo fallback on `NEXT_PUBLIC_AUTH_MODE=demo` alone, with no `NODE_ENV` check, despite `.env.example:35` asserting production must reject it. Worse, it returned the client-supplied `travelapp_user_id` cookie **verbatim** as the user id, so any visitor could set that cookie and become any user. `demo-mode.test.ts` asserted the vulnerable behaviour as expected.

### What changed

- **New `lib/data/demo-session.ts`.** `assertDemoAuthAllowed()` throws when the flag is set and `NODE_ENV=production`, naming the variable and noting that `NEXT_PUBLIC_*` is build-inlined so a rebuild is required. `signDemoSession` / `verifyDemoSession` issue and check an HMAC-SHA256 token via Web Crypto; `verifyDemoSession` returns `null` for anything the process did not sign, so a client cannot choose its own id. The signing secret is a per-process random value cached on `globalThis` — no new env var, because demo auth cannot run in production, so the secret never has to survive a deploy.
- **`lib/data/auth.ts`.** Cookie renamed to `travelapp_demo_session`; the legacy unsigned `travelapp_user_id` is no longer read. New cookie is `httpOnly`, `sameSite=lax`, and `secure` in production.
- **Tests.** `__tests__/demo-session.test.ts` (guard + forgery) and `__tests__/auth-production.test.ts` (integration through `getUserId` with a mocked cookie jar). The test in `demo-mode.test.ts` that asserted the bypass is inverted.

### Why the failure is loud enough to notice

`app/error.tsx:17` renders `error.message`, so a misconfigured production deploy shows the actionable message and emits a Sentry event rather than quietly serving the shared identity to every visitor.

### Verified

Each half was proven to have teeth by temporarily neutering it: disabling the production guard fails 3 test files; restoring the old unsigned-cookie read fails 2. Suite green at 20/20 with and without `NEXT_PUBLIC_SUPABASE_*` set; `tsc --noEmit` clean; `next lint` clean; `next build` succeeds.

### Note for later

`NEXT_PUBLIC_AUTH_MODE` is inlined at build time, so it cannot be toggled without a redeploy — arguably it should not be `NEXT_PUBLIC_` at all. Renaming is left out of this section to keep it atomic; flagged for §10.

---

## Section 3 — Restore the E2E verification gate

**Findings addressed:** C-4, H-5.

`playwright.config.ts:4` sets `testDir: "./e2e"`. **No `e2e/` directory exists.** `npm run test:e2e` runs zero tests and `.github/workflows/e2e.yml` burns ~4 min of CI proving it.

The workflow is also incoherent: it runs `npm run build` then discards it for `npm run dev`, while `playwright.config.ts:30-35` _also_ launches `npm run dev` as `webServer` with `reuseExistingServer: !CI` — two servers racing for :3000. Readiness is `sleep 10`.

Blocked on Section 1 (need a reliable harness to seed auth state for authenticated page specs).

---

## Section 4 — Dependency vulnerabilities

**Findings addressed:** C-3.

`npm audit`: **2 critical, 10 high, 53 moderate** across 1380 deps.

- critical: `next` (pinned `^15.0.0`, installed 15.0.0), `vitest`
- high: `rollup` (arbitrary file write), `serialize-javascript` (RCE), `sharp`/libvips, `postcss`, `vite`, and the `next-pwa@5.6.0` → `workbox-build` chain

One package per commit, changelog read before each bump, green suite before and after, lockfile diff reviewed. `--force` only where the changelog justifies it.

---

## Section 5 — Middleware and silent production degradation

**Findings addressed:** H-1, H-2.

- `middleware.ts:10-11` non-null-asserts `NEXT_PUBLIC_SUPABASE_URL!` / `ANON_KEY!` and constructs a server client **unconditionally**, under a matcher covering every non-static path (`middleware.ts:47`). With Supabase env absent — the documented demo path — this throws on every request and 500s the site. Contradicts `README.md:13`.
- `lib/data/trips.ts` silently falls back to a process-global in-memory store when Supabase env is missing. On Vercel that is ephemeral and shared. Production should fail loudly, not degrade to fake persistence.

---

## Section 6 — Delete the dead service-role client

**Findings addressed:** H-3.

`lib/supabase/server.ts:32-56` `createAdminClient` is never called anywhere, yet it reads `SUPABASE_SERVICE_ROLE_KEY` and wires the service-role key into a _cookie-based_ client — meaning an end-user session cookie could silently override service-role auth. `README.md:63` confirms v1 does not need it. One-line delete.

---

## Section 7 — Extract the trips repository

**Findings addressed:** M-1.

`hasSupabase()` plus the dynamic-import/construct boilerplate is repeated ~10× in `lib/data/trips.ts` (lines 4-6, 12-13, 25-26, 49-50, 63-64, 79-80, 101-102, 126-127, 140-141, 161-162). Textbook "repeated conditionals on the same shape → missing dispatcher." One repository interface with two adapters (in-memory, Supabase) collapses every branch and makes the Section 1 harness decision structural rather than env-driven.

---

## Section 8 — Itinerary authz check-then-write race

**Findings addressed:** H-4.

`lib/data/trips.ts:141-145` and `163-167`: fetch `trip_id` by id → verify ownership with a second query → then `.eq("id", id)` **without re-asserting the verified scope**. Check and write are separate round-trips. RLS is the backstop, but the app-level check is racy. Scope the write to the verified `trip_id` in a single statement.

---

## Section 9 — Docs and source-of-truth truthfulness

**Findings addressed:** M-2, M-3, M-4.

- Byte-identical migration in two places: `docs/migrations/20250101000000_v1_trips_itinerary.sql` and `supabase/migrations/…` (same SHA256). CLAUDE.md §30's "agent reads from `docs/migrations/`" does not apply — there is no `agent/` here, and `npm run db:push` reads `supabase/migrations/`.
- Tailwind split-brain: `tailwindcss@3.4.19` **and** `@tailwindcss/postcss@4.3.3` both installed; `postcss.config.mjs` uses the v3 plugin name, so the v4 package is dead weight. `README.md:6` claims "Tailwind v4" — false.
- `README.md` stale in five places: Tailwind version; "9 tests" (actually 105); `migrations/…` root path (does not exist); no mention of `/design`, `components/motion`, `hooks/`; and a model-attribution line baked into shipped product docs (`README.md:70`).

---

## Section 10 — Hygiene

**Findings addressed:** M-5, M-6, L-1, L-4.

- `app/design/page.tsx` — 865 lines, unauthenticated, publicly routable. Largest file in the repo, past the ~1000-line signal threshold. Gate it out of production builds or split it.
- CI: dead `TURBO_TOKEN`/`TURBO_TEAM` env (no Turborepo); no `permissions:` block on either workflow; actions pinned to mutable `@v4` tags; `format:check` never runs; the `check` job only re-asserts `needs.*.result`.
- `~/` directory in the repo root: 2319 untracked files (a full `gstack` checkout including its own `.git`). Not committed, but it pollutes `git status` and risks a nested-repo accident. Add to `.gitignore`.
- `hooks/use-toast.ts:16` — lint warning, `actionTypes` assigned but only used as a type.
- No `LESSONS.md`, though CLAUDE.md §29 expects one.

---

## Cross-cutting notes

- `.env.local` holds a real `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `SENTRY_AUTH_TOKEN`. Verified **not** tracked by git and covered by `.gitignore`. No action; noted so it is not re-litigated.
- `/trips` is correctly gated by `app/trips/layout.tsx:9-11`. No action.
- CI triggers only on `main`/`develop`; neither branch exists. This is why none of the above was ever caught by CI. Fixing the trigger set belongs with Section 3.
