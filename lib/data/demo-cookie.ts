import { DEMO_USER, signDemoSession, verifyDemoSession } from "./demo-session";

// Cookie issuance lives here, not in the data layer, because Next.js only allows
// cookies to be written from middleware, route handlers and server actions -- a
// Server Component render cannot set one, and the resulting throw is easy to
// mistake for "no session needed". Middleware is the one place on the read path
// that can both read the incoming cookie and write the response.

export type DemoSession = {
  userId: string;
  value: string;
  shouldSet: boolean;
};

export async function resolveDemoSession(
  existingValue: string | undefined,
): Promise<DemoSession> {
  const verified = await verifyDemoSession(existingValue);

  if (verified) {
    return {
      userId: verified,
      value: existingValue as string,
      shouldSet: false,
    };
  }

  const value = await signDemoSession(DEMO_USER);
  return { userId: DEMO_USER, value, shouldSet: true };
}
