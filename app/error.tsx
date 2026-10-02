"use client";

import * as React from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorId, setErrorId] = React.useState<string | undefined>(undefined);

  // Reporting moved out of the render body. captureException during render is a
  // side effect in a function React may run more than once, so a single failure
  // could be reported several times, and in Strict Mode twice per failure.
  React.useEffect(() => {
    setErrorId(Sentry.captureException(error));
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl p-8 text-center space-y-4">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      {/* Deliberately not error.message. This boundary is reachable by any
          visitor, and the raw message can carry SQL fragments, internal host
          names or upstream payloads. The Sentry event keeps the detail for us;
          the user gets a reference id. */}
      <p className="text-sm text-zinc-600">
        An unexpected error occurred. Please try again, and quote the reference
        below if you contact support.
      </p>
      {errorId && (
        <p className="text-xs text-zinc-500">
          Error ID: {errorId} (reference this when contacting support)
        </p>
      )}
      <button
        onClick={reset}
        className="h-10 rounded-md bg-black px-4 text-sm text-white"
      >
        Try again
      </button>
    </div>
  );
}
