import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex flex-col gap-1">
        <div className="h-7 w-28 rounded-md bg-neutral-100 animate-shimmer" />
        <div className="h-4 w-56 rounded-md bg-neutral-100 animate-shimmer" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-neutral-100 bg-white p-6 shadow-card">
          <div className="h-5 w-36 rounded-md bg-neutral-100 animate-shimmer mb-6" />
          <div className="h-[260px] rounded-lg bg-neutral-50 animate-shimmer" />
        </div>
        <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-card">
          <div className="h-5 w-32 rounded-md bg-neutral-100 animate-shimmer mb-4" />
          <div className="h-[220px] rounded-lg bg-neutral-50 animate-shimmer" />
        </div>
      </div>

      {/* Bottom skeletons */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-100 bg-white p-6 shadow-card">
            <div className="h-5 w-24 rounded-md bg-neutral-100 animate-shimmer mb-4" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-12 rounded-lg bg-neutral-50 animate-shimmer mb-3" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
