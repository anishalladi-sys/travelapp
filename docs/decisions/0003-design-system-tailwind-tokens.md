# ADR 0003 — Design System: Tailwind + Claymorphism Design Tokens

Date: 2026-09-17
Status: Accepted (Updated)

## Context
Need a consistent, maintainable design system for a travel app with excellent UX. Requirements:
- Dark mode support (travel apps often used at night/on flights)
- Custom brand colors (travel-themed: warm, tactile, claymorphism)
- Accessible by default (WCAG 2.2 AA)
- Mobile-first responsive
- Easy to maintain and extend
- **Adaptive claymorphism**: clay depth visible in both light and dark modes

## Decision
Build design system on **Tailwind CSS v3** with **claymorphism design tokens** in `tailwind.config.ts` and CSS variables in `app/globals.css`. Use **shadcn/ui** as component primitive library (Radix UI based, accessible, customizable).

### Claymorphism Token Structure
- **Clay Surfaces**: `--clay-surface`, `--clay-raised`, `--clay-pressed`, `--clay-border`
- **Clay Shadows**: `--clay-highlight`, `--clay-shadow`, `--clay-ring`
- **Semantic Mappings**: All semantic tokens (`--background`, `--card`, `--border`, `--ring`, etc.) consume clay tokens
- **Unified Radius**: `--radius: 0.75rem` (12px) with `rounded-clay` / `rounded-clay-lg`
- **Shadow Utilities**: `.shadow-clay`, `.shadow-clay-inset`, `.shadow-clay-raised`, `.shadow-clay-modal`
- **Focus Utility**: `.focus-clay` (2px ring, 2px offset, clay-ring color)

### Adaptive Dark Mode
Claymorphism works in both light and dark:
- Light: warm clay base (`#f5f0eb`), elevated cards (`#faf6f0`), terracotta accents
- Dark: dark clay base (`#2a2724`), elevated cards (`#322e2b`), brighter terracotta
- Clay depth (inner/outer shadows) visible in both modes

## Alternatives Considered
- **Material UI / MUI** — rejected: heavy bundle, hard to customize, not "travel" aesthetic
- **Chakra UI** — rejected: less popular, migration path unclear
- **Plain CSS + CSS Modules** — rejected: no design token system, reinventing wheels
- **StyleX / Panda CSS** — rejected: newer, less ecosystem, overkill for this scope
- **Framer Motion** — rejected for motion: pure CSS + IntersectionObserver + rAF preferred

## Consequences
- Positive: design tokens single source of truth, adaptive dark mode via `class` strategy, shadcn components accessible by default, small bundle, claymorphism provides tactile travel feel
- Negative: need to maintain token definitions, shadcn requires manual component updates, clay shadows require careful tuning for performance
- Migration path: tokens can be exported to Figma/Design tools

## Verification
- `tailwind.config.ts` defines: clay colors, semantic mappings, unified radii, clay shadows
- CSS variables in `app/globals.css` for clay theming (surfaces, shadows, highlights, radius)
- Adaptive dark mode toggle works with `localStorage` persistence, clay depth in both themes
- All shadcn/ui components use claymorphism tokens (Button, Card, Input/Field, Badge, Dialog/Sheet, EmptyState, SectionHeader, Timeline)
- Motion components use clay-ring for progress bars, clay-shadow for sticky header
- Lighthouse Accessibility > 95, Performance > 90
- 105 tests pass covering tokens, theme, primitives, motion, pages