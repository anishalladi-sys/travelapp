"use client";

import { ResetPasswordRequestForm, ResetPasswordUpdateForm } from "@/components/auth-form";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  // If there's a code in the URL, we're in the update password flow
  if (code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Travel App</h1>
          </div>
          <ResetPasswordUpdateForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Travel App</h1>
          <p className="text-muted-foreground mt-2">Reset your password</p>
        </div>
        <ResetPasswordRequestForm />
      </div>
    </div>
  );
}