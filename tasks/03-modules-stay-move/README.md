# Phase 03 — Modules: Stay + Move

Goal: accommodations and transport modules — the "where do I sleep and how do I
get there" core. Both follow the same pattern: schema+data+actions first, UI
second, phase QA last. New UI inherits the Phase 01 design system directly.

Convention for all module segments:
- New tables follow the existing migration format under BOTH `docs/migrations/` (canonical) and `supabase/migrations/` (db:push); keep them in sync.
- RLS + ownership enforced at the DB level for every new table.
- Zod schemas in `lib/validations/`; server actions under `app/trips/[id]/<module>/`
  or co-located; data layer in `lib/data/`.
- Currency/date handling consistent with trip settings.

## Segments

### 03.1 — Accommodations data (prompt: `prompts/03.1-accommodation-data.md`)
- `accommodations` table: trip_id, name, type (hotel/hostel/apartment/etc),
  address, check_in, check_out, cost, currency, confirmation/booking ref,
  contact info, notes. RLS ownership. Zod validation. CRUD server actions.
- Seed test data for dev mode.

### 03.2 — Accommodations UI (prompt: `prompts/03.2-accommodation-ui.md`)
- Tab/section on trip page, styled cards, stay timeline by night, booking
  reference copy button, empty/loading/error states, reveal animations.

### 03.3 — Transport data (prompt: `prompts/03.3-transport-data.md`)
- `transport` table: trip_id, type (flight/train/bus/ferry/car/other), provider,
  from/to, depart/arrive datetime, booking ref, cost, currency, notes. RLS. CRUD.

### 03.4 — Transport UI (prompt: `prompts/03.4-transport-ui.md`)
- Transport timeline (departure-ordered), icons per mode, booking refs, cost
  display, connection-to-accommodation awareness (nice-to-have).

### 03.5 — QA (prompt: `prompts/03.5-qa-stay-move.md`)
- Full CRUD functional pass on both modules, ownership isolation between users,
  validation errors surface correctly, UI states verified in browser.
- Fix defects found.

## Exit criteria
Both modules fully functional with verified RLS; styled consistently; tests green.
