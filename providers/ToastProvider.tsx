"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
// Import Toast tone/position types and the ToastStack component from local
// source (relative path, not the published barrel): the #1124 neutral tone is
// added locally and ships to the package with this 0.1.8 republish, but until
// that version is consumed the registry barrel's .d.ts lags the local ToastTone
// (LanguageNotice passes tone:"neutral"). Flip both to "@digitaltableteur/react"
// after the 0.1.8 consume; classified in check:package-registry-resolution.
import type {
  ToastTone,
  ToastPosition,
} from "../nextjs-app/shared/components/Toast/Toast";
import ToastStack, {
  type ToastStackItem,
} from "../nextjs-app/shared/components/ToastStack/ToastStack";
import { ToastRuntimeProvider } from "../nextjs-app/shared/lib/toast";

export interface ShowToastOptions {
  duration?: number;
  tone?: ToastTone;
  position?: ToastPosition;
}

interface StackedToast extends ToastStackItem {
  position: ToastPosition;
}

interface ToastContextType {
  /** Second argument accepts a bare duration (legacy) or an options object. */
  showToast: (message: string, options?: number | ShowToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    console.warn(
      "useToast called outside of ToastProvider - toast will not display",
    );
    return { showToast: () => {} };
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<StackedToast[]>([]);
  const nextIdRef = useRef(0);

  const showToast = useCallback(
    (message: string, options?: number | ShowToastOptions) => {
      const opts =
        typeof options === "number" ? { duration: options } : (options ?? {});
      nextIdRef.current += 1;
      setToasts((current) => [
        ...current,
        {
          id: `toast-${nextIdRef.current}`,
          message,
          duration: opts.duration ?? 3000,
          tone: opts.tone,
          position: opts.position ?? "bottom-center",
        },
      ]);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toastRuntime = useMemo(() => ({ showToast }), [showToast]);

  const positions = useMemo(
    () => [...new Set(toasts.map((toast) => toast.position))],
    [toasts],
  );

  return (
    <ToastContext.Provider value={toastRuntime}>
      <ToastRuntimeProvider value={toastRuntime}>
        {children}
        {positions.map((position) => (
          <ToastStack
            key={position}
            position={position}
            toasts={toasts.filter((toast) => toast.position === position)}
            onDismiss={dismissToast}
          />
        ))}
      </ToastRuntimeProvider>
    </ToastContext.Provider>
  );
};
