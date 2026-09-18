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

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

export async function loginAction(input: LoginInput): Promise<{ error: string } | void> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.email?.[0] ?? parsed.error.flatten().fieldErrors.password?.[0] ?? "Invalid credentials" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    const cookieStore = await cookies();
    cookieStore.set("sb-user-id", data.user.id, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  }

  redirect("/trips");
}

export async function signupAction(input: SignupInput): Promise<{ error: string } | void> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.email?.[0] ?? parsed.error.flatten().fieldErrors.password?.[0] ?? parsed.error.flatten().fieldErrors.confirmPassword?.[0] ?? parsed.error.flatten().fieldErrors.terms?.[0] ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && !data.session) {
    return { error: "Please check your email to confirm your account" };
  }

  if (data.user) {
    const cookieStore = await cookies();
    cookieStore.set("sb-user-id", data.user.id, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  }

  redirect("/trips");
}

export async function magicLinkAction(input: MagicLinkInput): Promise<{ error: string } | void> {
  const parsed = magicLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid email" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { error: "Magic link sent! Check your email." };
}

export async function resetPasswordRequestAction(input: ResetPasswordRequestInput): Promise<{ error: string } | void> {
  const parsed = resetPasswordRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid email" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getBaseUrl()}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: "Password reset email sent! Check your inbox." };
}

export async function resetPasswordUpdateAction(input: ResetPasswordUpdateInput): Promise<{ error: string } | void> {
  const parsed = resetPasswordUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.password?.[0] ?? parsed.error.flatten().fieldErrors.confirmPassword?.[0] ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

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

export async function getSessionAction(): Promise<{ user: { id: string; email: string } | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      return { user: { id: data.user.id, email: data.user.email ?? "" }, error: null };
    }
    return { user: null, error: null };
  } catch (error) {
    return { user: null, error: getErrorMessage(error) };
  }
}