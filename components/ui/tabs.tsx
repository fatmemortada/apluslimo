"use client";

import { useState } from "react";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  children?: (activeTab: string) => React.ReactNode;
}

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  className = "",
  children,
}: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  const handleChange = (tabId: string) => {
    setActive(tabId);
    onChange?.(tabId);
  };

  return (
    <div className={className}>
      <div className="flex border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={[
              "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20",
              active === tab.id
                ? "text-brand-700"
                : "text-neutral-500 hover:text-neutral-700",
            ].join(" ")}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={[
                  "ml-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                  active === tab.id
                    ? "bg-brand-100 text-brand-700"
                    : "bg-neutral-100 text-neutral-500",
                ].join(" ")}
              >
                {tab.count}
              </span>
            )}
            {active === tab.id && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-t-sm bg-brand-600" />
            )}
          </button>
        ))}
      </div>
      {children && <div className="pt-4">{children(active)}</div>}
    </div>
  );
}
