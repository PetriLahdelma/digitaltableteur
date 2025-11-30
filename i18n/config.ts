import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enTranslation from "../shared/locales/en/translation.json";
import fiTranslation from "../shared/locales/fi/translation.json";
import svTranslation from "../shared/locales/sv/translation.json";

const resources = {
  en: { translation: enTranslation },
  fi: { translation: fiTranslation },
  sv: { translation: svTranslation },
} as const;

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      supportedLngs: ["en", "fi", "sv"],
      detection: {
        order: ["cookie", "localStorage", "navigator"],
        caches: ["cookie", "localStorage"],
      },
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
}

export default i18n;
