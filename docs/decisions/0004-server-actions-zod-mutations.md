# ADR 0004 — Server Actions + Zod for Mutations

Date: 2026-09-05
Status: Accepted

## Context
Need a type-safe, secure way to handle all mutations (create, update, delete) for trips, itinerary, and future features. Requirements:
- End-to-end type safety (input → validation → DB)
- Server-side ownership enforcement (never trust client)
- No separate API layer to maintain
- Works with Next.js App Router
- Zod schemas as single source of truth

## Decision
Use **Next.js Server Actions** for all mutations with **Zod** validation at the boundary. Server Actions run on server, receive `FormData`, validate with Zod, enforce ownership via Supabase RLS + explicit checks, then mutate DB.

## Alternatives Considered
- **REST API (Route Handlers)** — rejected: more boilerplate, separate client fetcher, duplication
- **tRPC** — rejected: adds complexity, Server Actions native to Next.js 15
- **GraphQL** — rejected: overkill, no real-time needed
- **Client-side Supabase client** — rejected: cannot enforce ownership server-side

## Consequences
- Positive: type-safe from form to DB, server-only execution, automatic revalidation, no CORS issues
- Negative: Server Actions less familiar to some, harder to test in isolation, progressive enhancement needed
- Migration path: can extract to Route Handlers if needed

## Verification
- Every mutation has Zod schema in `lib/validations/`
- Server Action validates, checks ownership, then calls Supabase
- `as never` casts eliminated (use proper generics)
- Integration tests verify ownership enforcement