{
  /* TODO(owner): replace contact + domain with real values before launch (task 08.6) */
}
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Travel App",
  description: "Terms of Service for Travel App trip planning.",
};

export default function TermsPage() {
  return (
    <main className="container py-12 px-4 sm:px-6 lg:px-8 max-w-3xl">
      <div className="rounded-clay-lg bg-clay-raised shadow-clay-raised p-8">
        <h1 className="font-serif text-3xl font-bold">Terms of Service</h1>
        <p className="text-body-md text-muted-foreground mt-2">
          Last updated: October 2, 2026
        </p>

        <section className="mt-8">
          <h2 className="font-serif text-xl font-semibold">The service</h2>
          <p className="text-body-md text-muted-foreground mt-2">
            Travel App is a trip and itinerary planning tool that helps you
            organize trips, stops, and notes in one place.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="font-serif text-xl font-semibold">Your account</h2>
          <p className="text-body-md text-muted-foreground mt-2">
            Keep your login credentials safe. You are responsible for activity
            under your account. You own the content you create in the app.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="font-serif text-xl font-semibold">Acceptable use</h2>
          <p className="text-body-md text-muted-foreground mt-2">
            Do not abuse the service or post unlawful content. Do not attempt to
            disrupt the service or access other users&apos; data.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="font-serif text-xl font-semibold">Availability</h2>
          <p className="text-body-md text-muted-foreground mt-2">
            The service is provided on a best-effort basis, with no warranty of
            any kind. Features may change or be removed at any time.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="font-serif text-xl font-semibold">Liability</h2>
          <p className="text-body-md text-muted-foreground mt-2">
            To the extent permitted by law, our liability for any claim related
            to the service is limited.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="font-serif text-xl font-semibold">
            Changes and contact
          </h2>
          <p className="text-body-md text-muted-foreground mt-2">
            We may update these terms and will post the current version here.
            For questions, contact support@travelapp.example.com.
          </p>
        </section>
      </div>
    </main>
  );
}
