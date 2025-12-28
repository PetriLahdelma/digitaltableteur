"use client";

import { I18nextProvider } from "react-i18next";
import { useEffect, useState } from "react";

import i18n from "../i18n/config";

const supportedLanguages = ["en", "fi", "sv"] as const;
type SupportedLanguage = (typeof supportedLanguages)[number];

const normalizeLanguage = (
  value: string | null | undefined,
): SupportedLanguage => {
  if (!value) return "en";
  const base = value.split("-")[0];
  return supportedLanguages.includes(base as SupportedLanguage)
    ? (base as SupportedLanguage)
    : "en";
};

const waitForI18nInit = () =>
  new Promise<void>((resolve) => {
    if (i18n.isInitialized) {
      resolve();
      return;
    }
    const handleInitialized = () => {
      i18n.off("initialized", handleInitialized);
      resolve();
    };
    i18n.on("initialized", handleInitialized);
  });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const syncLanguage = async () => {
      await waitForI18nInit();

      // Detect language from cookie BEFORE first render to avoid hydration mismatch
      const cookieLang = document.cookie
        .split("; ")
        .find((row) => row.startsWith("i18next="))
        ?.split("=")[1];

      const targetLanguage = normalizeLanguage(
        cookieLang || localStorage.getItem("i18nextLng"),
      );
      const currentLanguage = normalizeLanguage(
        i18n.resolvedLanguage || i18n.language,
      );

      if (currentLanguage !== targetLanguage) {
        try {
          await i18n.changeLanguage(targetLanguage);
        } catch {
          await i18n.changeLanguage("en");
        }
      }

      if (!cancelled) {
        setIsInitialized(true);
      }
    };

    syncLanguage();

    return () => {
      cancelled = true;
    };
  }, []);

  // Don't render children until language is synced to avoid hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
