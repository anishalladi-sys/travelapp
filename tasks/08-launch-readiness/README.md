# Phase 08 — No-Vibe Launch Readiness

Goal:ship-ready, hand-built look. No fake signals, legal pages live, brand assets real, domain ready.

## Execution

Said **"next"** per task for 08.1, then **"finish all"** for 08.2-08.7 batched on branch `fix/no-vibe-emoji-icons` (one branch for all, per explicit owner instruction, instead of one-branch-per-task). 4 subagents per task. No commits, merges, or pushes. Other agents' branches and in-flight files untouched.

Spec: `docs/reasonix/specs/no-vibe-launch-readiness.md`
Plan: `docs/reasonix/plans/no-vibe-launch-readiness.md`
Gate audit: `docs/audits/periodic/2026-10-no-vibe-audit.md`

States: pending, in_progress, blocked, verified.

| ID | Task | Branch | Status | Notes |
|---|---|---|---|---|
| 08.1 | Emoji icons to Lucide | `fix/no-vibe-emoji-icons` | verified | 4 subagents, 4 files. Luggage/CalendarDays/MapPin/Sparkles in clay circles. Evidence: emoji grep 0 hits app+components; lint clean; tsc clean; misc-primitives-clay 3/3 pass. |
| 08.2 | Em dashes + slop copy + hero | `fix/no-vibe-emoji-icons` | verified | layout 6 dashes fixed; hero tightened; "delightful" gone. Evidence: `—` 0 in layout/page; slop grep 0. |
| 08.3 | Gradients out + dev link off homepage | `fix/no-vibe-emoji-icons` | verified | trips detail + design demo gradients to flat clay; /design link removed. Evidence: gradient/purple grep 0 in trips/page; `—` 0 app-wide except card.tsx:72 code comment (accepted). |
| 08.4 | Privacy + Terms + footer links | `fix/no-vibe-emoji-icons` | verified | `app/(legal)/privacy + terms` live, footer links added. Evidence: both pages 200-capable static, copy grep clean. Needs: real contact email from owner. |
| 08.5 | Favicon + OG + robots + sitemap | `fix/no-vibe-emoji-icons` | verified | robots.ts + sitemap.ts new; og-image.png generated (Pillow, 1200x630, flat); metadataBase added. Other agent's icons block + public PNGs + manifest + sw.js deliberately untouched. |
| 08.6 | Custom-domain cutover | `fix/no-vibe-emoji-icons` | verified | .env.example production comments; `docs/features/custom-domain-checklist.md`; layout OG url relative; SUPABASE_SETUP cutover pointer. Manual DNS/Vercel/Supabase/Resend steps await owner. |
| 08.7 | Final verification gate | `fix/no-vibe-emoji-icons` | verified | Evidence: lint clean; tsc clean; 24 files / 152 tests pass; build exit 0, 17/17 static. Audit doc filed. |

## Exit criteria
All rows `verified`. Owner domain cutover (checklist provided) flips status to READY TO SHIP.

## Resume instructions
If blocked (e.g. domain/email unknown), mark `blocked` with reason, stop, ask. Do not invent the domain. Placeholders stay clearly marked until the owner supplies real values. Do not touch other agents' in-flight files (public/*.png, manifest.json, sw.js, scripts/generate-icons.mjs); flag findings instead.
