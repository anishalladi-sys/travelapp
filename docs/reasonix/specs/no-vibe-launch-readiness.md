# Spec: No-Vibe Launch Readiness

## Objective

Remove every vibe-coded signal from the travel app and close the launch blockers so the site looks hand-built and is legally shippable. User says "next" and the agent executes exactly one task, verifies it, updates the tracker, and stops.

### User & Outcome

- **User:** Site owner preparing for public launch on a custom domain.
- **Outcome:** No purple gradients on CTAs, no pill CTAs, no fake reviews/metrics/counters, no emoji icons, no em dashes in UI copy, no AI-slop photos/copy, no cursor animation, no crazy scroll animation, real favicon + OG, no AI-made tag, privacy + terms pages live, domain checklist done.
- **Success:** `npm run lint`, `npx tsc --noEmit`, `npm run build` green plus a grep audit returning zero hits for the banned patterns.

## Non-goals

- No rebrand, no new features, no new dependencies unless a task explicitly requires one.
- No marketing copy rewrite beyond the hero + flagged slop words.
- DNS purchase/clicking in registrars is manual; the repo only carries config + checklist.

## Audit baseline (2026-10-02, verified in repo)

- Buttons: PASS. Solid terracotta + clay shadow, `rounded-clay` 12px (`components/ui/button.tsx:7-24`). Pill `9999px` only for icon circles/badges/avatars.
- Purple gradients: PASS on homepage. FAIL on placeholders: `app/design/page.tsx:402,867`, `app/trips/[id]/page.tsx:76,81`.
- Fake reviews/metrics/counters: PASS. Zero hits in `app/`, `components/`.
- Emoji icons: FAIL. `app/trips/page.tsx:56` suitcase, `app/trips/[id]/page.tsx:161` calendar, `components/ui/timeline.tsx:37` pin. Homepage correctly uses Lucide.
- Em dashes: FAIL per owner rule. `app/layout.tsx:30,34,52,54,69,71` (6x in title/meta).
- AI-slop copy: 1 FAIL. `app/page.tsx:79` "delightful details".
- Hero: borderline. `app/page.tsx:57-62` "Plan Your Perfect Journey" is generic; subcopy is specific and saves it.
- Scroll motion: PASS. `Reveal` 30px/600ms/once + `Parallax 0.15` + `prefers-reduced-motion` (`components/motion/`, `hooks/use-motion.ts`).
- Cursor animation: PASS. Only `cursor-pointer/default` utilities, no custom-cursor lib.
- AI photos: PASS. Homepage has zero photos, only Lucide icons.
- AI-made tag: PASS. No v0/Lovable/Bolt badge. Footer has a dev credit + `/design` link (`app/page.tsx:113-120`) that must not ship publicly.
- Favicon: PARTIAL. `app/favicon.ico` exists (no 404) but is stock Next icon. `/og-image.png` referenced in `app/layout.tsx:60,73` but missing. No `robots.ts`/`sitemap.ts`.
- Domain: NOT DONE. `https://travelapp.example.com`, `noreply@yourdomain.com`, `localhost:3000` placeholders.
- Privacy/Terms: NOT DONE. No routes.

## Constraints

- Each task ships on its own branch, never direct to main (`fix/no-vibe-*`, `chore/...`, `feat/legal-pages`).
- Max ~2 files per code task. One task per "next". Verify, record evidence, stop.
- Buttons stay `rounded-clay`; never introduce `rounded-full` CTAs or purple/blue gradients.
- Lucide only for icons; never emoji in UI.
- No em dashes anywhere in user-facing copy (use colon, comma, or hyphen).
- Reduced-motion behavior must keep working after every motion-adjacent edit.

## Commands

```
Dev:       npm run dev
Build:     npm run build
Lint:      npm run lint
Typecheck: npx tsc --noEmit
Tests:     npm test
Grep UI:   rg -n "—|🧳|📅|📍|✨|testimonial|CountUp|from-purple|via-purple|bg-gradient" app components
```

## Success criteria

- [ ] Zero emoji in `app/`, `components/` (excluding internal docs/comments).
- [ ] Zero em dashes in user-facing copy.
- [ ] Zero "delightful/seamless/unlock/elevate/supercharge/revolutionize" in `app/page.tsx`.
- [ ] Zero `bg-gradient-*` in `app/trips/`, zero purple/violet/indigo in UI.
- [ ] `/privacy` and `/terms` return 200 with real contact + updated date, linked from footer.
- [ ] Custom `app/icon.png` + `apple-touch-icon.png` + `public/og-image.png` exist; `robots.ts` + `sitemap.ts` exist; metadata points at real domain.
- [ ] No `/design` link on the public homepage.
- [ ] Lint + typecheck + build green.

## Open questions

- Real domain name + support contact email (needed by Tasks 4-6). Defaults used until provided.
