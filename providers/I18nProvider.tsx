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

const LANGUAGE_COOKIE_NAME = "i18next";
const LANGUAGE_STORAGE_KEY = "i18nextLng";
const LANGUAGE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const getSupportedLanguage = (
  value: string | null | undefined,
): SupportedLanguage | null => {
  if (!value) return null;
  const base = value.split("-")[0];
  return supportedLanguages.includes(base as SupportedLanguage)
    ? (base as SupportedLanguage)
    : null;
};

const normalizeLanguage = (
  value: string | null | undefined,
): SupportedLanguage => {
  return getSupportedLanguage(value) ?? "en";
};

const getLanguageCookie = (): SupportedLanguage | null => {
  if (typeof document === "undefined") return null;

  const rawCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LANGUAGE_COOKIE_NAME}=`))
    ?.slice(LANGUAGE_COOKIE_NAME.length + 1);

  return getSupportedLanguage(
    rawCookie ? decodeURIComponent(rawCookie) : null,
  );
};

const getStoredLanguage = (): SupportedLanguage | null => {
  if (typeof window === "undefined") return null;

  try {
    return getSupportedLanguage(
      window.localStorage.getItem(LANGUAGE_STORAGE_KEY),
    );
  } catch {
    return null;
  }
};

const getPersistedLanguage = (): SupportedLanguage | null =>
  getStoredLanguage() ?? getLanguageCookie();

const persistLanguagePreference = (language: SupportedLanguage): void => {
  if (typeof document !== "undefined") {
    document.cookie = [
      `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(language)}`,
      "path=/",
      `max-age=${LANGUAGE_COOKIE_MAX_AGE_SECONDS}`,
      "SameSite=Lax",
    ].join("; ");
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Cookies keep the preference when localStorage is unavailable.
    }
  }
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
      if (typeof translated === "string") return translated;
      // `returnObjects: true` lookups (e.g. HomeHero's title/subtext option
      // arrays) must pass through structurally, matching the shared lib's
      // fallbackTranslate; String() here turned arrays into joined text and
      // silently killed the per-visit hero randomization.
      if (translated !== null && typeof translated === "object") {
        return translated as unknown as string;
      }
      return String(translated);
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

  const changeLanguage = useCallback(async (language: string) => {
    const targetLanguage = normalizeLanguage(language);
    persistLanguagePreference(targetLanguage);

    try {
      return await i18n.changeLanguage(targetLanguage);
    } catch {
      persistLanguagePreference("en");
      return i18n.changeLanguage("en");
    }
  }, []);

  // Sync language preference client-side after hydration (non-blocking)
  useEffect(() => {
    // Skip if running on server
    if (typeof window === "undefined") return;

    const syncLanguage = () => {
      const persistedLanguage = getPersistedLanguage();
      if (!persistedLanguage) return;

      const targetLanguage = persistedLanguage;
      const currentLanguage = normalizeLanguage(
        i18n.resolvedLanguage || i18n.language,
      );

      // Only change if different to avoid unnecessary re-renders
      if (currentLanguage !== targetLanguage) {
        i18n.changeLanguage(targetLanguage).catch(() => {
          // Fallback to English on error
          persistLanguagePreference("en");
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
        changeLanguage={changeLanguage}
        getResourceBundle={getResourceBundle}
      >
        {children}
      </TranslationProvider>
    </I18nextProvider>
  );
}
