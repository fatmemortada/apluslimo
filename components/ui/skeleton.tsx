interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={[
        "animate-shimmer rounded-md bg-neutral-100",
        className,
      ].join(" ")}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-card">
      <Skeleton className="mb-2 h-3 w-20" />
      <Skeleton className="mb-1 h-7 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-card">
      <Skeleton className="mb-4 h-5 w-1/3" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-2 h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
