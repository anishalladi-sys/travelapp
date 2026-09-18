# Plan: Travel App v1 — Trip Basics + Itinerary

## Stack locked (ADR 0001)
Next.js 15 App Router + TS strict + Tailwind + shadcn/ui + Supabase (Postgres/Auth/RLS) + Vercel.

## Design System: Claymorphism (ADR 0003)
Refined claymorphism with adaptive dark mode: soft pillowy surfaces, inner/outer shadow depth, unified 12-16px radii, warm neutral clay palette. See `docs/architecture/design-system.md`.

## Vertical Slices (build order)

### Slice 0 — Scaffolding & Infra (no user value alone, but unblocks all)
- Objective: Init Next.js app, Tailwind, shadcn, Supabase helpers, Zod schemas, DB migration, env. **Claymorphism tokens in `app/globals.css` + `tailwind.config.ts`**.
- Files: `package.json`, `app/layout.tsx`, `app/globals.css`, `lib/supabase/*`, `lib/validations/*`, `supabase/migrations/20250101000000_v1_trips_itinerary.sql`, `.env.example`
- Deps: none
- Acceptance: `npm run dev` boots, `npm run build` passes, migration file exists, supabase helpers compile, `npx tsc --noEmit` passes. **Claymorphism tokens render correctly in both light/dark**.
- Verify: `npm run build && npx tsc --noEmit && npm run lint`
- Rollback: delete scaffold; no data.

### Slice 1 — Auth + Trip Basics (create/view trip list)
- Objective: User can sign up/login and create a trip; sees own trips in list.
- Files: `app/(auth)/login/page.tsx`, `app/(dashboard)/trips/page.tsx`, `app/(dashboard)/trips/new/page.tsx`, `components/trip-form.tsx`, `app/api/trips/*` or Server Actions in `app/(dashboard)/trips/actions.ts`, `lib/validations/trip.ts`, `__tests__/trip.test.ts`
- Deps: Slice 0
- Acceptance: Auth required; create with valid data appears in list; invalid (missing title, end<start) shows Zod error; RLS prevents seeing other user's trips (test with two mocked users). **All forms use claymorphism Field primitives**.
- Verify: `npm test -- trip` + manual login → create trip flow.
- Rollback: revert actions/pages; trips table remains.

### Slice 2 — Itinerary Management (add/view on trip)
- Objective: Open a trip, add itinerary items (date, time, activity, location, notes), view grouped by date sorted by time.
- Files: `app/(dashboard)/trips/[id]/page.tsx`, `components/itinerary-form.tsx`, `components/itinerary-list.tsx`, `lib/validations/itinerary.ts`, `__tests__/itinerary.test.ts`, `docs/migrations` (already has table)
- Deps: Slice 1
- Acceptance: Add item appears grouped by date; sorted by time; validation (activity required); itinerary scoped to trip; cascade not yet needed but FK exists. **Timeline uses claymorphism dots/connectors**.
- Verify: `npm test -- itinerary` + add item E2E via UI.
- Rollback: revert itinerary components/actions.

### Slice 3 — Edit/Delete + Authz hardening
- Objective: Edit/delete trip and itinerary items; authz enforced server-side + RLS.
- Files: `app/(dashboard)/trips/[id]/edit/page.tsx`, actions for update/delete, `components/confirm-dialog.tsx`, `__tests__/authz.test.ts`
- Deps: Slice 1,2
- Acceptance: Owner can edit/delete own trip/item; non-owner gets 403/empty (RLS test); delete trip cascades items; optimistic UI + confirm dialog. **Dialog uses claymorphism modal shadows**.
- Verify: `npm test -- authz` + attempt cross-user fetch in test.
- Rollback: revert edit/delete actions.

### Slice 4 — Polish & Productionize
- Objective: Loading/error/empty states, mobile responsive, a11y, observability, docs.
- Files: `components/ui/*` states, `app/error.tsx`, `app/loading.tsx`, `docs/features/travelapp-v1.md`, README update
- Deps: Slice 1-3
- Acceptance: All async boundaries have loading/error/empty; touch targets >=44px; keyboard nav works; lint/typecheck/build/test green. **Claymorphism shadows/radii consistent across all states**.
- Verify: `npm run lint && npx tsc --noEmit && npm test && npm run build` + manual mobile check.

## Parallelization
- Slices are sequential (vertical). Within a slice, validations + tests can be written in parallel with UI.

## Risks
- Supabase env missing locally → provide mock fallback for tests and local dev without env (in-memory or mocked supabase client).
- RLS misconfig → add explicit integration test for cross-user access.

## Verification Gates (per slice)
`npm test` (targeted) → `npx tsc --noEmit` → `npm run lint` → `npm run build` → manual UI smoke.

## Rollback per slice
Git: new branch `feat/travelapp-v1`, atomic commits per slice. Revert commit for that slice.
