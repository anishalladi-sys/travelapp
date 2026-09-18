import { LoginForm, MagicLinkForm } from "@/components/auth-form";
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
        <div className="space-y-4" id="auth-tabs">
          <div className="flex space-x-4" role="tablist">
            <button
              role="tab"
              aria-selected="true"
              aria-controls="password-panel"
              id="password-tab"
              className="flex-1 py-2 text-sm font-medium text-center text-primary border-b-2 border-primary"
            >
              Password
            </button>
            <button
              role="tab"
              aria-selected="false"
              aria-controls="magic-panel"
              id="magic-tab"
              className="flex-1 py-2 text-sm font-medium text-center text-muted-foreground border-b-2 border-transparent hover:text-foreground"
            >
              Magic Link
            </button>
          </div>
          <div role="tabpanel" id="password-panel" aria-labelledby="password-tab">
            <LoginForm />
          </div>
          <div role="tabpanel" id="magic-panel" aria-labelledby="magic-tab" hidden>
            <MagicLinkForm />
          </div>
        </div>
      </div>
    </div>
  );
}