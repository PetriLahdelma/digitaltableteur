"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "@dt/Toast";

interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
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

  const showToast = useCallback((msg: string, dur: number = 3000) => {
    setMessage(msg);
    setDuration(dur);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={message}
        isOpen={isOpen}
        duration={duration}
        onClose={handleClose}
      />
    </ToastContext.Provider>
  );
};
