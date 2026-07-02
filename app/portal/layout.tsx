"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Car, CalendarDays, FileText, User, Building2,
  Phone, LogOut, MessageSquare, Bell, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";

const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/book", label: "Book a Ride", icon: Car },
  { href: "/portal/rides", label: "My Rides", icon: CalendarDays },
  { href: "/portal/invoices", label: "Invoices", icon: FileText },
  { href: "/portal/profile", label: "Profile", icon: User },
  { href: "/portal/corporate", label: "Corporate", icon: Building2 },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-25">
      <header className="sticky top-0 z-30 h-16 border-b border-neutral-100 bg-white/90 backdrop-blur-xl flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          <Link href="/portal" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500 text-neutral-900"><span className="text-sm font-black">C</span></div>
            <span className="text-base font-bold tracking-tight">Chauffeur<span className="text-gold-500">OS</span></span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"><Bell className="h-4 w-4" /></button>
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-neutral-200">
            <Avatar name="John Smith" size="sm" />
            <div className="hidden sm:block"><p className="text-sm font-semibold text-neutral-700">John Smith</p><p className="text-xs text-neutral-400">VIP Client</p></div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={["fixed lg:sticky top-16 left-0 z-20 h-[calc(100vh-64px)] w-64 bg-white border-r border-neutral-100 shrink-0 transition-transform lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full"].join(" ")}>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/portal" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className={["flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all", active ? "bg-brand-50 text-brand-700" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"].join(" ")}>
                  <Icon className="h-4 w-4" />{item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-100">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-50"><Phone className="h-4 w-4" />Contact Dispatch</button>
            <Link href="/login" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-400 hover:text-danger-600 transition-all mt-1"><LogOut className="h-4 w-4" />Sign Out</Link>
          </div>
        </aside>
        {mobileOpen && <div className="fixed inset-0 bg-black/20 z-10 lg:hidden" onClick={() => setMobileOpen(false)} />}
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-64px)]">
          {children}
          <footer className="mt-8 border-t border-neutral-100 pt-4 text-center text-xs text-neutral-400">
            <p>&copy; {new Date().getFullYear()} ChauffeurOS. All rights reserved. Built for luxury fleet operators.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
