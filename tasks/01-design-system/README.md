# Phase 01 — Editorial Travel Design System

Goal: one design system every later UI segment inherits, so pages and modules
never get styled twice.

Visual direction (user-approved): **editorial travel** — warm paper tones,
serif display headlines, soft cards, grainy/subtle textures, parallax accents.
Stack constraints: verify effective Tailwind major version first (repo shows tailwindcss ^3.4 alongside @tailwindcss/postcss ^4), existing shadcn/ui primitives, Radix UI.

## Segments

### 01.1 — Tokens & typography (prompt: `prompts/01.1-tokens.md`) ✅
- Define the palette (warm paper neutrals + accent), radii, shadows, spacing scale.
- Serif display font + readable sans body font (self-hosted or `next/font`).
- Wire as CSS variables / Tailwind theme so `prefers-color-scheme` and future
  dark mode stay possible.
- Grain/texture treatment as a reusable utility, performance-safe.

### 01.2 — Core primitives (prompt: `prompts/01.2-primitives.md`) ✅
- Styled on top of existing shadcn components, not replacements: Button, Card,
  Input/Field, Badge, Sheet/Dialog, EmptyState, SectionHeader, Timeline.
- Consistent focus states, touch-target sizes, error/loading/empty states built in.

### 01.3 — Scroll & motion utilities (prompt: `prompts/01.3-scroll-motion.md`) ✅
- `<Reveal>` (fade/slide in on scroll), `<Parallax>` (subtle layered movement),
  sticky section headers, scroll-progress indicator, animated timeline progress.
- Implementation: CSS + Intersection Observer (+ optional lightweight rAF),
  no heavy animation libraries unless justified.
- **Mandatory:** `prefers-reduced-motion` disables all of it; 60fps budget;
  no layout shift (CLS-safe).

### 01.4 — QA (prompt: `prompts/01.4-qa-design-system.md`) ✅
- Story/demo page exercising every token, primitive, and motion utility.
- Devtools check: no console errors, animations don't drop frames, reduced-motion
  actually disables effects, mobile rendering sane.
- Fix defects found.

## Exit criteria
Demo page renders correctly on desktop + mobile; all utilities documented;
tests/typecheck/lint/build green.
