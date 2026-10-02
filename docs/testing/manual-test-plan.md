# Manual Test Plan — Travel App

Status: Implemented
Covers: homepage `/`, auth (`/login`, `/signup`, `/auth/*`), `/design`, `/trips`, `/trips/[id]`, `/trips/new`, `/trips/[id]/edit`, scroll/motion connectivity, claymorphism visual QA, responsive, a11y/keyboard, errors/loading/404, API/middleware guards, automated gate.

How to use:

1. Start in demo mode: `NEXT_PUBLIC_AUTH_MODE=demo npm run dev` → open `http://localhost:3000`.
2. Work sections 0 → 14 in order (start to end of project).
3. Check each `- [ ]` only when Given/When/Expect all hold.
4. Record failures in section 15 sign-off table.

---

## 0. Setup and Environment

- [ ] 0.1 Demo env boots
  - Given `.env.local` has `NEXT_PUBLIC_AUTH_MODE=demo`
  - When you run `npm run dev` and open `http://localhost:3000`
  - Expect homepage loads with no console errors, no env crash
- [ ] 0.2 All routes reachable
  - Given dev server running
  - When you visit `/`, `/login`, `/signup`, `/design`, `/trips`, `/trips/new`
  - Expect no 404, no white screen, header/nav renders
- [ ] 0.3 Automated baseline noted
  - Given clean checkout
  - When you run `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`
  - Expect 105 tests pass, 0 lint errors, 0 type errors, 13 pages build (record versions)

## 1. Signup Page (`/signup`)

- [ ] 1.1 Signup form renders
  - Given logged out at `/signup`
  - When page loads
  - Expect title "Start planning your adventures", email/password/confirm fields, submit button, link to login
- [ ] 1.2 Empty submit blocked
  - Given empty signup form
  - When you submit
  - Expect inline field errors, no navigation, no server crash
- [ ] 1.3 Invalid email rejected
  - Given email `not-an-email`
  - When you submit
  - Expect email validation error, stays on `/signup`
- [ ] 1.4 Password mismatch rejected
  - Given password and confirm differ
  - When you submit
  - Expect mismatch error, stays on `/signup`
- [ ] 1.5 Valid signup succeeds (demo mode)
  - Given valid email + matching passwords
  - When you submit
  - Expect redirect to `/trips`, `UserMenu` shows user, session persists on reload

## 2. Login Page (`/login` — Password + Magic Link tabs)

- [ ] 2.1 Tabs render with correct ARIA
  - Given logged out at `/login`
  - When page loads
  - Expect `role=tablist` with Password (selected) and Magic Link tabs, `password-panel` visible, `magic-panel` hidden
- [ ] 2.2 Switch to Magic Link tab
  - Given Password tab active
  - When you click Magic Link tab
  - Expect magic panel shows, `aria-selected` flips, password panel hides
- [ ] 2.3 Empty login blocked
  - Given empty login form
  - When you submit
  - Expect inline errors, stays on `/login`
- [ ] 2.4 Wrong credentials rejected
  - Given unknown email / wrong password
  - When you submit
  - Expect error message, stays on `/login`, no redirect to `/trips`
- [ ] 2.5 Valid login succeeds (demo mode)
  - Given valid demo credentials
  - When you submit
  - Expect redirect to `/trips`, header shows `UserMenu`
- [ ] 2.6 Magic link request
  - Given Magic Link tab with valid email
  - When you submit
  - Expect success notice ("check email"), no crash in demo mode
- [ ] 2.7 Login → signup cross-link
  - Given at `/login`
  - When you click sign-up link
  - Expect navigation to `/signup` and back-link works

## 3. Auth Callback and Reset (`/auth/callback`, `/auth/reset-password`)

- [ ] 3.1 Callback handles code
  - Given Supabase email link with `?code=...`
  - When you open `/auth/callback?code=...`
  - Expect session set then redirect to `/trips` (or error message on bad code, no crash)
- [ ] 3.2 Reset-password form renders
  - Given at `/auth/reset-password`
  - When page loads
  - Expect new-password + confirm fields
- [ ] 3.3 Reset mismatch blocked
  - Given differing new passwords
  - When you submit
  - Expect mismatch error, stays on page
