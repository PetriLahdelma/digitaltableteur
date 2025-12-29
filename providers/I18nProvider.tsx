"use client";

import { I18nextProvider } from "react-i18next";
import { useEffect, useState } from "react";

import i18n from "../i18n/config";
import styles from "./I18nProvider.module.css";

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

const waitForI18nInit = (timeoutMs = 5000) =>
  new Promise<void>((resolve, reject) => {
    if (i18n.isInitialized) {
      resolve();
      return;
    }
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const handleInitialized = () => {
      if (timeout) clearTimeout(timeout);
      i18n.off("initialized", handleInitialized);
      resolve();
    };
    timeout = setTimeout(() => {
      i18n.off("initialized", handleInitialized);
      reject(new Error("i18n initialization timeout"));
    }, timeoutMs);
    i18n.on("initialized", handleInitialized);
  });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const syncLanguage = async () => {
      try {
        await waitForI18nInit();
      } catch (error) {
        console.error("i18n initialization timeout:", error);
      }

      // Detect language from cookie and sync before rendering children to avoid hydration mismatch
      const cookieLang = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("i18next="))
          ?.slice(8) ?? "",
      );

      const targetLanguage = normalizeLanguage(
        cookieLang || localStorage.getItem("i18nextLng"),
      );
      const currentLanguage = normalizeLanguage(
        i18n.resolvedLanguage || i18n.language,
      );

      if (currentLanguage !== targetLanguage) {
        try {
          await i18n.changeLanguage(targetLanguage);
        } catch (error) {
          try {
            await i18n.changeLanguage("en");
          } catch (fallbackError) {
            console.error("Failed to initialize i18n language:", fallbackError);
          }
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
    return (
      <div className={styles.loadingRoot} role="status" aria-live="polite">
        <div className={styles.loadingCard}>
          <span className={styles.loadingSpinner} aria-hidden="true" />
          <span className={styles.loadingText}>Loading...</span>
        </div>
      </div>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
