import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import fi from "./locales/fi/translation.json";
import sv from "./locales/sv/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fi: { translation: fi },
    sv: { translation: sv },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: true },
});

export default i18n;
