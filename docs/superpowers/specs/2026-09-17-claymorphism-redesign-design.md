# Spec: Claymorphism Redesign — Full System Overhaul

## Overview
Replace the existing "editorial travel" design system (warm paper, Playfair Display, grain texture) with a **refined claymorphism** system: soft pillowy surfaces, inner/outer shadow depth, unified 12-16px radii, warm neutral clay palette. Adaptive clay works in both light and dark modes. All tokens, 9 primitives, 5 motion components, 4 trip pages, homepage, and documentation updated.

## Scope
- **Tokens**: `app/globals.css` + `tailwind.config.ts` — complete replacement
- **Primitives (9)**: `button`, `card` (incl. `CardWithMedia`), `input`, `field`, `badge`, `dialog`/`sheet`, `empty-state`, `section-header`, `timeline`
- **Motion (5)**: `Reveal`, `Parallax`, `StickyHeader`, `ScrollProgress`, `TimelineProgress` — token updates only
- **Pages**: `/` (homepage), `/trips`, `/trips/[id]`, `/trips/new`, `/trips/[id]/edit`
- **Docs**: `docs/architecture/design-system.md`, `docs/reasonix/plans/travelapp-v1-plan.md`, `docs/reasonix/plans/travelapp-comprehensive-plan.md`, `docs/decisions/0003-design-system-tailwind-tokens.md`

## Non-Goals
- No new features or data model changes
- No Supabase/RLS/auth modifications
- No new motion behaviors — only token updates
- No breaking changes to component APIs (props stay same)

## Token System (Claymorphism)

### CSS Variables (`app/globals.css`)
```css
:root {
  /* Clay Surfaces */
  --clay-surface: 35 25% 96%;           /* #f5f0eb - warm clay base */
  --clay-raised: 38 33% 98%;            /* #faf6f0 - elevated cards */
  --clay-pressed: 35 20% 92%;           /* #ebe3da - pressed state */
  --clay-border: 30 20% 86%;            /* #dccbc0 - subtle edges */
  
  /* Clay Shadows (HSL for color-mix compatibility) */
  --clay-highlight: 38 50% 98%;         /* top/inner light */
  --clay-shadow: 25 25% 35%;            /* bottom/inner dark */
  --clay-ring: 18 85% 42%;              /* focus ring (terracotta) */
  
  /* Semantic mappings (consume clay tokens) */
  --background: var(--clay-surface);
  --foreground: 25 25% 12%;
  --card: var(--clay-raised);
  --card-foreground: 25 25% 12%;
  --popover: var(--clay-raised);
  --popover-foreground: 25 25% 12%;
  --primary: 18 85% 42%;                /* terracotta accent */
  --primary-foreground: 38 33% 98%;
  --secondary: var(--clay-pressed);
  --secondary-foreground: 25 25% 18%;
  --muted: var(--clay-pressed);
  --muted-foreground: 25 15% 42%;
  --accent: var(--clay-pressed);
  --accent-foreground: 25 25% 18%;
  --destructive: 0 70% 50%;
  --destructive-foreground: 38 33% 98%;
  --border: var(--clay-border);
  --input: var(--clay-border);
  --ring: var(--clay-ring);
  --radius: 0.75rem;                    /* 12px unified */
  
  /* Typography (unchanged) */
  --font-inter: "Inter", system-ui, sans-serif;
  --font-serif: "Playfair Display", Georgia, serif;
  --font-mono: "JetBrains Mono", monospace;
}

.dark {
  /* Dark Clay Surfaces */
  --clay-surface: 25 15% 16%;           /* #2a2724 - dark clay base */
  --clay-raised: 25 15% 20%;            /* #322e2b - elevated */
  --clay-pressed: 25 10% 13%;           /* #22201e - pressed */
  --clay-border: 25 10% 23%;            /* #3a3632 - edges */
  
  --clay-highlight: 25 15% 25%;         /* subtle highlight */
  --clay-shadow: 0 0% 0%;               /* deep shadow */
  --clay-ring: 18 85% 50%;              /* brighter terracotta */
  
  --background: var(--clay-surface);
  --foreground: 35 20% 95%;
  --card: var(--clay-raised);
  --card-foreground: 35 20% 95%;
  --popover: var(--clay-raised);
  --popover-foreground: 35 20% 95%;
  --primary: 18 85% 50%;
  --primary-foreground: 25 15% 16%;
  --secondary: var(--clay-pressed);
  --secondary-foreground: 35 20% 95%;
  --muted: var(--clay-pressed);
  --muted-foreground: 35 15% 65%;
  --accent: var(--clay-pressed);
  --accent-foreground: 35 20% 95%;
  --destructive: 0 70% 55%;
  --destructive-foreground: 35 20% 95%;
  --border: var(--clay-border);
  --input: var(--clay-border);
  --ring: var(--clay-ring);
}
```

