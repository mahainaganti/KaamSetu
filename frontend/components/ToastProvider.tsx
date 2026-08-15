"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

const ICONS: Record<ToastType, string> = {
  success: "✅",
  error: "⚠️",
  info: "ℹ️",
};

const ToastContext = createContext<((message: string, type?: ToastType) => void) | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  function dismiss(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-stack">
        {toasts.map((toast) => (
          <div className={`toast toast-${toast.type}`} key={toast.id}>
            <span className="toast-icon">{ICONS[toast.type]}</span>
            <span className="toast-body">{toast.message}</span>
            <button type="button" className="toast-close" onClick={() => dismiss(toast.id)} aria-label="Dismiss">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
