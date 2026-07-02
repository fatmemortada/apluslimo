"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("fatme@chauffeuross.com");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  // Get redirect URL from query params
  const redirectTo = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("redirect") || "/"
    : "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(email, password);

    setLoading(false);
    if (success) {
      router.push(redirectTo);
    } else {
      setError("Invalid email or password. Try fatme@chauffeuross.com / password");
    }
  }

  return (
    <div className="animate-fade-in-up">
      {/* Brand */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/20 ring-1 ring-gold-500/30">
          <span className="text-2xl font-black text-gold-500">C</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Welcome to Chauffeur<span className="text-gold-500">OS</span>
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Sign in to your luxury fleet command center
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl"
      >
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-white/80">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="email"
                placeholder="admin@chauffeuross.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-white/80">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-brand-600 focus:ring-brand-500/30"
              />
              <span className="text-sm text-white/60">Remember me</span>
            </label>
            <a
              href="#"
              className="text-sm font-medium text-gold-500 hover:text-gold-400 transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="gold"
          size="xl"
          loading={loading}
          className="mt-6 w-full"
        >
          Sign In
        </Button>

        <p className="mt-5 text-center text-xs text-white/30">
          Demo: fatme@chauffeuross.com / password
        </p>
      </form>
    </div>
  );
}
