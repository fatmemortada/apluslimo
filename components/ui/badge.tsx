type BadgeVariant =
  | "default"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gold"
  | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-neutral-100 text-neutral-700",
  brand: "bg-brand-100 text-brand-700",
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  danger: "bg-danger-100 text-danger-700",
  info: "bg-info-100 text-info-700",
  gold: "bg-gold-100 text-gold-800",
  neutral: "bg-neutral-50 text-neutral-500 border border-neutral-200",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-neutral-500",
  brand: "bg-brand-600",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-info-500",
  gold: "bg-gold-500",
  neutral: "bg-neutral-400",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 font-semibold whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs rounded-md" : "px-2.5 py-1 text-sm rounded-lg",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {dot && (
        <span className={["h-1.5 w-1.5 rounded-full", dotColors[variant]].join(" ")} />
      )}
      {children}
    </span>
  );
}

/* Status Chip — specifically for status indicators */
const statusColors: Record<string, string> = {
  active: "bg-success-100 text-success-700",
  available: "bg-success-100 text-success-700",
  completed: "bg-success-100 text-success-700",
  paid: "bg-success-100 text-success-700",
  confirmed: "bg-info-100 text-info-700",
  "en route": "bg-info-100 text-info-700",
  "on trip": "bg-brand-100 text-brand-700",
  assigned: "bg-warning-100 text-warning-700",
  pending: "bg-warning-100 text-warning-700",
  "pending confirmation": "bg-warning-100 text-warning-700",
  "chauffeur en route": "bg-info-100 text-info-700",
  "passenger picked up": "bg-brand-100 text-brand-700",
  "in progress": "bg-brand-100 text-brand-700",
  "no-show": "bg-danger-100 text-danger-700",
  maintenance: "bg-danger-100 text-danger-700",
  cancelled: "bg-danger-100 text-danger-700",
  overdue: "bg-danger-100 text-danger-700",
  draft: "bg-neutral-100 text-neutral-600",
  inactive: "bg-neutral-100 text-neutral-500",
};

export function StatusChip({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const colorClass =
    statusColors[status.toLowerCase()] || "bg-neutral-100 text-neutral-700";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
        colorClass,
        className,
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          status.toLowerCase() in statusColors
            ? "bg-current opacity-60"
            : "bg-neutral-400",
        ].join(" ")}
      />
      {status}
    </span>
  );
}
