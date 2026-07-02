"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { User, Organization, Permission, ResourceName, PermissionAction } from "@/lib/types";

interface AuthState {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (resource: ResourceName, action: PermissionAction) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    organization: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const saved = localStorage.getItem("chauffeuross_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState({
          ...parsed,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      } catch { /* Invalid session */ }
    }
    setState((s) => ({ ...s, isLoading: false }));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.success) return false;

      const session = {
        user: json.data.user,
        organization: json.data.organization,
        token: json.data.token,
      };

      localStorage.setItem("chauffeuross_session", JSON.stringify(session));
      setState({
        ...session,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("chauffeuross_session");
    setState({
      user: null,
      organization: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const hasPermission = useCallback(
    (resource: ResourceName, action: PermissionAction): boolean => {
      if (!state.user) return false;
      // Owner has all permissions
      if (state.user.role === "owner") return true;
      const perm = state.user.permissions.find((p) => p.resource === resource);
      return perm ? perm.actions.includes(action) : false;
    },
    [state.user]
  );

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}
