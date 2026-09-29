// Demo-mode identity. Demo auth exists for local development and demos only:
// it resolves every unauthenticated visitor to one fixed shared user, so it is
// refused outright in production (see assertDemoAuthAllowed) and the session it
// hands out is signed rather than read straight off the client.

export const DEMO_COOKIE = "travelapp_demo_session";
export const DEMO_USER = "demo-user-0001";

const encoder = new TextEncoder();

// A per-process random secret, cached on globalThis so HMR does not invalidate
// open demo sessions. No new env var is required because demo auth cannot run in
// production, so this secret never has to survive a deploy or cross a trust
// boundary. It exists only to stop a client from choosing its own user id.
function getSigningSecret(): string {
  const g = globalThis as unknown as { __travelappDemoSecret?: string };
  if (!g.__travelappDemoSecret) {
    g.__travelappDemoSecret = crypto.randomUUID();
  }
  return g.__travelappDemoSecret;
}

async function getKey(usage: "sign" | "verify"): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSigningSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): ArrayBuffer | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return buffer;
  } catch {
    return null;
  }
}

export function isDemoAuthRequested(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_MODE === "demo";
}

// Demo auth hands every visitor the same identity, so treating it as a runtime
// misconfiguration in production is the only safe reading. Fail loudly rather
// than silently degrading to "no user", which would leave a live insecure
// deploy looking like a merely-unused feature.
export function assertDemoAuthAllowed(): void {
  if (!isDemoAuthRequested()) return;
  if (process.env.NODE_ENV !== "production") return;

  throw new Error(
    "NEXT_PUBLIC_AUTH_MODE=demo is set while NODE_ENV=production. Demo auth " +
      "resolves every unauthenticated visitor to the shared user " +
      `"${DEMO_USER}" and must never be reachable in production. Unset the ` +
      "variable and redeploy. Note that NEXT_PUBLIC_ variables are inlined at " +
      "build time, so this also requires a rebuild.",
  );
}

export async function signDemoSession(userId: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getKey("sign"),
    encoder.encode(userId),
  );
  return `${userId}.${toBase64Url(new Uint8Array(signature))}`;
}

// Returns the user id only for a token this process issued. A tampered or
// client-authored cookie resolves to null, so a visitor cannot pick their own id.
export async function verifyDemoSession(
  value: string | undefined,
): Promise<string | null> {
  if (!value) return null;

  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;

  const userId = value.slice(0, separator);
  const signature = fromBase64Url(value.slice(separator + 1));
  if (!signature) return null;

  const valid = await crypto.subtle.verify(
    "HMAC",
    await getKey("verify"),
    signature,
    encoder.encode(userId),
  );
  return valid ? userId : null;
}
