"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-2xl">
        ⚠️
      </div>
      <div>
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-1 max-w-md text-muted">
          An unexpected error occurred. You can try again — if it keeps
          happening, check your database and API configuration.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
