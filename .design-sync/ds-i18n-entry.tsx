// design-sync preview i18n. Story files import `useTranslation` from
// react-i18next directly (not the DS TranslationProvider), so previews need a
// real, initialized i18next instance in context — this mirrors what
// .storybook/preview.tsx does. Self-contained (fresh instance + en resources)
// to avoid the app's init chain. Exposed on window.<Global> via cfg.extraEntries;
// referenced by cfg.provider ({"$ref": "dsI18n"}).
import i18next from "i18next";
import { initReactI18next, I18nextProvider } from "react-i18next";
import en from "../nextjs-app/shared/locales/en/translation.json";

const dsI18n = i18next.createInstance();
void dsI18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  ns: ["translation"],
  defaultNS: "translation",
  resources: { en: { translation: en as Record<string, unknown> } },
  interpolation: { escapeValue: false },
  // Synchronous init: with inline resources this flips isInitialized before
  // the one-shot preview snapshot renders (default async init leaves t()
  // returning raw keys on the first paint).
  initImmediate: false,
  react: { useSuspense: false },
});

export const DsI18nProvider = I18nextProvider;
export { dsI18n };
