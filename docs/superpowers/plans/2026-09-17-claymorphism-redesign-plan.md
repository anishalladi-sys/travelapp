# Claymorphism Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the entire design system (tokens, 9 primitives, 5 motion components, 5 pages, 4 docs) with a refined claymorphism system — soft pillowy surfaces, inner/outer shadow depth, unified 12-16px radii, warm neutral clay palette with adaptive dark mode.

**Architecture:** Token-first incremental (Option A). CSS variables → Tailwind config → primitives → motion → pages → docs. Each task produces independently verifiable changes (build, lint, typecheck, test).

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS v3, shadcn/ui (Radix), Vitest + Playwright, Supabase (Postgres/Auth/RLS)

## Global Constraints
- All semantic colors (`bg-background`, `text-foreground`, `border-border`, `ring-ring`, etc.) must resolve to clay tokens
- Dark/light toggle works, no flash, clay depth visible in both modes
- All 9 primitives render with clay shadows/radii; APIs unchanged
- Button press shows inner shadow flip (raised → inset)
- Card hover lifts (shadow-clay → shadow-clay-modal)
- Input focus lifts + ring (clay accent)
- Focus-visible: 2px ring, 2px offset, clay ring color
- Touch targets ≥44px maintained
- `prefers-reduced-motion` disables all motion
- No console errors, no layout shift (CLS < 0.1)
- `npm run lint` && `npx tsc --noEmit` && `npm test` && `npm run build` all pass
- Lighthouse: Performance > 90, Accessibility > 95, Best Practices > 90

---

### Task 1: Claymorphism Tokens — globals.css

**Files:**
- Modify: `app/globals.css:1-204` (replace entire token system)

**Interfaces:**
- Consumes: none
- Produces: CSS variables `--clay-surface`, `--clay-raised`, `--clay-pressed`, `--clay-border`, `--clay-highlight`, `--clay-shadow`, `--clay-ring`, `--radius`, semantic mappings (`--background`, `--foreground`, `--card`, etc.), utility classes `.shadow-clay`, `.shadow-clay-inset`, `.shadow-clay-raised`, `.shadow-clay-modal`, `.focus-clay`, `.rounded-clay`, `.rounded-clay-lg`, `.rounded-clay-full`, `.grain` (removed), `.grain-subtle` (removed)

- [ ] **Step 1: Write failing test for token availability**

