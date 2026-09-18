# Testing Notes — Travel App

## Verification Baseline

**All four commands must pass before any merge:**

```bash
npm test           # 35 tests, unit + integration
npm run lint       # ESLint 8.57 (next lint wrapper)
npm run typecheck  # tsc --noEmit (strict)
npm run build      # Next.js 15 production build
```

Expected results:
- `npm test`: **35 tests pass** across 7 test files
- `npm run lint`: **0 errors, 0 warnings**
- `npm run typecheck`: **0 errors**
- `npm run build`: **Compiles successfully** (middleware 139 kB, 12 routes)

---

## Test Suite Breakdown (35 tests)

| File | Tests | Coverage |
|------|-------|----------|
| `__tests__/authz.test.ts` | 2 | Authorization: own trips only (fallback store) |
| `__tests__/trip.test.ts` | 4 | Trip CRUD, validation, ownership |
| `__tests__/itinerary.test.ts` | 3 | Itinerary CRUD, ordering |
| `__tests__/auth.test.ts` | 11 | Auth flow validation (signup, login, magic link, reset) |
| `__tests__/demo-mode.test.ts` | 4 | Demo mode fallback behavior (enabled/disabled) |
| `__tests__/itinerary-cascade.test.ts` | 3 | Cascade delete, single delete, no cascade on update |
| `__tests__/server-action-validation.test.ts` | 8 | Zod schema rejections for all server actions |

---

## Dual Data Modes

### 1. In-Memory Demo Mode (default for local dev without Supabase)
- **Activation**: `NEXT_PUBLIC_AUTH_MODE=demo` in `.env.local`
- **User**: Fixed `demo-user-0001`
- **Store**: `globalThis.__travelStore` in `lib/data/store.ts`
- **Behavior**: Full CRUD works; data persists across HMR reloads
- **Safety**: **Disabled by default** — `getUserId()` returns `null` when flag is unset

### 2. Supabase Mode (production)
- **Activation**: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- **Auth**: Real Supabase Auth (email/password, magic link)
- **Data**: PostgreSQL with RLS policies
- **Fallback**: Demo mode **never activates** in Supabase mode

### Fail-Closed Guarantee
```typescript
// lib/data/auth.ts
const isDemoMode = process.env.NEXT_PUBLIC_AUTH_MODE === "demo";
if (hasSupabase) { /* try Supabase */ }
if (isDemoMode) { /* demo fallback */ }
return null; // hard fail - no silent fallback
```

---

## Running Tests Locally

### In-Memory Mode (no Supabase needed)
```bash
# Terminal 1: Start dev server
NEXT_PUBLIC_AUTH_MODE=demo npm run dev

# Terminal 2: Run tests (auto-detects demo mode)
npm test
npm run lint
npm run typecheck
npm run build
```

### Supabase Mode (requires credentials)
1. Follow `SUPABASE_SETUP.md` to create project
2. Copy `.env.example` to `.env.local` with real values
3. **Do NOT set** `NEXT_PUBLIC_AUTH_MODE=demo`
4. Run verification commands

---

## Adding New Tests

1. **Unit**: Place in `__tests__/*.test.ts` — test pure logic, schema validation
2. **Integration**: Test server actions via direct imports (mock Supabase when needed)
3. **E2E**: Use Playwright in `test:e2e` for browser flows

### Test Patterns Used
- `vi.resetModules()` + `beforeEach` for clean env isolation
- `resetStore()` for in-memory store cleanup
- Direct schema tests: `schema.safeParse(input)` → assert `!result.success`
- Server action tests: Import action, pass `FormData`, assert `{ error: string }`

---

## CI/CD Notes

- Pre-commit hook: `npx lint-staged` (ESLint + Prettier on staged files)
- Husky: `.husky/pre-commit`
- No test runner in pre-commit (too slow) — rely on CI for full suite
- Build must pass before merge (GitHub Actions runs all 4 commands)

---

## Known Test Gaps (Future)

- E2E browser tests for auth flow (signup → login → trip CRUD → logout)
- Cross-user RLS verification against live Supabase
- Visual regression tests for UI components
- Performance benchmarks for Core Web Vitals

---

*Last updated: 2026-09-17 — Baseline: 35 tests, all 4 commands green*