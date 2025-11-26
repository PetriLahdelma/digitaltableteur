"use client";

import { I18nextProvider } from "react-i18next";
import { useEffect, useState } from "react";

import i18n from "../i18n/config";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Detect language from cookie BEFORE first render to avoid hydration mismatch
    const cookieLang = document.cookie
      .split("; ")
      .find((row) => row.startsWith("i18next="))
      ?.split("=")[1];

    const lng = cookieLang || localStorage.getItem("i18nextLng") || "en";

    if (i18n.language !== lng) {
      i18n.changeLanguage(lng).then(() => {
        setIsInitialized(true);
      });
    } else {
      setIsInitialized(true);
    }
  }, []);

  // Don't render children until language is synced to avoid hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
