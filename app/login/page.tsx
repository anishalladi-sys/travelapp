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
        <SignInTabs />
      </div>
    </div>
  );
}
