import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations synchronously for better reliability
import enTranslation from "./locales/en/translation.json";
import fiTranslation from "./locales/fi/translation.json";
import svTranslation from "./locales/sv/translation.json";

// Initialize i18n synchronously
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    fi: { translation: fiTranslation },
    sv: { translation: svTranslation },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  initImmediate: true,
});

export default i18n;
