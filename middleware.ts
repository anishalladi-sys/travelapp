import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { readSupabaseEnv } from "@/lib/supabase/env";
import { resolveDemoSession } from "@/lib/data/demo-cookie";
import {
  DEMO_COOKIE,
  assertDemoAuthAllowed,
  isDemoAuthRequested,
} from "@/lib/data/demo-session";

export async function middleware(request: NextRequest) {
  const env = readSupabaseEnv();

  if (!env.configured) {
    // Without Supabase there is no session cookie to refresh, and the demo /
    // in-memory mode does not use one. Passing through is what makes the
    // documented "no Supabase configured" quick start actually work -- this
    // middleware used to construct a client unconditionally, which made
    // @supabase/ssr throw on every request and 500 the whole site.
    if (env.reason === "missing-env-in-production") {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set while " +
          "NODE_ENV=production. Production has no in-memory fallback: trips would be " +
          "stored in a per-process array and lost on every deploy. Set both variables.",
      );
    }

    if (!isDemoAuthRequested()) return NextResponse.next({ request });

    // Demo auth resolves every visitor to one shared identity, so it must never
    // be reachable in production.
    assertDemoAuthAllowed();

    // Middleware is the only place on the read path that can write a cookie, so
    // the signed demo session is issued here rather than in a Server Component.
    const session = await resolveDemoSession(
      request.cookies.get(DEMO_COOKIE)?.value,
    );
    const response = NextResponse.next({ request });

    if (session.shouldSet) {
      response.cookies.set(DEMO_COOKIE, session.value, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest|xml|txt)$).*)",
  ],
};
