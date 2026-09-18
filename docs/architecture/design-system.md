# Design System Architecture — Claymorphism

## Overview
The design system implements a **refined claymorphism** aesthetic: soft pillowy surfaces, inner/outer shadow depth, unified 12-16px radii, warm neutral clay palette with adaptive dark mode. Built on Tailwind CSS v3 + shadcn/ui (Radix UI), with custom CSS variables for theming and dark mode.

## Token System (01.1 ✅)

### Color Palette (CSS Variables in `app/globals.css`)

#### Clay Surface Tokens
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--clay-surface` | `#f5f0eb` (warm clay base) | `#2a2724` | Page background |
| `--clay-raised` | `#faf6f0` (elevated) | `#322e2b` | Card backgrounds |
| `--clay-pressed` | `#ebe3da` (pressed) | `#22201e` | Pressed/active states |
| `--clay-border` | `#dccbc0` | `#3a3632` | Borders, dividers |

#### Clay Shadow Tokens
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--clay-highlight` | `#faf9f7` (top/inner light) | `#3d3833` | Inner/outer highlights |
| `--clay-shadow` | `#5a5248` (bottom/inner dark) | `#000000` | Inner/outer shadows |
| `--clay-ring` | `#c4724a` (terracotta) | `#d48a5e` | Focus rings |

#### Semantic Mappings (consume clay tokens)
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `var(--clay-surface)` | `var(--clay-surface)` | Page background |
| `--foreground` | `#1a1816` | `#f5f0eb` | Primary text |
| `--card` | `var(--clay-raised)` | `var(--clay-raised)` | Card backgrounds |
| `--card-foreground` | `#1a1816` | `#f5f0eb` | Card text |
| `--border` | `var(--clay-border)` | `var(--clay-border)` | Borders, dividers |
| `--ring` | `var(--clay-ring)` | `var(--clay-ring)` | Focus rings |
| `--primary` | `#c4724a` | `#d48a5e` | Primary actions, links |
| `--primary-foreground` | `#faf6f0` | `#2a2724` | Text on primary |
| `--destructive` | `#b33a3a` | `#d45a5a` | Errors, dangerous actions |

### Typography (via `next/font` + Tailwind config)

| Role | Font | CSS Variable | Tailwind Class |
|------|------|--------------|----------------|
| Display (headlines) | Playfair Display | `--font-serif` | `font-display` |
| Body/UI | Inter | `--font-sans` | `font-sans` |

**Type Scale** (Tailwind `fontSize`):
- `display-xl`: `4.5rem / 1.1` — hero headlines
- `display-lg`: `3.75rem / 1.1` — section headers
- `display-md`: `3rem / 1.2` — card titles
- `display-sm`: `2.25rem / 1.3` — subsection headers
- `body-lg`: `1.125rem / 1.6` — lead paragraphs
- `body-md`: `1rem / 1.6` — default body
- `body-sm`: `0.875rem / 1.5` — captions, meta
- `caption`: `0.75rem / 1.5` — fine print

### Spacing & Layout
- **Base unit**: `4px` (Tailwind default)
- **Scale**: `0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32`
- **Container max-width**: `72rem` (1152px) with `px-4 sm:px-6 lg:px-8`

### Border Radius
- `radius-sm`: `0.25rem` (4px)
- `radius`: `0.75rem` (12px) — **unified default** (`--radius`)
- `radius-md`: `1rem` (16px) — cards, modals
- `radius-lg`: `1.25rem` (20px)
- `radius-full`: `9999px`

### Shadows (Claymorphism)
- `.shadow-clay` — outer raised surface
- `.shadow-clay-inset` — pressed/inset state
- `.shadow-clay-raised` — cards (outer + inner depth)
- `.shadow-clay-modal` — modals/dialogs (maximum elevation)

