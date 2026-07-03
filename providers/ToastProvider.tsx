"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Toast, { type ToastTone, type ToastPosition } from "@dt/Toast";

export interface ShowToastOptions {
  duration?: number;
  tone?: ToastTone;
  position?: ToastPosition;
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
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState(3000);
  const [tone, setTone] = useState<ToastTone | undefined>(undefined);
  const [position, setPosition] = useState<ToastPosition>("bottom-center");

  const showToast = useCallback(
    (msg: string, options?: number | ShowToastOptions) => {
      const opts = typeof options === "number" ? { duration: options } : (options ?? {});
      setMessage(msg);
      setDuration(opts.duration ?? 3000);
      setTone(opts.tone);
      setPosition(opts.position ?? "bottom-center");
      setIsOpen(true);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={message}
        open={isOpen}
        duration={duration}
        tone={tone}
        position={position}
        onClose={handleClose}
      />
    </ToastContext.Provider>
  );
};
