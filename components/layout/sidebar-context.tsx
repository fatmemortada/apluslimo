"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  sidebarWidth: number;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
  toggle: () => {},
  sidebarWidth: 260,
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = useCallback(() => setCollapsed((prev) => !prev), []);
  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggle, sidebarWidth }}>
      {children}
    </SidebarContext.Provider>
  );
}
