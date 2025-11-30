import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@dt/ThemeProvider";
import type { Preview } from "@storybook/react-vite";
import type { Decorator, StoryContext, StoryFn } from "@storybook/react";
import React, { useEffect, useLayoutEffect } from "react";
import { I18nextProvider } from "react-i18next";
import * as storybookIcons from "@storybook/icons";
import i18n from "../nextjs-app/shared/i18n";
import en from "../nextjs-app/shared/locales/en/translation.json";
import fi from "../nextjs-app/shared/locales/fi/translation.json";
import sv from "../nextjs-app/shared/locales/sv/translation.json";

// Import global styles - CRITICAL for design tokens and component styling
import "../nextjs-app/shared/index.css";

const THEME_KEY = "storybook-theme";
const STORYBOOK_THEMES = ["light", "dark", "hcb", "hcw"] as const;
type StorybookTheme = (typeof STORYBOOK_THEMES)[number];

const isStorybookTheme = (value: unknown): value is StorybookTheme =>
  typeof value === "string" &&
  STORYBOOK_THEMES.includes(value as StorybookTheme);

const STORYBOOK_TOOLBAR_ICON_SET = new Set(
  Object.keys(storybookIcons)
    .filter((key) => key.endsWith("Icon"))
    .map((key) => key.replace(/Icon$/, "").toLowerCase()),
);

const STORYBOOK_ICON_SUGGESTIONS = Array.from(STORYBOOK_TOOLBAR_ICON_SET)
  .sort()
  .slice(0, 25);

const DEFAULT_TOOLBAR_ICON = "circlehollow";
const warnedIcons = new Set<string>();

const resolveToolbarIcon = (
  iconName: string,
  fallback: string = DEFAULT_TOOLBAR_ICON,
) => {
  const normalizedIcon = iconName.toLowerCase();
  if (STORYBOOK_TOOLBAR_ICON_SET.has(normalizedIcon)) {
    return normalizedIcon;
  }

  const normalizedFallback = fallback.toLowerCase();
  const safeFallback = STORYBOOK_TOOLBAR_ICON_SET.has(normalizedFallback)
    ? normalizedFallback
    : DEFAULT_TOOLBAR_ICON;

  if (process.env.NODE_ENV !== "production") {
    if (!warnedIcons.has(normalizedIcon)) {
      const suggestions = STORYBOOK_ICON_SUGGESTIONS.join(", ");
      // eslint-disable-next-line no-console
      console.warn(
        `[storybook] Unknown toolbar icon "${iconName}".` +
          ` Falling back to "${safeFallback}".` +
          ` Try one of: ${suggestions}${
            STORYBOOK_TOOLBAR_ICON_SET.size > STORYBOOK_ICON_SUGGESTIONS.length
              ? ", …"
              : ""
          }`,
      );
      warnedIcons.add(normalizedIcon);
    }
  }

  return safeFallback;
};

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
      icon: resolveToolbarIcon("circlehollow"),
      items: [
        { value: "light", title: "Light" },
        { value: "dark", title: "Dark" },
        { value: "hcb", title: "HCB" },
        { value: "hcw", title: "HCW" },
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
      icon: resolveToolbarIcon("globe"),
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
  const isHcw = theme === "hcw";
  const root = document.documentElement;
  const body = document.body;

  root.classList.toggle("themeDark", isDark);
  root.classList.toggle("themeHCB", isHcb);
  root.classList.toggle("themeHCW", isHcw);
  root.dataset.theme = theme;
  root.style.colorScheme =
    theme === "dark" || theme === "hcb" ? "dark" : "light";

  if (body) {
    body.classList.toggle("themeDark", isDark);
    body.classList.toggle("themeHCB", isHcb);
    body.classList.toggle("themeHCW", isHcw);
    body.dataset.theme = theme;
    body.style.background =
      theme === "hcb" ? "#000" : theme === "dark" ? "#23272a" : "#fff";
  }
};

const withI18next: Decorator = (Story: StoryFn, context: StoryContext) => {
  const theme: StorybookTheme =
    (context.globals.theme as StorybookTheme) || getStoredTheme();
  const locale = (context.globals.locale as string) || "en";
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
          {Story(context.args, context)}
        </ThemeProvider>
      </MemoryRouter>
    </I18nextProvider>
  );
};

// Order: withI18next first so WIP badge children have translation context
// Fullscreen safe-area decorator adds padding for stories using layout: 'fullscreen'
const withFullscreenSafeArea: Decorator = (Story, context) => {
  const isFullscreen = context.parameters?.layout === "fullscreen";
  if (!isFullscreen) {
    return <>{Story(context)}</>;
  }
  return (
    <div className="fullscreenSafeArea" data-safe-area>
      {Story(context)}
    </div>
  );
};

export const decorators = [withI18next, withFullscreenSafeArea];

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
