# TravelApp Improvement Plan — Master Tracker

## Approved scope

Repair the foundation and real Supabase auth, establish an editorial-travel design system, add rich accessible scroll storytelling, build all eight v2 modules, then harden and audit the complete app. This is a plan, not a claim that these features exist.

36 segments across 8 phases. Phase READMEs describe the work; `prompts/` contains the execution instructions. Paths below are repository-root-relative.

## Execution

Say **"go to prompts, next task"**. Read `prompts/_CONVENTIONS.md` first, then the earliest eligible prompt below. Execute one segment, verify it, update its state/evidence, and stop. Never infer completion from the presence of a prompt file.

States: pending, in_progress, blocked, verified, audit_complete. Resume in-progress work; report blockers instead of skipping them. Verified means required acceptance checks passed. The shared rules define the narrow 00.1 tooling handoff and 07.1 audit-to-repair exception.

Create each segment branch from a safely established working state containing its predecessors, not blindly from main. Preserve user changes. No automatic commits, merges, pushes, or deployments. Read the full branch, test-environment, migration, and security rules in `prompts/_CONVENTIONS.md`.

Record branch/base, changed paths, test commands/results, browser/integration evidence, defects and resume instructions in Notes or the phase README. All implementation is currently pending.

## Phase 00 — Foundation repairs

Phase plan: `tasks/00-foundation/README.md`.

| ID | Segment | Prompt | Status | Notes |
|---|---|---|---|---|
| 00.1 | Real Supabase auth and ownership | `prompts/00.1-fix-auth.md` | pending | |
| 00.2 | Lint and typecheck repair | `prompts/00.2-fix-lint-typecheck.md` | pending | |
| 00.3 | Environment and test baseline | `prompts/00.3-env-tests.md` | pending | |
| 00.4 | Foundation QA and fixes | `prompts/00.4-qa-foundation.md` | pending | |

## Phase 01 — Editorial design system

Phase plan: `tasks/01-design-system/README.md`.

| ID | Segment | Prompt | Status | Notes |
|---|---|---|---|---|
| 01.1 | Tokens and typography | `prompts/01.1-tokens.md` | pending | |
| 01.2 | Accessible UI primitives | `prompts/01.2-primitives.md` | pending | |
| 01.3 | Scroll and reduced-motion utilities | `prompts/01.3-scroll-motion.md` | pending | |
| 01.4 | Design-system QA and fixes | `prompts/01.4-qa-design-system.md` | pending | |

## Phase 02 — Existing pages

Phase plan: `tasks/02-page-overhaul/README.md`.

| ID | Segment | Prompt | Status | Notes |
|---|---|---|---|---|
| 02.1 | Home page | `prompts/02.1-home.md` | pending | |
| 02.2 | Trips list and create flow | `prompts/02.2-trips-list.md` | pending | |
| 02.3 | Trip detail and day navigation | `prompts/02.3-trip-detail.md` | pending | |
| 02.4 | Itinerary editing and trip metadata UX | `prompts/02.4-editor.md` | pending | |
| 02.5 | Page QA and fixes | `prompts/02.5-qa-pages.md` | pending | |

## Phase 03 — Stay and move

Phase plan: `tasks/03-modules-stay-move/README.md`.

| ID | Segment | Prompt | Status | Notes |
|---|---|---|---|---|
| 03.1 | Accommodations data and actions | `prompts/03.1-accommodation-data.md` | pending | |
| 03.2 | Accommodations UI | `prompts/03.2-accommodation-ui.md` | pending | |
| 03.3 | Transport data and actions | `prompts/03.3-transport-data.md` | pending | |
| 03.4 | Transport UI | `prompts/03.4-transport-ui.md` | pending | |
| 03.5 | Stay/move QA and fixes | `prompts/03.5-qa-stay-move.md` | pending | |

## Phase 04 — Spend and pack

Phase plan: `tasks/04-modules-plan-spend/README.md`.

| ID | Segment | Prompt | Status | Notes |
|---|---|---|---|---|
| 04.1 | Budget data and currency-safe totals | `prompts/04.1-budget-data.md` | pending | |
| 04.2 | Budget UI | `prompts/04.2-budget-ui.md` | pending | |
| 04.3 | Packing data and templates | `prompts/04.3-packing-data.md` | pending | |
| 04.4 | Packing checklist UI | `prompts/04.4-packing-ui.md` | pending | |
| 04.5 | Spend/pack QA and fixes | `prompts/04.5-qa-spend-pack.md` | pending | |

## Phase 05 — Prepare

Phase plan: `tasks/05-modules-prepare/README.md`.

| ID | Segment | Prompt | Status | Notes |
|---|---|---|---|---|
| 05.1 | Document metadata data layer | `prompts/05.1-documents-data.md` | pending | |
| 05.2 | Documents UI | `prompts/05.2-documents-ui.md` | pending | |
| 05.3 | Places and itinerary conversion | `prompts/05.3-poi.md` | pending | |
| 05.4 | Verified emergency info and contacts | `prompts/05.4-emergency.md` | pending | |
| 05.5 | Media gallery using R2 | `prompts/05.5-media.md` | pending | |
| 05.6 | Prepare-module QA and fixes | `prompts/05.6-qa-prepare.md` | pending | |

## Phase 06 — Production hardening

Phase plan: `tasks/06-production/README.md`.

| ID | Segment | Prompt | Status | Notes |
|---|---|---|---|---|
| 06.1 | Measured performance | `prompts/06.1-performance.md` | pending | |
| 06.2 | Accessibility and mobile | `prompts/06.2-a11y-mobile.md` | pending | |
| 06.3 | PWA and privacy-safe offline basics | `prompts/06.3-pwa.md` | pending | |
| 06.4 | Observability and CI | `prompts/06.4-observability-ci.md` | pending | |
| 06.5 | Production QA and fixes | `prompts/06.5-qa-production.md` | pending | |

## Phase 07 — Final functional audit

Phase plan: `tasks/07-final-qa/README.md`.

| ID | Segment | Prompt | Status | Notes |
|---|---|---|---|---|
| 07.1 | Full product audit and defect report | `prompts/07.1-audit.md` | pending | |
| 07.2 | Repair findings and reverify | `prompts/07.2-repairs.md` | pending | |

## Baseline, not completion evidence

The existing 9 unit tests passed during planning. Lint failed on ESLint options; typecheck failed in unfinished auth-form code; build failed at lint/type validation. These are assigned to Phase 00, not fixed by this documentation task. Browser, live database/RLS, R2, deployment, and field performance were not verified here. Application status: NOT READY TO SHIP.

Planning generated by Union Alpha; maker currently anonymous.
