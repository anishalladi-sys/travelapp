import { SignupForm } from "@/components/auth-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up - Travel App",
  description: "Create your Travel App account",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Travel App</h1>
          <p className="text-muted-foreground mt-2">Start planning your adventures</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}