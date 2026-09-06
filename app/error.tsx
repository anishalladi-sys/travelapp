"use client";

import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorId = Sentry.captureException(error);

  return (
    <div className="mx-auto max-w-2xl p-8 text-center space-y-4">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-zinc-600">{error.message || "Unknown error"}</p>
      {errorId && (
        <p className="text-xs text-zinc-500">
          Error ID: {errorId} (reference this when contacting support)
        </p>
      )}
      <button onClick={reset} className="h-10 rounded-md bg-black px-4 text-sm text-white">
        Try again
      </button>
    </div>
  );
}