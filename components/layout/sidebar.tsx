"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Car,
  Wrench,
  ClipboardList,
  Truck,
  FileText,
  Bell,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  DollarSign,
  Receipt,
  TrendingUp,
  PieChart,
  UserCheck,
  Mail,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles, badge: "New", badgeColor: "bg-gold-500 text-neutral-900" },
    ],
  },
  {
    title: "CRM",
    items: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Corporate Accounts", href: "/corporate", icon: Building2 },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Bookings", href: "/bookings", icon: ClipboardList },
      { label: "Dispatch", href: "/dispatch", icon: Truck },
      { label: "Drivers", href: "/drivers", icon: UserCheck },
      { label: "Fleet", href: "/fleet", icon: Car },
      { label: "Vehicles", href: "/vehicles", icon: Car },
      { label: "Maintenance", href: "/maintenance", icon: Wrench },
      { label: "Calendar", href: "/calendar", icon: CalendarDays },
      { label: "Quotes", href: "/quotes", icon: FileText },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Invoices", href: "/invoices", icon: Receipt },
      { label: "Revenue", href: "/revenue", icon: DollarSign },
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Analytics", href: "/analytics", icon: PieChart },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "Email Center", href: "/email", icon: Mail },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Keyboard shortcut to toggle sidebar
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setCollapsed((prev) => !prev);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col bg-neutral-900 text-white overflow-hidden"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/8 shrink-0">
        <Link href="/" className="flex items-center gap-3 min-w-0 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-500 text-neutral-900">
            <span className="text-sm font-black">R</span>
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="text-base font-bold tracking-tight whitespace-nowrap"
              >
                Royal<span className="text-gold-500">OS</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
          title={collapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 no-scrollbar">
        {navigation.map((section) => (
          <div key={section.title} className="mb-1">
            {!collapsed && (
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/25 whitespace-nowrap">
                {section.title}
              </p>
            )}
            {collapsed && section.title !== navigation[0].title && (
              <div className="my-2 border-t border-white/6 mx-3" />
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={[
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-white/12 text-white"
                          : "text-white/55 hover:bg-white/8 hover:text-white",
                      ].join(" ")}
                    >
                      <Icon
                        className={[
                          "h-5 w-5 shrink-0 transition-transform duration-200",
                          hoveredItem === item.href && !active && "scale-110",
                        ].join(" ")}
                      />
                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -4 }}
                            className="flex-1 whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {item.badge && !collapsed && (
                        <span
                          className={[
                            "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                            item.badgeColor || "bg-brand-500 text-white",
                          ].join(" ")}
                        >
                          {item.badge}
                        </span>
                      )}
                      {/* Active indicator */}
                      {active && (
                        <motion.span
                          layoutId="activeNav"
                          className="absolute inset-1 rounded-xl bg-white/12 -z-10"
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      {/* Tooltip on collapsed */}
                      {collapsed && (
                        <div className="absolute left-full ml-3 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-white/8 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/8 transition-colors cursor-pointer">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold">
            FM
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold truncate">Fatme Mortada</p>
                <p className="text-xs text-white/40 truncate">Administrator</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
