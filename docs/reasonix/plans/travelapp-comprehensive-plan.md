# Comprehensive Implementation Plan: Travel App -- Full Product Vision

## Overview

Build a production-ready travel planning web app (responsive PWA) with all 10 feature areas from the original vision. This plan extends the existing v1 plan (Trip Basics + Itinerary) through v2 and v3 to deliver the complete product.

**Timeline:** 18 weeks (4.5 months) with 3+ month target
**Approach:** Vertical slicing, incremental delivery, quality gates at each phase
**Stack:** Next.js 15 App Router + TypeScript strict + Tailwind + shadcn/ui + Supabase (Postgres/Auth/RLS) + Vercel + Cloudflare R2

---

## Architecture Decisions (ADRs to Create)

| ADR | Decision | Rationale |
|-----|----------|-----------|
| 0001 | Next.js + Supabase for v1 | Already decided |
| 0002 | Cloudflare R2 for file storage | Free tier, S3-compatible, global CDN |
| 0003 | Design system: Tailwind + claymorphism tokens | Consistency, theming, adaptive dark mode |
| 0004 | Server Actions + Zod for mutations | Type-safe, no separate API layer needed |
| 0005 | Vitest + Playwright for testing | Unit + E2E coverage |
| 0006 | GitHub Actions for CI/CD | Free, integrated with Vercel |
| 0007 | PWA with Workbox | Offline support, installable |
| 0008 | Sentry for error tracking | Free tier, excellent Next.js integration |

---

## Phase Overview

| Phase | Weeks | Focus | Deliverable |
|-------|-------|-------|-------------|
| **0** | 1 | Foundation & Supabase Setup | Repo ready, Supabase project, CI/CD |
| **1** | 2 | Auth & Trip Basics (v1) | Login, signup, trip CRUD, list |
| **2** | 2 | Itinerary Management (v1) | Day-by-day items, grouped by date |
| **3** | 2 | Edit/Delete + Authz Hardening (v1) | Full CRUD, ownership enforcement |
| **4** | 2 | Polish v1 + Design System | A11y, dark mode, loading states, PWA |
| **5** | 3 | Accommodation + Transport (v2) | Lodging, flights, local transport |
| **6** | 3 | Budget + Documents (v2) | Expenses, currency, file uploads |
| **7** | 3 | Packing + POI + Emergency (v3) | Lists, places, safety info |
| **8** | 2 | Media & Memories (v3) | Photos, journal, gallery |
| **9** | 2 | Production Hardening & Launch | Perf, security, observability, launch |

---


## Phase 0: Foundation & Supabase Setup (Week 1)

### Task 0.1: Initialize Repository & Tooling
- **Description:** Set up Next.js 15, TypeScript strict, ESLint, Prettier, Tailwind v4, shadcn/ui
- **Acceptance:**
  - [ ] 
pm run dev boots without errors
  - [ ] 
pm run build passes
  - [ ] 
pm run lint passes
  - [ ] 
px tsc --noEmit passes
  - [ ] shadcn/ui components import correctly
- **Verify:** 
pm run build && npx tsc --noEmit && npm run lint
- **Files:** package.json, 	sconfig.json, eslint.config.mjs, 	ailwind.config.ts, components.json, pp/globals.css, pp/layout.tsx
- **Scope:** M
- **Deps:** None

### Task 0.2: Create Supabase Project & Run Migrations
- **Description:** Provision Supabase project, configure auth, run v1 migration, set up RLS policies
- **Acceptance:**
  - [ ] Supabase project created and linked
  - [ ] supabase db push applies migration successfully
  - [ ] RLS enabled on 	rips and itinerary_items
  - [ ] Auth providers configured (email/password)
  - [ ] Environment variables documented in .env.example
- **Verify:** supabase status, manual check in Supabase dashboard
- **Files:** supabase/migrations/20250101000000_v1_trips_itinerary.sql, .env.example, .env.local
- **Scope:** M
- **Deps:** 0.1

### Task 0.3: Set Up Supabase Helpers & Type Generation
- **Description:** Create server/client Supabase clients, generate TypeScript types from DB schema
- **Acceptance:**
  - [ ] lib/supabase/server.ts and client.ts work correctly
  - [ ] Types generated: 
px supabase gen types typescript --project-id > types/supabase.ts
  - [ ] No ny types in Supabase helpers
- **Verify:** 
px tsc --noEmit
- **Files:** lib/supabase/server.ts, lib/supabase/client.ts, 	ypes/supabase.ts
- **Scope:** S
- **Deps:** 0.2

### Task 0.4: Configure GitHub Actions CI/CD
- **Description:** Set up CI pipeline: lint, typecheck, test, build on every PR
- **Acceptance:**
  - [ ] .github/workflows/ci.yml runs on push/PR
  - [ ] Jobs: lint -> typecheck -> test -> build
  - [ ] Preview deployment to Vercel on PR
  - [ ] Production deployment on merge to main
