/**
 * Restricts a redirect target to same-origin relative paths.
 *
 * Lives outside app/auth/callback/route.ts because Next only permits a route
 * handler to export HTTP verbs and route config; exporting a helper from
 * route.ts fails the build with an OmitWithTag constraint error.
 *
 * Accepted: "/trips", "/auth/reset-password".
 * Rejected: absolute URLs, protocol-relative "//evil.example", backslash
 * variants ("/\evil.example") that some browsers normalise into
 * "//evil.example", percent-encoded smuggled slashes, and javascript:/data: URLs.
 */
export function safeRedirectTarget(
  candidate: string | null,
  origin: string,
): URL {
  const fallback = new URL("/trips", origin);

  if (!candidate) return fallback;

  const trimmed = candidate.trim();

  if (!trimmed.startsWith("/")) return fallback;
  // "//host" and "/\host" are protocol-relative and resolve off-origin.
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return fallback;
  // A scheme anywhere means it was never a local path.
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return fallback;
  // Encoded forms can smuggle a leading slash pair past the checks above.
  if (/^%2f{1,2}/i.test(trimmed)) return fallback;
  if (trimmed.includes("\\")) return fallback;

  const resolved = new URL(trimmed, origin);
  // Belt and braces: confirm the final URL is still ours.
  if (resolved.origin !== origin) return fallback;

  return resolved;
}
