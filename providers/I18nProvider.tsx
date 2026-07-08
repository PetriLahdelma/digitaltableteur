"use client";

import { I18nextProvider } from "react-i18next";
import { useCallback, useEffect, useState } from "react";

import i18n from "../i18n/config";
import {
  TranslationProvider,
  type TranslationOptions,
  type TranslationResourceBundle,
} from "../nextjs-app/shared/lib/translation";

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

/**
 * I18nProvider - SSR-compatible internationalization wrapper
 *
 * IMPORTANT: This component renders children immediately without blocking.
 * Translations are bundled statically, so no async loading is needed.
 * Language detection happens client-side after hydration.
 *
 * This ensures crawlers and link previews see actual content instead of "Loading..."
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [runtimeLanguage, setRuntimeLanguage] = useState(() => ({
    language: i18n.language || "en",
    resolvedLanguage: i18n.resolvedLanguage || i18n.language || "en",
  }));

  const translate = useCallback(
    (
      key: string,
      fallbackOrOptions?: string | TranslationOptions,
      options?: TranslationOptions,
    ) => {
      const translationOptions =
        typeof fallbackOrOptions === "string"
          ? { ...options, defaultValue: fallbackOrOptions }
          : fallbackOrOptions;
      const translated = i18n.t(key, translationOptions);
      return typeof translated === "string" ? translated : String(translated);
    },
    [],
  );

  const getResourceBundle = useCallback(
    (language: string, namespace = "translation"):
      | TranslationResourceBundle
      | undefined => {
      const bundle = i18n.getResourceBundle(language, namespace);
      return bundle && typeof bundle === "object"
        ? (bundle as TranslationResourceBundle)
        : undefined;
    },
    [],
  );

  // Sync language preference client-side after hydration (non-blocking)
  useEffect(() => {
    // Skip if running on server
    if (typeof window === "undefined") return;

    const syncLanguage = () => {
      // Detect language from cookie or localStorage
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

      // Only change if different to avoid unnecessary re-renders
      if (currentLanguage !== targetLanguage) {
        i18n.changeLanguage(targetLanguage).catch(() => {
          // Fallback to English on error
          i18n.changeLanguage("en").catch(console.error);
        });
      }
    };

    // If i18n is already initialized, sync immediately
    if (i18n.isInitialized) {
      syncLanguage();
    } else {
      // Otherwise wait for initialization
      i18n.on("initialized", syncLanguage);
      return () => {
        i18n.off("initialized", syncLanguage);
      };
    }
  }, []);

  useEffect(() => {
    const syncRuntimeLanguage = () => {
      setRuntimeLanguage({
        language: i18n.language || "en",
        resolvedLanguage: i18n.resolvedLanguage || i18n.language || "en",
      });
    };

    syncRuntimeLanguage();
    i18n.on("languageChanged", syncRuntimeLanguage);
    i18n.on("initialized", syncRuntimeLanguage);
    return () => {
      i18n.off("languageChanged", syncRuntimeLanguage);
      i18n.off("initialized", syncRuntimeLanguage);
    };
  }, []);

  // Render children immediately - translations are bundled, no loading needed
  // This ensures SSR works and crawlers see actual content
  return (
    <I18nextProvider i18n={i18n}>
      <TranslationProvider
        translate={translate}
        language={runtimeLanguage.language}
        resolvedLanguage={runtimeLanguage.resolvedLanguage}
        changeLanguage={i18n.changeLanguage.bind(i18n)}
        getResourceBundle={getResourceBundle}
      >
        {children}
      </TranslationProvider>
    </I18nextProvider>
  );
}
