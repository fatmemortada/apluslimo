"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success-600" />,
  error: <AlertCircle className="h-5 w-5 text-danger-600" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning-600" />,
  info: <Info className="h-5 w-5 text-info-600" />,
};

const bgMap: Record<ToastType, string> = {
  success: "border-success-200",
  error: "border-danger-200",
  warning: "border-warning-200",
  info: "border-info-200",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  return (
    <div
      className={[
        "pointer-events-auto flex w-80 items-start gap-3 rounded-xl border bg-white p-4 shadow-xl animate-slide-in-right",
        bgMap[toast.type],
      ].join(" ")}
    >
      <span className="mt-0.5 shrink-0">{iconMap[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-800">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-neutral-500">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-md p-0.5 text-neutral-300 hover:text-neutral-500 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
