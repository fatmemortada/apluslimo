"use client";

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
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500/20 ring-1 ring-gold-500/30">
              <span className="text-2xl font-black text-gold-500">C</span>
            </div>
            <h1 className="text-5xl font-black text-white">500</h1>
            <p className="mt-3 text-lg font-semibold text-white/80">Server error</p>
            <p className="mt-2 text-sm text-white/40 leading-relaxed">
              Something went wrong on our end. Our team has been notified and we are working on a fix.
              Please try again shortly.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-neutral-900 hover:bg-gold-600 transition-all"
              >
                Try Again
              </button>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white transition-all"
              >
                Go to Login
              </a>
            </div>
          </div>
          <p className="mt-12 text-xs text-white/20">
            Error reference: {error.digest || "N/A"}
          </p>
        </div>
      </body>
    </html>
  );
}