### Clay Shadow Utilities
```css
.shadow-clay {
  box-shadow:
    4px 4px 8px hsl(var(--clay-shadow) / 0.15),
    -4px -4px 8px hsl(var(--clay-highlight) / 0.9),
    0 0 0 1px hsl(var(--clay-border));
}

.shadow-clay-inset {
  box-shadow:
    inset 2px 2px 4px hsl(var(--clay-shadow) / 0.25),
    inset -2px -2px 4px hsl(var(--clay-highlight) / 0.7);
}

.shadow-clay-raised {
  box-shadow:
    6px 6px 12px hsl(var(--clay-shadow) / 0.12),
    -6px -6px 12px hsl(var(--clay-highlight) / 0.8),
    0 0 0 1px hsl(var(--clay-border)),
    inset 1px 1px 2px hsl(var(--clay-shadow) / 0.1),
    inset -1px -1px 2px hsl(var(--clay-highlight) / 0.5);
}

.shadow-clay-modal {
  box-shadow:
    12px 12px 24px hsl(var(--clay-shadow) / 0.2),
    -12px -12px 24px hsl(var(--clay-highlight) / 0.6),
    0 0 0 1px hsl(var(--clay-border));
}
```

### Radius Tokens
- `.rounded-clay` — 12px (unified)
- `.rounded-clay-lg` — 16px (cards, modals)
- `.rounded-clay-full` — 9999px (badges, pills)

### Focus Utility
```css
.focus-clay {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background;
}
```

## Component Primitives (01.2 ✅)

All components in `components/ui/` extending shadcn/ui with claymorphism:

| Component | File | Claymorphism Features |
|-----------|------|----------------------|
| Button | `button.tsx` | Raised default, inset on active, hover lift; variants: default, primary, outline, secondary, ghost, destructive, link |
| Card | `card.tsx` | `.shadow-clay-raised` base, `.shadow-clay-modal` hover; `CardWithMedia` for image headers |
| Input/Field | `input.tsx`, `field.tsx` | Inset shadow base, focus lift + ring; `FieldLabel`, `FieldInput`, `FieldTextarea`, `FieldDescription`, `FieldError` |
| Badge | `badge.tsx` | Pill shape, clay shadows; variants: default, secondary, outline, accent, success, warning, destructive |
| Dialog/Sheet | `dialog.tsx`, `sheet.tsx` | `.shadow-clay-modal`, clay surfaces, adaptive dark |
| EmptyState | `empty-state.tsx` | Clay surface card with illustration |
| SectionHeader | `section-header.tsx` | Token colors only, layout unchanged |
| Timeline | `timeline.tsx` | Clay dots (`shadow-clay`), clay-border connector, clay content cards |

### Focus States (WCAG 2.2 AA)
All interactive elements use:
```css
.focus-clay {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background;
}
```

### Touch Targets
Minimum `44x44px` via `min-h-[44px] min-w-[44px]` on all interactive elements.

## Scroll & Motion Utilities (01.3 ✅)

### Hooks (`hooks/use-motion.ts`)
| Hook | Returns | Description |
|------|---------|-------------|
| `useReducedMotion()` | `boolean` | Reactive `prefers-reduced-motion` detection |
| `useScrollPosition()` | `{ y, progress, direction }` | Scroll Y, 0-1 progress, 'up'/'down' direction via rAF |
| `useInViewport(threshold)` | `[ref, entry]` | IntersectionObserver ref + entry for sticky triggers |

### Components (`components/motion/`)
| Component | Props | Behavior |
|-----------|-------|----------|
| `<Reveal>` | `direction`, `delay`, `stagger`, `once`, `threshold` | Fade/slide/scale in on viewport entry |
| `<Parallax>` | `speed` (0-1), `offset` | Subtle translateY on scroll |
| `<StickyHeader>` | `onStickyChange` | Position: sticky header with clay shadow when sticky |
| `<ScrollProgress>` | `color`, `height` | Top progress bar bound to scroll (default: clay-ring) |
| `<TimelineProgress>` | `items`, `activeIndex` | Animated progress line for timelines (default: clay-ring) |

### Performance Guarantees
- **CSS transforms only** — no layout shifts (CLS-safe)
- **rAF-throttled** scroll listeners (`passive: true`)
- **`will-change` hints** on animated elements
- **`prefers-reduced-motion`** disables ALL motion instantly
- **No external animation libraries** — pure CSS + IntersectionObserver + minimal rAF

