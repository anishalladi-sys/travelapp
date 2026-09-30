# Travel App — Hardening Plan

**Status:** In Progress
**Origin:** project review on `chore/travelapp-improvement-plan` (commit `e84d3d2`)
**Branch strategy:** one branch per section, branched off `chore/travelapp-improvement-plan`. Never touch `main`.

Sections are ordered by **risk if unfixed**, then by **whether later sections depend on earlier ones being trustworthy**. Section 1 comes first not because it is the worst bug, but because every other fix must be verifiable — and right now the test harness decides for itself which backend it is testing.

---

## Section 1 — Deterministic test harness _(DONE)_

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

## Section 2 — Demo-mode auth bypass _(DONE — C-1 closed)_

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

## Section 3 — Middleware and silent production degradation _(DONE — H-1, H-2 closed)_

**Findings addressed:** H-1, H-2. **Branch:** `fix/section-3-middleware-unconfigured`.

**This section moved ahead of the E2E work.** It was originally §5. While setting up E2E I verified the blocker directly: with no Supabase env, the homepage returns **500** and `@supabase/ssr` throws `"Your project's URL and Key are required"` from inside the middleware on every request. The documented quick start in `README.md:13` does not work at all, so there is no environment in which E2E specs could run. Fixing it first was necessary, not a preference.

### What was wrong

`middleware.ts` non-null-asserted `NEXT_PUBLIC_SUPABASE_URL!` / `ANON_KEY!` and constructed a server client **unconditionally**, under a matcher covering every non-static path. With Supabase unconfigured it threw on every request. Separately, `lib/data/trips.ts` silently falls back to a process-global in-memory store when Supabase is missing, which on Vercel is ephemeral and shared — production would appear to work while losing all data.

### What changed

- **New `lib/supabase/env.ts`.** `readSupabaseEnv()` is the single place that decides whether Supabase is usable, returning a discriminated union. A half-supplied or blank pair counts as absent; values are trimmed.
- **`middleware.ts`.** Uses it. Unconfigured in development → pass the request through (no session cookie to refresh, and demo mode does not use one). Unconfigured in production → throw naming both variables. The `!` assertions are gone. Matcher extended to also skip `webmanifest`, `xml` and `txt` so the middleware has a reason to run on fewer paths.
- **Demo cookie issuance moved to middleware.** `lib/data/demo-session.ts` gained `resolveDemoSession` in `lib/data/demo-cookie.ts`, and `lib/data/auth.ts` now only ever _verifies_. See the correction below.
- **Tests.** `__tests__/supabase-env.test.ts` covers the decision matrix; `__tests__/demo-cookie.test.ts` covers issuance, reuse and replacement of forged cookies.

### Correction: the §2 cookie issuance was wrong and is fixed here

§2 put `jar.set(...)` inside `getUserId()`. A Server Component render **cannot** write cookies — Next throws — and the broad `catch` swallowed it, so the signed session was never actually issued. The §2 test passed only because its `cookies()` double implemented a `set` that does not exist at that layer: the same class of mistake as `authz.test.ts`, which I had flagged specifically.

Issuance now happens in middleware, the one place on the read path permitted to write. The double in `auth-production.test.ts` exposes only `get`, so a future test cannot assert against a capability that is not there. Verified live: first request sets `travelapp_demo_session=<userId>.<sig>; HttpOnly; SameSite=lax`, second request reuses it and reissues nothing.

### Verified

- Live dev server, Supabase unconfigured: `/` and `/trips` went **500 → 200**; `/login` and `/design` 200.
- Live demo mode: signed cookie issued on first request, not reissued on the second.
- Live with Supabase configured: behaviour unchanged.
- 22/22 vitest files, `tsc --noEmit` clean, `next lint` clean.

### One thing found and ruled out

While testing, `/trips` returned **200 with the trips page** for an anonymous request, which looked like the `app/trips/layout.tsx` auth gate failing. It is not. The streamed HTML contains `NEXT_REDIRECT;replace;/login;307;` with `stack: [["TripsLayout","./app/trips/layout.tsx",15,66]]` — the gate fires correctly and the browser follows it client-side; only the HTTP status is 200 because the shell flushes first. Reproduced identically on the **original** middleware, so it is not a regression. No user data is exposed either way, since `listTrips()` returns `[]` for no user.

Worth noting: the page markup is flushed to an unauthenticated client before the redirect resolves. Low severity (empty-state only, no user data), but it does mean the trips shell reaches the client pre-redirect.

---

## Section 4 — Restore the E2E verification gate _(DONE — C-4, H-5 closed)_

