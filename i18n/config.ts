import i18n, {
  createInstance,
  type i18n as I18nInstance,
} from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "../nextjs-app/shared/locales/en/translation.json";
import fiTranslation from "../nextjs-app/shared/locales/fi/translation.json";
import svTranslation from "../nextjs-app/shared/locales/sv/translation.json";

export const resources = {
  en: { translation: enTranslation },
  fi: { translation: fiTranslation },
  sv: { translation: svTranslation },
} as const;

export const supportedLanguages = ["en", "fi", "sv"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const normalizeLanguage = (
  value: string | null | undefined,
): SupportedLanguage => {
  if (!value) return "en";
  const base = value.split("-")[0];
  return supportedLanguages.includes(base as SupportedLanguage)
    ? (base as SupportedLanguage)
    : "en";
};

const createInitOptions = (language: string) => ({
  resources,
  lng: normalizeLanguage(language),
  fallbackLng: "en",
  supportedLngs: [...supportedLanguages],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export function createI18nInstance(language = "en"): I18nInstance {
  const instance = createInstance();
  void instance.use(initReactI18next).init(createInitOptions(language));
  return instance;
}

/**
 * SSR-compatible i18n configuration
 *
 * - Initializes with English as default (for SSR/crawlers)
 * - All translations bundled statically (no async loading)
 * - Language detection happens in I18nProvider after hydration
 * - This ensures crawlers see real content, not "Loading..."
 */
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init(createInitOptions("en")); // Default for tests and non-app utilities.
}

export default i18n;
