import { cookies } from "next/headers";
import {
  DEMO_COOKIE,
  DEMO_USER,
  assertDemoAuthAllowed,
  isDemoAuthRequested,
  signDemoSession,
  verifyDemoSession,
} from "./demo-session";

// Returns user_id. Uses Supabase auth; only falls back to demo mode when
// NEXT_PUBLIC_AUTH_MODE=demo is explicitly set, and never in production.
export async function getUserId(): Promise<string | null> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user?.id) return data.user.id;
  } catch {
    // Supabase not configured or error - continue to fallback logic
  }

  if (!isDemoAuthRequested()) return null;

  assertDemoAuthAllowed();

  try {
    const jar = await cookies();
    const existing = await verifyDemoSession(jar.get(DEMO_COOKIE)?.value);
    if (existing) return existing;

    const session = await signDemoSession(DEMO_USER);
    jar.set(DEMO_COOKIE, session, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return DEMO_USER;
  } catch {
    // No request scope (e.g. a test or a non-request context): there is nowhere
    // to persist the session, but demo auth is still opted in for this process.
    return DEMO_USER;
  }
}

export async function requireUserId(): Promise<string> {
  const uid = await getUserId();
  if (!uid) throw new Error("Unauthorized");
  return uid;
}
