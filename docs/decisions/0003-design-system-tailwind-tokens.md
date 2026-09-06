# ADR 0003 — Design System: Tailwind + Custom Design Tokens

Date: 2026-09-05
Status: Accepted

## Context
Need a consistent, maintainable design system for a travel app with excellent UX. Requirements:
- Dark mode support (travel apps often used at night/on flights)
- Custom brand colors (travel-themed: warm, inspiring)
- Accessible by default (WCAG 2.2 AA)
- Mobile-first responsive
- Easy to maintain and extend

## Decision
Build design system on **Tailwind CSS v4** with custom design tokens in `tailwind.config.ts` and CSS variables in `app/globals.css`. Use **shadcn/ui** as component primitive library (Radix UI based, accessible, customizable).

## Alternatives Considered
- **Material UI / MUI** — rejected: heavy bundle, hard to customize, not "travel" aesthetic
- **Chakra UI** — rejected: less popular, migration path unclear
- **Plain CSS + CSS Modules** — rejected: no design token system, reinventing wheels
- **StyleX / Panda CSS** — rejected: newer, less ecosystem, overkill for this scope

## Consequences
- Positive: design tokens single source of truth, dark mode via `class` strategy, shadcn components accessible by default, small bundle
- Negative: need to maintain token definitions, shadcn requires manual component updates
- Migration path: tokens can be exported to Figma/Design tools

## Verification
- `tailwind.config.ts` defines: colors (light/dark), spacing, typography, radii, shadows
- CSS variables in `app/globals.css` for theming
- Dark mode toggle works with `localStorage` persistence
- All shadcn/ui components use design tokens
- Lighthouse Accessibility > 95