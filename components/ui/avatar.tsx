interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    "bg-brand-100 text-brand-700",
    "bg-success-100 text-success-700",
    "bg-warning-100 text-warning-700",
    "bg-danger-100 text-danger-700",
    "bg-info-100 text-info-700",
    "bg-gold-100 text-gold-800",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={[
          "rounded-full object-cover ring-2 ring-white",
          sizeClasses[size],
          className,
        ].join(" ")}
      />
    );
  }

  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full font-semibold",
        getColorFromName(name),
        sizeClasses[size],
        className,
      ].join(" ")}
    >
      {getInitials(name)}
    </span>
  );
}
