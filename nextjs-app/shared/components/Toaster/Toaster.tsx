"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, Warning, XCircle, Info } from "@phosphor-icons/react";

export type ToastSeverity = "success" | "error" | "warning" | "info";
export type ToastPosition =
  | "top-right"
  | "top-center"
  | "bottom-right"
  | "bottom-center";

interface Toast {
  id: string;
  message: string;
  severity?: ToastSeverity;
  duration?: number;
}

interface ToasterContextValue {
  toast: (message: string, options?: Omit<Toast, "id" | "message">) => void;
  dismiss: (id: string) => void;
}

const ToasterContext = createContext<ToasterContextValue | null>(null);

export function useToast() {
  const context = useContext(ToasterContext);
  if (!context) {
    // Soft-failing matches the existing providers/ToastProvider.tsx hook so
    // components remain testable without wiring a full ToasterProvider in
    // every test, and so accidental production usage outside the provider
    // degrades quietly to a no-op instead of crashing the page. The warn
    // gives developers a breadcrumb during local dev.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "useToast called outside ToasterProvider — toasts will be no-ops.",
      );
    }
    return {
      toast: () => {},
      dismiss: () => {},
    } as ToasterContextValue;
  }
  return context;
}

const severityIcons: Record<ToastSeverity, ReactNode> = {
  success: <CheckCircle weight="fill" className="size-5 shrink-0 self-center text-green-500" />,
  error: <XCircle weight="fill" className="size-5 shrink-0 self-center text-red-500" />,
  warning: <Warning weight="fill" className="size-5 shrink-0 self-center text-yellow-500" />,
  info: <Info weight="fill" className="size-5 shrink-0 self-center text-blue-500" />,
};

const severityClasses: Record<ToastSeverity, string> = {
  success: "border-green-500/50 bg-green-500/5",
  error: "border-red-500/50 bg-red-500/5",
  warning: "border-yellow-500/50 bg-yellow-500/5",
  info: "border-blue-500/50 bg-blue-500/5",
};

interface ToasterProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  defaultDuration?: number;
}

export function ToasterProvider({
  children,
  position = "bottom-right",
  defaultDuration = 4000,
}: ToasterProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (message: string, options?: Omit<Toast, "id" | "message">) => {
      const id = Math.random().toString(36).slice(2, 9);
      const newToast: Toast = { id, message, ...options };
      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss
      const duration = options?.duration ?? defaultDuration;
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    [defaultDuration]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const positionClasses: Record<ToastPosition, string> = {
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  return (
    <ToasterContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className={cn(
          "fixed z-50 flex flex-col gap-2 pointer-events-none",
          positionClasses[position]
        )}
        role="status"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center gap-3 min-w-[280px] max-w-[400px] rounded-lg border bg-background p-4 shadow-lg",
              "animate-in slide-in-from-right-full duration-200",
              t.severity && severityClasses[t.severity]
            )}
            role="status"
          >
            {t.severity && (
              <span className="flex items-center justify-center">
                {severityIcons[t.severity]}
              </span>
            )}
            <span className="font-body text-sm flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
}