- **Verify:** Open a test PR, confirm all checks pass
- **Files:** .github/workflows/ci.yml, ercel.json
- **Scope:** M
- **Deps:** 0.1

### Task 0.5: Set Up Error Tracking (Sentry)
- **Description:** Integrate Sentry for error monitoring and performance
- **Acceptance:**
  - [ ] Sentry DSN configured in env
  - [ ] Error boundary catches and reports errors
  - [ ] Source maps uploaded on build
- **Verify:** Trigger test error, confirm in Sentry dashboard
- **Files:** sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts, pp/error.tsx
- **Scope:** S
- **Deps:** 0.1

### Task 0.6: Create Design System Foundation — Claymorphism
- **Description:** Define claymorphism design tokens (clay surfaces, shadows, unified radii), adaptive dark mode, component primitives
- **Acceptance:**
  - [ ] `tailwind.config.ts` extends with claymorphism theme (clay colors, shadows, radii)
  - [ ] CSS variables for clay theming in `app/globals.css` (clay-surface, clay-raised, clay-pressed, clay-border, clay-highlight, clay-shadow, clay-ring)
  - [ ] Adaptive dark mode works via class strategy (clay depth in both light/dark)
  - [ ] shadcn/ui components use claymorphism tokens (shadows, radii, colors)
  - [ ] Storybook configured (optional but recommended)
- **Verify:** Visual check in Storybook or component gallery page; clay shadows visible in both themes
- **Files:** `tailwind.config.ts`, `app/globals.css`, `components/ui/*`, `.storybook/*`
- **Scope:** M
- **Deps:** 0.1

---


## Phase 1: Auth & Trip Basics (Weeks 2-3)

### Task 1.1: Authentication UI (Login, Signup, Password Reset)
- **Description:** Build auth pages with Supabase Auth, form validation, error handling
- **Acceptance:**
  - [ ] /login page: email/password, magic link option, " forgot password\ link
 - [ ] /signup page: email/password, validation, terms acceptance
 - [ ] /auth/reset-password page: email entry + password update
 - [ ] /auth/callback handles email confirmation
 - [ ] Client-side validation with Zod + React Hook Form
 - [ ] Server-side validation in Server Actions
 - [ ] Toast notifications for success/error states
 - [ ] Redirect to /trips after auth
- **Verify:** Manual flow test + 
pm test -- auth
- **Files:** pp/(auth)/login/page.tsx, pp/(auth)/signup/page.tsx, pp/(auth)/reset-password/page.tsx, pp/(auth)/callback/page.tsx, pp/auth/actions.ts, components/auth-form.tsx
- **Scope:** L
- **Deps:** 0.2, 0.3, 0.6

### Task 1.2: Trip List Page with Pagination & Search
- **Description:** Build trips dashboard with list, search, filter, pagination
- **Acceptance:**
 - [ ] /trips page shows user trips (Server Component)
 - [ ] Server-side pagination (cursor-based, 20 per page)
 - [ ] Search by title/destination (debounced, server-side)
 - [ ] Filter by status, trip_type, date range
 - [ ] Empty state with CTA to create trip
 - [ ] Loading skeleton during fetch
 - [ ] Error state with retry button
 - [ ] Responsive grid (1 col mobile, 2 tablet, 3 desktop)
- **Verify:** 
pm test -- trips-list + manual mobile/desktop test
- **Files:** pp/(dashboard)/trips/page.tsx, components/trips-list.tsx, components/trip-card.tsx, lib/data/trips.ts
- **Scope:** M
- **Deps:** 1.1

### Task 1.3: Create Trip Form & Server Action
- **Description:** Build trip creation form with full validation, optimistic UI
- **Acceptance:**
 - [ ] /trips/new page with TripForm component
 - [ ] Fields: title*, destination*, start_date*, end_date*, trip_type, traveler_count, status
 - [ ] Zod validation: required fields, end_date >= start_date, traveler_count >= 1
 - [ ] Client-side validation with inline errors
 - [ ] Server Action createTripAction with Zod + ownership
 - [ ] Optimistic UI: disable submit, show spinner, toast on success
 - [ ] Redirect to /trips/[id] on success
 - [ ] Accessible form: labels, aria-describedby, fieldset/legend
- **Verify:** 
pm test -- create-trip + manual form test
- **Files:** pp/(dashboard)/trips/new/page.tsx, components/trip-form.tsx, pp/trips/actions.ts, lib/validations/trip.ts
- **Scope:** M
- **Deps:** 1.1