**Findings addressed:** C-4, H-5. **Was §3; moved behind the middleware fix.** **Branch:** `fix/section-4-e2e-gate`.

`playwright.config.ts` set `testDir: "./e2e"` while **no `e2e/` directory existed**, so `npm run test:e2e` ran zero tests and `e2e.yml` burned ~4 min of CI proving it. The workflow also built the app and discarded the result, then raced a second dev server against the one `playwright.config.ts` starts itself, with `sleep 10` as readiness.

**Auth path.** §2 removed the ability to authenticate a spec by setting a cookie — demo mode now issues HMAC-signed sessions and refuses production. So specs run against a dev server started by Playwright with `NEXT_PUBLIC_AUTH_MODE=demo` and Supabase blanked, which gives a deterministic in-memory backend and a real signed session issued by middleware. `webServer.env` sets the Supabase vars to empty strings so neither the shell nor `.env.local` can leak a configured backend in.

### The P0 this found on its first run

`/trips` **rendered the error boundary for every user with zero trips** — the entire first-run experience:

> _Event handlers cannot be passed to Client Component props._

`app/trips/page.tsx:43` passed `action={{ label, onClick }}` to `EmptyState` from a **Server Component**. React cannot serialise a function prop across the server/client boundary, so the page threw. `app/trips/[id]/page.tsx` had the same defect in its itinerary empty state (with a no-op `onClick`, so it had never done anything useful).

`EmptyStateProps.action` is now `React.ReactNode`, matching the `SectionHeaderProps.action` pattern already used correctly elsewhere in this codebase, and both call sites pass a `Link`/anchor. The dead no-op button became a real `#add-itinerary-item` jump link. **My original review missed this** — I read the page and moved on. It took an actual browser.

### Also fixed here

- `playwright.config.ts`: `testDir: "./e2e"` now resolves; `fullyParallel: false` and `workers: 1` because the in-memory store is one process-global array shared by every context; timeouts raised to 180s/60s after measuring 15–35s cold first-hits on a slow machine; mobile projects limited to the smoke suite so CRUD does not triple a slow run.
- `e2e/helpers.ts`: `createTrip` / `deleteCurrentTrip` / `uniqueTitle`. The shared store means a spec that creates a trip and does not delete it breaks every later spec — two of my own specs did exactly that, and it only showed up as failures in the _second_ project to run.
- `e2e.yml`: no more second dev server, no more discarded build, no more `sleep`; installs `chromium webkit` (installing only chromium left all 12 mobile-safari tests failing to launch); added `permissions: contents: read`, concurrency cancellation, and trace upload on failure.
- `ci.yml`: triggers on all branches — `main`/`develop` never matched anything, which is why none of this was ever caught. Added `permissions`, removed the dead `TURBO_*` vars, removed the redundant `check` job, and **dropped the Supabase secrets from the test job** (they actively hurt: the unit harness pins the in-memory backend, so credentials only flip tests onto a path that cannot work outside a request scope).
- `.prettierignore`: added. `types/supabase.ts` is generated by piping the Supabase CLI through Windows shell redirection, producing **UTF-16LE**, which Prettier reads as binary and cannot parse.

### Verified

Full suite: **39 passed / 0 failed in 4.2m**, across `chromium`, `mobile-chrome` and `mobile-safari`.

The run before the last fix was 36 passed / 3 failed, and all 3 were my own shared-store cleanup bug rather than an application defect. Two rounds of self-inflicted spec failures came out of the same root cause — the demo backend is one process-global array, so ordering and cleanup are the spec author's problem. Both are fixed in `e2e/helpers.ts`; the suite is now order-independent.

### Deliberately not done

`format:check` was **not** wired into CI. It currently fails on 16 pre-existing files (the generated `types/supabase.ts` plus drifted config and docs), and a gate that is red on arrival blocks everything and gets disabled. The `.prettierignore` fixes the genuinely unparseable file; the formatting debt is recorded in §9.

---

## Section 5 — Dependency vulnerabilities

**Findings addressed:** C-3. **Was §4.**

`npm audit`: **2 critical, 10 high, 53 moderate** across 1380 deps.

- critical: `next` (pinned `^15.0.0`, installed 15.0.0), `vitest`
- high: `rollup` (arbitrary file write), `serialize-javascript` (RCE), `sharp`/libvips, `postcss`, `vite`, and the `next-pwa@5.6.0` → `workbox-build` chain

One package per commit, changelog read before each bump, green suite before and after, lockfile diff reviewed. `--force` only where the changelog justifies it.

---

## Section 6 — Delete the dead service-role client _(DONE — H-3 closed)_

**Findings addressed:** H-3. **Branch:** `fix/section-6-dead-admin-client`.

