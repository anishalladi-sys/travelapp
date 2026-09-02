# Spec: Travel App v1 — Trip Basics + Itinerary

## Objective
Build a mobile/web app for capturing trip information. v1 is limited to two vertical slices so we ship a verifiable increment fast. Users can create/view/edit trips and manage day-by-day itinerary items on each trip. Authz: users only see/modify their own trips. Everything else (accommodation, transport, budget, documents, packing, POI, emergency, media) is backlog v2+.

### User & Outcome
- **User:** Solo traveler / small group planner capturing itinerary in one place per trip.
- **Outcome:** User can create a trip (title, destination, dates, type, traveler count, status) and add itinerary items (date, time, activity, location, notes) and see them organized by trip/day.
- **Why now:** Greenfield — nothing exists. Ship narrowest vertical slice first.
- **Success:** User creates trip → appears in list → opens trip → adds itinerary item → edits/deletes both → cannot see another user's trips.

## Assumptions (correct me or I proceed)
1. Web app only for v1 (not native mobile). Responsive, mobile-first.
2. Auth: Supabase Auth email/password. RLS enforces ownership server-side.
3. DB: Supabase Postgres (free tier). `auth.users` is source of truth for Users.
4. Hosting: Vercel (frontend). No worker needed for v1.
5. Currency/docs/storage deferred — no S3/R2 in v1.

## Tech Stack
- Next.js 15 App Router, TypeScript strict, Tailwind CSS, shadcn/ui + Radix
- Supabase (Postgres + Auth + RLS), Zod validation, React Hook Form
- Vitest + Testing Library (unit), Playwright optional (e2e later)
- Biome/ESLint, Vercel

## Commands
```
Dev:   npm run dev
Build: npm run build
Test:  npm test
Lint:  npm run lint
Typecheck: npx tsc --noEmit
DB: supabase migrations via docs/migrations/ (SQL)
```

## Project Structure
```
app/                  → Next.js App Router (server components default)
  (auth)/login        → login page
  (dashboard)/trips   → trips list, trip detail, itinerary
components/ui/        → shadcn primitives
lib/
  supabase/           → client/server supabase helpers
  validations/        → zod schemas (trip, itinerary)
  utils.ts
docs/
  reasonix/specs/     → this spec
  reasonix/plans/     → implementation plan
  architecture/       → system overview
  decisions/          → ADRs
  migrations/         → SQL migrations (if we stay on local SQLite fallback, mirror there)
supabase/migrations/  → alt location if supabase CLI used (mirror to docs/migrations)
```

## Data Model (v1 only)
```
Users → Supabase auth.users (id uuid PK)

Trips
- id uuid PK default gen_random_uuid()
- user_id uuid FK auth.users.id NOT NULL
- title text NOT NULL
- destination text NOT NULL
- start_date date NOT NULL
- end_date date NOT NULL CHECK (end_date >= start_date)
- trip_type text CHECK in ('leisure','business','adventure','family','other')
- traveler_count int NOT NULL DEFAULT 1 CHECK >=1
- status text NOT NULL DEFAULT 'planning' CHECK in ('planning','upcoming','ongoing','completed','cancelled')
- created_at timestamptz default now()
- Index: (user_id, start_date)

Itinerary_Items
- id uuid PK
- trip_id uuid FK trips.id ON DELETE CASCADE NOT NULL
- date date NOT NULL
- time time NULL
- activity text NOT NULL
- location text NULL
- notes text NULL
- sort_order int default 0
- created_at timestamptz default now()
- Index: (trip_id, date, time)
- FK ensures itinerary belongs to a trip; RLS on trips + join check for items.
```

## RLS / Security (non-negotiable)
- Enable RLS on `trips` and `itinerary_items`.
- Policies: `FOR ALL USING (auth.uid() = user_id)` on trips; itinerary_items via `EXISTS (select 1 from trips where trips.id = itinerary_items.trip_id AND trips.user_id = auth.uid())`.
- Every mutation validates ownership server-side (never trust client).
- Zod at API boundary; never log secrets; env vars via .env.local (gitignored).

## API / Interface Design
No custom REST needed for v1 — direct Supabase client from Server Actions / Route Handlers with Zod. If we add route handlers, shape:
- `POST /api/trips` {title, destination, start_date, end_date, trip_type, traveler_count, status}
- `GET /api/trips` → user's trips
- `PATCH /api/trips/:id`, `DELETE /api/trips/:id`
- `POST /api/trips/:tripId/itinerary` {date, time, activity, location, notes}
- `PATCH/DELETE /api/trips/:tripId/itinerary/:itemId`
All require auth; return 401/403 on violation; validate with Zod; idempotent deletes.

## UI Flows (v1)
1. Login → Trips list (empty state + CTA) → Create trip (form) → list shows new trip
2. Click trip → Trip detail (header + itinerary list grouped by date) → Add item → appears sorted by date/time
3. Edit trip, edit item, delete item, delete trip (cascade deletes items)
4. Loading/error/empty states on every async boundary; mobile-first responsive; keyboard nav; accessible forms.

## Code Style
- TypeScript strict, no `any`; `use client` only when needed (forms, interactivity)
- Server Components default; Tailwind for styling; reuse `components/ui/*`
- Zod schemas colocated in `lib/validations/`
- Example:
```ts
// lib/validations/trip.ts
export const tripSchema = z.object({
  title: z.string().min(1).max(100),
  destination: z.string().min(1).max(100),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).refine(d => d.end_date >= d.start_date, { message: "end_date >= start_date" });
```

## Testing Strategy
- Framework: Vitest + Testing Library for unit/component; optional Playwright for E2E later.
- Where: `__tests__/` colocated or `tests/`; mirror `app/` structure.
- Coverage: critical paths — trip CRUD, itinerary CRUD, authz (own-trip isolation), validation (date order, required fields), RLS policies (via integration test with mocked Supabase).
- TDD per slice: write failing test → minimal impl → verify.
- Always run `npm run lint && npx tsc --noEmit && npm test` before commit.

## Boundaries
- Always: tests for behavior change, server-side authz on every mutation, validate input at boundary, RLS enabled, no secrets committed.
- Ask first: schema change, new dependency, adding storage/auth provider, changing hosting.
- Never: commit `.env`, log tokens/passwords, expose service_role key to client, trust frontend authz, edit vendor dirs, delete failing tests to get green.

## Success Criteria (testable)
- [ ] User can sign up/login (Supabase Auth) and sees only own trips
- [ ] Create trip with valid data appears in list; invalid (missing title, end<start) shows validation error
- [ ] Trip detail shows trip header + itinerary grouped by date, sorted by time
- [ ] Add/edit/delete itinerary item persists and reflects immediately; delete trip cascades
- [ ] Direct fetch of another user's trip id returns 403/empty (RLS) — verified by test with two mocked users
- [ ] Loading, error, empty states render; mobile responsive; lint/typecheck/build pass

## Open Questions (resolved for v1)
- Platform: Web only (Option A). Mobile later.
- Backlog deferred explicitly: accommodation, transport, budget, documents, packing, POI, emergency, media.

## Non-goals (v1)
- Offline sync, native mobile, file uploads, currency conversion, expense splitting, maps/location pins, sharing.
