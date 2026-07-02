"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-danger-100 bg-white p-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-50">
        <AlertTriangle className="h-8 w-8 text-danger-500" />
      </div>
      <h2 className="text-lg font-bold text-neutral-800">Something went wrong</h2>
      <p className="mt-1 max-w-sm text-sm text-neutral-400">
        An unexpected error occurred while loading this page. Please try again.
      </p>
      <Button
        variant="primary"
        size="lg"
        icon={<RefreshCw className="h-4 w-4" />}
        onClick={reset}
        className="mt-6"
      >
        Try Again
      </Button>
    </div>
  );
}
