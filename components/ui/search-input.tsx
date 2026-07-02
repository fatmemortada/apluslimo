"use client";

import { forwardRef } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?: () => void;
  containerClassName?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, containerClassName = "", className = "", value, ...props }, ref) => {
    return (
      <div className={["relative", containerClassName].join(" ")}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          className={[
            "w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-10 text-sm",
            "placeholder:text-neutral-400",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
            className,
          ].join(" ")}
          {...props}
        />
        {value && onClear && (
          <button
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
