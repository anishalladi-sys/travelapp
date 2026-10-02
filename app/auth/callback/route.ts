import { createClient } from "@/lib/supabase/server";
import { safeRedirectTarget } from "@/lib/safe-redirect";
import { NextResponse } from "next/server";

/**
 * OAuth / email-confirmation landing route.
 *
 * Supabase redirects here after a magic link, an email confirmation, or a
 * password reset. Two defects were fixed here:
 *
 * 1. Open redirect. `next` was read from the query string and passed straight to
 *    `redirect(next)` with no validation. An attacker could send anyone to
 *    `/auth/callback?next=https://evil.example` and have the app perform the
 *    redirect itself, carrying this site's credibility with it -- the classic
 *    phishing primitive. Worse, the redirect happened even with no valid `code`,
 *    so the link worked as a pure redirector. Only same-origin relative paths
 *    are accepted now.
 *
 * 2. Silent failure. `exchangeCodeForSession`'s error was discarded, so a failed
 *    exchange redirected to /trips anyway and the user saw "not signed in" with
 *    no explanation. The reason is now surfaced.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const destination = safeRedirectTarget(searchParams.get("next"), origin);

  // token_hash + type is the PKCE-style email OTP path; code is the OAuth path.
  if (code || (tokenHash && type)) {
    const supabase = await createClient();
    const result = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          type: type as "email" | "recovery",
          token_hash: tokenHash as string,
        });

    if (result.error) {
      // Log server-side only; the query string carries the reason and is not for
      // the visitor.
      console.error(
        "[auth/callback] code exchange failed",
        result.error.message,
      );
      return NextResponse.redirect(
        new URL("/login?error=callback_failed", origin),
      );
    }
  } else if (!code && !tokenHash) {
    // Neither credential present. Do not redirect anywhere on the caller's
    // behalf -- this link has no session to establish.
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }

  return NextResponse.redirect(destination);
}
