# Custom Domain Cutover Checklist

Manual steps for the owner in provider dashboards. Repo work stops at code.

1. Vercel: open project Settings > Domains, add apex (yourdomain.com) plus www.
   Note the A record for apex and CNAME record for www that Vercel shows.
2. DNS: at your registrar, add the records from step 1.
   Wait for propagation, then confirm Vercel marks the domain Valid.
3. Env: in Vercel project env set NEXT_PUBLIC_APP_URL to https://yourdomain.com.
   Set EMAIL_FROM to an address on the verified domain, then redeploy.
4. Supabase: Dashboard > Auth > URL Configuration, set Site URL to https://yourdomain.com.
   Add https://yourdomain.com/auth/callback to redirect URLs (see SUPABASE_SETUP.md lines 26, 86-87).
5. Resend: verify the sending domain in the Resend dashboard, then send one test email.
6. Contact email: replace support@travelapp.example.com in app/(legal)/privacy and app/(legal)/terms with the real address.
7. Smoke test: open homepage, /trips, /privacy, /terms, /robots.txt, /sitemap.xml.
   Confirm favicon loads and the OG card preview is correct.
8. Rollback: remove the domain in Vercel, revert the env values, redeploy.
   Restore the localhost entry in Supabase redirect URLs.