### Clay Shadow Utilities (add to `@layer utilities`)
```css
/* Outer clay shadow — raised surface */
.shadow-clay {
  box-shadow: 
    4px 4px 8px hsl(var(--clay-shadow) / 0.15),
    -4px -4px 8px hsl(var(--clay-highlight) / 0.9),
    0 0 0 1px hsl(var(--clay-border));
}

/* Inner clay shadow — pressed/inset */
.shadow-clay-inset {
  box-shadow: 
    inset 2px 2px 4px hsl(var(--clay-shadow) / 0.25),
    inset -2px -2px 4px hsl(var(--clay-highlight) / 0.7);
}

/* Combined: raised with inner depth (cards) */
.shadow-clay-raised {
  box-shadow: 
    6px 6px 12px hsl(var(--clay-shadow) / 0.12),
    -6px -6px 12px hsl(var(--clay-highlight) / 0.8),
    0 0 0 1px hsl(var(--clay-border)),
    inset 1px 1px 2px hsl(var(--clay-shadow) / 0.1),
    inset -1px -1px 2px hsl(var(--clay-highlight) / 0.5);
}

/* Modal/dialog elevation */
.shadow-clay-modal {
  box-shadow: 
    12px 12px 24px hsl(var(--clay-shadow) / 0.2),
    -12px -12px 24px hsl(var(--clay-highlight) / 0.6),
    0 0 0 1px hsl(var(--clay-border));
}

/* Focus ring — clay accent */
.focus-clay {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background;
}

/* Radius tokens */
.rounded-clay { border-radius: var(--radius); }        /* 12px */
.rounded-clay-lg { border-radius: calc(var(--radius) + 4px); } /* 16px */
.rounded-clay-full { border-radius: 9999px; }
```

### Tailwind Config (`tailwind.config.ts`) — Theme Extend
```ts
theme: {
  extend: {
    colors: {
      // ... existing semantic mappings (consume CSS vars)
      clay: {
        surface: "hsl(var(--clay-surface))",
        raised: "hsl(var(--clay-raised))",
        pressed: "hsl(var(--clay-pressed))",
        border: "hsl(var(--clay-border))",
        highlight: "hsl(var(--clay-highlight))",
        shadow: "hsl(var(--clay-shadow))",
      },
    },
    borderRadius: {
      clay: "var(--radius)",           // 12px
      "clay-lg": "calc(var(--radius) + 4px)", // 16px
    },
    boxShadow: {
      clay: "4px 4px 8px hsl(var(--clay-shadow) / 0.15), -4px -4px 8px hsl(var(--clay-highlight) / 0.9), 0 0 0 1px hsl(var(--clay-border))",
      "clay-inset": "inset 2px 2px 4px hsl(var(--clay-shadow) / 0.25), inset -2px -2px 4px hsl(var(--clay-highlight) / 0.7)",
      "clay-raised": "6px 6px 12px hsl(var(--clay-shadow) / 0.12), -6px -6px 12px hsl(var(--clay-highlight) / 0.8), 0 0 0 1px hsl(var(--clay-border)), inset 1px 1px 2px hsl(var(--clay-shadow) / 0.1), inset -1px -1px 2px hsl(var(--clay-highlight) / 0.5)",
      "clay-modal": "12px 12px 24px hsl(var(--clay-shadow) / 0.2), -12px -12px 24px hsl(var(--clay-highlight) / 0.6), 0 0 0 1px hsl(var(--clay-border))",
    },
  },
}
```

## Primitive Specifications

