"use client";

import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { TopNav } from "./topnav";
import { SidebarProvider, useSidebar } from "./sidebar-context";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { sidebarWidth } = useSidebar();

  return (
    <div className="min-h-screen bg-neutral-25">
      <Sidebar />
      <div
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <TopNav />
        <main className="p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
        {/* Footer */}
        <footer className="border-t border-neutral-100 bg-white px-6 py-4" style={{ marginLeft: 0 }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-neutral-500">ChauffeurOS</span>
              <span>v1.0.0</span>
              <span className="hidden sm:inline">&middot;</span>
              <span className="hidden sm:inline">Built for luxury fleet operators</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-neutral-600 transition-colors">Support</a>
              <a href="#" className="hover:text-neutral-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-neutral-600 transition-colors">Terms</a>
              <span className="hidden sm:inline">&copy; {new Date().getFullYear()} ChauffeurOS. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardInner>{children}</DashboardInner>
    </SidebarProvider>
  );
}
