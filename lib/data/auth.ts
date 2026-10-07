import { cookies } from "next/headers";
import {
  DEMO_COOKIE,
  DEMO_USER,
  assertDemoAuthAllowed,
  isDemoAuthRequested,
  verifyDemoSession,
} from "./demo-session";
import { readSupabaseEnv } from "@/lib/supabase/env";

// Returns user_id. Uses Supabase auth; only falls back to demo mode when
// NEXT_PUBLIC_AUTH_MODE=demo is explicitly set, and never in production.
//
// The demo session cookie is issued by middleware (lib/data/demo-cookie.ts),
// which is the only place on the read path allowed to write one. This side only
// ever verifies, so a client-authored cookie can never choose the identity.
export async function getUserId(): Promise<string | null> {
  // First check if Supabase is configured at all.
  const env = readSupabaseEnv();

  if (!env.configured) {
    // Supabase not configured at all.
    if (!isDemoAuthRequested()) return null;
    assertDemoAuthAllowed();
    try {
      const jar = await cookies();
      return (
        (await verifyDemoSession(jar.get(DEMO_COOKIE)?.value)) ?? DEMO_USER
      );
    } catch {
      return DEMO_USER;
    }
  }

  // Supabase is configured. Try to get the user. If this fails for any reason
  // (auth outage, corrupt cookie, revoked session, etc.), we MUST fail closed.
  // Falling back to demo mode here would let a transient auth outage silently
  // resolve to the shared demo identity, which is a cross-user data leak.
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user?.id) return data.user.id;
  } catch {
    // Any failure here is a genuine auth-system problem, not "unconfigured".
    // We must NOT fall through to demo mode.
    return null;
  }

  if (!isDemoAuthRequested()) return null;

  assertDemoAuthAllowed();

  try {
    const jar = await cookies();
    return (await verifyDemoSession(jar.get(DEMO_COOKIE)?.value)) ?? DEMO_USER;
  } catch {
    return DEMO_USER;
  }
}

export async function requireUserId(): Promise<string> {
  const uid = await getUserId();
  if (!uid) throw new Error("Unauthorized");
  return uid;
}