- [ ] 3.4 Reset success
  - Given matching valid passwords + valid session
  - When you submit
  - Expect success message and redirect to `/login`

## 4. Homepage / First Page (`/`)

- [ ] 4.1 Hero renders
  - Given at `/`
  - When page loads
  - Expect "Plan Your Perfect Journey" headline, lede copy, `Start Planning` → `/trips/new`, `View Demo Trips` → `/trips`
- [ ] 4.2 Header nav works
  - Given at `/`
  - When you click Trips / New Trip / logo
  - Expect correct routes, logo returns to `/`
- [ ] 4.3 Feature cards render
  - Given scrolled to features
  - When section enters viewport
  - Expect 3 cards (Smart Itinerary, Trip Planning, Secure & Private) with icons, staggered Reveal
- [ ] 4.4 ScrollProgress on homepage
  - Given at top of `/`
  - When you scroll down 500px+
  - Expect 3px `clay-ring` progress bar grows left→right at viewport top
- [ ] 4.5 StickyHeader on homepage
  - Given scrolled past header
  - When you continue scrolling
  - Expect header sticks, backdrop blur, no layout jump
- [ ] 4.6 Parallax hero
  - Given hero in view
  - When you scroll slowly
  - Expect hero card moves at reduced rate (speed 0.15), no jitter or overlap

## 5. Design System Page (`/design`)

- [ ] 5.1 Page loads with all galleries
  - Given at `/design`
  - When page loads
  - Expect color tokens, type scale, Button/Card Input Badge Dialog EmptyState SectionHeader Timeline galleries all visible
- [ ] 5.2 Buttons gallery interactive
  - Given Button section
  - When you hover/press primary, outline, ghost, destructive
  - Expect clay lift on hover, inset press on active, visible focus ring on tab
- [ ] 5.3 Dialog/Sheet demo
  - Given Dialog trigger
  - When you open then press Escape / click overlay
  - Expect `clay-modal` shadow, focus trapped while open, closes and returns focus to trigger
- [ ] 5.4 Motion demos
  - Given motion section
  - When you scroll
  - Expect Reveal, Parallax, TimelineProgress, `useInViewport` demos animate once and respect reduced-motion

## 6. Trips List (`/trips`)

- [ ] 6.1 Empty state (fresh demo store)
  - Given zero trips
  - When you visit `/trips`
  - Expect "No trips yet" EmptyState with 🧳, Create Trip button → `/trips/new`
- [ ] 6.2 Trip cards render
  - Given 2+ trips exist
  - When you visit `/trips`
  - Expect grid of Cards with title, destination, `start_date → end_date` mono dates, status Badge, type + traveler count
- [ ] 6.3 Card → detail navigation
  - Given cards visible
  - When you click a card
  - Expect navigation to `/trips/[id]` for that trip
- [ ] 6.4 Stagger Reveal on list
  - Given list with 3+ trips
  - When you scroll
  - Expect cards reveal up with 50–100ms stagger, no flash of unstyled content
- [ ] 6.5 Header actions
  - Given at `/trips`
  - When you click Create Trip / New Trip
  - Expect navigation to `/trips/new`; UserMenu opens with logout option
- [ ] 6.6 Ownership scoping note
  - Given logged in as demo user
  - When you view footer note
  - Expect "you only see your own trips" and no other-user trips leak

## 7. Trip Detail (`/trips/[id]`)

- [ ] 7.1 Hero renders
  - Given valid trip id
  - When you visit `/trips/[id]`
  - Expect title, destination, dates, type Badge, Edit → `/trips/[id]/edit`, Delete button
- [ ] 7.2 Back to list
  - Given on detail
  - When you click All Trips
  - Expect back to `/trips` preserving session
- [ ] 7.3 Empty itinerary state
  - Given trip with zero items
  - When detail loads
  - Expect EmptyState with Add Item CTA
- [ ] 7.4 Itinerary grouped by date
  - Given items on 2+ dates
  - When detail loads
  - Expect date groups ascending, times sorted within day, Timeline dots/connectors render
- [ ] 7.5 Add itinerary item
  - Given detail with ItineraryForm
  - When you submit valid date/time/title
  - Expect new item appears in correct date group without full reload
