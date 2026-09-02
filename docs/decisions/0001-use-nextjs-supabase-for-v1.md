# ADR 0001 — Use Next.js + Supabase for v1

Date: 2026-09-02
Status: Accepted
Context: Greenfield travel app. Need free-tier, fast vertical slice, DB-level authz without building custom backend. Original spec suggested React Native/Flutter + Node/Express/Firebase/Postgres/Mongo + S3 — unvetted against actual constraints.

## Decision
Use **Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui** for frontend, **Supabase (Postgres + Auth + RLS)** for data/auth, **Vercel** for hosting. No Express server, no S3/R2 for v1.

## Alternatives Considered
- Next.js + NextAuth + SQLite/Prisma local DB — rejected: no built-in RLS, more custom authz code, harder to get DB-level isolation.
- Flutter/React Native — rejected: v1 is web-only per scope A; mobile later would duplicate effort before validating slice.
- Firebase — rejected: RLS model less familiar than Postgres policies; CLAUDE.md existing stack is Supabase.

## Consequences
- Positive: free tier covers v1; RLS gives least-privilege per user; single deployment (Vercel); fast iteration.
- Negative: vendor lock to Supabase Auth; need to manage RLS policies carefully; local dev needs Supabase env vars or fallback.
- Migration path: additive tables for backlog features; no schema rewrite.

## Verification
- Check Supabase RLS policies enforce `auth.uid() = user_id` (trips) and `EXISTS` (itinerary).
- Validate `npm run build` passes with env vars; `npx tsc --noEmit` strict.
