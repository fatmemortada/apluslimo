"use client";

import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  color?: "default" | "brand" | "success" | "warning" | "danger" | "info" | "gold";
}

const colorMap = {
  default: {
    bg: "bg-neutral-50",
    iconBg: "bg-neutral-100",
    iconColor: "text-neutral-500",
    accent: "border-neutral-200",
  },
  brand: {
    bg: "bg-brand-50",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-700",
    accent: "border-brand-200",
  },
  success: {
    bg: "bg-success-50",
    iconBg: "bg-success-100",
    iconColor: "text-success-600",
    accent: "border-success-200",
  },
  warning: {
    bg: "bg-warning-50",
    iconBg: "bg-warning-100",
    iconColor: "text-warning-600",
    accent: "border-warning-200",
  },
  danger: {
    bg: "bg-danger-50",
    iconBg: "bg-danger-100",
    iconColor: "text-danger-600",
    accent: "border-danger-200",
  },
  info: {
    bg: "bg-info-50",
    iconBg: "bg-info-100",
    iconColor: "text-info-600",
    accent: "border-info-200",
  },
  gold: {
    bg: "bg-gold-50",
    iconBg: "bg-gold-100",
    iconColor: "text-gold-700",
    accent: "border-gold-200",
  },
};

export function StatCard({
  label,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = "default",
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={[
        "relative overflow-hidden rounded-xl border bg-white p-6",
        "shadow-card transition-all duration-300",
        "hover:shadow-card-hover hover:-translate-y-0.5",
        colors.accent,
      ].join(" ")}
    >
      {/* Background decoration */}
      <div
        className={["absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20", colors.iconBg].join(" ")}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {label}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-800">
              {value}
            </p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-neutral-400">{subtitle}</p>
            )}
            {trend && trendValue && (
              <div className="mt-2 flex items-center gap-1">
                {trend === "up" && (
                  <TrendingUp className="h-3.5 w-3.5 text-success-600" />
                )}
                {trend === "down" && (
                  <TrendingDown className="h-3.5 w-3.5 text-danger-600" />
                )}
                {trend === "neutral" && (
                  <Minus className="h-3.5 w-3.5 text-neutral-400" />
                )}
                <span
                  className={[
                    "text-xs font-semibold",
                    trend === "up" && "text-success-600",
                    trend === "down" && "text-danger-600",
                    trend === "neutral" && "text-neutral-400",
                  ].join(" ")}
                >
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                colors.iconBg,
                colors.iconColor,
              ].join(" ")}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
