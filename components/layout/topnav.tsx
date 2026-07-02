"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  MessageSquare,
  Plus,
  Sun,
  Moon,
  ChevronDown,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { SearchInput } from "@/components/ui/search-input";
import { Avatar } from "@/components/ui/avatar";
import { CompanySwitcher } from "@/components/layout/company-switcher";

interface TopNavProps {
  onMenuClick?: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-neutral-100 bg-white/80 backdrop-blur-xl px-6">
      {/* Mobile menu trigger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <SearchInput
          placeholder="Search bookings, customers, drivers..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onClear={() => setSearchValue("")}
        />
      </div>

      {/* Quick Search Shortcut */}
      <kbd className="hidden md:inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px] font-semibold text-neutral-400">
        <span>⌘</span>K
      </kbd>

      <div className="flex items-center gap-1.5 ml-auto">
        <CompanySwitcher />
        <div className="h-6 w-px bg-neutral-200 mx-1" />

        {/* New / Quick Actions */}
        <Dropdown
          align="right"
          items={[
            { label: "New Booking", icon: <Plus className="h-4 w-4" />, onClick: () => {} },
            { label: "Add Customer", icon: <Plus className="h-4 w-4" />, onClick: () => {} },
            { label: "Add Vehicle", icon: <Plus className="h-4 w-4" />, onClick: () => {} },
            { divider: true },
            { label: "Quick Dispatch", icon: <Plus className="h-4 w-4" />, onClick: () => {} },
          ]}
          trigger={
            <button className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-800 transition-colors">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New</span>
            </button>
          }
        />

        {/* Separator */}
        <div className="h-6 w-px bg-neutral-200 mx-1" />

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all"
          title="Toggle dark mode"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Messages */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all">
          <MessageSquare className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white ring-2 ring-white">
            3
          </span>
        </button>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[9px] font-bold text-white ring-2 ring-white">
            5
          </span>
        </button>

        {/* Profile */}
        <Dropdown
          align="right"
          items={[
            { label: "View Profile", onClick: () => {} },
            { label: "Account Settings", onClick: () => {} },
            { label: "Billing & Plan", onClick: () => {} },
            { divider: true },
            { label: "Team Members", onClick: () => {} },
            { label: "API Keys", onClick: () => {} },
            { divider: true },
            { label: "Sign Out", onClick: () => {}, danger: true },
          ]}
          trigger={
            <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-neutral-100 transition-colors ml-1">
              <Avatar name="Fatme Mortada" size="sm" />
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-neutral-700 leading-tight">
                  Fatme Mortada
                </p>
                <p className="text-xs text-neutral-400">Admin</p>
              </div>
              <ChevronDown className="hidden lg:block h-3.5 w-3.5 text-neutral-400" />
            </button>
          }
        />
      </div>
    </header>
  );
}
