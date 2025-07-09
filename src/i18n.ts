import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export async function initI18n() {
  const [en, fi, sv] = await Promise.all([
    import("./locales/en/translation.json"),
    import("./locales/fi/translation.json"),
    import("./locales/sv/translation.json"),
  ]);

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en.default },
      fi: { translation: fi.default },
      sv: { translation: sv.default },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  });
}

export default i18n;
