import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "../shared/locales/en/translation.json";
import fiTranslation from "../shared/locales/fi/translation.json";
import svTranslation from "../shared/locales/sv/translation.json";

const resources = {
  en: { translation: enTranslation },
  fi: { translation: fiTranslation },
  sv: { translation: svTranslation },
} as const;

/**
 * SSR-compatible i18n configuration
 *
 * - Initializes with English as default (for SSR/crawlers)
 * - All translations bundled statically (no async loading)
 * - Language detection happens in I18nProvider after hydration
 * - This ensures crawlers see real content, not "Loading..."
 */
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "en", // Default for SSR - user preference applied client-side
    fallbackLng: "en",
    supportedLngs: ["en", "fi", "sv"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
