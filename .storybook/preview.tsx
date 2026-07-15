import { ThemeProvider } from "@dt/ThemeProvider";
import type { Preview } from "@storybook/react-vite";
import type { Decorator, StoryContext, StoryFn } from "@storybook/react";
import React, { useEffect, useLayoutEffect } from "react";
import { AnimationProvider } from "../providers/AnimationProvider";

// @gsap/react reads React from globalThis in some Vite/Storybook bundles
if (typeof globalThis !== "undefined") {
  (
    globalThis as typeof globalThis & { React: typeof React }
  ).React = React;
}

import { I18nextProvider } from "react-i18next";
import { MotionConfig } from "framer-motion";
import * as storybookIcons from "@storybook/icons";
import i18n from "@dt/../i18n";
import en from "@dt/../locales/en/translation.json";
import fi from "@dt/../locales/fi/translation.json";
import sv from "@dt/../locales/sv/translation.json";
import { WipBadge } from "@dt/WipBadge";
import { CookieConsentProvider } from "../nextjs-app/shared/lib/cookieConsent/CookieConsentContext";
import { resolveDesignParameters } from "./lib/resolve-figma-from-contract";
import { autogenArgTypes, autogenArgs } from "./lib/controls-autogen";
import { DtDocsPage } from "./blocks/DtDocsPage";
import { dtSourceTransform } from "./blocks/sourceTransform";

// Import global styles - CRITICAL for design tokens and component styling
import "@dt/../index.css";
// Tailwind 4 entry — components in shared/patterns rely on shadcn semantic
// tokens (e.g. text-foreground, bg-background) which need the `@theme` block
// from app/tailwind.css to bind utility classes to the theme variables. Without
// this import, Tailwind utilities used in Storybook stories silently fall back
// to inherited styles and trigger light/dark matrix contrast violations.
import "../app/tailwind.css";

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

/** Story-level `globals.forcedColors` — only the ForcedColors story should use "active". */
export type ForcedColorsGlobal = "none" | "active";

/**
 * Runtime check for forced-colors emulation in the iframe.
 *
 * The Storybook dev server is started without `DT_FORCED_COLORS`, so any build-time
 * `process.env.DT_FORCED_COLORS` lookup in this module resolves to `undefined`.
 * Playwright's `page.emulateMedia({ forcedColors: "active" })` IS active by the time
 * the iframe boots, so `matchMedia` is the reliable signal.
 */
const isForcedColorsRuntime = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(forced-colors: active)").matches;
  } catch {
    return false;
  }
};

