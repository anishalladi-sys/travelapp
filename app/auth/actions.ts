"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  signupSchema,
  resetPasswordRequestSchema,
  resetPasswordUpdateSchema,
  magicLinkSchema,
  type LoginInput,
  type SignupInput,
  type ResetPasswordRequestInput,
  type ResetPasswordUpdateInput,
  type MagicLinkInput,
} from "@/lib/validations/auth";
import { redirect } from "next/navigation";
import {
  enforceRateLimit,
  HOUR,
  tooManyAttemptsMessage,
} from "@/lib/rate-limit";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

export async function loginAction(
  input: LoginInput,
): Promise<{ error?: string; success?: string } | void> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        parsed.error.flatten().fieldErrors.email?.[0] ??
        parsed.error.flatten().fieldErrors.password?.[0] ??
        "Invalid credentials",
    };
  }

  const email = parsed.data.email;

  // Two budgets: one per IP so a single host cannot spray many accounts, and one
  // per IP+email so a distributed attempt against one account is still bounded.
  // Only failures are charged, so a legitimate user who signs in successfully is
  // never locked out by earlier traffic -- the Supabase call happens first and
  // the gate is only consulted on failure.
  const gate = await enforceRateLimit([
    { scope: "login", limit: 10, windowMs: 15 * 60_000 },
    {
      scope: "login_email",
      limit: 5,
      windowMs: 15 * 60_000,
      identifier: email,
    },
  ]);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    if (!gate.ok) return { error: tooManyAttemptsMessage() };
    // Deliberately not error.message. Supabase's own text ("Invalid login
    // credentials") is safe, but passing the raw message through means any new
    // upstream wording -- including one that distinguishes "no such user" from
    // "wrong password" -- reaches the user verbatim and enables account
    // enumeration. One fixed message for every failure.
    return { error: "Invalid email or password." };
  }

  if (data.user) {
    const cookieStore = await cookies();
    cookieStore.set("sb-user-id", data.user.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  redirect("/trips");
}

export async function signupAction(
  input: SignupInput,
): Promise<{ error?: string; success?: string } | void> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        parsed.error.flatten().fieldErrors.email?.[0] ??
        parsed.error.flatten().fieldErrors.password?.[0] ??
        parsed.error.flatten().fieldErrors.confirmPassword?.[0] ??
        parsed.error.flatten().fieldErrors.terms?.[0] ??
        "Invalid input",
    };
  }

  const email = parsed.data.email;

  // Signup is unbounded upstream once an IP is trusted, and each attempt can
  // trigger an outbound email. Both the IP and the target address are limited.
  const gate = await enforceRateLimit([
    { scope: "signup", limit: 5, windowMs: HOUR },
    { scope: "signup_email", limit: 3, windowMs: HOUR, identifier: email },
  ]);
  if (!gate.ok) return { error: tooManyAttemptsMessage() };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && !data.session) {
    // Informational, not a failure: Supabase created the account and is waiting
    // on the emailed confirmation. This used to travel back through the `error`
    // channel, so the most common successful sign-up path in the whole product
    // rendered as a red error next to an error toast.
    return { success: "Please check your email to confirm your account." };
  }

  if (data.user) {
    const cookieStore = await cookies();
    cookieStore.set("sb-user-id", data.user.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  redirect("/trips");
}

export async function magicLinkAction(
  input: MagicLinkInput,
): Promise<{ error?: string; success?: string } | void> {
  const parsed = magicLinkSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid email",
    };
  }

  const email = parsed.data.email;

  // Each request triggers an outbound email, so both the caller and the target
  // address are limited.
  const gate = await enforceRateLimit([
    { scope: "magic", limit: 5, windowMs: HOUR },
    { scope: "magic_email", limit: 3, windowMs: HOUR, identifier: email },
  ]);
  if (!gate.ok) return { error: tooManyAttemptsMessage() };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });

  if (error) {
    // A failure here is a config or rate-limit problem, not user input. Surfacing
    // Supabase's raw message would tell an attacker which of those it is.
    return {
      error: "We could not send the link. Please try again shortly.",
    };
  }

  return { success: "Magic link sent! Check your email." };
}

export async function resetPasswordRequestAction(
  input: ResetPasswordRequestInput,
): Promise<{ error?: string; success?: string } | void> {
  const parsed = resetPasswordRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid email",
    };
  }

  const email = parsed.data.email;

  // The strongest per-target limit in the auth surface. This endpoint is a
  // password-reset mail dispenser: without a per-address cap it can be used both
  // to mail-bomb an address and to enumerate which addresses have accounts by
  // timing the response.
  const gate = await enforceRateLimit([
    { scope: "reset", limit: 5, windowMs: HOUR },
    { scope: "reset_email", limit: 3, windowMs: HOUR, identifier: email },
  ]);
  if (!gate.ok) return { error: tooManyAttemptsMessage() };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl()}/auth/reset-password`,
  });

  if (error) {
    return {
      error: "We could not send the reset email. Please try again shortly.",
    };
  }

  return { success: "Password reset email sent! Check your inbox." };
}

export async function resetPasswordUpdateAction(
  input: ResetPasswordUpdateInput,
): Promise<{ error?: string; success?: string } | void> {
  const parsed = resetPasswordUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        parsed.error.flatten().fieldErrors.password?.[0] ??
        parsed.error.flatten().fieldErrors.confirmPassword?.[0] ??
        "Invalid input",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/trips");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete("sb-user-id");

  redirect("/login");
}

export async function getSessionAction(): Promise<{
  user: { id: string; email: string } | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      return {
        user: { id: data.user.id, email: data.user.email ?? "" },
        error: null,
      };
    }
    return { user: null, error: null };
  } catch (error) {
    return { user: null, error: getErrorMessage(error) };
  }
}
