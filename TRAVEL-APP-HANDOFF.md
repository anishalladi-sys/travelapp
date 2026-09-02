# Travel App — Handoff

Trip information capture app. This file is the current state of planning before any code exists. Read this, `CLAUDE.md`, and `IMPLEMENTATION-PROCESS.md` before starting work.

Status: Stage 0 (Orient) done — greenfield, nothing exists yet. Stage 1 (Define) is partial: the raw feature list below needs to be cut down to an MVP before implementation starts. That cut is the first task.

## What this is

A mobile/web app for capturing and organizing trip information: itinerary, accommodation, transport, budget, documents, packing, points of interest, emergency info, and media, all in one place per trip.

## Scope decision (open — resolve before Stage 2)

The original spec below lists ten feature areas. Building all ten before shipping anything isn't realistic. Proposed v1 scope:

- **Trip Basics** — create/view/edit a trip (title, destination, dates, type, traveler count, status)
- **Itinerary Management** — add, edit, and view day-by-day itinerary items on a trip

Everything else (accommodation, transportation, budget tracker, documents, packing list, points of interest, emergency info, media) goes to backlog for v2+.

This split is a proposal, not a decision. Confirm it with the user in Stage 1 before moving to Architect. If the user wants a different first slice (for example, budget tracking instead of itinerary), swap it in, the same narrowing logic applies either way.

## Full feature list (reference / backlog)

Kept here so nothing from the original request gets lost, even though v1 only covers two of these.

1. **Trip Basics** — name, destination(s), start/end date, trip type, traveler count, status
2. **Itinerary Management** — day-by-day schedule, activities with time slots, location pins, notes, duration
3. **Accommodation Details** — lodging name, check-in/out, address, confirmation number, price
4. **Transportation** — flights, train/bus, car rental, local transport notes
5. **Budget Tracker** — estimated vs actual, category breakdown, currency conversion, expense splitting
6. **Documents Storage** — passport/ID, visa, insurance, booking confirmations, vaccination records
7. **Packing List** — customizable, category-based, weather-based suggestions
8. **Points of Interest** — wishlist, restaurants, local recommendations, reviews
9. **Emergency Info** — local emergency numbers, embassy contacts, home contacts, medical info
10. **Media & Memories** — photo/video gallery, journal, location-tagged photos

## Stack (unconfirmed — revisit in Architect)

The original spec suggested React Native/Flutter, Node/Express or Firebase, Postgres or MongoDB, and AWS S3. Treat this as a placeholder, not a decision: it wasn't chosen against this project's actual constraints (the all-free OpenCode/deepseek stack described in `IMPLEMENTATION-PROCESS.md`). Confirm framework, database, hosting, and auth approach with the user in Stage 2 before writing any code against it.

Original draft schema, kept for reference once the stack is confirmed:

```
Users
- user_id, name, email, password_hash

Trips
- trip_id, user_id, title, destination, start_date, end_date, status

Itinerary_Items
- item_id, trip_id, date, time, activity, location, notes

Accommodations
- accom_id, trip_id, name, address, check_in, check_out, confirmation_no

Transportation
- transport_id, trip_id, type, details (JSON), date_time

Expenses
- expense_id, trip_id, category, amount, currency, date

Documents
- doc_id, trip_id, type, file_url, upload_date
```

For v1, only `Users`, `Trips`, and `Itinerary_Items` are needed. The rest maps to backlog features and can wait.

## Pipeline status

| Stage | Status | Notes |
|---|---|---|
| 0 Orient | Done | Greenfield project, no repo to survey |
| 1 Define | Partial | MVP scope proposed above, needs user confirmation |
| 2 Architect | Not started | Stack unconfirmed, no API/schema design done for v1 |
| 3 Plan | Not started | |
| 4 Implement | Not started | |
| 5 Verify | Not started | |
| 6 Harden | Not started | |
| 7 Review | Not started | |
| 8 Productionize | Not started | |
| 9 Ship | Not started | |
| 10 Report | Not started | |

## First vertical slices (for Stage 3 Plan, once scope + stack are confirmed)

1. User can create a trip (title, destination, dates, type, status) and see it in a list
2. User can open a trip and add an itinerary item (date, time, activity, location, notes)
3. User can edit or delete a trip and its itinerary items
4. Authz: a user can only see and modify their own trips

## Instructions for the next AI session

- Run on the executor (`openrouter/deepseek/deepseek-chat-v3.1:free` via OpenCode). Security review, once there's anything to review, stays on `deepseek-r1:free`, never a NIM subagent.
- Start at Stage 1: confirm the MVP scope split above with the user, one question at a time, before writing code.
- Once scope is locked, move to Stage 2: confirm the stack, write down why, then design the API/schema for `Users`, `Trips`, `Itinerary_Items` only.
- Follow the non-negotiables from `IMPLEMENTATION-PROCESS.md`: tests for every behavior change, server-side authz on every protected mutation, no secrets committed, new branch per feature, model attribution on generated output.
- Don't touch the backlog features (accommodation, transport, budget, documents, packing, POI, emergency, media) until v1 slices above are shipped and verified.

## Open questions for the user

- Web app, mobile app, or both for v1?
- Confirm database choice given the free-tier stack.
- Auth: email/password, magic link, or third-party?
- Any of the backlog features needed for v1 after all (documents/photo storage in particular changes the storage decision early)?
