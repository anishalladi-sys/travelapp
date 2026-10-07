# Project Audit — Required Fixes

Date: 2026-10-07
Scope: full repository review across correctness, security, architecture, accessibility, deployment, and dependency risk.
Method: static review of every source file, then the highest-severity claims re-verified by executing the real application, the real build output, and the real dependency tree. Claims that could not be executed are marked as such.

Verdict: **not production-ready.** Three defects break a user-facing feature outright, one renders the marketing page blank without JavaScript, and the CI gate is narrower than it appears.

---

## How to read this

| Severity     | Meaning                                                                  |
| ------------ | ------------------------------------------------------------------------ |
| **Critical** | A feature is broken, or content is invisible. Must fix before launch.    |
| **High**     | Exploitable, or the safety net is not actually there. Fix before launch. |
| **Medium**   | Real defect with a workaround. Fix soon.                                 |
| **Low**      | Cleanup. Batch it.                                                       |

---

## Critical

### C1. Password reset cannot work for any user

`@supabase/ssr` hardcodes PKCE (`createServerClient.js:37 flowType: "pkce"`), so the recovery link delivers a one-time `?code=`. The only place in the entire codebase that redeems it is `app/auth/callback/route.ts:35`.

But the reset email points somewhere else:

```ts
// app/auth/actions.ts:209-211
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${getBaseUrl()}/auth/reset-password`,
});
```

So the code lands on `/auth/reset-password?code=…`, and that page only uses the code as a boolean to decide which form to render:

```ts
// app/auth/reset-password/page.tsx:8-11
const code = searchParams.get("code");
// If there's a code in the URL, we're in the update password flow
if (code) {
```

It never calls `exchangeCodeForSession`. `updateUser` then runs with no session and fails. Verified by enumerating every `exchangeCodeForSession` / `verifyOtp` / `setSession` call in `app/`, `lib/`, `components/` — only the callback route has one.

**Fix:** point `redirectTo` at `/auth/callback?next=/auth/reset-password`. `lib/safe-redirect.ts` already accepts that path, and the callback already redirects to `next`. The reset page then arrives with a real session.

### C2. A signed-in user cannot reach the reset form

```ts
// app/auth/layout.tsx:9-12
const userId = await getUserId();
if (userId) {
  redirect("/trips");
}
```

`app/auth/reset-password/page.tsx` lives under this layout. Anyone who still holds a valid session and requests a reset is bounced to `/trips` and never sees the form.

**Fix:** move the reset page out of the redirecting layout — `app/(auth-redirect)/reset-password/` — or exclude it. The same guard is correct for `/login` and `/signup`, so do not remove it from those.

### C3. The homepage is blank without JavaScript

`components/motion/Reveal.tsx` starts hidden and only becomes visible from an `IntersectionObserver` callback. The hidden state is in the server-rendered HTML.

Confirmed by counting `opacity:0` in the prerendered output:

```
.next/server/app/index.html -> 8 inline "opacity:0" declarations
```

Verified in a browser with JavaScript disabled:

```
/        : 12 of 16 text nodes invisible (75%)
          invisible: "Plan trips with day-by-day itineraries"
          invisible: "Why Travelers Choose Us"
/privacy : 0 of 15 invisible (0%)
/terms   : 0 of 14 invisible (0%)
```

Only the marketing page is affected — `/privacy` and `/terms` do not use `Reveal`. The screenshot shows a header and then an empty page: the entire hero and every feature section are gone.

This is not only a no-JS problem. On a slow connection the page renders and then shows nothing for ~600ms plus stagger, which reads as a blank screen.

**Fix:** server-render the revealed state and let the observer only replay it. Add a Playwright spec that asserts visible text with `javaScriptEnabled: false` so this cannot regress.

---

## High

### H1. No Content-Security-Policy, no HSTS, no clickjacking protection

`next.config.ts` sets three headers. Missing everywhere in the repo:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options` / `frame-ancestors`
- `Permissions-Policy`

Note a real blocker: `app/layout.tsx:115-130` injects an inline theme script via `dangerouslySetInnerHTML`, so a strict `script-src 'self'` will not apply until that moves to a nonce or hash. Solve the script first, then the policy.

### H2. Signup leaks whether an address is registered

```ts
// app/auth/actions.ts:124-126
if (error) {
  return { error: error.message };
}
```

Supabase returns a distinct message when the address already exists. This renders verbatim (`components/auth-form.tsx`).

It contradicts the policy documented 50 lines earlier in the same file, at `app/auth/actions.ts:70-76`, where login was deliberately hardened against exactly this.

**Fix:** return a fixed string, as `loginAction`, `magicLinkAction` and `resetPasswordRequestAction` already do.

### H3. `.env.example` documents `NODE_ENV=development`, which disables two production guards

`README.md` quick start copies this file to `.env.local`. On any host that honours it, this turns off the guard that stops demo auth in production and the guard that stops silent fallback to in-memory storage:

```ts
// lib/data/demo-session.ts:63-65
if (isDemoAuthRequested()) { if (process.env.NODE_ENV !== "production") return; throw ... }
// lib/supabase/env.ts:20
process.env.NODE_ENV === "production" ? "missing-env-in-production" : "missing-env"
```

**Fix:** delete the line. Next.js sets `NODE_ENV` itself; Next even warns that overriding it is non-standard.

### H4. `next lint` does not lint `middleware.ts` or anything outside four directories

No `eslint.dirs` is configured, so `next lint` falls back to its hardcoded list:

```js
// node_modules/next/dist/lib/constants.js
const ESLINT_DEFAULT_DIRS = ["app", "pages", "components", "lib", "src"];
```

Never linted: `middleware.ts` (the auth boundary, including the production hard-fail and the session-cookie flags), `hooks/`, `e2e/`, `__tests__/`, `scripts/`, every config file.

Confirmed the gap is real rather than theoretical — `next lint` reports clean, while linting `__tests__` directly finds an **error**-severity rule violation sitting in `__tests__/input-field-clay.test.tsx:45`.

**Fix:** add `eslint: { dirs: [...] }` to `next.config.ts`, or migrate to the ESLint CLI (`npx @next/codemod@canary next-lint-to-eslint-cli .`) — which must happen before any Next 16 bump, because Next 16 removes `next lint`.

Also note every custom rule is `"warn"` and CI runs `next lint` with no `--max-warnings`, so all four `jsx-a11y` rules and `no-explicit-any` are non-blocking by construction.

### H5. Sentry is misconfigured; fixing the obvious part breaks the build

Three defects:

1. `withSentryConfig` is never called, so source-map upload never runs — which is what `SENTRY_ORG`, `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN` exist to feed. All three are dead.
2. `sentry.client.config.ts:10` calls an API that does not exist in the installed major:

```bash
node -e "const S=require('@sentry/nextjs'); console.log(typeof S.replayIntegration, typeof S.Replay)"
# undefined  undefined      (installed 8.55.2; replayIntegration arrived in v10)
```

That is a `TypeError` the moment the file is evaluated. It is dormant only because nothing imports it — `instrumentation.ts` loads just the server and edge configs. 3. `tracesSampleRate: 1.0` in all three configs is a real cost exposure on a free tier.

`npm audit` flags `@sentry/nextjs` HIGH; the only clean version is 11.4.0 — three majors up.

**Fix:** wire `withSentryConfig` into `next.config.ts`, replace `replayIntegration` with `Replay` for v8, and lower the sample rates. Do the Sentry 11 upgrade as its own change, not bundled with anything else.

---

## Medium

### M1. Supabase types are generated but never used, so the query layer is `any`

`types/supabase.ts` exists and is complete, but is imported by nothing. `tsconfig.json` does not include `types/**`, so it is not even typechecked. `.prettierignore` has a block dedicated to working around its UTF-16LE encoding.

Consequence: `SupabaseClient` is used with no `Database` generic, so `.from("trips")` accepts any string and `.data` is `any`. `.from("trip")` or `.eq("userid", …)` compiles clean and fails only at runtime. Every crossing is an assertion, not a check: `TripRow = Record<string, unknown>`, `RepositoryResult<unknown>`, then seven `as Trip` casts in `lib/data/trips.ts` plus `as never` in the actions.

**Fix:** add `types/**` to `tsconfig.json` include, pass `Database` to the Supabase clients, delete the casts. Also regenerate the file without shell redirection, which is what produces the UTF-16 encoding on Windows.

### M2. Store selection has no production guard of its own

```ts
// lib/data/trips-repository.ts:288-301
repositoryPromise = configured
  ? supabaseRepository()
  : Promise.resolve(inMemoryRepository());
```

The hard fail lives only in `middleware.ts:20-26`. Any path that does not traverse middleware — a future worker, a webhook, a script importing `lib/data/trips`, or a page that forgets `force-dynamic` — silently gets in-memory storage in production and loses data on every cold start.

**Fix:** one line in `getTripsRepository` that throws when unconfigured and `NODE_ENV === "production"`.

### M3. Auth errors conflate "not configured" with "lookup failed"

```ts
// lib/data/auth.ts:22-24
} catch {
  // Supabase not configured or error - continue to fallback logic
}
```

With demo mode enabled on any non-production host, a transient Supabase outage silently resolves the **shared** `demo-user-0001` identity — i.e. someone else's trips. Production is protected by the demo guard.

**Fix:** distinguish "not configured" from "the lookup failed" and fail closed on the latter.

### M4. Action-bound ids are not validated as UUIDs

`app/trips/actions.ts:44,84` pass a bound id straight to `.eq("id", id)`. A bound Server Action arg is attacker-reachable regardless of what the page bound. A malformed id produces a PostgREST `22P02`, which `unwrap` rethrows; the actions have no `try/catch`, so it surfaces as an unhandled error into the error boundary rather than a clean validation message.

Not a security hole — a bad id matches no rows and RLS still holds — but it is an unhandled-error path on attacker-controlled input.

**Fix:** `z.string().uuid()` on the action args, plus a catch that maps unknown errors to a generic message.

### M5. Form error UI only ever shows Zod messages

```ts
// app/trips/actions.ts:9-26 (representative)
if (!parsed.success) {
  return { error: parsed.error.issues.map((i) => i.message).join(", ") };
}
const trip = await createTrip(parsed.data); // no try/catch
```

`createTrip` throws on every non-validation failure (`"Unauthorized"`, and `unwrap` rethrows raw PostgREST errors). A DB failure or expired session replaces the whole page with the error boundary and **loses the user's typed input**. `deleteTripAction` and `deleteItineraryAction` have no error path at all.

**Fix:** wrap the data-layer call, return a generic message, keep the form mounted.

Related: the Zod messages themselves are developer strings shown verbatim — `"end_date must be on or after start_date"`, `"date must be YYYY-MM-DD"` (`lib/validations/trip.ts`, `lib/validations/itinerary.ts`). `lib/validations/auth.ts` writes user-facing copy correctly; the other two do not.

### M6. Logout is unreliable, and the client ignores the result

`logoutAction` calls `createClient()` with no try/catch, so logout throws in demo mode — which is exactly the no-Supabase mode. `POST /api/auth/logout` then never reaches its `return NextResponse.json(...)` because `logoutAction` ends in `redirect()`, which throws.

Client side (`components/user-menu.tsx:22-27`): `res.ok` is true after redirects are followed, so the branch is effectively always taken; there is no `catch`, so a network failure does nothing at all, silently.

The user-fetch effect has no error or loading state — `user === null` means "loading" and "failed" indistinguishably, and the panel still renders.

### M7. Delete is a single unguarded click

`app/trips/[id]/page.tsx:117-126` submits on one click with no confirmation, and deletion cascades to all itinerary items. `components/ui/dialog.tsx` is fully built and unused here.

### M8. `NEXT_PUBLIC_APP_URL` has no build-time validation

Four different fallbacks for the same unset variable: `travelapp.example.com` in `layout.tsx`, `sitemap.ts`, `robots.ts`; `http://localhost:3000` in `actions.ts`. Unset in production, confirmation and reset emails point at the recipient's own laptop. There is a hard fail for missing Supabase but none here.

### M9. Dead weight that will rot

- **14 env vars documented but read by nothing**, including five R2 credentials and three Resend values. `SUPABASE_SETUP.md` still tells the developer to create a service-role key for a code path that does not exist.
- **34 declared dependencies are never imported**, and they are all in `dependencies`, not `devDependencies` — the full Tiptap tree (~40 moderate advisories), `leaflet` + `react-leaflet` (plus dead Leaflet CSS in `globals.css`), `recharts`, `@dnd-kit`, `cmdk`, `vaul`, `embla`, `input-otp`, `react-day-picker`, `@tanstack/react-query`, `@vercel/analytics`, and 8 unused Radix packages.
- **A complete unused toast system**: `components/ui/toast.tsx` + `hooks/use-toast.ts` (~238 lines) is never mounted; only `sonner` is live.
- **A complete unused CSS component system**: `.btn*`, `.input`, `.label`, `.card`, `.badge`, `.skeleton` in `globals.css`, none referenced by any `.tsx`. The `.skeleton` class exists and is never used; the hand-rolled `.animate-in` collides with `tailwindcss-animate`, which the dialog and select depend on.
- **`.env.example` lines 36-41** are an indented orphan block that reads as documentation for `NODE_ENV` rather than for `NEXT_PUBLIC_APP_URL` — which compounds H3.
- **`tsconfig.json:52`** has a machine-specific path committed: `"C:/Users/Anish/.config"`.
- **`supabase/config.toml:65-70`** enables a seed file that does not exist, so `supabase db reset` and `supabase start` fail.
- **`next.config.ts:5-7`** optimises `@radix-ui/react-icons`, which is not a dependency.
- **`vitest.config.ts` coverage thresholds are dead** — no `--coverage` flag anywhere, so the 50% floor is never evaluated, and CI uploads a `coverage/` directory that will not exist.

---

## Low

- `sb-user-id` cookie is set and deleted but read nowhere (`app/auth/actions.ts:79-85,136-142,252`). Unsigned, no `httpOnly`, no `secure` — harmless today, but it looks like an auth mechanism and invites being wired into a check. **Delete it.**
- `role="list"` with no `role="listitem"` children — `components/ui/timeline.tsx:88-92`.
- Icon-only button with no accessible name — `app/design/page.tsx:1102-1113`.
- Two focusable buttons that do nothing — "Today" and "Add Item" at `app/trips/[id]/page.tsx:138-147`; the working affordance is the anchor at `:171`.
- `<a>` wrapping `<button>` in 8 places; one correct `<Button asChild>` example already exists at `app/trips/[id]/page.tsx:170-172`.
- Touch targets below 44px: checkbox 16×16 (`components/ui/checkbox.tsx:12`), dialog close ~24×24, user-menu trigger 40×40.
- Badge variants hardcode hexes failing WCAG AA against white: warning 1.92:1, success 2.28:1, destructive 3.76:1. A compliant `--destructive` token already exists in `globals.css`.
- No `:focus-visible` rule in `globals.css`; every `<Link>` relies on the UA default, including the whole trip card on `/trips`.
- `FieldDescription` is never associated with its input (no `aria-describedby`) — all 12 fields across both forms.
- Heading levels skip h2 on `/login`, `/signup`, `/`; `/trips/[id]` has no `h1`.
- Persistent nav is deleted below `md` with no replacement — no hamburger on the real pages.
- `components/itinerary-form.tsx:25` uses unconditional `grid-cols-2` for date+time; overflows at 320px.
- Only one `loading.tsx` in the app, and it is off-design-system (`text-zinc-500` instead of the clay tokens).
- `UserMenu` renders only on `/trips` — **a signed-in user on `/trips/new` or `/trips/[id]/edit` has no sign-out control at all.**
- CI: `npm audit` is not a gate; `e2e.yml timeout-minutes: 30` exactly equals Playwright's `globalTimeout`, so a long run is killed before the report is written; `main` is in `branches-ignore`; `format:check` is not wired; no `engines`/`.nvmrc` (local Node is v25, CI is 20.x); `@typescript-eslint/*` is used by `.eslintrc.js` but not declared in `package.json`.
- `next lint` is deprecated and **removed in Next 16**; `npm audit` currently reports 71 vulnerabilities (56 moderate, 15 high, 0 critical).

---

## What is genuinely solid

Worth stating plainly, because it is a lot of good work:

- **RLS is complete and correct.** Both tables enabled, both with policies carrying correct `using` _and_ `with check`. Verified against the live project: the public anon key returns `[]`, not rows. The anon key being public by definition is a non-issue here.
- **Ownership is enforced server-side on all five write paths**, with `.eq("user_id", …)` in the statements themselves. The itinerary interface makes check-then-write structurally impossible — a method taking only `id` would allow a caller to bypass the ownership check, and the design prevents that.
- **The open-redirect defence is thorough** — absolute URLs, protocol-relative, backslash variants, percent-encoded slashes, and a final origin re-check.
- **Demo auth fails closed and loud** — signed with HMAC, verified on every read, and it throws if enabled with `NODE_ENV=production`.
- **Rate limiting is real** — dual IP and IP+email budgets, non-oracular messages, and an honest documented caveat about in-memory storage on serverless.
- **199 unit tests, 54 Playwright tests, typecheck, lint and build all pass.** `npm ci` everywhere in CI. No secrets committed; ignore rules verified working.
- **`Reveal`'s reduced-motion handling is correct**, and the dev-only error detail is genuinely eliminated from production bundles rather than merely hidden.

---

## Suggested order

**Launch blockers**

1. C1 + C2 — password reset works end to end
2. C3 — homepage renders without JavaScript
3. H2 — fixed signup error message
4. H3 — delete `NODE_ENV` from `.env.example`

**Before real users**

5. H4 — lint actually covers the repo
6. H5 — Sentry consistent with the installed version, sample rates lowered
7. M1 + M2 — real DB types, production guard in the store selector
8. M3 — fail closed on auth lookup errors
9. M4 + M5 — validate ids, keep forms mounted on failure
10. M6 — reliable logout with client-side error handling

**Security hardening**

11. H1 — CSP, HSTS, `X-Frame-Options` (move the inline theme script first)
12. M7 — confirmation dialog before destructive delete

**Then**

13. M8 — validate `NEXT_PUBLIC_APP_URL` at build
14. M9 + Low — delete dead dependencies, env vars, CSS, toast system; fix `tsconfig.json`, `config.toml`, coverage thresholds
15. M10 — accessibility fixes in one pass

**Not blockers, deliberately deferred**

- Next 16 / React 19 / Sentry 11 / Tailwind 4. Each needs its own branch and its own review. The 15 HIGH advisories are build-time or unreached, and 0 are critical.
- `eslint-config-next@15.0.0` has no patched 15.x — `npm audit` proposes a _downgrade_ to 14.2.35. It is coupled to the Next 16 bump.

---

## Two things I could not verify from the repo

1. **That the migration is applied to the live project.** `db:push` is manual, CI has no drift check, and the `if not exists` / `enable row level security` lines are idempotent, so a pre-existing table with RLS off would not surface. **Check both tables in the Supabase dashboard: RLS enabled _and_ a policy present.** This is the one security claim code cannot settle.
2. **Contrast ratios and 44px targets are arithmetic from class strings**, not measured in a rendering engine. No axe run has ever happened — `@axe-core/react` is installed and imported by nothing, and there are zero accessibility assertions in `__tests__/` or `e2e/`. Adding axe to the Playwright suite is the highest-value single addition for the accessibility class of defect.
