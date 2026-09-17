"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/15 text-danger">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">An unexpected error occurred. You can try again — your calculations run locally and aren&apos;t lost.</p>
      <button onClick={reset} className="btn-primary">Try again</button>
    </div>
  );
}
