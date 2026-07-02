"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownItem {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  shortcut?: string;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "left",
  className = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={ref} className={["relative inline-block", className].join(" ")}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={[
            "absolute z-50 mt-2 min-w-[200px] rounded-xl border border-neutral-100 bg-white py-1.5 shadow-xl animate-scale-in",
            align === "right" ? "right-0" : "left-0",
          ].join(" ")}
        >
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={i} className="my-1.5 border-t border-neutral-100" />;
            }

            const content = (
              <>
                {item.icon && (
                  <span className="mr-2.5 h-4 w-4 text-neutral-400">
                    {item.icon}
                  </span>
                )}
                <span className="flex-1 text-left">{item.label}</span>
                {item.shortcut && (
                  <span className="ml-4 text-xs text-neutral-400">
                    {item.shortcut}
                  </span>
                )}
              </>
            );

            if (item.href) {
              return (
                <a
                  key={i}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center px-3.5 py-2 text-sm transition-colors",
                    item.danger
                      ? "text-danger-600 hover:bg-danger-50"
                      : item.disabled
                      ? "text-neutral-300 cursor-not-allowed"
                      : "text-neutral-700 hover:bg-neutral-50",
                  ].join(" ")}
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                key={i}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                disabled={item.disabled}
                className={[
                  "flex w-full items-center px-3.5 py-2 text-sm transition-colors",
                  item.danger
                    ? "text-danger-600 hover:bg-danger-50"
                    : item.disabled
                    ? "text-neutral-300 cursor-not-allowed"
                    : "text-neutral-700 hover:bg-neutral-50",
                ].join(" ")}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