export const globalTypes = {
  forcedColors: {
    name: "Forced colors (Windows HC)",
    description:
      "Simulates forced-colors mode for the ForcedColors story only. Default stories keep this Off.",
    defaultValue: "none" satisfies ForcedColorsGlobal,
    toolbar: {
      icon: "contrast",
      items: [
        { value: "none", title: "Off" },
        { value: "active", title: "On (HC)" },
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
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
    // The body background is driven entirely by the `--main-body-background-color`
    // CSS variable in `shared/styles/variables.css` (and the shadcn `--background`
    // token in `app/tailwind.css`) — both flip with the `.themeDark` / `.themeHCB`
    // / `.themeHCW` classes already applied above. Setting an inline style here
    // would shadow the cascade and persist through later theme switches, which
    // is exactly what broke the ThemeProvider Playground story when its child
    // provider toggled to dark while the inline `#fff` stayed pinned to body.
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
      <ThemeProvider forcedTheme={theme}>
        {/* MotionConfig with reducedMotion="user" makes framer-motion skip
              transition tweens when prefers-reduced-motion is set (we force
              that in test-runner.preVisit). Without this the motion library
              still animates opacity 0->1 over its default duration, which axe
              samples mid-flight and reports as a color-contrast violation. */}
        <MotionConfig reducedMotion="user">
          <Story />
        </MotionConfig>
      </ThemeProvider>
    </I18nextProvider>
  );
};

// Order: withI18next first so WIP badge children have translation context
// Fullscreen safe-area decorator adds padding for stories using layout: 'fullscreen'
const withFullscreenSafeArea: Decorator = (Story, context) => {
  const isFullscreen = context.parameters?.layout === "fullscreen";
  if (!isFullscreen) {
    return <><Story /></>;
  }
  return (
    <div className="fullscreenSafeArea" data-safe-area>
      <Story />
    </div>
  );
};


const withWipBadge: Decorator = (Story, context) => {
  // Docs pages carry status through their own affordances (DocHeader
  // StatusPill on the frame, the sidebar lifecycle dots, the Status line on
  // legacy MDX pages). Rendering the fixed-position badge inside docs would
  // inject one per embedded canvas, where the Canvas block's transformed
  // container traps `position: fixed` and clips the badge into a floating
  // scrap over every story (seen on the LanguageSwitcher MDX page).
  if (context.viewMode === "docs") {
    return <Story />;
  }
  const contractStatus =
    (context.parameters?.contractStatus as string | undefined) ??
    (context.parameters?.wip?.status as string | undefined) ??
    "alpha";
  const showBadge = contractStatus !== "stable" && context.parameters?.wip?.disabled !== true;
  return (
    <>
      {showBadge ? <WipBadge status={contractStatus as "alpha" | "beta" | "stable" | "deprecated"} variant="canvas" /> : null}
      <Story />
    </>
  );
};

const withAnimation: Decorator = (Story) => (
  <AnimationProvider>
    <Story />
  </AnimationProvider>
);

// CookieConsentProvider must wrap stories because several patterns (and the
// CookieConsent component itself) call `useCookieConsent()`, which throws when
// the provider is missing. `autoShow={false}` keeps the banner from popping on
// every story render.
const withCookieConsent: Decorator = (Story) => (
  <CookieConsentProvider autoShow={false}>
    <Story />
  </CookieConsentProvider>
);

const FORCED_COLORS_STYLE_ID = "sb-forced-colors-emulation";
const FORCED_COLORS_A11Y_FIX_STYLE_ID = "sb-forced-colors-a11y-fix";

/**
 * Applies / clears forced-colors emulation from story globals only.
 * Default/Playground/Example set `forcedColors: "none"` so toolbar + URL do not stick.
 */
const withForcedColorsGlobal: Decorator = (Story, context) => {
  const mode = (context.globals?.forcedColors as ForcedColorsGlobal | undefined) ?? "none";
  const active = mode === "active";
  const forcedColorsEnvActive = isForcedColorsRuntime();

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.classList.add("sb-forced-colors-active");
      let style = document.getElementById(FORCED_COLORS_STYLE_ID);
      if (!style) {
        style = document.createElement("style");
        style.id = FORCED_COLORS_STYLE_ID;
        style.textContent = `
          /* Dev-only hint; CI uses Playwright emulateMedia in test:stories:hc */
          html.sb-forced-colors-active { color-scheme: light dark; }
        `;
        document.head.appendChild(style);
      }
    } else {
      root.classList.remove("sb-forced-colors-active");
      document.getElementById(FORCED_COLORS_STYLE_ID)?.remove();
    }

    // When the test runner uses Playwright emulateMedia({ forcedColors: "active" }),
    // Storybook globals are not involved. Add minimal CSS fixes so Tailwind utility
    // colors resolve to system colors and axe doesn't report low-contrast author
    // colors in forced-colors mode.
    if (forcedColorsEnvActive) {
      let fix = document.getElementById(FORCED_COLORS_A11Y_FIX_STYLE_ID);
      if (!fix) {
        fix = document.createElement("style");
        fix.id = FORCED_COLORS_A11Y_FIX_STYLE_ID;
        fix.textContent = `
/* DT_FORCED_COLORS=active test runs on macOS do not reliably trigger
   @media (forced-colors: active) styles. Apply a minimal system-color
   mapping unconditionally when the env flag is enabled. */
.text-muted-foreground,
.text-muted-foreground\\/70,
.text-muted-foreground\\/60,
.text-muted-foreground\\/50,
.text-foreground,
.text-background\\/70 {
  color: CanvasText !important;
}

.bg-background,
.bg-background\\/60 {
  background-color: Canvas !important;
}

.border,
.border-border,
.border-border\\/50 {
  border-color: CanvasText !important;
}

/* Keep emphasis/CTA surfaces readable */
.bg-primary,
.bg-primary\\/20,
.bg-primary\\/60 {
  background-color: Highlight !important;
  color: HighlightText !important;
}
        `.trim();
        document.head.appendChild(fix);
      }
    } else {
      document.getElementById(FORCED_COLORS_A11Y_FIX_STYLE_ID)?.remove();
    }

    return () => {
      root.classList.remove("sb-forced-colors-active");
      document.getElementById(FORCED_COLORS_STYLE_ID)?.remove();
      document.getElementById(FORCED_COLORS_A11Y_FIX_STYLE_ID)?.remove();
    };
  }, [active, forcedColorsEnvActive]);

  return <Story />;
};

