import { cookies } from "next/headers";

const DEMO_COOKIE = "travelapp_user_id";
const DEMO_USER = "demo-user-0001";

// Returns user_id. Uses Supabase auth; only falls back to demo mode when
// NEXT_PUBLIC_AUTH_MODE=demo is explicitly set (non-production only).
export async function getUserId(): Promise<string | null> {
  const isDemoMode = process.env.NEXT_PUBLIC_AUTH_MODE === "demo";

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user?.id) return data.user.id;
  } catch {
    // Supabase not configured or error - continue to fallback logic
  }

  // Demo fallback: ONLY allowed when explicitly opted in via env flag
  if (isDemoMode) {
    try {
      const jar = await cookies();
      const existing = jar.get(DEMO_COOKIE)?.value;
      if (existing) return existing;
      jar.set(DEMO_COOKIE, DEMO_USER, { path: "/", maxAge: 60 * 60 * 24 * 30 });
      return DEMO_USER;
    } catch {
      return DEMO_USER;
    }
  }

  return null;
}

export async function requireUserId(): Promise<string> {
  const uid = await getUserId();
  if (!uid) throw new Error("Unauthorized");
  return uid;
}