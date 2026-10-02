# Plan: No-Vibe Launch Readiness

## Overview

Execute the spec in `docs/reasonix/specs/no-vibe-launch-readiness.md` as 7 small sequential tasks. Say **"next"** and the agent does exactly one task: create branch, implement, verify, update `tasks/08-launch-readiness/README.md`, and stop. Strictly in order; each task leaves the app working.

## How "next" works

1. Read `tasks/08-launch-readiness/README.md`, find the earliest task with status `pending`.
2. Create its branch from a clean working tree. Never touch main.
3. Implement only that task's files. No drive-by refactors.
4. Run its verification commands. Paste results into the tracker.
5. Mark it `verified`, stop, and report. Wait for the next "next".

## Architecture decisions

- Lucide replaces all UI emoji; emoji never returns (lint by grep, not a new dep).
- Legal pages are static Server Components under `app/(legal)/`; no DB, no client JS.
- Favicon via `app/icon.png` + `apple-touch-icon.png` (Next.js convention); OG via `public/og-image.png`; SEO via `app/robots.ts` + `app/sitemap.ts`.
- Domain cutover is config + checklist; DNS clicks stay manual.

---

## Task 1: Replace emoji icons with Lucide

**Description:** Swap the 3 production emoji for Lucide icons in clay circles.
**Branch:** `fix/no-vibe-emoji-icons`
**Files:**

- `app/trips/page.tsx:56` (suitcase -> `Luggage`)
- `app/trips/[id]/page.tsx:161` (calendar -> `CalendarDays`)
- `components/ui/timeline.tsx:37` (pin -> `MapPin`, keep `aria-hidden`)
- Leave `app/design/page.tsx:1290` demo alone or swap for `Sparkles` icon.
  **Acceptance:**
- [ ] Zero emoji in `app/trips/`, `components/ui/`.
- [ ] Icons render at same sizes, no layout shift, timeline pin keeps accessible name via surrounding text.
      **Verification:**
- [ ] `rg -n "[🧳📅📍✨]" app/trips components/ui` returns nothing (or only intentional demo).
- [ ] `npm run lint`, `npx tsc --noEmit` pass.
      **Dependencies:** None. **Scope:** S (3 files).

## Task 2: Em dashes + slop copy + hero

**Description:** Purge em dashes from user-facing copy, fix the one slop word, tighten the hero.
**Branch:** `fix/no-vibe-copy`
**Files:**

- `app/layout.tsx:30,34,52,54,69,71` (`—` -> `:` or `,`)
- `app/page.tsx:57-62` hero -> `H1: "Plan trips with day-by-day itineraries"`, sub specific to trips/budgets/docs.
- `app/page.tsx:79` lede: drop "delightful", use concrete wording from spec.
- `app/page.tsx:105` "Join travelers who plan smarter." -> numberless concrete line, e.g. "Create your first trip in minutes. Free to start."
  **Acceptance:**
- [ ] Zero `—` in `app/layout.tsx`, `app/page.tsx`.
- [ ] Zero banned slop words in hero/lede.
      **Verification:**
- [ ] `rg -n "—" app/layout.tsx app/page.tsx` empty; `rg -ni "delightful|seamless|unlock|elevate|supercharge|revolutionize" app/page.tsx` empty.
- [ ] `npm run lint`, `npx tsc --noEmit` pass; homepage renders at 320/768/1440 with no overflow.
      **Dependencies:** None (after Task 1 in order, no code coupling). **Scope:** S (2 files).

## Task 3: Gradients out + dev link off public homepage

**Description:** Replace flat-placeholder gradients with clay surfaces; remove the `/design` dev link from the public footer.
**Branch:** `fix/no-vibe-gradients`
**Files:**

- `app/trips/[id]/page.tsx:76,81` (`bg-gradient-to-*` -> `bg-clay-pressed` / `bg-clay-surface`).
- `app/page.tsx:113-120` footer: drop "Built with Next.js..." dev credit + `/design` link; keep minimal copyright or product links.
- `app/design/page.tsx:402,867` demo gradients -> clay or leave only if page is auth-gated (record decision in tracker).
  **Acceptance:**
- [ ] Zero `bg-gradient-*`, zero purple/violet/indigo in `app/trips/`, `app/page.tsx`.
- [ ] Public homepage has no `/design` link.
      **Verification:**
