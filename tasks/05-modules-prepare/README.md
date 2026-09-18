# Phase 05 — Modules: Prepare

Goal: documents, POI research, emergency info, media gallery. Docs get separate
data and UI segments; POI/emergency/media each combine data+UI in one segment.
All new UI inherits the Phase 01 design system.

## Segments

### 05.1 — Documents data (prompt: `prompts/05.1-documents-data.md`)
- `travel_documents` table: trip_id, type, title, number, expiry, notes. RLS. CRUD.
- **Security note:** store only metadata + notes in DB, never scans of sensitive
  IDs unless encryption added deliberately (CLAUDE.md: AES-256 if credentials
  stored).

### 05.2 — Documents UI (prompt: `prompts/05.2-documents-ui.md`)
- Document cards with expiry warnings, masked numbers, completeness checklist.

### 05.3 — POI research (prompt: `prompts/05.3-poi.md`)
- `points_of_interest` table: RLS. CRUD + visited toggle + convert-to-itinerary.
- UI: saved-places list, map-link-out pattern (no map SDK this phase — links to
  Google/Apple Maps).

### 05.4 — Emergency info (prompt: `prompts/05.4-emergency.md`)
- Mostly computed/curated UI: per-trip emergency section (local emergency numbers
  by destination country, embassy placeholder, personal contacts, insurance
  hotline). Data model minimal or derived from documents.
- Simple, findable, print-friendly.

### 05.5 — Media gallery (prompt: `prompts/05.5-media.md`)
- `trip_media` table + upload strategy. **Production storage: Cloudflare R2 per
  accepted ADR-0002** (signed URLs). Dev/in-memory mode uses a dev adapter so no
  credentials are needed locally. File limits (size/type) validated server-side.
- UI: horizontal-scroll gallery (scroll-storytelling), lightbox, upload flow,
  delete with confirmation.

### 05.6 — QA (prompt: `prompts/05.6-qa-prepare.md`)
- Functional pass on all four modules; upload/delete with wrong-file rejection
  verified; ownership isolation; fix defects.

## Exit criteria
All prepare modules functional; security notes respected (metadata-only docs;
R2-per-ADR storage); tests green.
