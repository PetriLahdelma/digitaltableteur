import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@dt/ThemeProvider";
import type { Preview } from "@storybook/react-vite";
import React, { useEffect, useLayoutEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/i18n";
import en from "../src/locales/en/translation.json";
import fi from "../src/locales/fi/translation.json";
import sv from "../src/locales/sv/translation.json";

const THEME_KEY = "storybook-theme";
const STORYBOOK_THEMES = ["light", "dark", "hcb"] as const;
type StorybookTheme = (typeof STORYBOOK_THEMES)[number];

const isStorybookTheme = (value: unknown): value is StorybookTheme =>
  typeof value === "string" &&
  STORYBOOK_THEMES.includes(value as StorybookTheme);

const getStoredTheme = (): StorybookTheme => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return isStorybookTheme(stored) ? stored : "light";
  } catch {
    return "light";
  }
};

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
    defaultValue: getStoredTheme(),
    toolbar: {
      icon: "circlehollow",
      items: [
        { value: "light", title: "Light" },
        { value: "dark", title: "Dark" },
        { value: "hcb", title: "HCB" },
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

const applyThemeToDom = (theme: StorybookTheme) => {
  if (typeof window === "undefined") {
    return;
  }

  const isDark = theme === "dark";
  const isHcb = theme === "hcb";
  const root = document.documentElement;
  const body = document.body;

  root.classList.toggle("themeDark", isDark);
  root.classList.toggle("themeHCB", isHcb);
  root.dataset.theme = theme;
  root.style.colorScheme = theme === "light" ? "light" : "dark";

  if (body) {
    body.classList.toggle("themeDark", isDark);
    body.classList.toggle("themeHCB", isHcb);
    body.dataset.theme = theme;
    body.style.background =
      theme === "hcb" ? "#000" : theme === "dark" ? "#23272a" : "#fff";
  }
};

const withI18next = (Story, context) => {
  const theme: StorybookTheme = context.globals.theme || getStoredTheme();
  const locale = context.globals.locale || "en";
  useLayoutEffect(() => {
    applyThemeToDom(theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
      window.localStorage.setItem("theme", theme);
    } catch {
      // ignore storage errors (private mode, etc.)
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

const detectVisualRegression = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const globalFlag = Boolean(
    (
      window as typeof window & {
        __STORYBOOK_VISUAL_REGRESSION__?: boolean;
      }
    ).__STORYBOOK_VISUAL_REGRESSION__,
  );

  const storageFlag = (() => {
    try {
      return (
        window.localStorage.getItem("STORYBOOK_VISUAL_REGRESSION") === "true"
      );
    } catch (error) {
      return false;
    }
  })();

  return globalFlag || storageFlag;
};

const isVisualRegression = detectVisualRegression();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "off",
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