- [ ] `rg -n "bg-gradient|from-purple|via-purple|purple|violet|indigo" app/trips app/page.tsx` empty.
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build` pass.
      **Dependencies:** Tasks 1-2. **Scope:** S (2-3 files).

## Task 4: Privacy + Terms pages + footer links

**Description:** Ship real `/privacy` and `/terms` routes and link them publicly.
**Branch:** `feat/legal-pages`
**Files:**

- `app/(legal)/privacy/page.tsx` (new: scope, data collected, cookies, contact, updated date; `export const metadata`).
- `app/(legal)/terms/page.tsx` (new: service description, acceptable use, liability, contact, updated date; metadata).
- Footer component or `app/page.tsx` footer + `app/trips/layout.tsx` if a shared footer exists: add Privacy/Terms links.
  **Acceptance:**
- [ ] `/privacy` and `/terms` return 200, have H1, contact email, updated date.
- [ ] Linked from public footer; no placeholder lorem.
      **Verification:**
- [ ] `npm run build` pass; manual: visit `/privacy`, `/terms` at mobile + desktop.
- [ ] `npm test` pass (add/adjust route test if convention requires).
      **Dependencies:** Tasks 1-3. **Scope:** M (3-4 files).

## Task 5: Favicon + OG + robots + sitemap

**Description:** Replace stock icon with brand mark and close SEO placeholders.
**Branch:** `chore/brand-seo-assets`
**Files:**

- `app/icon.png` (new, 32px+ terracotta plane mark), `app/apple-touch-icon.png` (new, 180px).
- Keep `app/favicon.ico` until PNG pipeline verified, then remove if redundant (record in tracker).
- `public/og-image.png` (new, 1200x630, no text smaller than 24px, clay background).
- `app/robots.ts` (new), `app/sitemap.ts` (new, reads real domain from env).
- `app/layout.tsx` metadata: point `openGraph.url`, `images` at real domain + `/og-image.png`; remove placeholder comments.
  **Acceptance:**
- [ ] Tab icon is the new mark in light + dark; `/og-image.png` loads 200; `/robots.txt` + `/sitemap.xml` load 200.
- [ ] No references to missing assets.
      **Verification:**
- [ ] `npm run build` pass; check `/favicon.ico`, `/robots.txt`, `/sitemap.xml`, `/og-image.png` on dev server.
- [ ] `npm run lint`, `npx tsc --noEmit` pass.
      **Dependencies:** Task 4. **Scope:** M (5-6 files, mostly binary + small TS).

## Task 6: Custom-domain cutover checklist + config

**Description:** Make the repo domain-ready; human does DNS clicks.
**Branch:** `chore/custom-domain`
**Files:**

- `.env.example` (`NEXT_PUBLIC_APP_URL`, `EMAIL_FROM` documented with real-domain placeholder).
- `app/layout.tsx` `openGraph.url`/`metadataBase` uses `NEXT_PUBLIC_APP_URL`.
- `docs/features/custom-domain-checklist.md` (new): Vercel Domains steps, Supabase Auth redirect URLs, Resend domain verification, post-cutover smoke test.
- `SUPABASE_SETUP.md` or docs update for redirect-URL step (append, don't rewrite).
  **Acceptance:**
- [ ] No `example.com`/`yourdomain.com`/`localhost` in production metadata paths; values come from env.
- [ ] Checklist covers DNS, Vercel, Supabase, Resend, smoke test, rollback (remove domain / revert env).
      **Verification:**
- [ ] `rg -n "example\.com|yourdomain|localhost:3000" app .env.example` reviewed; only intentional dev fallbacks remain.
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build` pass.
      **Dependencies:** Tasks 1-5. **Scope:** S (2-3 files + 1 doc).

## Task 7: Final no-vibe verification gate

**Description:** Run the full banned-pattern audit + production gate; file the result. No code changes unless the gate finds a regression (then open a follow-up task, don't expand scope).
**Branch:** `chore/no-vibe-verify`
**Files:**

- `docs/audits/periodic/2026-10-no-vibe-audit.md` (new: evidence table + before/after).
- `tasks/08-launch-readiness/README.md` (mark gate result).
  **Acceptance:**
- [ ] Grep audit zero-hits; lint + typecheck + build + tests green; `/privacy`, `/terms`, favicon, OG, robots, sitemap verified live.
      **Verification:**
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` all pass; record outputs in audit doc.
      **Dependencies:** Tasks 1-6. **Scope:** XS (docs only).

---

## Risks

| Risk                          | Impact | Mitigation                                                               |
| ----------------------------- | ------ | ------------------------------------------------------------------------ |
| Real domain/email unknown     | Med    | Tasks 4-6 use clearly-marked placeholders; gate fails until replaced.    |
| OG/favicon design taste       | Low    | Flat clay + single Lucide plane; no gradients, no photo.                 |
| Scope creep ("while here...") | Med    | Tracker enforces one-task-per-next; unrelated findings become new tasks. |

## Rollback

Each task rolls back via its branch (`git revert` / drop branch). Legal/SEO additions are additive; removing them restores prior state. Domain rollback: remove Vercel domain, revert env, re-add Supabase localhost redirect.
