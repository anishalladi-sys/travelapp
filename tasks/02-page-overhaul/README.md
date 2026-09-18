# Phase 02 — Page Overhaul (Scroll-Driven UI)

Goal: rebuild the 4 existing user-facing surfaces with the Phase 01 design system
and rich scroll storytelling (user-approved intensity: reveals, parallax heroes,
sticky headers, animated timeline, horizontal galleries).

Intensity rule (from CLAUDE.md + user choice): rich but performance-conscious.
Every effect must degrade gracefully (reduced-motion, slow devices, small screens).

## Segments

### 02.1 — Landing/home (prompt: `prompts/02.1-home.md`)
- Parallax hero (destination imagery, serif headline), reveal sections, stats.
- Clear CTA into the app; marketing-quality first impression.

### 02.2 — Trips list (prompt: `prompts/02.2-trips-list.md`)
- Editorial card grid, staggered reveal, empty state with strong visual identity.
- Create-trip flow entry point styled to match.

### 02.3 — Trip detail (prompt: `prompts/02.3-trip-detail.md`)
- The flagship page: hero with trip dates/cover, sticky day-nav header,
  itinerary rendered as an animated scroll timeline (day sections pin/reveal,
  progress indicator tracks scroll position), horizontal-scroll photo strip.
- Day → anchor navigation with smooth scroll.

### 02.4 — Itinerary editor (prompt: `prompts/02.4-editor.md`)
- Keep server-action correctness; improve form UX (inline add/edit, optimistic
  UI where safe, drag reorder via existing @dnd-kit, better empty states).
- Editor must remain fully keyboard accessible.

### 02.5 — QA (prompt: `prompts/02.5-qa-pages.md`)
- Devtools pass on every page: console, network, scroll performance, CLS,
  LCP on detail page, mobile + desktop viewports, keyboard navigation.
- Functional check: all CRUD still works after redesign.
- Fix defects found.

## Exit criteria
All pages redesigned and functional; no console errors; scroll effects smooth on
mid-range mobile; CRUD flows verified in browser.
