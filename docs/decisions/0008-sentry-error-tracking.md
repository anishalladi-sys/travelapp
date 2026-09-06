# ADR 0008 — Sentry for Error Tracking & Performance

Date: 2026-09-05
Status: Accepted

## Context
Need production observability: error tracking, performance monitoring, session replay. Requirements:
- Free tier generous for small team
- Native Next.js App Router support
- Source map upload
- Session replay for debugging
- Alerting on error rates

## Decision
Use **Sentry** with Next.js SDK (`@sentry/nextjs`).

## Alternatives Considered
- **Datadog** — rejected: expensive, complex setup
- **LogRocket** — rejected: session replay focused, less error tracking
- **Vercel Observability only** — rejected: limited error grouping, no replay
- **Custom logging** — rejected: reinventing wheel, no alerting

## Consequences
- Positive: generous free tier (5k errors/month), excellent Next.js integration, replay, alerting
- Negative: additional vendor, DSN in client bundle (public), sampling at scale
- Migration path: OpenTelemetry compatible if switching

## Verification
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Source maps uploaded on build (`sentry-cli`)
- Error boundary in `app/error.tsx` captures and reports
- Test error appears in Sentry dashboard
- Alert configured for error rate > 1%