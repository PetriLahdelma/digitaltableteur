"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ToastStack,
  type ToastTone,
  type ToastPosition,
  type ToastStackItem,
} from "@digitaltableteur/react";
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
