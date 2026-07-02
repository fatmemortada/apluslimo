import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500/20 ring-1 ring-gold-500/30">
          <span className="text-2xl font-black text-gold-500">C</span>
        </div>
        <h1 className="text-5xl font-black text-white">404</h1>
        <p className="mt-3 text-lg font-semibold text-white/80">Page not found</p>
        <p className="mt-2 text-sm text-white/40 leading-relaxed">
          The page you are looking for does not exist or has been moved.
          Please check the URL or navigate back to the dashboard.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-neutral-900 hover:bg-gold-600 transition-all"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
      <p className="mt-12 text-xs text-white/20">&copy; {new Date().getFullYear()} ChauffeurOS. All rights reserved.</p>
    </div>
  );
}
