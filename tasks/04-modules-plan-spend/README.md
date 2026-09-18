# Phase 04 — Modules: Spend + Pack

Goal: budget tracking and packing lists. Same conventions as Phase 03
(schema → data+actions → UI → QA). Design system inherited.

## Segments

### 04.1 — Budget data (prompt: `prompts/04.1-budget-data.md`)
- `expenses` table: trip_id, category (food/transport/lodging/activities/shopping/
  other), description, amount, currency, date, payment method. RLS. CRUD actions.
- Category totals + trip total computed at query level.

### 04.2 — Budget UI (prompt: `prompts/04.2-budget-ui.md`)
- Budget dashboard: category breakdown (Recharts), spending list with quick add,
  animated counters, per-day spend strip, over-budget signal if trip budget set.

### 04.3 — Packing data (prompt: `prompts/04.3-packing-data.md`)
- `packing_items` table: trip_id, name, category, quantity, packed boolean,
  ai_suggested boolean optional. RLS. CRUD + toggle-packed action.
- Optional template presets (beach/city/hiking) as seed lists.

### 04.4 — Packing UI (prompt: `prompts/04.4-packing-ui.md`)
- Checklist grouped by category, satisfying packed interaction (animated check),
  progress bar, quick-add, add-from-template flow.

### 04.5 — QA (prompt: `prompts/04.5-qa-spend-pack.md`)
- Full CRUD + toggles, ownership isolation, charts render correctly, mobile UX.
- Fix defects found.

## Exit criteria
Budget and packing fully functional; RLS verified; UI consistent; tests green.
