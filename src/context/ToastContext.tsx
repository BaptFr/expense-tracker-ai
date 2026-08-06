"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-l-4 border-l-[#0ca30c] text-[#0b0b0b]",
  error: "border-l-4 border-l-[#d03b3b] text-[#0b0b0b]",
  info: "border-l-4 border-l-[#2a78d6] text-[#0b0b0b]",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = `toast-${counter.current++}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto min-w-[240px] max-w-sm rounded-lg bg-white px-4 py-3 text-sm font-medium shadow-lg shadow-black/10 ring-1 ring-black/5 animate-[toast-in_0.2s_ease-out] ${VARIANT_STYLES[toast.variant]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