- [ ] 7.6 Invalid itinerary blocked
  - Given empty title or bad date
  - When you submit
  - Expect inline validation error, no item created
- [ ] 7.7 Delete itinerary item
  - Given existing item with delete control
  - When you delete
  - Expect item removed, other dates unaffected
- [ ] 7.8 Delete trip
  - Given detail with Delete button
  - When you confirm delete
  - Expect redirect to `/trips`, trip gone, itinerary cascade deleted
- [ ] 7.9 Unknown id → not-found
  - Given id that does not exist
  - When you visit `/trips/bad-id`
  - Expect custom `not-found.tsx` (not stack trace)

## 8. Create Trip (`/trips/new`)

- [ ] 8.1 Form renders in clay card
  - Given at `/trips/new`
  - When page loads
  - Expect Back to Trips link, clay-raised card, fields: title, destination, dates, type, travelers, status
- [ ] 8.2 Empty submit blocked
  - Given empty form
  - When you submit
  - Expect field errors, stays on `/trips/new`
- [ ] 8.3 End-before-start rejected
  - Given `end_date` before `start_date`
  - When you submit
  - Expect date-range error, no trip created
- [ ] 8.4 Valid create succeeds
  - Given all required valid
  - When you submit Create Trip
  - Expect redirect to new `/trips/[id]`, trip appears in `/trips` list
- [ ] 8.5 Cancel/back preserves list
  - Given at `/trips/new`
  - When you click Back to Trips
  - Expect `/trips` loads, no draft created

## 9. Edit Trip (`/trips/[id]/edit`)

- [ ] 9.1 Form prefills
  - Given existing trip
  - When you visit `/trips/[id]/edit`
  - Expect all fields prefilled with current values, Back to Trip → detail
- [ ] 9.2 Save changes
  - Given changed title/destination
  - When you submit Save Changes
  - Expect redirect to `/trips/[id]` showing updated values
- [ ] 9.3 Invalid edit blocked
  - Given cleared title or bad dates
  - When you submit
  - Expect inline errors, data unchanged
- [ ] 9.4 Unknown id → not-found
  - Given bad id
  - When you visit `/trips/bad-id/edit`
  - Expect not-found page, no crash

## 10. Scroll and Motion Connectivity

- [ ] 10.1 ScrollProgress connectivity (all scroll pages)
  - Given `/`, `/trips`, `/trips/[id]`, `/design`
  - When you scroll top → bottom
  - Expect bar 0 → 100% width, color `clay-ring`/`accent`, fixed, no content shift
- [ ] 10.2 StickyHeader connectivity
  - Given `/`, `/trips`, `/trips/[id]`
  - When you scroll past header
  - Expect header pins, blur intact, anchor links still clickable
- [ ] 10.3 Reveal connectivity + stagger
  - Given homepage features, trips grid, detail sections
  - When sections enter viewport
  - Expect fade-up once, stagger 50–100ms, no re-trigger on scroll-up
- [ ] 10.4 Parallax connectivity
  - Given `/` hero (0.15) and `/trips/[id]` hero (0.2, offset -50)
  - When you scroll
  - Expect smooth differential movement, no overlap with sticky header or footer
- [ ] 10.5 TimelineProgress connectivity
  - Given `/design` demo and detail Timeline
  - When you scroll through timeline
  - Expect progress fill follows scroll, dots highlight in order
- [ ] 10.6 Reduced-motion honored
  - Given OS reduced-motion ON
  - When you scroll all motion pages
  - Expect no parallax/transform animation, content fully visible statically

## 11. Claymorphism Visual QA (Light + Dark)

- [ ] 11.1 Light theme depth
  - Given light mode, base `#f5f0eb`
  - When you view Buttons, Cards, Inputs, Badges, Dialogs
  - Expect soft raised surfaces, inner highlight + outer shadow, 12px radius (16px `clay-lg`), pill badges
- [ ] 11.2 Dark theme depth (adaptive clay)
  - Given dark mode, base `#2a2724`
  - When you view same components
  - Expect depth still visible (not flat black), text contrast passes, modal shadow stronger