`lib/supabase/server.ts` exported `createAdminClient`, which had **no callers anywhere** in the application, yet it read `SUPABASE_SERVICE_ROLE_KEY` and wired the service-role key into a _cookie-based_ client. That combination is the footgun: a service-role client is meant to bypass RLS entirely, but handing it the request's cookies means an end-user session can attach itself to the client and quietly acquire elevated privileges. It was a loaded gun with no user, which is the worst kind.

Deleted the function. `SUPABASE_SERVICE_ROLE_KEY` is now read by **no** application code path — verified by search, not by assumption — so the Vercel deploy section in `README.md` no longer asks for it, and `.env.example` documents it as unused rather than implying it is required.

The variable stays out of `docs/architecture/architecture-overview.md`'s secrets list only in the sense that it is no longer needed at runtime; the doc's "never exposed to client" note is still correct as a rule and was left alone. `SUPABASE_SETUP.md` still tells you to copy the service-role key during initial setup, which is harmless but now unnecessary — folded into §9.

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

- `app/design/page.tsx` — was 865 lines, unauthenticated, publicly routable, and the largest file in the repo. Two problems recorded together:
  1. It is past the ~1000-line signal threshold. Gate it out of production builds or split it.
  2. **It was never prettier-clean**, so the pre-commit hook's `prettier --write` rewrote the whole file on first contact: 865 → 1462 lines, burying a 2-line fix under ~780 lines of unrelated churn. Formatting is now settled and `prettier --check` passes on it, but the next person to edit it will hit the same trap if the file is reformatted again. **Split it before further edits.**
- CI: dead `TURBO_TOKEN`/`TURBO_TEAM` env (no Turborepo); no `permissions:` block on either workflow; actions pinned to mutable `@v4` tags; `format:check` never runs; the `check` job only re-asserts `needs.*.result`.
- `~/` directory in the repo root: 2319 untracked files (a full `gstack` checkout including its own `.git`). Not committed, but it pollutes `git status` and risks a nested-repo accident. Add to `.gitignore`.
- `hooks/use-toast.ts:16` — lint warning, `actionTypes` assigned but only used as a type.
- `tailwind.config.ts:128` — `require("tailwindcss-animate")` inside an ESM config. Pre-existing, and previously invisible because the file was outside both `tsconfig.json` and the `next lint` scope. Now lint-visible after §3 widened the tsconfig include; fix by importing at the top level. Deliberately left out of §3 to keep it atomic.
- `tsconfig.json:exclude` contains `"C:/Users/Anish/.config"`, a machine-specific absolute path outside the repository. Dead config that will never apply on another machine; remove.
- `__tests__/input-field-clay.test.tsx:45` — a `react/no-unescaped-entities` **error**. Invisible because `next lint` does not cover `__tests__/` by default. Either extend the lint scope or fix the apostrophe.
- `npm run format:check` fails on 16 pre-existing files (`.prettierignore` now excludes the generated `types/supabase.ts`, which was the only hard parse error; the rest are drifted config and docs). Left out of CI in §4 rather than shipping a red gate. Either run `prettier --write .` and then add the gate, or accept lint-staged as the only enforcement.
- No `LESSONS.md`, though CLAUDE.md §29 expects one.
- `/login` is unreachable in demo mode because `app/login/layout.tsx:10-12` redirects whenever a user is resolved and demo auth always resolves one. Correct behaviour, but it means the unauthenticated sign-in form has no automated coverage — it stays in `docs/testing/manual-test-plan.md`.

---

## Cross-cutting notes

- `.env.local` holds a real `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `SENTRY_AUTH_TOKEN`. Verified **not** tracked by git and covered by `.gitignore`. No action; noted so it is not re-litigated.
- `/trips` is correctly gated by `app/trips/layout.tsx:9-11`. Verified live, not just by reading: the streamed response carries `NEXT_REDIRECT;replace;/login;307;` with `stack: [["TripsLayout","./app/trips/layout.tsx",15,66]]`. The HTTP status is 200 because the shell flushes before the redirect resolves, so the trips markup reaches an unauthenticated client — empty state only, no user data, but worth knowing.
- Type-aware ESLint (`.eslintrc.js:21`) is configured against `tsconfig.json`, whose `include` had never listed the root-level config files. Any commit touching one of them was blocked by the pre-commit hook, and the files went unlinted. §1 added `vitest.config.ts`/`playwright.config.ts`; §3 widened it to `*.ts` so the whole root-level category is covered.
- CI triggers only on `main`/`develop`; neither branch exists. This is why none of the above was ever caught by CI. Fixing the trigger set belongs with Section 4.