## Dark Mode Strategy (Adaptive Clay)
- **Strategy**: `class` on `<html>` (Tailwind `darkMode: 'class'`)
- **Persistence**: `localStorage` + system preference detection
- **Provider**: `components/theme-provider.tsx` (inline script in `<head>` to prevent flash)
- **Toggle**: `components/theme-toggle.tsx` in header
- **Adaptive Clay**: Clay depth works in both modes — lighter surfaces in dark (`--clay-raised`: `#322e2b`), deeper shadows in light

## Responsive Breakpoints
| Breakpoint | Width | Container Padding |
|------------|-------|-------------------|
| `sm` | 640px | `px-6` |
| `md` | 768px | `px-6` |
| `lg` | 1024px | `px-8` |
| `xl` | 1280px | `px-8` |
| `2xl` | 1536px | `px-8` |

## Accessibility Baseline (WCAG 2.2 AA)
- ✅ Semantic HTML landmarks (`main`, `nav`, `aside`, `header`, `footer`)
- ✅ Heading hierarchy (h1 → h2 → h3, no skips)
- ✅ Color contrast ≥ 4.5:1 (normal), ≥ 3:1 (large)
- ✅ Focus visible: 2px ring, 2px offset (clay-ring)
- ✅ Keyboard navigation: all interactive elements reachable
- ✅ ARIA labels on icon-only buttons, form fields, dialogs
- ✅ `prefers-reduced-motion` respected globally
- ✅ Screen reader tested (NVDA/VoiceOver)
- ✅ Form validation: `aria-describedby` for errors, `aria-invalid`, `aria-required`

## Usage in Pages

### Import Pattern
```tsx
// Primitives
import { Button } from '@/components/ui/button';
import { Card, CardWithMedia } from '@/components/ui/card';
import { Input, Field, FieldLabel, FieldInput, FieldTextarea, FieldDescription, FieldError } from '@/components/ui/field';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';

// Motion
import { Reveal, Parallax, StickyHeader, ScrollProgress, TimelineProgress } from '@/components/motion';

// Hooks
import { useReducedMotion, useScrollPosition, useInViewport } from '@/hooks/use-motion';
```

### Page Template Example
```tsx
export default function TripDetailPage({ params }) {
  return (
    <div className="min-h-screen bg-clay-surface">
      <ScrollProgress />
      <StickyHeader>
        <TripHeader trip={trip} />
      </StickyHeader>
      <main className="container py-12">
        <Reveal direction="up" stagger={100}>
          <ItineraryList items={itinerary} />
        </Reveal>
      </main>
    </div>
  );
}
```

## QA Checklist (01.4)
- [ ] Demo page renders all tokens visually
- [ ] All 9 primitives interactive and accessible with clay shadows
- [ ] Motion components animate smoothly at 60fps
- [ ] `prefers-reduced-motion` disables all effects
- [ ] Mobile rendering sane (375px, 414px viewports)
- [ ] No console errors in DevTools
- [ ] Lighthouse: Performance > 90, Accessibility > 95, Best Practices > 90
- [ ] Dark mode toggle works, persists, no flash, clay depth visible
- [ ] Focus navigation works end-to-end
- [ ] Button press shows inset shadow flip
- [ ] Card hover lifts to modal shadow
- [ ] Input focus lifts with ring

## Migration Notes
- **v1 → v2**: Tokens are single source of truth; new features must use design tokens
- **Adding colors**: Update `app/globals.css` + `tailwind.config.ts` simultaneously
- **New components**: Extend shadcn/ui, don't replace; document in this file
- **Motion additions**: Follow `hooks/use-motion.ts` patterns; no Framer Motion unless justified

## Related Files
- `app/globals.css` — CSS variables, clay shadow utilities, base styles
- `tailwind.config.ts` — Theme extension, fonts, type scale, clay colors/shadows/radius
- `components/ui/*.tsx` — 9 primitives with claymorphism
- `components/motion/*.tsx` — 5 motion components with clay tokens
- `hooks/use-motion.ts` — 3 core hooks
- `components/theme-provider.tsx` — Dark mode provider
- `components/theme-toggle.tsx` — Theme switcher