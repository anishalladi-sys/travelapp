# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization, enter project name: `travelapp`
4. Set database password (save it!)
5. Choose region closest to you
6. Wait for project to provision (~2 minutes)

## 2. Get API Keys

1. Go to Settings → API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)
   - **Project ID** → `SUPABASE_PROJECT_ID`

## 3. Configure Auth

1. Go to Authentication → Providers
2. Enable **Email** provider
3. (Optional) Configure email templates
4. Set Site URL: `http://localhost:3000` (dev) / your production URL

## 4. Update .env.local

Edit `.env.local` with your actual values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id
```

## 5. Link Local Supabase CLI

```bash
supabase login
supabase link --project-ref your-project-id
```

## 6. Push Migrations

```bash
supabase db push
```

This will run the migration in `supabase/migrations/20250101000000_v1_trips_itinerary.sql`

## 7. Generate TypeScript Types

```bash
supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

## 8. Verify Locally

```bash
npm run dev
```

Visit http://localhost:3000/trips/new to test trip creation.

## 9. Demo Auth Mode (Development Only)

For development without Supabase, set in `.env.local`:
```bash
NEXT_PUBLIC_AUTH_MODE=demo
```

This enables an in-memory demo user (`demo-user-0001`). **Never use in production** — production must reject demo mode even if the flag is set.

---

## Troubleshooting

### Migration fails
- Check Supabase dashboard → SQL Editor for errors
- Ensure pgcrypto extension is enabled (migration does this)

### Auth not working
- Verify Site URL in Auth settings
- Check redirect URLs include `http://localhost:3000/auth/callback`

### RLS not working
- Verify policies in Authentication → Policies
- Test with two different user accounts

### Types out of sync
- Re-run `supabase gen types` after schema changes
- Restart TypeScript server in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"