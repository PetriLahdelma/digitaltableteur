import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@dt/ThemeProvider";
import type { Preview } from "@storybook/react-vite";
import React, { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/i18n";
import en from "../src/locales/en/translation.json";
import fi from "../src/locales/fi/translation.json";
import sv from "../src/locales/sv/translation.json";

const THEME_KEY = "storybook-theme";

// Ensure i18n is initialized synchronously for Storybook
if (!i18n.isInitialized) {
  i18n.init({
    resources: {
      en: { translation: en },
      fi: { translation: fi },
      sv: { translation: sv },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    defaultValue: "light",
    toolbar: {
      icon: "circlehollow",
      items: [
        { value: "light", title: "Light" },
        { value: "dark", title: "Dark" },
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
  locale: {
    name: "Locale",
    description: "Internationalization locale",
    defaultValue: "en",
    toolbar: {
      icon: "globe",
      items: [
        { value: "en", title: "English" },
        { value: "fi", title: "Suomi" },
        { value: "sv", title: "Svenska" },
      ],
      showName: true,
    },
  },
};

const setThemeClass = (theme: string) => {
  if (typeof window !== "undefined") {
    document.documentElement.classList.toggle("themeDark", theme === "dark");
  }
};

const withI18next = (Story, context) => {
  const theme = context.globals.theme || "light";
  const locale = context.globals.locale || "en";
  useEffect(() => {
    setThemeClass(theme);
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem("theme", theme);
    if (typeof window !== "undefined") {
      document.body.style.background = theme === "dark" ? "#23272a" : "#fff";
    }
  }, [theme]);
  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);
  return (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <ThemeProvider forcedTheme={theme}>
          <Story />
        </ThemeProvider>
      </MemoryRouter>
    </I18nextProvider>
  );
};

export const decorators = [withI18next];

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "error",
    },
    options: {
      storySort: {
        order: [
          "Overview",
          ["Welcome", "Test Health Overview"],
          "Docs",
          "Components",
        ],
      },
    },
    // backgrounds: {
    //   default: "light",
    //   values: [
    //     { name: "light", value: "#fff" },
    //     { name: "dark", value: "#000" },
    //   ],
    // },
  },
};

export default preview;
