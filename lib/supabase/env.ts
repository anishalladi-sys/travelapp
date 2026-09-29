// One place that decides whether Supabase is usable, so callers do not each
// reach for process.env and re-derive the same rules.
//
// A pair that is absent, empty, or half-supplied is treated as absent: a URL
// without a key (or the reverse) is a misconfiguration, not a working client.

export type SupabaseEnv =
  | { configured: true; url: string; anonKey: string }
  | { configured: false; reason: "missing-env" | "missing-env-in-production" };

export function readSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  if (url && anonKey) return { configured: true, url, anonKey };

  return {
    configured: false,
    reason:
      process.env.NODE_ENV === "production"
        ? "missing-env-in-production"
        : "missing-env",
  };
}
