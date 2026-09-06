# ADR 0005 — Testing: Vitest + Playwright

Date: 2026-09-05
Status: Accepted

## Context
Need comprehensive testing strategy covering unit, integration, and E2E. Requirements:
- Fast unit/component tests (run on every commit)
- Integration tests for authz (RLS, ownership)
- E2E tests for critical user flows
- Accessibility testing
- CI integration

## Decision
**Vitest + React Testing Library** for unit/integration tests. **Playwright** for E2E tests. **axe-core** for automated a11y testing in Vitest.

## Alternatives Considered
- **Jest** — rejected: Vitest faster, native ESM, better Vite/Next.js integration
- **Cypress** — rejected: Playwright better multi-browser, parallel, CI support
- **Testing Library only** — rejected: need E2E for real browser behavior
- **No E2E** — rejected: critical for authz, payments, file uploads

## Consequences
- Positive: Vitest fast (~100ms/test), Playwright reliable cross-browser, axe-core catches a11y regressions
- Negative: two test frameworks to maintain, Playwright slower in CI
- Migration path: can consolidate if needed

## Verification
- `npm test` runs Vitest (unit + integration)
- `npm run test:e2e` runs Playwright
- CI runs both on every PR
- Coverage: critical paths (auth, CRUD, authz) > 80%