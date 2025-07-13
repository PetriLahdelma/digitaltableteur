"use client";
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "../src/components/ThemeProvider";
import { initI18n } from "../src/i18n";
import i18n from "../src/i18n";
import { I18nextProvider } from "react-i18next";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [i18nReady, setI18nReady] = useState(false);
  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);
  if (!i18nReady) return null;
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>{children}</ThemeProvider>
    </I18nextProvider>
  );
}
