"use client";

import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, icon, iconPosition = "left", className = "", id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1.5 text-sm font-semibold text-neutral-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-neutral-800",
              "placeholder:text-neutral-400",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
              error
                ? "border-danger-500 focus:ring-danger-500/20 focus:border-danger-500"
                : "border-neutral-200 hover:border-neutral-300",
              icon && iconPosition === "left" && "pl-10",
              icon && iconPosition === "right" && "pr-10",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {icon}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-danger-600">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-neutral-400">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, type InputProps };
