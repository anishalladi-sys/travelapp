# ADR 0002 — Cloudflare R2 for File Storage

Date: 2026-09-05
Status: Accepted

## Context
Need object storage for v2+ features: documents (passports, visas, insurance, bookings), receipts for expenses, photos/videos for media gallery, and journal exports. Requirements:
- S3-compatible API (easy migration if needed)
- Free tier generous enough for development and small production
- Global CDN for fast downloads
- No egress fees (critical for media-heavy app)
- Simple signed URL upload/download from browser

## Decision
Use **Cloudflare R2** for all file storage (documents, receipts, media).

## Alternatives Considered
- **AWS S3** — rejected: egress fees, complex IAM, no free tier for production
- **Supabase Storage** — rejected: limited free tier (1GB), tied to Supabase, no CDN
- **Vercel Blob** — rejected: newer, less proven, pricing unclear at scale
- **Local filesystem** — rejected: not durable, doesn't work on serverless

## Consequences
- Positive: zero egress fees, generous free tier (10GB), global CDN, S3-compatible
- Negative: additional vendor, need CORS config, signed URL logic required
- Migration path: S3-compatible API means easy switch if needed

## Verification
- R2 bucket created with CORS for localhost and production domain
- Signed PUT/GET URLs work from browser
- File type validation and size limits enforced