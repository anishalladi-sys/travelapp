# Travel App — v1 (Trip Basics + Itinerary)

Trip information capture: itinerary, accommodation, transport, budget, documents, packing, POI, emergency, media — all per trip. **v1 ships only Trip Basics + Itinerary** (Option A, confirmed 2026-09-02). Backlog → v2.

## Stack

- Next.js 15 App Router, TypeScript strict, Tailwind v3, shadcn/ui pattern
- Supabase (Postgres + Auth + RLS) — fallback in-memory store when `NEXT_PUBLIC_SUPABASE_*` missing (local dev/demo)
- Vercel hosting, Zod validation, Vitest + Testing Library

## Quick start

```bash
npm install
cp .env.example .env.local   # add Supabase URL/anon key if you have them; otherwise runs in demo mode
npm run dev                  # http://localhost:3000
```

## Commands

```
npm run dev      # dev server
npm run build    # production build
npm run lint     # eslint
npx tsc --noEmit # typecheck
npm test         # vitest run (unit + integration)
npm run test:e2e # playwright (requires: npx playwright install chromium webkit)
```

## Project structure

```
app/
  page.tsx               → landing, links to /trips
  trips/
    page.tsx             → list trips (own only)
    new/page.tsx         → create trip
    [id]/page.tsx        → trip detail + itinerary grouped by date
    [id]/edit/page.tsx   → edit trip
    actions.ts           → server actions (Zod + authz + RLS)
components/
  trip-form.tsx, itinerary-form.tsx, itinerary-item-row.tsx
  ui/*                   → button, input, card, etc.
lib/
  validations/trip.ts, itinerary.ts, auth.ts
  supabase/client.ts, server.ts, env.ts
  data/store.ts, trips.ts, trips-repository.ts, auth.ts,
         demo-session.ts, demo-cookie.ts
e2e/
  smoke.spec.ts, trips-crud.spec.ts, itinerary.spec.ts
docs/
  reasonix/specs/travelapp-v1-spec.md
  reasonix/plans/travelapp-v1-plan.md, travelapp-hardening-plan.md
  architecture/architecture-overview.md
  decisions/0001-use-nextjs-supabase-for-v1.md
supabase/
  migrations/20250101000000_v1_trips_itinerary.sql   ← canonical
```

### Data layer

`lib/data/trips.ts` owns identity and authorisation rules only. Backend
selection lives behind `lib/data/trips-repository.ts`, which picks the Supabase
anon client or the in-memory adapter once. Every query runs as the calling user
under RLS; there is no service-role code path.

Demo auth (`NEXT_PUBLIC_AUTH_MODE=demo`) is for local development and the E2E
harness only. It resolves every visitor to one shared user, issues an
HMAC-signed session cookie from middleware, and **throws if the flag is set
while `NODE_ENV=production`**.

## Data model (v1)

- `trips` (id, user_id FK auth.users, title, destination, start_date, end_date, trip_type, traveler_count, status)
- `itinerary_items` (id, trip_id FK trips cascade, date, time, activity, location, notes, sort_order)
- RLS: `trips` `auth.uid()=user_id`; `itinerary_items` via `EXISTS (select 1 from trips where trips.id=trip_id and user_id=auth.uid())`

## Authz

- Server-side ownership check on every mutation (`getUserId()` → `createClient().auth.getUser()` when Supabase configured, else demo cookie). Never trust client. RLS is second gate.

## Vercel deploy

Set env vars in Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

No service-role key is needed. Every query runs through the anon client under RLS, and there is no code path that reads one.

Run migration `supabase/migrations/20250101000000_v1_trips_itinerary.sql` via Supabase SQL editor or `supabase db push`.

## Backlog (v2+)

Accommodation, transportation, budget tracker, documents storage, packing list, POI, emergency info, media & memories — specs in `TRAVEL-APP-HANDOFF.md`.

## Known gaps

Tracked in `docs/reasonix/plans/travelapp-hardening-plan.md`:

- `/og-image.png` is referenced by the Open Graph and Twitter metadata but does
  not exist. Add it before launch.
- ADR 0007 records a PWA decision that was never implemented; there is no
  manifest and no service worker.
- No `LESSONS.md`, despite CLAUDE.md §29 expecting one.
- `prettier --check` fails on pre-existing formatting drift and is not wired into
  CI for that reason.