### Task 1.4: Trip Detail Page (Read-Only)
- **Description:** Build trip detail view with header, metadata, empty itinerary state
- **Acceptance:**
 - [ ] /trips/[id] page loads trip via Server Component
 - [ ] Header: title, destination, dates, type, travelers, status badge
 - [ ] Edit/Delete actions in header
 - [ ] Itinerary section with \Add item\ CTA
 - [ ] Empty state when no itinerary items
 - [ ] 404 if trip not found or not owned (RLS)
 - [ ] Loading skeleton, error boundary
- **Verify:** Manual test + 
pm test -- trip-detail
- **Files:** pp/(dashboard)/trips/[id]/page.tsx, components/trip-header.tsx
- **Scope:** S
- **Deps:** 1.2

---


## Phase 2: Itinerary Management (Weeks 4-5)

### Task 2.1: Itinerary Item Form & Create Action
- **Description:** Build inline form for adding itinerary items with validation
- **Acceptance:**
  - [ ] ItineraryForm component: date*, time, activity*, location, notes
  - [ ] Zod validation: date format, time format, activity required
  - [ ] Server Action createItineraryAction with trip ownership check
  - [ ] Optimistic add: show immediately, sync on success
  - [ ] Toast on success/error
  - [ ] Keyboard accessible: Tab order, Enter to submit
- **Verify:** 
pm test -- itinerary-create + manual test
- **Files:** components/itinerary-form.tsx, pp/trips/actions.ts, lib/validations/itinerary.ts
- **Scope:** M
- **Deps:** 1.4

### Task 2.2: Itinerary List Grouped by Date
- **Description:** Render itinerary items grouped by date, sorted by time
- **Acceptance:**
  - [ ] Items grouped by date with date header
  - [ ] Within date, sorted by time (null times last)
  - [ ] Each item shows: time badge, activity, location, notes
  - [ ] Edit/Delete actions per item
  - [ ] Empty state per date group
  - [ ] Responsive: stacked on mobile, side-by-side on desktop
- **Verify:** Manual test with multiple items across dates
- **Files:** pp/(dashboard)/trips/[id]/page.tsx, components/itinerary-list.tsx, components/itinerary-item-row.tsx
- **Scope:** M
- **Deps:** 2.1

### Task 2.3: Drag-and-Drop Reordering (Sort Order)
- **Description:** Allow reordering items within a date via drag-drop
- **Acceptance:**
  - [ ] @dnd-kit integration for drag-drop
  - [ ] Update sort_order on drop via Server Action
  - [ ] Visual drag preview, drop zones
  - [ ] Persist order across refresh
  - [ ] Touch support for mobile
  - [ ] Keyboard alternative (arrow keys + modifier)
- **Verify:** Manual drag-drop test + 
pm test -- reorder
- **Files:** components/itinerary-list.tsx, pp/trips/actions.ts, lib/validations/itinerary.ts
- **Scope:** L
- **Deps:** 2.2

---


## Phase 3: Edit/Delete + Authz Hardening (Weeks 6-7)

### Task 3.1: Edit Trip Page & Action
- **Description:** Build trip edit form pre-filled with current data
- **Acceptance:**
  - [ ] /trips/[id]/edit page with pre-filled TripForm
  - [ ] Partial update: only changed fields sent
  - [ ] Server Action updateTripAction with ownership check
  - [ ] Validation same as create
  - [ ] Toast on success, redirect to detail
  - [ ] Cancel button returns to detail
- **Verify:** 
pm test -- update-trip + manual test
- **Files:** pp/(dashboard)/trips/[id]/edit/page.tsx, pp/trips/actions.ts
- **Scope:** M
- **Deps:** 1.3

### Task 3.2: Edit Itinerary Item Inline
- **Description:** Inline edit mode for itinerary items
- **Acceptance:**
  - [ ] Click " Edit\ -> inline form replaces item row
 - [ ] Pre-filled with current values
 - [ ] Save/Cancel buttons
 - [ ] Server Action updateItineraryAction with ownership via trip
 - [ ] Optimistic update, toast on result
- **Verify:** Manual test + 
pm test -- update-itinerary
- **Files:** components/itinerary-item-row.tsx, pp/trips/actions.ts
- **Scope:** M
- **Deps:** 2.1

### Task 3.3: Delete Confirmation & Actions
- **Description:** Confirmation dialogs for destructive actions
- **Acceptance:**
 - [ ] ConfirmDialog component (Radix Dialog)
 - [ ] Delete trip: confirms, cascades itinerary items
 - [ ] Delete item: confirms, single item
 - [ ] Server Actions deleteTripAction, deleteItineraryAction
 - [ ] Ownership verified server-side + RLS
 - [ ] Redirect to /trips after trip delete
 - [ ] Optimistic removal with undo toast (5s)
- **Verify:** 
pm test -- delete + manual test cross-user (RLS)
- **Files:** components/confirm-dialog.tsx, pp/trips/actions.ts, components/itinerary-item-row.tsx
- **Scope:** M
- **Deps:** 3.1, 3.2

