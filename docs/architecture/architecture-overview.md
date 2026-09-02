# Architecture Overview — Travel App v1

## Context
Greenfield trip capture app. v1 scope: Trip Basics + Itinerary only. Goal: shippable web vertical slice with authz, validated inputs, RLS, minimal infra.

## Stack Decision (ADR 0001)
- **Frontend:** Next.js 15 App Router, TypeScript strict, Tailwind, shadcn/ui (Radix)
- **Backend:** Supabase (Postgres + Auth + RLS). No custom Express server for v1; Server Actions / Route Handlers call Supabase directly.
- **Hosting:** Vercel (free tier)
- **Validation:** Zod at trust boundary
- **Testing:** Vitest + Testing Library
- Rationale: all-free, matches CLAUDE.md existing stack, RLS gives DB-level isolation without custom backend, fastest to vertical slice. Alternative (NextAuth + SQLite) would lack RLS and require more custom authz code.

## System Diagram
```
Browser (Next.js App Router)
  ├─ Server Components → Supabase (via server client + RLS)
  ├─ Client Components (forms) → Server Actions → Supabase
  └─ Supabase Auth (email/password) → auth.users
           ↓
        Postgres
         ├─ trips (user_id FK auth.users)
         └─ itinerary_items (trip_id FK trips, cascade)
```

## Data Flow
1. User logs in via Supabase Auth (client).
2. Server Components read `auth.uid()` via supabase server client; queries automatically scoped by RLS.
3. Mutations go through Server Actions that validate with Zod, then insert/update/delete via supabase service-agnostic client (anon key + user JWT). RLS rejects cross-user writes.
4. Itinerary items never queried without trip ownership check (policy via EXISTS).

## Security Boundaries
- AuthN: Supabase Auth
- AuthZ: RLS + server-side ownership check (double-gate). Never trust client.
- Validation: Zod on every mutation (title, destination required; end_date >= start_date; time optional).
- Secrets: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` public; `SUPABASE_SERVICE_ROLE_KEY` never exposed to client; `.env.local` gitignored.

## Deployment
- Vercel env vars set via dashboard (no secrets in repo).
- Migrations: `docs/migrations/001-v1-trips-itinerary.sql` (source of truth), also mirrored to `supabase/migrations/` if CLI used.

## Observability (v1 minimal)
- Structured console logs for mutations (no PII/secrets)
- Error boundaries + toast for user-facing errors
- Health: Supabase dashboard + Vercel logs

## Backlog Isolation
Schema only has trips + itinerary_items. Adding accommodation/transport/etc later is additive (new tables FK trips), no rewrite.

## Constraints
- Mobile-first responsive, 44px touch targets, keyboard nav, accessible forms.
- Server Components by default; `"use client"` only for interactivity.
