# Phase 07 — Final QA

Goal: prove the whole product works as one system, then fix everything found.

## Segments

### 07.1 — Full end-to-end audit (prompt: `prompts/07.1-audit.md`)
- Systematic audit across every feature: auth, trips, itinerary, accommodations,
  transport, budget, packing, documents, POI, emergency, media.
- Method: scripted Playwright E2E + manual devtools browser pass per module,
  two-user ownership isolation checks, error-path checks (network failure,
  invalid input, empty states), mobile viewport pass.
- Output: defect list with severity, written to `docs/audits/periodic/`.

### 07.2 — Repairs (prompt: `prompts/07.2-repairs.md`)
- Fix every defect from 07.1, highest severity first.
- Re-run the full verification suite + failed E2E steps as proof.
- Update tasks/README.md; write lessons to LESSONS.md if any meaningful gotcha
  was discovered.

## Exit criteria
Zero open critical/major defects; all suites green; final report delivered with
READY/NOT READY verdict per CLAUDE.md §38.