### Button (`components/ui/button.tsx`)
- **Base**: `rounded-clay bg-clay-raised text-foreground shadow-clay transition-all duration-150`
- **Hover**: `shadow-clay-raised -translate-y-0.5`
- **Active/Pressed**: `shadow-clay-inset translate-y-0.5 scale-[0.98]`
- **Focus**: `.focus-clay`
- **Variants**:
  - `default`: clay surface + terracotta ring on focus
  - `primary`: `bg-primary text-primary-foreground` with clay shadows
  - `outline`: `border-2 border-clay-border bg-transparent` + clay shadows on hover
  - `ghost`: `bg-transparent` + clay shadows on hover
  - `destructive`: `bg-destructive` + clay shadows
- **Loading**: spinner inside, `aria-busy`, disabled clay state (reduced shadow)

### Card (`components/ui/card.tsx`)
- **Base**: `rounded-clay-lg bg-clay-raised text-card-foreground shadow-clay-raised transition-shadow duration-200`
- **Hover**: `shadow-clay-modal`
- **CardWithMedia**: Same, `overflow-hidden`, media scales on hover
- **Header/Title/Description/Content/Footer**: Unchanged layout, token colors

### Input (`components/ui/input.tsx`) + Field (`components/ui/field.tsx`)
- **Base**: `rounded-clay bg-clay-surface border-clay-border text-foreground placeholder:text-muted-foreground shadow-clay-inset transition-all duration-150`
- **Focus**: `.focus-clay` + `shadow-clay-raised` (lift)
- **Error**: `border-destructive focus-visible:ring-destructive`
- **Disabled**: `opacity-50 cursor-not-allowed shadow-none bg-clay-pressed`
- **Field**: Label uses `text-sm font-medium`, error message `text-destructive text-sm`, description `text-muted-foreground text-sm`

### Badge (`components/ui/badge.tsx`)
- **Base**: `rounded-clay-full px-2.5 py-0.5 text-xs font-medium shadow-clay transition-all`
- **Variants**: `default` (clay), `secondary` (clay-pressed), `outline` (border), `accent` (terracotta), `success/warning/destructive` (semantic colors + clay shadows)

### Dialog/Sheet (`components/ui/dialog.tsx`, `sheet.tsx`)
- **Overlay**: `bg-black/30 backdrop-blur-sm` (unchanged)
- **Content**: `rounded-clay-lg bg-clay-raised shadow-clay-modal`
- **Sheet**: `rounded-clay-lg bg-clay-raised shadow-clay-modal` from bottom

### EmptyState (`components/ui/empty-state.tsx`)
- **Container**: `rounded-clay-lg p-12 text-center bg-clay-surface border border-clay-border`
- **Illustration**: Large icon, clay-styled
- **Action**: Button primitive

### SectionHeader (`components/ui/section-header.tsx`)
- **Layout**: Unchanged (eyebrow + title + lede + action)
- **Typography**: `font-serif` for title, tokens for colors

### Timeline (`components/ui/timeline.tsx`)
- **Connector**: `bg-clay-border` line
- **Dot**: `rounded-full bg-clay-raised border-2 border-clay-border shadow-clay`
- **Content**: Card-like `bg-clay-raised shadow-clay`

## Motion Components (Token Updates Only)
- `Reveal`, `Parallax`, `StickyHeader`, `ScrollProgress`, `TimelineProgress` — no behavior changes
- Update any hardcoded colors to use `--clay-ring`, `--clay-border`, `--clay-shadow`
- `ScrollProgress` color default: `hsl(var(--clay-ring))`
- `StickyHeader` shadow: `shadow-clay` when sticky

## Page Specifications

### Homepage (`app/page.tsx`)
```tsx
// Full viewport hero with claymorphism showcase
<div className="min-h-screen bg-clay-surface">
  <ScrollProgress color="hsl(var(--clay-ring))" height={3} />
  <StickyHeader>
    <header className="bg-clay-surface/80 backdrop-blur-sm border-b border-clay-border">
      {/* Logo + nav + theme toggle + Create Trip CTA */}
    </header>
  </StickyHeader>
  <main className="container py-20 px-4 sm:px-6 lg:px-8">
    <Reveal direction="up" stagger={100}>
      {/* Hero: Playfair Display headline, clay CTA buttons */}
      <Parallax speed={0.15}>
        <div className="rounded-clay-lg bg-clay-raised shadow-clay-raised p-12">
          {/* Feature cards grid: 3 cards with CardWithMedia */}
        </div>
      </Parallax>
    </Reveal>
  </main>
</div>
```

