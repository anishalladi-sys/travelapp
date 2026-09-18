"use client";

import { useState } from "react";
import { useForm, type SubmitHandler, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";
import { z } from "zod";

interface FieldConfig<T extends z.ZodTypeAny> {
  name: Path<z.infer<T>>;
  label: string;
  type?: "text" | "email" | "password" | "checkbox";
  placeholder?: string;
}

interface AuthFormProps<T extends z.ZodTypeAny> {
  schema: T;
  action: (data: z.infer<T>) => Promise<{ error: string } | void>;
  defaultValues: z.infer<T>;
  submitLabel: string;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  fields: FieldConfig<T>[];
  isLoading?: boolean;
}

export function AuthForm<T extends z.ZodTypeAny>({
  schema,
  action,
  defaultValues,
  submitLabel,
  title,
  description,
  footer,
  fields,
  isLoading = false,
}: AuthFormProps<T>) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<z.infer<T>> = async (data) => {
    setServerError(null);
    const result = await action(data);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-center">{title}</CardTitle>
        {description && <CardDescription className="text-center">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="text-sm text-red-500 text-center" role="alert">
              {serverError}
            </div>
          )}
          {fields.map((field) => (
            <div key={String(field.name)} className="space-y-1.5">
              {field.type !== "checkbox" && (
                <Label htmlFor={String(field.name)}>{field.label}</Label>
              )}
              {field.type === "checkbox" ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={String(field.name)}
                    {...register(field.name)}
                    aria-describedby={errors[field.name as string] ? `${String(field.name)}-error` : undefined}
                  />
                  <Label htmlFor={String(field.name)} className="cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              ) : (
                <Input
                  id={String(field.name)}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                  aria-invalid={!!errors[field.name as string]}
                  aria-describedby={errors[field.name as string] ? `${String(field.name)}-error` : undefined}
                  disabled={isSubmitting}
                />
              )}
              {errors[field.name as string] && (
                <p id={`${String(field.name)}-error`} className="text-sm text-red-500" role="alert">
                  {String(errors[field.name as string]?.message ?? "")}
                </p>
              )}
            </div>
          ))}
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting || isLoading}>
            {isSubmitting ? "Please wait..." : submitLabel}
          </Button>
        </form>
      </CardContent>
      {footer && (
        <CardFooter className="flex flex-col space-y-2">
          <Separator />
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

import { loginSchema, signupSchema, resetPasswordRequestSchema, resetPasswordUpdateSchema, magicLinkSchema } from "@/lib/validations/auth";
import { loginAction, signupAction, resetPasswordRequestAction, resetPasswordUpdateAction, magicLinkAction } from "@/app/auth/actions";

interface LoginFormProps {
  isLoading?: boolean;
}

export function LoginForm({ isLoading }: LoginFormProps) {
  return (
    <AuthForm
      schema={loginSchema}
      action={loginAction}
      defaultValues={{ email: "", password: "", remember: false }}
      submitLabel="Sign in"
      title="Welcome back"
      description="Sign in to your Travel App account"
      isLoading={isLoading}
      fields={[
        { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
        { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
        { name: "remember", label: "Remember me", type: "checkbox" },
      ]}
      footer={(
        <div className="space-y-2 text-center text-sm">
          <Link href="/auth/reset-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
          <p>
            Do not have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      )}
    />
  );
}

interface SignupFormProps {
  isLoading?: boolean;
}

export function SignupForm({ isLoading }: SignupFormProps) {
  return (
    <AuthForm
      schema={signupSchema}
      action={signupAction}
      defaultValues={{ email: "", password: "", confirmPassword: "", terms: true }}
      submitLabel="Create account"
      title="Create your account"
      description="Start planning your adventures"
      isLoading={isLoading}
      fields={[
        { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
        { name: "password", label: "Password", type: "password", placeholder: "At least 8 characters" },
        { name: "confirmPassword", label: "Confirm password", type: "password", placeholder: "••••••••" },
        { name: "terms", label: "I agree to the Terms of Service and Privacy Policy", type: "checkbox" },
      ]}
      footer={(
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      )}
    />
  );
}

interface ResetPasswordRequestFormProps {
  isLoading?: boolean;
}

export function ResetPasswordRequestForm({ isLoading }: ResetPasswordRequestFormProps) {
  return (
    <AuthForm
      schema={resetPasswordRequestSchema}
      action={resetPasswordRequestAction}
      defaultValues={{ email: "" }}
      submitLabel="Send reset link"
      title="Reset your password"
      description="Enter your email and we'll send you a link to reset your password"
      isLoading={isLoading}
      fields={[
        { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
      ]}
      footer={(
        <p className="text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      )}
    />
  );
}

interface ResetPasswordUpdateFormProps {
  isLoading?: boolean;
}

export function ResetPasswordUpdateForm({ isLoading }: ResetPasswordUpdateFormProps) {
  return (
    <AuthForm
      schema={resetPasswordUpdateSchema}
      action={resetPasswordUpdateAction}
      defaultValues={{ password: "", confirmPassword: "" }}
      submitLabel="Update password"
      title="Set new password"
      description="Your new password must be at least 8 characters"
      isLoading={isLoading}
      fields={[
        { name: "password", label: "New password", type: "password", placeholder: "At least 8 characters" },
        { name: "confirmPassword", label: "Confirm password", type: "password", placeholder: "••••••••" },
      ]}
    />
  );
}

interface MagicLinkFormProps {
  isLoading?: boolean;
}

export function MagicLinkForm({ isLoading }: MagicLinkFormProps) {
  return (
    <AuthForm
      schema={magicLinkSchema}
      action={magicLinkAction}
      defaultValues={{ email: "" }}
      submitLabel="Send magic link"
      title="Sign in with magic link"
      description="Enter your email and we'll send you a link to sign in"
      isLoading={isLoading}
      fields={[
        { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
      ]}
      footer={(
        <div className="space-y-2 text-center text-sm">
          <p>Or sign in with password</p>
          <Link href="/login" className="text-primary hover:underline font-medium">
            Use password instead
          </Link>
        </div>
      )}
    />
  );
}