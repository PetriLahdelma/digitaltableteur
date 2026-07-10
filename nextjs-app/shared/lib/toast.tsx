"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ToastPosition, ToastTone } from "../components/Toast";

export interface ShowToastOptions {
  duration?: number;
  tone?: ToastTone;
  position?: ToastPosition;
}

export interface ToastRuntime {
  /** Second argument accepts a bare duration (legacy) or an options object. */
  showToast: (message: string, options?: number | ShowToastOptions) => void;
}

const defaultRuntime: ToastRuntime = {
  showToast: () => undefined,
};

const ToastContext = createContext<ToastRuntime>(defaultRuntime);

export interface ToastRuntimeProviderProps {
  children: ReactNode;
  value: ToastRuntime;
}

export function ToastRuntimeProvider({
  children,
  value,
}: ToastRuntimeProviderProps) {
  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastRuntime {
  return useContext(ToastContext);
}
