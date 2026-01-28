'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4 text-center">
            <h1 className="text-2xl font-bold">Something went wrong!</h1>
            <p className="text-muted-foreground">
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={reset}
              className="rounded bg-primary px-4 py-2 text-primary-foreground"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
