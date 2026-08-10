"use client";

import { useEffect } from "react";

interface DrawerProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Drawer({ title, subtitle, onClose, children, footer }: DrawerProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl ring-1 ring-black/5 animate-[drawer-in_0.2s_ease-out]"
      >
        <div className="flex items-start justify-between border-b border-[#ece9e2] px-6 py-5">
          <div>
            <h2 id="drawer-title" className="text-lg font-semibold text-[#0b0b0b]">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-sm text-[#52514e]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-md p-1.5 text-[#898781] transition-colors hover:bg-[#f9f9f7] hover:text-[#0b0b0b]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && <div className="border-t border-[#ece9e2] px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