/**
 * Wires the Design addon panel to each component's contract `figma` URL
 * (Digitaltableteur scaffold URLs). Stories may override via `parameters.design`.
 */
const withFigmaDesignFromContract: Decorator = (Story, context) => {
  const design = resolveDesignParameters(context);
  if (design && !context.parameters.design?.url) {
    context.parameters = {
      ...context.parameters,
      design,
    };
  }
  return <Story />;
};

export const decorators = [
  withFigmaDesignFromContract,
  withI18next,
  withForcedColorsGlobal,
  withCookieConsent,
  withAnimation,
  withWipBadge,
  withFullscreenSafeArea,
];

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
  // Contract-driven Controls for components registered in
  // .storybook/controls-autogen.json — see lib/controls-autogen.ts.
  argTypesEnhancers: [autogenArgTypes],
  argsEnhancers: [autogenArgs],
  initialGlobals: {
    forcedColors: "none",
    // When the iframe boots under Playwright's `emulateMedia({ forcedColors: "active" })`,
    // mark a11y as "manual" so the addon-a11y test addon skips its `afterEach`. We still
    // gate forced-colors runs through the AT-tree snapshot diff in test-runner.ts.
    a11y: {
      manual: isForcedColorsRuntime(),
    },
  },
  parameters: {
    // Built-in onboarding checklist adds weight on first paint; disable for faster dev UX.
    onboarding: { disable: true },
    // Astryx-style docs frame (spec 3.2 A): contract-backed components render
    // the 11-block DT template; others fall back to classic autodocs inside
    // DtDocsPage. Source transform strips story scaffolding from code panels.
    docs: {
      page: DtDocsPage,
      source: { transform: dtSourceTransform },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: (() => {
      // Detect forced-colors at module evaluation in the iframe. By the time this
      // module loads under test-runner, Playwright has already applied emulateMedia.
      const forced = isForcedColorsRuntime();
      const disabled = forced || process.env.DT_DISABLE_A11Y === "1";

      // In forced-colors mode the user agent overrides author colors. axe-core's
      // color-contrast rule then evaluates author colors that are not what the user
      // actually sees, producing false positives. Disable just that rule and let
      // the AT-tree snapshot diff guard structural changes.
      const forcedColorsOverrides = forced
        ? {
            options: {
              rules: [{ id: "color-contrast", enabled: false }],
            },
          }
        : {};

      // Exclude the Storybook-only WIP badge from every axe run. The badge is a
      // dev-tooling decoration injected by `withWipBadge`; its sibling presence
      // in the DOM otherwise makes axe interpret it as "surrounding text" for
      // bare-component stories like NavLink / TextLink Default and surface
      // false-positive `link-in-text-block` failures.
      const baseContext = {
        context: {
          exclude: ["[data-axe-ignore]"],
        },
      };

      return {
        test: disabled ? "off" : process.env.CI ? "error" : "todo",
        disable: disabled,
        ...baseContext,
        ...forcedColorsOverrides,
      };
    })(),
    options: {
      storySort: {
        order: [
          "Overview",
          [
            "Welcome",
            "Components",
            "Test Health Overview",
            "00-Overview",
            "01-Principles",
            "02-Tokens",
            "03-Theming",
            "04-Accessibility",
            "05-Roadmap",
          ],
          "Docs",
          "Foundations",
          [
            "Color",
            "Typography",
            "Space",
            "Motion",
            "Layout",
            "Radius",
            "Elevation",
            "Focus",
            "Themes",
            "Contrast",
            "Token catalog",
            "Icons",
            "ThemeProvider",
          ],
          "Actions",
          "Content",
          "Forms",
          "Feedback",
          "Navigation",
          "Layout",
          "Web Components",
          "Site",
          ["Chat"],
          "Patterns",
          "Templates",
          "Testing",
          "Deprecated",
        ],
        method: "alphabetical",
        locales: "en-US",
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
