import { Suspense } from "react";
import { SignInTabs } from "@/components/auth-tabs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in - Travel App",
  description: "Sign in to your Travel App account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Travel App</h1>
          <p className="text-muted-foreground mt-2">Plan your adventures</p>
        </div>
        {/* SignInTabs reads ?error= from useSearchParams so an expired or
            already-used confirmation link explains itself instead of dumping the
            user on a blank form. useSearchParams opts a subtree out of static
            rendering, so it needs a boundary to prerender the shell. */}
        <Suspense
          fallback={
            <div className="h-96 w-full max-w-md animate-pulse rounded-clay bg-clay-surface" />
          }
        >
          <SignInTabs />
        </Suspense>
      </div>
    </div>
  );
}