### Task 3.4: Authz Integration Tests
- **Description:** Comprehensive authz tests with two users
- **Acceptance:**
 - [ ] Test: User A cannot read User B trip
 - [ ] Test: User A cannot update User B trip
 - [ ] Test: User A cannot delete User B trip
 - [ ] Test: User A cannot access User B itinerary
 - [ ] Test: RLS policies enforced at DB level
 - [ ] Run in CI with real Supabase (or mock)
- **Verify:** 
pm test -- authz
- **Files:** __tests__/authz.integration.test.ts, __tests__/setup.ts
- **Scope:** M
- **Deps:** 3.3

---


## Phase 4: Polish v1 + Claymorphism Design System (Weeks 8-9)

### Task 4.1: Loading, Error, Empty States Audit
- **Description:** Ensure every async boundary has proper states
- **Acceptance:**
  - [ ] pp/loading.tsx for each route segment
  - [ ] pp/error.tsx with retry button
  - [ ] pp/not-found.tsx for 404s
  - [ ] Skeleton loaders for lists/cards
  - [ ] Empty states with illustrations/CTAs
  - [ ] Form submission loading (disabled + spinner)
  - [ ] No layout shift during loading (CLS < 0.1)
- **Verify:** Manual audit + Lighthouse CI
- **Files:** pp/**/loading.tsx, pp/**/error.tsx, pp/**/not-found.tsx, components/skeleton.tsx
- **Scope:** M
- **Deps:** 1.2, 1.4, 2.2

### Task 4.2: Accessibility Audit & Fixes
- **Description:** Full WCAG 2.2 AA compliance
- **Acceptance:**
  - [ ] Semantic HTML: landmarks, headings hierarchy
  - [ ] Color contrast: 4.5:1 normal, 3:1 large text
  - [ ] Focus visible: 2px outline, 2px offset
  - [ ] Keyboard nav: all interactive elements reachable
  - [ ] ARIA labels: forms, dialogs, buttons with icons only
  - [ ] Screen reader tested (NVDA/VoiceOver)
  - [ ] Reduced motion respected
  - [ ] xe-core automated test in CI
- **Verify:** 
pm test -- a11y + manual screen reader test
- **Files:** components/ui/*, pp/**/*.tsx, itest.setup.ts
- **Scope:** L
- **Deps:** 0.6, 4.1

### Task 4.3: Adaptive Claymorphism Dark Mode & Theming
- **Description:** Complete adaptive claymorphism dark mode support with persistence
- **Acceptance:**
  - [ ] Theme provider with localStorage persistence
  - [ ] System preference detection
  - [ ] Toggle in header/navigation
  - [ ] All components work in dark mode with clay depth visible
  - [ ] No flash of wrong theme on load
  - [ ] Images/icons adapt (SVG currentColor)
  - [ ] Clay shadows visible in both light and dark (adaptive clay)
- **Verify:** Manual toggle test + refresh persistence; clay depth in both themes
- **Files:** components/theme-provider.tsx, components/theme-toggle.tsx, `app/globals.css`, `app/layout.tsx`
- **Scope:** M
- **Deps:** 0.6

### Task 4.4: Mobile-First Responsive Polish
- **Description:** Ensure excellent mobile UX
- **Acceptance:**
  - [ ] Touch targets >= 44x44px
  - [ ] No horizontal scroll
  - [ ] Viewport meta correct
  - [ ] Forms use correct input types (date, time, email)
  - [ ] iOS Safari zoom prevention (16px font minimum)
  - [ ] Safe area insets for notches
  - [ ] Bottom sheet pattern for mobile forms
- **Verify:** Chrome DevTools device toolbar + real device test
- **Files:** pp/globals.css, components/ui/*, pp/**/*.tsx
- **Scope:** M
- **Deps:** 0.6

### Task 4.5: PWA Configuration
- **Description:** Make app installable with offline support
- **Acceptance:**
  - [ ] 
ext-pwa / Workbox configured
  - [ ] Manifest: name, icons, theme_color, display: standalone
  - [ ] Service worker caches static assets
  - [ ] Offline fallback page
  - [ ] Install prompt on supported browsers
- **Verify:** Lighthouse PWA audit > 90
- **Files:** 
ext.config.ts, public/manifest.json, public/sw.js, pp/offline.tsx
- **Scope:** M
- **Deps:** 4.1

### Task 4.6: SEO & Meta Tags
- **Description:** Complete SEO foundation
- **Acceptance:**
  - [ ] Dynamic metadata per route (title, description, OG, Twitter)
  - [ ] JSON-LD structured data: WebSite, Organization
  - [ ] Sitemap.xml generation
  - [ ] Robots.txt
  - [ ] Canonical URLs
