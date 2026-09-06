# ADR 0006 — GitHub Actions for CI/CD

Date: 2026-09-05
Status: Accepted

## Context
Need automated CI/CD pipeline for quality gates and deployments. Requirements:
- Run lint, typecheck, test, build on every PR
- Preview deployments for PRs
- Production deployment on merge to main
- Free for open source / personal projects
- Integrates with Vercel

## Decision
Use **GitHub Actions** for CI/CD with **Vercel** for deployments.

## Alternatives Considered
- **GitLab CI** — rejected: repo on GitHub, extra complexity
- **CircleCI** — rejected: limited free tier, config complexity
- **Vercel Git Integration only** — rejected: no lint/typecheck/test gates before deploy
- **Custom server** — rejected: ops burden

## Consequences
- Positive: free, native GitHub integration, Vercel preview deploys automatic, matrix testing
- Negative: YAML complexity, limited Windows runner time
- Migration path: portable to other CI providers

## Verification
- `.github/workflows/ci.yml`: lint → typecheck → test → build
- `.github/workflows/e2e.yml`: Playwright on PR
- Vercel preview URL on every PR
- Production deploy on merge to main