- [ ] 11.3 Press/hover states
  - Given any clay Button/Card
  - When you hover then press
  - Expect hover lift + deeper shadow, press inset shadow, release restores
- [ ] 11.4 Focus ring everywhere
  - Given keyboard tab through all pages
  - When focus lands on interactive element
  - Expect 2px terracotta ring + 2px offset, never clipped
- [ ] 11.5 Touch targets
  - Given mobile 360px
  - When you measure buttons/links/tabs
  - Expect ≥44px hit area, no overlapping targets

## 12. Responsive and Mobile

- [ ] 12.1 360px mobile
  - Given 360×800 viewport
  - When you visit `/`, `/trips`, `/trips/[id]`, `/trips/new`
  - Expect single column, no horizontal scroll, header collapses (nav hidden, CTA reachable)
- [ ] 12.2 768px tablet
  - Given 768px viewport
  - When you visit trips grid
  - Expect 2-column grid, hero padding scales, forms max-w-2xl centered
- [ ] 12.3 1280px desktop
  - Given 1280px viewport
  - When you visit all pages
  - Expect container max width, 3-column trips grid, hero `p-20` breathing room

## 13. Accessibility and Keyboard

- [ ] 13.1 Full keyboard flow
  - Given keyboard only
  - When you tab signup → login → trips → new → detail → edit
  - Expect logical order, all actions reachable, no trap (except open Dialog)
- [ ] 13.2 Screen-reader labels
  - Given screen reader on
  - When you traverse forms, tabs, timeline, dialogs
  - Expect named fields, `tablist/tab/panel` announced, errors associated, dialog title announced
- [ ] 13.3 Contrast and motion
  - Given both themes
  - When you check muted text, badges, placeholders
  - Expect WCAG AA contrast; reduced-motion disables animation (see 10.6)

## 14. Errors, Loading, 404, API, Middleware

- [ ] 14.1 Loading states
  - Given slow network (throttle)
  - When you visit `/`, `/trips`, `/trips/[id]`
  - Expect `loading.tsx` skeleton, no layout jump when data arrives
- [ ] 14.2 Route error boundary
  - Given forced render error
  - When error throws
  - Expect `error.tsx` friendly message + retry, no stack trace to user
- [ ] 14.3 Unknown route 404
  - Given at `/nope-xyz`
  - When page loads
  - Expect branded 404 with home link
- [ ] 14.4 API guards (`/api/auth/user`, `/api/auth/logout`)
  - Given logged out
  - When you call `GET /api/auth/user`
  - Expect 401 JSON; logged in → 200 with safe user (no secrets)
- [ ] 14.5 Middleware session refresh
  - Given valid session cookie
  - When you navigate server-rendered routes
  - Expect no random logout; expired session redirects to `/login` on protected routes
- [ ] 14.6 Logout clears session
  - Given logged in
  - When you logout via UserMenu / API
  - Expect redirect to `/login`, back-button to `/trips` does not resurrect session

## 15. Automated Verification Gate and Sign-off

Run before marking pass:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Expected: lint 0 errors, typecheck 0 errors, 105 tests pass (17 files), build 13 pages OK.

| Section                  | Pass | Fail | Notes (URL, screenshot, console error) |
| ------------------------ | ---- | ---- | -------------------------------------- |
| 0 Setup                  |      |      |                                        |
| 1 Signup                 |      |      |                                        |
| 2 Login                  |      |      |                                        |
| 3 Callback/Reset         |      |      |                                        |
| 4 Homepage               |      |      |                                        |
| 5 /design                |      |      |                                        |
| 6 Trips list             |      |      |                                        |
| 7 Trip detail            |      |      |                                        |
| 8 Create                 |      |      |                                        |
| 9 Edit                   |      |      |                                        |
| 10 Scroll/motion         |      |      |                                        |
| 11 Clay visual           |      |      |                                        |
| 12 Responsive            |      |      |                                        |
| 13 A11y/keyboard         |      |      |                                        |
| 14 Errors/API/middleware |      |      |                                        |
| 15 Automated gate        |      |      |                                        |

Tester: __________ Date: __________ Env: demo / supabase (circle one) Branch: __________