- **Verify:** 
pm run build -> check public/sitemap.xml, obots.txt
- **Files:** pp/**/page.tsx (metadata export), pp/sitemap.ts, pp/robots.ts
- **Scope:** S
- **Deps:** 4.1

---


## Phase 5: Accommodation + Transport (v2, Weeks 10-12)

### Task 5.1: Accommodation Data Model & Migration
- **Description:** Add accommodations table with RLS
- **Acceptance:**
  - [ ] Migration: ccommodations table (trip_id FK, name, address, check_in, check_out, confirmation_no, price, currency, created_at)
  - [ ] RLS policy via trip ownership
  - [ ] Index on (trip_id, check_in)
  - [ ] Zod schema: ccommodationSchema
  - [ ] Types generated
- **Verify:** supabase db push + 
px tsc --noEmit
- **Files:** docs/migrations/002-accommodations.sql, lib/validations/accommodation.ts, 	ypes/supabase.ts
- **Scope:** M
- **Deps:** 0.2

### Task 5.2: Accommodation CRUD UI
- **Description:** Add/edit/view accommodations on trip detail
- **Acceptance:**
  - [ ] Accommodation section on /trips/[id]
  - [ ] " Add accommodation\ form (modal or inline)
 - [ ] Fields: name*, address, check_in*, check_out*, confirmation_no, price, currency
 - [ ] Validation: check_out >= check_in
 - [ ] List view grouped by trip
 - [ ] Edit/Delete with confirmation
