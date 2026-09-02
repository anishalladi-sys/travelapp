import { cookies } from "next/headers";

const DEMO_COOKIE = "travelapp_user_id";
const DEMO_USER = "demo-user-0001";

// Returns user_id. If Supabase env present, try Supabase auth; else fallback to demo cookie.
export async function getUserId(): Promise<string | null> {
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (hasSupabase) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) return data.user.id;
    } catch {
      // fall through to demo
    }
  }
  // Demo fallback: read cookie or create one
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

export async function requireUserId(): Promise<string> {
  const uid = await getUserId();
  if (!uid) throw new Error("Unauthorized");
  return uid;
}
