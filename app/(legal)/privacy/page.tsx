{
  /* TODO(owner): replace contact + domain with real values before launch (task 08.6) */
}
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Travel App",
  description: "Privacy Policy for Travel App",
};

export default function PrivacyPage() {
  return (
    <div className="container py-12 px-4 sm:px-6 lg:px-8 max-w-3xl">
      <div className="rounded-clay-lg bg-clay-raised shadow-clay-raised p-8">
        <h1 className="font-serif text-3xl">Privacy Policy</h1>
        <p className="text-body-md text-muted-foreground">
          Updated October 2, 2026
        </p>
        <p className="text-body-md text-muted-foreground">
          Contact: support@travelapp.example.com
        </p>
        <h2 className="font-serif text-xl">What we collect</h2>
        <p className="text-body-md text-muted-foreground">
          We collect your account email and the trip and itinerary content you
          enter.
        </p>
        <h2 className="font-serif text-xl">How we use it</h2>
        <p className="text-body-md text-muted-foreground">
          We use this information to provide the service and to handle auth via
          Supabase.
        </p>
        <h2 className="font-serif text-xl">Cookies</h2>
        <p className="text-body-md text-muted-foreground">
          We use essential session and theme cookies only.
        </p>
        <h2 className="font-serif text-xl">Data sharing</h2>
        <p className="text-body-md text-muted-foreground">
          Supabase and Vercel process data for us. We do not sell your data.
        </p>
        <h2 className="font-serif text-xl">Your rights</h2>
        <p className="text-body-md text-muted-foreground">
          You can request access or deletion by writing to
          support@travelapp.example.com.
        </p>
        <h2 className="font-serif text-xl">Changes</h2>
        <p className="text-body-md text-muted-foreground">
          We will update this page if our practices change.
        </p>
      </div>
    </div>
  );
}
