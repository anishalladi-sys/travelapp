# Phase 06 — Production Hardening

Goal: make everything fast, accessible, resilient, and observable.

## Segments

### 06.1 — Performance (prompt: `prompts/06.1-performance.md`)
- Measure first (Lighthouse/devtools) on the 4 main pages; record before numbers.
- Fix: image optimization (next/image), font loading, bundle size, lazy-load
  below-fold sections + charts, reduce re-renders in editor, CWV targets
  (LCP < 2.5s, CLS < 0.1, INP good on mid-range mobile).
- Record after numbers; no claim without measurement.

### 06.2 — Accessibility + mobile (prompt: `prompts/06.2-a11y-mobile.md`)
- WCAG 2.2 AA pass: contrast, focus order, labels, aria on timeline/gallery/
  progress components, keyboard-complete flows, screen-reader smoke test.
- Mobile: touch targets ≥ 44px, safe-area insets, horizontal-scroll affordances,
  viewport + dynamic type sanity.

### 06.3 — PWA / offline basics (prompt: `prompts/06.3-pwa.md`)
- Manifest, icons, installable, offline shell (cached static + last-viewed trip).
- Keep scope small: read-mostly offline is enough; queue-free for v1 of PWA.

### 06.4 — Observability + CI (prompt: `prompts/06.4-observability-ci.md`)
- Sentry verified end-to-end (already a dep): capture server actions + client
  errors, no PII/secrets in payloads.
- GitHub Actions: lint, typecheck, test, build on PR. Green required to merge.
- E2E smoke suite (Playwright): signup → create trip → add item → verify.

### 06.5 — QA (prompt: `prompts/06.5-qa-production.md`)
- Full production-readiness gate from CLAUDE.md §15 as a checklist.
- Fix defects found.

## Exit criteria
CWV targets measured and met; a11y pass; PWA installable; CI green; Sentry live.