- **Verify:** Manual test + 
pm test -- accommodation
- **Files:** pp/(dashboard)/trips/[id]/accommodations/*, components/accommodation-form.tsx, components/accommodation-list.tsx, pp/trips/actions.ts
- **Scope:** L
- **Deps:** 5.1

### Task 5.3: Transport Data Model & Migration
- **Description:** Add transport table for flights, trains, car rental, local
- **Acceptance:**
 - [ ] Migration: ransport table (trip_id FK, type enum, details JSON, date_time, created_at)
 - [ ] RLS via trip ownership
 - [ ] Index on (trip_id, date_time)
 - [ ] Zod schema with discriminated union for type-specific details
- **Verify:** supabase db push + 
px tsc --noEmit
- **Files:** docs/migrations/003-transport.sql, lib/validations/transport.ts
- **Scope:** M
- **Deps:** 5.1

### Task 5.4: Transport CRUD UI
- **Description:** Transport management on trip detail
- **Acceptance:**
 - [ ] Transport section with type tabs (Flights, Trains, Car Rental, Local)
 - [ ] Type-specific forms (flight: airline, flight_no, departure/arrival airports/times; train: similar; car: company, confirmation; local: notes)
 - [ ] Chronological list sorted by date_time
 - [ ] Edit/Delete with confirmation
- **Verify:** Manual test + 
pm test -- transport
- **Files:** pp/(dashboard)/trips/[id]/transport/*, components/transport-form.tsx, components/transport-list.tsx, pp/trips/actions.ts
- **Scope:** L
- **Deps:** 5.3

---


## Phase 6: Budget + Documents (v2, Weeks 13-15)

### Task 6.1: Cloudflare R2 Setup for File Storage
- **Description:** Configure R2 bucket, signed URLs, upload/download
- **Acceptance:**
  - [ ] R2 bucket created and CORS configured
  - [ ] lib/storage/r2.ts with upload/download helpers
  - [ ] Signed URL generation (PUT for upload, GET for download)
  - [ ] File type validation (images, PDFs, max 10MB)
  - [ ] Server Action for generating upload URLs
- **Verify:** Upload/download test file via UI
- **Files:** lib/storage/r2.ts, pp/api/upload/route.ts, .env.example (R2 vars)
- **Scope:** M
- **Deps:** 0.2

### Task 6.2: Budget/Expense Data Model & Migration
- **Description:** Add expenses table with categories, currency, splitting
- **Acceptance:**
  - [ ] Migration: expenses table (trip_id FK, category, amount, currency, date, description, split_with JSON, receipt_url, created_at)
  - [ ] udgets table (trip_id FK, total_budget, currency, alert_threshold)
  - [ ] RLS via trip ownership
  - [ ] Indexes on (trip_id, date), (trip_id, category)
  - [ ] Zod schemas with currency validation (ISO 4217)
- **Verify:** supabase db push + 
px tsc --noEmit
- **Files:** docs/migrations/004-budget.sql, lib/validations/budget.ts, lib/validations/expense.ts
- **Scope:** M
- **Deps:** 6.1

### Task 6.3: Budget Dashboard & Expense Tracking
- **Description:** Budget overview + expense CRUD with currency conversion
- **Acceptance:**
  - [ ] /trips/[id]/budget page
  - [ ] Set total budget + currency
  - [ ] Expense list with category filters
  - [ ] Add expense form: category*, amount*, currency, date*, description, split_with, receipt upload
  - [ ] Real-time conversion via exchangerate.host API (cached)
  - [ ] Summary: spent vs budget, by category, by traveler
  - [ ] Visual: progress bar, pie chart (Recharts)
- **Verify:** Manual test + 
pm test -- budget
- **Files:** pp/(dashboard)/trips/[id]/budget/page.tsx, components/budget-dashboard.tsx, components/expense-form.tsx, components/expense-list.tsx, lib/currency.ts
- **Scope:** L
- **Deps:** 6.2

### Task 6.4: Documents Management
- **Description:** Document upload, list, preview, download
- **Acceptance:**
  - [ ] /trips/[id]/documents page
  - [ ] Drag-drop upload zone (R2 direct upload via signed URL)
  - [ ] Document types: passport, visa, insurance, booking, vaccination, other
  - [ ] List with type icons, file size, upload date
  - [ ] Preview (PDF in iframe, images inline)
  - [ ] Download via signed GET URL
  - [ ] Delete with confirmation
  - [ ] Client-side validation before upload
- **Verify:** Upload/download various file types
- **Files:** pp/(dashboard)/trips/[id]/documents/page.tsx, components/document-upload.tsx, components/document-list.tsx, pp/api/upload/route.ts
- **Scope:** L
- **Deps:** 6.1

---


## Phase 7: Packing + POI + Emergency (v3, Weeks 16-18)

### Task 7.1: Packing List Data Model & Migration
- **Description:** Packing items with categories, quantities, weather suggestions
- **Acceptance:**
  - [ ] Migration: packing_items (trip_id FK, category, name, quantity, packed, weather_dependent, created_at)
  - [ ] packing_templates (global templates by trip type/climate)
  - [ ] RLS via trip ownership
  - [ ] Zod schemas
- **Verify:** supabase db push + 
px tsc --noEmit
- **Files:** docs/migrations/005-packing.sql, lib/validations/packing.ts
- **Scope:** M
- **Deps:** 0.2

### Task 7.2: Packing List UI with Templates
- **Description:** Interactive packing list with category grouping, templates
- **Acceptance:**
  - [ ] /trips/[id]/packing page
  - [ ] Categories: Clothing, Toiletries, Electronics, Documents, Medications, Other
  - [ ] Checkbox to mark packed, progress bar per category
  - [ ] " Add from template\ button (pre-built lists per trip_type)
 - [ ] Custom items with quantity
 - [ ] Drag-drop reorder within category
 - [ ] \Packed all\ / \Unpack all\ actions
- **Verify:** Manual test + 
pm test -- packing
- **Files:** pp/(dashboard)/trips/[id]/packing/page.tsx, components/packing-list.tsx, components/packing-template.tsx
- **Scope:** L
- **Deps:** 7.1

### Task 7.3: Points of Interest (POI) Data Model & Migration
- **Description:** Wishlist places with location, ratings, notes
- **Acceptance:**
 - [ ] Migration: pois (trip_id FK, name, category, lat, lng, address, rating, notes, website, created_at)
 - [ ] RLS via trip ownership
 - [ ] Index on (trip_id, category)
 - [ ] Zod schema with coordinate validation
- **Verify:** supabase db push + 
px tsc --noEmit
- **Files:** docs/migrations/006-pois.sql, lib/validations/poi.ts
- **Scope:** M
- **Deps:** 7.1

### Task 7.4: POI Management with Map Integration
- **Description:** POI CRUD with map picker (Leaflet/MapLibre)
- **Acceptance:**
 - [ ] /trips/[id]/poi page
 - [ ] List view with category filters
 - [ ] Add POI: name*, category, address -> geocode to lat/lng
 - [ ] Map picker for manual coordinate selection
 - [ ] Show POIs on map with clustering
 - [ ] Category icons/colors
 - [ ] Export to Google Maps / Apple Maps links
- **Verify:** Manual test with map
- **Files:** pp/(dashboard)/trips/[id]/poi/page.tsx, components/poi-form.tsx, components/poi-map.tsx, lib/geocode.ts
- **Scope:** L
- **Deps:** 7.3

### Task 7.5: Emergency Info Data Model & UI
- **Description:** Emergency contacts, local numbers, medical info
- **Acceptance:**
 - [ ] Migration: emergency_info (trip_id FK, local_emergency, embassy, hospital, police, medical_notes, emergency_contacts JSON, created_at)
 - [ ] /trips/[id]/emergency page
 - [ ] Pre-filled by destination country (dataset)
 - [ ] Editable fields with validation
 - [ ] One-tap call links (tel:)
 - [ ] Offline-accessible (cached in SW)
- **Verify:** Manual test + offline check
- **Files:** docs/migrations/007-emergency.sql, lib/validations/emergency.ts, pp/(dashboard)/trips/[id]/emergency/page.tsx, components/emergency-form.tsx
- **Scope:** M
- **Deps:** 7.3

---


## Phase 8: Media & Memories (v3, Weeks 19-20)

### Task 8.1: Media Data Model & Migration
- **Description:** Photos/videos with metadata, journal entries
- **Acceptance:**
  - [ ] Migration: media (trip_id FK, type enum, r2_key, thumbnail_key, caption, date_taken, lat, lng, created_at)
  - [ ] journal_entries (trip_id FK, date, title, content, mood, created_at)
  - [ ] RLS via trip ownership
  - [ ] Indexes on (trip_id, date_taken), (trip_id, date)
- **Verify:** supabase db push + 
px tsc --noEmit
- **Files:** docs/migrations/008-media.sql, lib/validations/media.ts, lib/validations/journal.ts
- **Scope:** M
- **Deps:** 6.1

### Task 8.2: Media Gallery & Upload
- **Description:** Photo/video gallery with upload, grid, lightbox
- **Acceptance:**
  - [ ] /trips/[id]/media page
  - [ ] Masonry grid layout (CSS columns or react-masonry)
  - [ ] Drag-drop multi-upload to R2
  - [ ] Client-side thumbnail generation (canvas)
  - [ ] Lightbox viewer with navigation
  - [ ] Caption/location/date editing
  - [ ] Map view toggle (photos with coords)
  - [ ] Download original via signed URL
- **Verify:** Upload 10+ photos, test lightbox, map view
- **Files:** pp/(dashboard)/trips/[id]/media/page.tsx, components/media-grid.tsx, components/media-lightbox.tsx, components/media-upload.tsx
- **Scope:** L
- **Deps:** 8.1

### Task 8.3: Travel Journal
- **Description:** Rich-text journal entries per day
- **Acceptance:**
  - [ ] /trips/[id]/journal page
  - [ ] Calendar heatmap showing entry days
  - [ ] Rich text editor (TipTap or Plate)
  - [ ] Mood selector (emoji)
  - [ ] Auto-save draft to localStorage
  - [ ] Photos inline (reference media)
  - [ ] Export journal as PDF/Markdown
- **Verify:** Write multi-day journal, export
- **Files:** pp/(dashboard)/trips/[id]/journal/page.tsx, components/journal-editor.tsx, components/journal-calendar.tsx
- **Scope:** L
- **Deps:** 8.1

---


## Phase 9: Production Hardening & Launch (Weeks 21-22)

### Task 9.1: Performance Optimization
- **Description:** Meet Core Web Vitals targets
- **Acceptance:**
  - [ ] LCP < 2.5s (4G), < 1.5s (wifi)
  - [ ] INP < 200ms
  - [ ] CLS < 0.1
  - [ ] Bundle analysis: < 150KB JS gzipped initial
  - [ ] Images: WebP/AVIF, responsive, lazy-loaded
  - [ ] Font optimization: 
ext/font with preload
  - [ ] RSC streaming where beneficial
- **Verify:** Lighthouse CI in GitHub Actions, Vercel Analytics
- **Files:** 
ext.config.ts, pp/globals.css, components/ui/*, pp/**/*.tsx
- **Scope:** L
- **Deps:** All prior

