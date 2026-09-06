# Feature: Travel App v1 — Trip Basics + Itinerary

Status: Implemented (2026-09-02)
Spec: `docs/reasonix/specs/travelapp-v1-spec.md`
Plan: `docs/reasonix/plans/travelapp-v1-plan.md`
ADR: `docs/decisions/0001-use-nextjs-supabase-for-v1.md`
Migration: `supabase/migrations/20250101000000_v1_trips_itinerary.sql`

## What shipped
- Create/view/edit/delete trips (title, destination, dates, type, traveler count, status)
- Day-by-day itinerary on each trip (date, time, activity, location, notes), grouped by date, sorted by time, add/edit/delete
- Authz: users see only own trips; server-side ownership check + RLS (policy `auth.uid()=user_id` and `EXISTS` for items)
- Validation: Zod at boundary (title/destination required, end >= start, activity required, date format YYYY-MM-DD)
- UI: mobile-first responsive, loading/error/empty states, keyboard nav, 44px touch targets

## What did not ship (backlog)
Accommodation, transport, budget, documents, packing, POI, emergency, media — deferred to v2+. See `TRAVEL-APP-HANDOFF.md`.

## How to verify
```
npm test            # 9 tests (trip/itinerary validation + authz store)
npx tsc --noEmit    # strict
npm run lint        # eslint
npm run build       # next build (5 routes)
# manual: npm run dev → / → /trips → create trip → open trip → add itinerary → edit/delete → verify cross-user isolation via RLS test
```

## Security notes
- Never log secrets; env via .env.local (gitignored)
- RLS enabled before any data
- Zod on every mutation
- Demo fallback uses cookie `travelapp_user_id` when Supabase env missing; production uses Supabase Auth JWT

## Rollback
Revert commit on `feat/travelapp-v1` branch; trips table remains; no destructive migration rollback needed (drop tables if desired).

## Next
- Wire Supabase Auth login UI (currently demo user when env missing)
- Add real file storage for Documents when that slice ships
- Add Playwright E2E for create-trip → add-item flow