```typescript
// __tests__/tokens.test.ts
import { render } from '@testing-library/react';
import { GlobalsCSS } from '@/test-utils/globals-css';

describe('Claymorphism tokens', () => {
  it('exposes clay surface variables in :root', () => {
    const { container } = render(<GlobalsCSS />);
    const style = getComputedStyle(container.firstChild as HTMLElement);
    expect(style.getPropertyValue('--clay-surface')).toBeTruthy();
    expect(style.getPropertyValue('--clay-raised')).toBeTruthy();
    expect(style.getPropertyValue('--clay-pressed')).toBeTruthy();
    expect(style.getPropertyValue('--clay-border')).toBeTruthy();
    expect(style.getPropertyValue('--clay-highlight')).toBeTruthy();
    expect(style.getPropertyValue('--clay-shadow')).toBeTruthy();
    expect(style.getPropertyValue('--clay-ring')).toBeTruthy();
  });

  it('maps semantic colors to clay tokens', () => {
    const { container } = render(<GlobalsCSS />);
    const style = getComputedStyle(container.firstChild as HTMLElement);
    expect(style.getPropertyValue('--background')).toBe('hsl(var(--clay-surface))');
    expect(style.getPropertyValue('--card')).toBe('hsl(var(--clay-raised))');
    expect(style.getPropertyValue('--border')).toBe('hsl(var(--clay-border))');
    expect(style.getPropertyValue('--ring')).toBe('hsl(var(--clay-ring))');
  });

  it('defines dark mode clay tokens', () => {
    const { container } = render(<GlobalsCSS />);
    const style = getComputedStyle(container.firstChild as HTMLElement);
    // Dark mode values exist in .dark block
    expect(style.getPropertyValue('--clay-surface')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npm test -- __tests__/tokens.test.ts -v
```
Expected: FAIL (tokens don't exist yet)

- [ ] **Step 3: Replace globals.css with claymorphism tokens**
Replace entire `app/globals.css` with claymorphism token system from spec.

- [ ] **Step 4: Run test to verify it passes**
```bash
npm test -- __tests__/tokens.test.ts -v
```
Expected: PASS

- [ ] **Step 5: Verify build passes**
```bash
npm run build
```
Expected: PASS (13 pages)

- [ ] **Step 6: Commit**
```bash
git add app/globals.css __tests__/tokens.test.ts
git commit -m "feat: claymorphism token system in globals.css"
```

---

### Task 2: Claymorphism Tokens — tailwind.config.ts

**Files:**
- Modify: `tailwind.config.ts:1-130` (replace theme.extend)

**Interfaces:**
- Consumes: CSS variables from Task 1
- Produces: Tailwind theme colors (`clay.*`, semantic mappings), borderRadius (`clay`, `clay-lg`), boxShadow (`clay`, `clay-inset`, `clay-raised`, `clay-modal`), fontSize (unchanged), spacing (unchanged), animation (unchanged)

- [ ] **Step 1: Write failing test for Tailwind theme**

```typescript
// __tests__/tailwind-theme.test.ts
import config from '@/tailwind.config';

describe('Tailwind claymorphism theme', () => {
  it('extends colors with clay palette', () => {
    const colors = config.theme.extend.colors;
    expect(colors.clay).toBeDefined();
    expect(colors.clay.surface).toBe('hsl(var(--clay-surface))');
    expect(colors.clay.raised).toBe('hsl(var(--clay-raised))');
    expect(colors.clay.pressed).toBe('hsl(var(--clay-pressed))');
    expect(colors.clay.border).toBe('hsl(var(--clay-border))');
    expect(colors.clay.highlight).toBe('hsl(var(--clay-highlight))');
    expect(colors.clay.shadow).toBe('hsl(var(--clay-shadow))');
  });

  it('maps semantic colors to clay tokens', () => {
    const colors = config.theme.extend.colors;
    expect(colors.background).toBe('hsl(var(--background))');
    expect(colors.card).toBe('hsl(var(--card))');
    expect(colors.border).toBe('hsl(var(--border))');
    expect(colors.ring).toBe('hsl(var(--ring))');
  });

  it('defines clay borderRadius', () => {
    const radius = config.theme.extend.borderRadius;
    expect(radius.clay).toBe('var(--radius)');
    expect(radius['clay-lg']).toBe('calc(var(--radius) + 4px)');
  });

  it('defines clay boxShadows', () => {
    const shadows = config.theme.extend.boxShadow;
    expect(shadows.clay).toBeTruthy();
    expect(shadows['clay-inset']).toBeTruthy();
    expect(shadows['clay-raised']).toBeTruthy();
    expect(shadows['clay-modal']).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npm test -- __tests__/tailwind-theme.test.ts -v
```
Expected: FAIL

- [ ] **Step 3: Replace tailwind.config.ts theme.extend with claymorphism config**
Update `tailwind.config.ts` with clay theme from spec.

- [ ] **Step 4: Run test to verify it passes**
```bash
npm test -- __tests__/tailwind-theme.test.ts -v
```
Expected: PASS

- [ ] **Step 5: Verify build + typecheck + lint**
```bash
npm run build && npx tsc --noEmit && npm run lint
```
Expected: All PASS

- [ ] **Step 6: Commit**
```bash
git add tailwind.config.ts __tests__/tailwind-theme.test.ts
git commit -m "feat: claymorphism theme in tailwind.config.ts"
```

---

### Task 3: Button Primitive — Claymorphism

**Files:**
- Modify: `components/ui/button.tsx:1-83`
- Test: `__tests__/button-clay.test.tsx`

**Interfaces:**
- Consumes: clay tokens via Tailwind classes (`rounded-clay`, `shadow-clay`, `shadow-clay-raised`, `shadow-clay-inset`, `focus-clay`, `bg-clay-raised`, `text-foreground`, `border-clay-border`, `bg-primary`, `text-primary-foreground`, `bg-destructive`, `text-destructive-foreground`, `bg-clay-pressed`, `bg-clay-surface`)
- Produces: Button component with clay variants (default, primary, outline, secondary, ghost, destructive, link), sizes (sm, default, lg, xl, icon), loading state, asChild

- [ ] **Step 1: Write failing test for clay Button**

```tsx
// __tests__/button-clay.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import userEvent from '@testing-library/user-event';

describe('Claymorphism Button', () => {
  it('renders with clay base classes', () => {
    render(<Button>Test</Button>);
    const btn = screen.getByRole('button', { name: /test/i });
    expect(btn).toHaveClass('rounded-clay');
    expect(btn).toHaveClass('shadow-clay');
    expect(btn).toHaveClass('bg-clay-raised');
    expect(btn).toHaveClass('focus-clay');
  });

  it('applies primary variant with clay shadows', () => {
    render(<Button variant="primary">Primary</Button>);
    const btn = screen.getByRole('button', { name: /primary/i });
    expect(btn).toHaveClass('bg-primary');
    expect(btn).toHaveClass('text-primary-foreground');
    expect(btn).toHaveClass('shadow-clay');
  });

  it('shows pressed state (inset shadow) on mousedown', async () => {
    const user = userEvent.setup();
    render(<Button>Press me</Button>);
    const btn = screen.getByRole('button', { name: /press me/i });
    
    await user.pointerDown({ keys: '[MouseLeft]', target: btn });
    expect(btn).toHaveClass('shadow-clay-inset');
    
    await user.pointerUp({ keys: '[MouseLeft]', target: btn });
    expect(btn).not.toHaveClass('shadow-clay-inset');
  });

  it('shows hover lift (raised shadow)', async () => {
    const user = userEvent.setup();
    render(<Button>Hover me</Button>);
    const btn = screen.getByRole('button', { name: /hover me/i });
    
    await user.hover(btn);
    expect(btn).toHaveClass('shadow-clay-raised');
  });

  it('disables properly with loading state', () => {
    render(<Button loading>Loading</Button>);
    const btn = screen.getByRole('button', { name: /loading/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('meets 44px touch target', () => {
    render(<Button>Test</Button>);
    const btn = screen.getByRole('button');
    const styles = getComputedStyle(btn);
    expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npm test -- __tests__/button-clay.test.tsx -v
```
Expected: FAIL

- [ ] **Step 3: Update button.tsx with claymorphism classes**
Replace `buttonVariants` base and variants with clay classes per spec.

- [ ] **Step 4: Run test to verify it passes**
```bash
npm test -- __tests__/button-clay.test.tsx -v
```
Expected: PASS

- [ ] **Step 5: Run full test suite**
```bash
npm test
```
Expected: 66 tests PASS

- [ ] **Step 6: Commit**
```bash
git add components/ui/button.tsx __tests__/button-clay.test.tsx
git commit -m "feat: claymorphism button primitive"
```

---

### Task 4: Card Primitive — Claymorphism

**Files:**
- Modify: `components/ui/card.tsx:1-106`
- Test: `__tests__/card-clay.test.tsx`

**Interfaces:**
- Consumes: clay tokens via Tailwind (`rounded-clay-lg`, `bg-clay-raised`, `text-card-foreground`, `shadow-clay-raised`, `shadow-clay-modal`, `border-clay-border`)
- Produces: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardWithMedia

- [ ] **Step 1: Write failing test for clay Card**

```tsx
// __tests__/card-clay.test.tsx
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardWithMedia } from '@/components/ui/card';

describe('Claymorphism Card', () => {
  it('renders base card with clay classes', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('rounded-clay-lg');
    expect(card).toHaveClass('bg-clay-raised');
    expect(card).toHaveClass('shadow-clay-raised');
  });

  it('CardWithMedia has overflow-hidden and media slot', () => {
    render(
      <CardWithMedia media={<div className="media-test" />}>
        Content
      </CardWithMedia>
    );
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('overflow-hidden');
    expect(screen.getByTestId('media-test')).toBeInTheDocument();
  });

  it('Card sub-components render', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );
    expect(screen.getByText('Title')).toHaveClass('font-serif');
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npm test -- __tests__/card-clay.test.tsx -v
```
Expected: FAIL

- [ ] **Step 3: Update card.tsx with claymorphism classes**
Replace base classes and CardWithMedia with clay tokens.

- [ ] **Step 4: Run test to verify it passes**
```bash
npm test -- __tests__/card-clay.test.tsx -v
```
Expected: PASS

- [ ] **Step 5: Run full test suite**
```bash
npm test
```
Expected: 66 tests PASS

- [ ] **Step 6: Commit**
```bash
git add components/ui/card.tsx __tests__/card-clay.test.tsx
git commit -m "feat: claymorphism card primitive"
```

---

### Task 5: Input + Field Primitives — Claymorphism

**Files:**
- Modify: `components/ui/input.tsx`, `components/ui/field.tsx`
- Test: `__tests__/input-field-clay.test.tsx`

**Interfaces:**
- Consumes: clay tokens (`rounded-clay`, `bg-clay-surface`, `border-clay-border`, `text-foreground`, `placeholder:text-muted-foreground`, `shadow-clay-inset`, `focus-clay`, `shadow-clay-raised`, `border-destructive`, `focus-visible:ring-destructive`, `bg-clay-pressed`)
- Produces: Input, Field (Label, Input, Description, ErrorMessage)

- [ ] **Step 1: Write failing test for clay Input/Field**

```tsx
// __tests__/input-field-clay.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldInput, FieldDescription, FieldError } from '@/components/ui/field';

describe('Claymorphism Input/Field', () => {
  it('Input renders with clay base classes', () => {
    render(<Input placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test');
    expect(input).toHaveClass('rounded-clay');
    expect(input).toHaveClass('bg-clay-surface');
    expect(input).toHaveClass('border-clay-border');
    expect(input).toHaveClass('shadow-clay-inset');
    expect(input).toHaveClass('focus-clay');
  });

  it('Input focus shows raised shadow + ring', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(input).toHaveClass('shadow-clay-raised');
    expect(input).toHaveClass('focus-clay');
  });

  it('Input error state shows destructive border/ring', () => {
    render(<Input aria-invalid="true" aria-describedby="error" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-destructive');
    expect(input).toHaveClass('focus-visible:ring-destructive');
  });

  it('Field composes label, input, description, error', () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldInput placeholder="you@example.com" />
        <FieldDescription>We'll never share your email</FieldDescription>
        <FieldError>Invalid email</FieldError>
      </Field>
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByText('We\'ll never share your email')).toHaveClass('text-muted-foreground');
    expect(screen.getByText('Invalid email')).toHaveClass('text-destructive');
  });

  it('disabled input has clay pressed bg and no shadow', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('bg-clay-pressed');
    expect(input).toHaveClass('shadow-none');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npm test -- __tests__/input-field-clay.test.tsx -v
```
Expected: FAIL

- [ ] **Step 3: Update input.tsx + field.tsx with claymorphism classes**

- [ ] **Step 4: Run test to verify it passes**
```bash
npm test -- __tests__/input-field-clay.test.tsx -v
```
Expected: PASS

- [ ] **Step 5: Run full test suite**
```bash
npm test
```
Expected: 66 tests PASS

- [ ] **Step 6: Commit**
```bash
git add components/ui/input.tsx components/ui/field.tsx __tests__/input-field-clay.test.tsx
git commit -m "feat: claymorphism input and field primitives"
```

---

### Task 6: Badge Primitive — Claymorphism

**Files:**
- Modify: `components/ui/badge.tsx`
- Test: `__tests__/badge-clay.test.tsx`

**Interfaces:**
- Consumes: clay tokens (`rounded-clay-full`, `shadow-clay`, `bg-clay-raised`, `bg-clay-pressed`, `border-clay-border`, `bg-primary`, `text-primary-foreground`, `bg-destructive`, etc.)
- Produces: Badge with variants (default, secondary, outline, accent, success, warning, destructive)

- [ ] **Step 1: Write failing test**

```tsx
// __tests__/badge-clay.test.tsx
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Claymorphism Badge', () => {
  it('renders with clay base classes', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('rounded-clay-full');
    expect(badge).toHaveClass('shadow-clay');
    expect(badge).toHaveClass('bg-clay-raised');
  });

  it('outline variant has border', () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toHaveClass('border-clay-border');
  });

  it('accent variant uses terracotta', () => {
    render(<Badge variant="accent">Accent</Badge>);
    expect(screen.getByText('Accent')).toHaveClass('bg-primary');
    expect(screen.getByText('Accent')).toHaveClass('text-primary-foreground');
  });
});
```

- [ ] **Step 2-6: Run test, update, verify, commit** (same pattern)

---

### Task 7: Dialog + Sheet Primitives — Claymorphism

**Files:**
- Modify: `components/ui/dialog.tsx`, `components/ui/sheet.tsx`
- Test: `__tests__/dialog-sheet-clay.test.tsx`

**Interfaces:**
- Consumes: clay tokens (`rounded-clay-lg`, `bg-clay-raised`, `shadow-clay-modal`, `bg-black/30`, `backdrop-blur-sm`)
- Produces: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, Sheet, SheetContent, etc.

- [ ] **Step 1-6: Same pattern**

---

### Task 8: EmptyState + SectionHeader + Timeline Primitives — Claymorphism

**Files:**
- Modify: `components/ui/empty-state.tsx`, `components/ui/section-header.tsx`, `components/ui/timeline.tsx`
- Test: `__tests__/misc-primitives-clay.test.tsx`

**Interfaces:**
- EmptyState: `rounded-clay-lg`, `bg-clay-surface`, `border-clay-border`, `p-12`
- SectionHeader: token colors only (layout unchanged)
- Timeline: `bg-clay-border` connector, `bg-clay-raised` dot with `shadow-clay`, content cards clay-styled

- [ ] **Step 1-6: Same pattern**

---

### Task 9: Motion Components — Token Updates Only

**Files:**
- Modify: `components/motion/reveal.tsx`, `components/motion/parallax.tsx`, `components/motion/sticky-header.tsx`, `components/motion/scroll-progress.tsx`, `components/motion/timeline-progress.tsx`
- Test: `__tests__/motion-clay-tokens.test.tsx`

**Interfaces:**
- Consumes: clay tokens (`--clay-ring`, `--clay-border`, `--clay-shadow`, `--clay-highlight`)
- Produces: Same behavior, updated colors

- [ ] **Step 1: Write failing test for token usage**

```tsx
// __tests__/motion-clay-tokens.test.tsx
import { render, screen } from '@testing-library/react';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { StickyHeader } from '@/components/motion/sticky-header';

describe('Motion components use clay tokens', () => {
  it('ScrollProgress defaults to clay ring color', () => {
    render(<ScrollProgress />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveStyle({ backgroundColor: 'hsl(var(--clay-ring))' });
  });

  it('StickyHeader uses clay shadow when sticky', () => {
    render(
      <StickyHeader>
        <header>Header</header>
      </StickyHeader>
    );
    // Trigger sticky via scroll simulation
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('shadow-clay');
  });
});
```

- [ ] **Step 2-6: Update motion components, verify, commit**

---

### Task 10: Homepage — Claymorphism Redesign

**Files:**
- Modify: `app/page.tsx:1-18` (complete rewrite)
- Test: `__tests__/homepage-clay.test.tsx`

**Interfaces:**
- Consumes: All clay primitives (Button, Card, CardWithMedia), motion (ScrollProgress, StickyHeader, Reveal, Parallax), clay tokens
- Produces: Full claymorphism homepage with hero, feature grid, CTAs

- [ ] **Step 1: Write failing test for homepage structure**

```tsx
// __tests__/homepage-clay.test.tsx
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Claymorphism Homepage', () => {
  it('renders hero with Playfair headline', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('font-serif');
  });

  it('has clay-styled CTA buttons', () => {
    render(<Home />);
    const primaryBtn = screen.getByRole('button', { name: /create trip/i });
    expect(primaryBtn).toHaveClass('bg-primary');
    expect(primaryBtn).toHaveClass('shadow-clay');
  });

  it('includes ScrollProgress and StickyHeader', () => {
    render(<Home />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('feature cards use CardWithMedia with clay styling', () => {
    render(<Home />);
    const cards = screen.getAllByRole('article');
    expect(cards.length).toBeGreaterThanOrEqual(3);
    cards.forEach(card => {
      expect(card).toHaveClass('rounded-clay-lg');
      expect(card).toHaveClass('shadow-clay-raised');
    });
  });
});
```

- [ ] **Step 2-6: Rewrite page.tsx, verify, commit**

---

### Task 11: Trip List Page (/trips) — Claymorphism

**Files:**
- Modify: `app/trips/page.tsx:1-86`
- Test: `__tests__/trips-page-clay.test.tsx`

**Interfaces:**
- Consumes: clay primitives, motion, data layer (`listTrips`)
- Produces: Trip list with stagger Reveal, clay cards, StickyHeader, ScrollProgress

- [ ] **Step 1-6: Same pattern**

---

### Task 12: Trip Detail Page (/trips/[id]) — Claymorphism

**Files:**
- Modify: `app/trips/[id]/page.tsx`
- Test: `__tests__/trip-detail-clay.test.tsx`

**Interfaces:**
- Consumes: clay primitives, motion (Parallax, StickyHeader, Timeline), data layer
- Produces: Trip detail with parallax hero, timeline itinerary

- [ ] **Step 1-6: Same pattern**

---

### Task 13: Create Trip Page (/trips/new) — Claymorphism

**Files:**
- Modify: `app/trips/new/page.tsx`
- Test: `__tests__/trip-create-clay.test.tsx`

**Interfaces:**
- Consumes: clay primitives (Field, Button, Card), Server Actions
- Produces: Trip creation form with clay fields

- [ ] **Step 1-6: Same pattern**

---

### Task 14: Edit Trip Page (/trips/[id]/edit) — Claymorphism

**Files:**
- Modify: `app/trips/[id]/edit/page.tsx`
- Test: `__tests__/trip-edit-clay.test.tsx`

**Interfaces:**
- Consumes: clay primitives, Server Actions
- Produces: Trip edit form with clay fields

- [ ] **Step 1-6: Same pattern**

---

### Task 15: Documentation Updates

**Files:**
- Modify: `docs/architecture/design-system.md`, `docs/reasonix/plans/travelapp-v1-plan.md`, `docs/reasonix/plans/travelapp-comprehensive-plan.md`, `docs/decisions/0003-design-system-tailwind-tokens.md`

**Interfaces:**
- Consumes: Completed implementation
- Produces: Updated docs reflecting claymorphism system

- [ ] **Step 1: Update design-system.md** — Rewrite Token System, Component Primitives, Usage, QA sections
- [ ] **Step 2: Update travelapp-v1-plan.md** — Task 0.6, 4.3, 4.4 acceptance criteria
- [ ] **Step 3: Update travelapp-comprehensive-plan.md** — Phase 0 Task 0.6, Phase 4 Tasks 4.2-4.4
- [ ] **Step 4: Amend ADR 0003** — Record claymorphism decision
- [ ] **Step 5: Verify all docs render correctly**

---

### Task 16: Final Verification Gate

**Files:** None (verification only)

- [ ] **Step 1: Full test suite**
```bash
npm test
```
Expected: 66+ tests PASS

- [ ] **Step 2: Typecheck**
```bash
npx tsc --noEmit
```
Expected: PASS

- [ ] **Step 3: Lint**
```bash
npm run lint
```
Expected: PASS

- [ ] **Step 4: Build**
```bash
npm run build
```
Expected: PASS (13 pages)

- [ ] **Step 5: Manual browser smoke test**
```bash
npm run dev
```
Verify: Homepage clay hero, trip list stagger, trip detail parallax, forms clay inputs, dark mode toggle, reduced motion

- [ ] **Step 6: Lighthouse CI (if configured)**
```bash
npm run lighthouse
```
Expected: Performance > 90, Accessibility > 95, Best Practices > 90

- [ ] **Step 7: Commit all remaining**
```bash
git add .
git commit -m "feat: claymorphism redesign complete - all tokens, primitives, pages, docs"
```

---

## Execution Order

1. Task 1: globals.css tokens
2. Task 2: tailwind.config.ts theme
3. Task 3: Button
4. Task 4: Card
5. Task 5: Input + Field
6. Task 6: Badge
7. Task 7: Dialog + Sheet
8. Task 8: EmptyState + SectionHeader + Timeline
9. Task 9: Motion components
10. Task 10: Homepage
11. Task 11: /trips
12. Task 12: /trips/[id]
13. Task 13: /trips/new
14. Task 14: /trips/[id]/edit
15. Task 15: Documentation
16. Task 16: Final verification

## Rollback Points
- After each task commit, `git tag clay-task-N`
- Full rollback: `git reset --hard main`

---

**Plan saved to:** `docs/superpowers/plans/2026-09-17-claymorphism-redesign-plan.md`

**Execution approach:** Subagent-driven (recommended) — fresh subagent per task with review between tasks. Ready to start Task 1.