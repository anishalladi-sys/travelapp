# Phase 00 — Foundation Repairs

Goal: make the app healthy before any redesign work. Everything in later phases
assumes auth is real, typecheck/lint are green, and tests run reliably.

## Segments

### 00.1 — Real Supabase auth (prompt: `prompts/00.1-fix-auth.md`) ✅
- Route the existing untracked auth code (`app/auth/`, `components/auth-form.tsx`,
  `lib/validations/auth.ts`) into the real app flow.
- Wire Supabase Auth (email/password + magic link; OAuth optional).
- Fix `auth-form.tsx` typecheck errors (missing `ui/checkbox`, `ui/separator`,
  bad `next/link` import, unused vars, generic type errors).
- Replace the demo-cookie fallback (`lib/data/auth.ts`, `travelapp_user_id`) with
  real session lookup. Demo fallback requires explicit non-production opt-in; production must reject it even when its flag is set (see prompts/_CONVENTIONS.md).
- Verify RLS in BOTH migration copies (`docs/migrations/` canonical + `supabase/migrations/`) matches
  the new auth (trips: user_id ownership; itinerary: via parent trip); update both copies + `SUPABASE_SETUP.md` if needed.
- Protect trips routes server-side; never trust client-side checks.

### 00.2 — Lint + typecheck (prompt: `prompts/00.2-fix-lint-typecheck.md`) ✅
- `npm run lint` fails: `next lint` passes legacy options rejected by the installed ESLint 8.x. Diagnose the version/config mismatch and fix the config; do not upgrade ESLint majors as a side effect.
- `npm run typecheck` must pass with zero errors.
- Add lint+typecheck back into any pre-commit hook (.husky currently empty).

### 00.3 — Env + test baseline (prompt: `prompts/00.3-env-tests.md`) ✅
- Document all required env vars in `.env.example` (no real secrets).
- Confirm demo mode works only with explicit non-production opt-in; confirm Supabase mode works with env set; confirm fail-closed behavior when configuration is absent or invalid (document how to run both modes).
- Strengthen tests where cheap (auth flow test, server-action validation tests).
- Establish the verification baseline used by all later prompts:
  `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.

### 00.4 — QA (prompt: `prompts/00.4-qa-foundation.md`) ✅
- Functional check: signup/login/logout, create/edit/delete trip, add/edit/remove
  itinerary item, ownership isolation between two users.
- Fix any defect found. Re-verify. Only then mark phase done.

## Exit criteria ✅
`npm test` + `npm run lint` + `npm run typecheck` + `npm run build` all green;
auth flow works end-to-end; RLS verified; tasks/README.md statuses ✅.

**Phase 00 COMPLETE** — Foundation repairs done. Ready for Phase 01.
