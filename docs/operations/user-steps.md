# User Steps

Status: Ready for owner action  
Scope: Manual external/account actions only. Repo work stops at code.

These are the steps that require access to your inbox, provider dashboards, DNS registrar, or production domain decisions. Do not paste secrets in chat. Do not commit `.env.local`.

## 1. Confirm your Supabase login email

Your account exists but is unconfirmed, so sign-in cannot succeed yet.

1. Open Supabase Dashboard → `travelapp`.
2. Go to **Authentication → Users**.
3. Find your Gmail user.
4. Either:
   - click the confirmation link in your Gmail inbox, **or**
   - open that user and choose **Confirm email**.
5. Test locally:
   - open `http://localhost:3000/login`
   - sign in with the correct password
   - if you forgot it, use **Forgot password?**, complete the emailed reset, then sign in.

Do not ask the repo agent to bypass email confirmation.

## 2. Cut over the production domain

Do this only when ready to go live. Full ordered checklist: `docs/features/custom-domain-checklist.md`.

1. Vercel → project **Settings → Domains**.
2. Add apex plus `www`.
3. Copy the A record and CNAME Vercel shows.
4. Add those DNS records at your registrar.
5. Wait until Vercel marks the domain **Valid**.
6. In Vercel environment variables, set:
   - `NEXT_PUBLIC_APP_URL=https://yourdomain.com`
   - `EMAIL_FROM` to an address on your verified domain.
7. Redeploy.
8. Supabase → **Auth → URL Configuration**:
   - set **Site URL** to production
   - add `https://yourdomain.com/auth/callback`
   - keep localhost entries for local development.
9. Verify your sending domain in Resend and send one test email.
10. Smoke-test:
    - `/`
    - `/trips`
    - `/privacy`
    - `/terms`
    - `/robots.txt`
    - `/sitemap.xml`

## 3. Deploy safely

1. Deploy from GitHub through Vercel.
2. Copy only the needed environment variables.
3. Do **not** add `SUPABASE_SERVICE_ROLE_KEY` to Vercel unless local CLI tooling specifically needs it.
4. Never paste secrets in chat.
5. Never commit `.env.local`.

## 4. Manual QA after email confirmation

Use `docs/testing/manual-test-plan.md` for the flows automation cannot cover in demo mode:

- `/signup`
- `/login`, including Password and Magic Link tabs
- `/auth/callback`
- `/auth/reset-password`

## 5. Decisions needed before repo changes

Tell the agent:

1. Vercel Analytics: wire `<Analytics/>` into `app/layout.tsx`, or remove unused `@vercel/analytics`?
2. Real production domain.
3. Real support/contact email for privacy and terms.
4. Attempt Sentry 11 / Next 16 now on a separate branch, or defer?
5. Supabase email confirmation is done.
