"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastState {
  msg: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (msg: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((msg: string, type: ToastType = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`admin-toast ${toast.type}`} role="status">
          {toast.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
