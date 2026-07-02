"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

const widthClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
};

export function SlideOver({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "lg",
  footer,
}: SlideOverProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          "relative z-10 h-full w-full bg-white shadow-2xl overflow-hidden flex flex-col",
          "animate-slide-in-right",
          widthClasses[width],
        ].join(" ")}
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between border-b border-neutral-100 px-6 py-5">
          <div className="min-w-0">
            {title && <h2 className="text-lg font-bold text-neutral-800 truncate">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="h-4 w-4" />} aria-label="Close" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t border-neutral-100 px-6 py-4 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
