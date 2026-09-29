import { cookies } from "next/headers";
import {
  DEMO_COOKIE,
  DEMO_USER,
  assertDemoAuthAllowed,
  isDemoAuthRequested,
  verifyDemoSession,
} from "./demo-session";

// Returns user_id. Uses Supabase auth; only falls back to demo mode when
// NEXT_PUBLIC_AUTH_MODE=demo is explicitly set, and never in production.
//
// The demo session cookie is issued by middleware (lib/data/demo-cookie.ts),
// which is the only place on the read path allowed to write one. This side only
// ever verifies, so a client-authored cookie can never choose the identity.
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
    return (await verifyDemoSession(jar.get(DEMO_COOKIE)?.value)) ?? DEMO_USER;
  } catch {
    // No request scope (e.g. a test or a non-request context). Demo auth is
    // still opted in for this process, and with no cookie to check the only
    // identity available is the shared demo user.
    return DEMO_USER;
  }
}

export async function requireUserId(): Promise<string> {
  const uid = await getUserId();
  if (!uid) throw new Error("Unauthorized");
  return uid;
}
