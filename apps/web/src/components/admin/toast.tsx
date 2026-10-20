"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";

type Tone = "success" | "error";
interface Toast {
  id: number;
  tone: Tone;
  message: string;
}

const ToastContext = createContext<((tone: Tone, message: string) => void) | null>(null);

const DURATION_MS = 4000;

/** Short-lived notifications for the admin panel. Mounted once in the panel layout. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const show = useCallback((tone: Tone, message: string) => {
    const id = ++nextId.current;
    setToasts((t) => [...t.slice(-2), { id, tone, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <p
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto max-w-sm rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
              t.tone === "error" ? "bg-red-600" : "bg-zinc-900"
            }`}
          >
            {t.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside <ToastProvider>");
  return useMemo(
    () => ({
      success: (message: string) => show("success", message),
      error: (message: string) => show("error", message),
    }),
    [show],
  );
}