### `/trips` (Trip List)
- `StickyHeader` with clay header
- `ScrollProgress` clay accent
- `Reveal` stagger grid of `CardWithMedia` trip cards
- `EmptyState` clay-styled

### `/trips/[id]` (Trip Detail)
- `Parallax` hero with trip image/hero color
- `StickyHeader` with trip title
- `Timeline` itinerary with clay dots/cards
- Action buttons (Edit/Delete) clay-styled

### `/trips/new` & `/trips/[id]/edit` (Forms)
- `Field` primitives for all inputs
- Clay buttons (primary + ghost for cancel)
- Validation errors with clay destructive styling

## Documentation Updates

### `docs/architecture/design-system.md`
- Rewrite **Token System** section with claymorphism tokens table
- Update **Component Primitives** with clay shadow/radius specs
- Update **Usage in Pages** examples
- Update **QA Checklist** for claymorphism

### `docs/reasonix/plans/travelapp-v1-plan.md`
- Task 0.6: Update acceptance criteria to claymorphism tokens
- Task 4.3: Dark mode → adaptive clay
- Task 4.4: Touch targets + clay shadows

### `docs/reasonix/plans/travelapp-comprehensive-plan.md`
- Phase 0 Task 0.6: Design system foundation → claymorphism
- Phase 4 Tasks 4.2-4.4: A11y, dark mode, responsive with clay tokens

### `docs/decisions/0003-design-system-tailwind-tokens.md`
- Amend or create new ADR: "Claymorphism Design System with Adaptive Dark Mode"
- Record: token structure, shadow system, radius unification, primitive updates

## Acceptance Criteria

### Token Level
- [ ] `npm run build` passes with new tokens
- [ ] Dark/light toggle works, no flash, clay depth visible in both
- [ ] All semantic colors (`bg-background`, `text-foreground`, `border-border`, etc.) resolve to clay tokens

### Primitive Level
- [ ] All 9 primitives render with clay shadows/radii
- [ ] Button press shows inner shadow flip (raised → inset)
- [ ] Card hover lifts (shadow-clay → shadow-clay-modal)
- [ ] Input focus lifts + ring (clay accent)
- [ ] Focus-visible ring 2px, offset 2px, clay ring color
- [ ] Touch targets ≥44px maintained

### Page Level
- [ ] Homepage: hero, feature cards, CTAs all clay-styled
- [ ] `/trips`: stagger reveal, sticky header, scroll progress
- [ ] `/trips/[id]`: parallax hero, timeline itinerary
- [ ] `/trips/new` & `/trips/[id]/edit`: clay form fields
- [ ] No console errors, no layout shift (CLS < 0.1)

### Quality Gates
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes (66 tests)
- [ ] `npm run build` passes (13 pages)
- [ ] Lighthouse: Performance > 90, Accessibility > 95, Best Practices > 90
- [ ] `prefers-reduced-motion` disables all motion

## Rollback Plan
- Git branch: `feat/claymorphism-redesign`
- Each step committed atomically
- Revert single commit if issue isolated
- Full revert: `git reset --hard main` (branch preserved)

## Risks
| Risk | Mitigation |
|------|------------|
| Shadow stacking causes performance issues | Test on low-end devices; reduce layers if needed |
| Dark mode clay depth too subtle | Adjust `--clay-highlight`/`--clay-shadow` opacity per mode |
| Existing tests break on token changes | Update test snapshots; no logic changes |
| Motion components hardcoded colors | Audit all motion files for hardcoded hex/hsl |

## Implementation Order (Option A — Token-First Incremental)
1. **Tokens**: `globals.css` + `tailwind.config.ts`
2. **Primitives**: `button`, `card`, `input`, `field`, `badge`, `dialog`, `sheet`, `empty-state`, `section-header`, `timeline`
3. **Motion**: token updates only
4. **Homepage**: complete redesign
5. **Trip pages**: `/trips`, `/trips/[id]`, `/trips/new`, `/trips/[id]/edit`
6. **Docs**: all 4 files
7. **Verification**: full gate run

---

**Next Step**: After your review/approval of this spec, I'll invoke `writing-plans` to create the detailed implementation plan with tasks, dependencies, and verification commands.