### Task 9.2: Security Hardening
- **Description:** Production security checklist
- **Acceptance:**
  - [ ] CSP header via 
ext.config.ts (strict)
  - [ ] HSTS, X-Frame-Options, X-Content-Type-Options
  - [ ] Rate limiting on auth endpoints (Supabase built-in + custom)
  - [ ] No secrets in client bundle (verify)
  - [ ] Input sanitization on all user content
  - [ ] RLS policies reviewed and tested
  - [ ] Dependency audit: 
pm audit clean
- **Verify:** Security headers check, 
pm audit, OWASP ZAP scan
- **Files:** 
ext.config.ts, middleware.ts, lib/security.ts
- **Scope:** M
- **Deps:** All prior

### Task 9.3: Observability & Monitoring
- **Description:** Logging, metrics, alerting
- **Acceptance:**
  - [ ] Structured JSON logging (Pino)
  - [ ] Custom metrics: trip_created, item_added, upload_completed
  - [ ] Sentry: errors, performance, replay
  - [ ] Vercel Analytics + Speed Insights enabled
  - [ ] Health check endpoint /api/health
  - [ ] Alert on error rate > 1%
- **Verify:** Trigger test error, confirm alert
- **Files:** lib/logger.ts, lib/metrics.ts, pp/api/health/route.ts, sentry.*.config.ts
- **Scope:** M
- **Deps:** 0.5

### Task 9.4: E2E Test Suite (Playwright)
- **Description:** Critical user flows covered
- **Acceptance:**
  - [ ] Auth: signup -> login -> logout
  - [ ] Trip: create -> edit -> delete
  - [ ] Itinerary: add -> reorder -> edit -> delete
  - [ ] Cross-user authz (two browsers)
  - [ ] Mobile viewport tests
  - [ ] Run in CI on PR
- **Verify:** 
pm run test:e2e passes in CI
- **Files:** e2e/*.spec.ts, playwright.config.ts, .github/workflows/e2e.yml
- **Scope:** L
- **Deps:** 9.1

### Task 9.5: Documentation & Launch Prep
- **Description:** Final docs, README, launch checklist
- **Acceptance:**
  - [ ] README.md: setup, dev, deploy, env vars
  - [ ] docs/architecture/architecture-overview.md updated
  - [ ] docs/features/ for each feature area
  - [ ] docs/operations/runbook.md: common ops tasks
  - [ ] Launch checklist: env vars, DNS, SSL, monitoring
  - [ ] Changelog updated
- **Verify:** Fresh clone -> follow README -> working app
- **Files:** README.md, docs/**/*.md, CHANGELOG.md
- **Scope:** M
- **Deps:** All prior

---


## Parallelization Strategy

| Can Parallelize | Must Be Sequential |
|-----------------|-------------------|
| Auth UI + Trip List (different routes) | DB migrations (order matters) |
| Accommodation + Transport (independent features) | Authz depends on Auth |
| Budget + Documents (different domains) | Design system before UI |
| Packing + POI + Emergency | R2 setup before Documents/Media |
| E2E tests + Documentation | Performance audit after features |

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Supabase RLS misconfiguration | High | Medium | Integration tests with 2 users per feature |
| R2 upload failures | High | Low | Retry logic, client-side validation, fallback |
| Currency API rate limits | Medium | Medium | Cache rates 1hr, fallback to static |
| Map library bundle size | Medium | High | Dynamic import, lazy load map |
| Drag-drop on mobile | Medium | High | Test early, fallback to arrow buttons |
| Dark mode flash | Low | High | Inline script in <head> |
| PWA cache stale data | Medium | Medium | Versioned cache, skipWaiting |

---

## Verification Gates (Every Phase)

`ash
# 1. Targeted tests
npm test -- <feature>

# 2. Type check
npx tsc --noEmit

# 3. Lint
npm run lint

# 4. Build
npm run build

# 5. E2E (phases 4+)
npm run test:e2e

# 6. Lighthouse CI (phases 4, 9)
npm run lighthouse

# 7. Manual smoke test
npm run dev -> verify in browser
`

---

## Checkpoints

### Checkpoint 1: End of Phase 1 (Week 3)
- [ ] Auth flow works end-to-end
- [ ] Trip create/list works
- [ ] All tests pass, build clean
- [ ] **Human review before proceeding**

### Checkpoint 2: End of Phase 3 (Week 7) -- v1 Complete
- [ ] Full Trip + Itinerary CRUD
- [ ] Authz verified (RLS + server)
- [ ] A11y baseline met
- [ ] **Human review before v2**

### Checkpoint 3: End of Phase 6 (Week 15) -- v2 Complete
- [ ] Accommodation, Transport, Budget, Documents working
- [ ] File uploads to R2 functional
- [ ] Currency conversion working
- [ ] **Human review before v3**

### Checkpoint 4: End of Phase 8 (Week 20) -- v3 Complete
- [ ] All 10 feature areas implemented
- [ ] PWA installable, offline works
- [ ] E2E suite green
- [ ] **Human review before launch**

### Checkpoint 5: End of Phase 9 (Week 22) -- Launch Ready
- [ ] CWV targets met
- [ ] Security audit clean
- [ ] Observability operational
- [ ] Documentation complete
- [ ] **Production deployment approved**

---

## Open Questions for Human

1. **Currency API:** Use free exchangerate.host or paid provider (fixer.io)?
2. **Map provider:** Leaflet (free, self-hosted tiles) or MapLibre (MapTiler/Mapbox tiles)?
3. **Rich text editor:** TipTap (headless, more control) or Plate (React-focused)?
4. **Email provider:** Resend (already in stack) or Supabase Auth emails?
5. **Analytics:** Vercel Analytics only, or add Plausible/PostHog?
6. **Beta users:** Internal only, or public beta before launch?

---

## Success Criteria (Definition of Done)

The project is **READY TO SHIP** when:

- [ ] All 10 feature areas implemented and tested
- [ ] 
pm run lint && npx tsc --noEmit && npm test && npm run build && npm run test:e2e all pass
- [ ] Lighthouse: Performance > 90, Accessibility > 95, Best Practices > 90, SEO > 90, PWA > 90
- [ ] Zero critical/high vulnerabilities in 
pm audit
- [ ] Security headers present and correct
- [ ] Sentry receiving errors, Vercel Analytics active
- [ ] Documentation complete for setup, deployment, operations
- [ ] Human has verified each checkpoint
