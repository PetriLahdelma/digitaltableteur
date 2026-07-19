import React, { useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import { DocsContainer } from "@storybook/addon-docs/blocks";
import type { DocsContainerProps } from "@storybook/addon-docs/blocks";
import { addons } from "storybook/preview-api";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { create } from "storybook/theming";
import type { ThemeVars } from "storybook/theming";

const THEME_KEY = "storybook-theme";
const DT_THEMES = ["light", "dark", "hcb", "hcw"] as const;
type DtTheme = (typeof DT_THEMES)[number];

const isDtTheme = (value: unknown): value is DtTheme =>
  typeof value === "string" && DT_THEMES.includes(value as DtTheme);

const readStoredTheme = (): DtTheme => {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return isDtTheme(stored) ? stored : "light";
  } catch {
    return "light";
  }
};

const fontBase =
  '"Satoshi", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const fontCode = 'ui-monospace, "SF Mono", Menlo, monospace';

/**
 * Docs-container themes per DT theme global. The docs container renders
 * outside the token cascade (Storybook paints its wrapper from an emotion
 * theme, not from variables.css), so token values are copied as hex with
 * their source token named alongside — the same documented exception to the
 * no-hardcoded-colors rule as the manager theme in `.storybook/manager.ts`.
 *
 * Without this mapping the docs canvas stays light-theme white in every
 * theme while the docs-frame blocks (DocHeader tabs, StatusPill) follow the
 * `.themeHCB`/`.themeDark` tokens — white-on-white in HCB (regressed with
 * the Astryx docs frame, #806).
 */
const DOCS_THEMES: Record<DtTheme, ThemeVars> = {
  light: create({
    base: "light",
    fontBase,
    fontCode,
  }),
  dark: create({
    base: "dark",
    fontBase,
    fontCode,
    colorPrimary: "#6fa8ff", // --color-primary (dark)
    colorSecondary: "#6fa8ff", // --color-primary (dark)
    appBg: "#181a1b", // --main-body-background-color (dark)
    appContentBg: "#181a1b", // --main-body-background-color (dark)
    appBorderColor: "#333333", // --color-border (dark)
    textColor: "#e0e0e0", // --color-text (dark)
    textInverseColor: "#041b23", // --color-primary (light)
    textMutedColor: "#888888", // --color-muted (dark)
    barBg: "#181a1b", // --main-body-background-color (dark)
    inputBg: "#181a1b", // --main-body-background-color (dark)
    inputBorder: "#444444", // --color-border-light (dark)
    inputTextColor: "#e0e0e0", // --color-text (dark)
  }),
  hcb: create({
    base: "dark",
    fontBase,
    fontCode,
    colorPrimary: "#ffffff", // --color-primary (hcb)
    colorSecondary: "#ffffff", // --color-primary (hcb)
    appBg: "#000000", // --main-body-background-color (hcb)
    appContentBg: "#000000", // --main-body-background-color (hcb)
    appBorderColor: "#333333", // --color-border (hcb)
    textColor: "#ffffff", // --color-text (hcb)
    textInverseColor: "#000000", // --inverted-text-color (hcb)
    textMutedColor: "#888888", // --color-muted (hcb)
    barBg: "#000000", // --main-body-background-color (hcb)
    inputBg: "#000000", // --main-body-background-color (hcb)
    inputBorder: "#444444", // --color-border-light (hcb)
    inputTextColor: "#ffffff", // --color-text (hcb)
  }),
  hcw: create({
    base: "light",
    fontBase,
    fontCode,
    colorPrimary: "#000000", // --color-primary (hcw)
    colorSecondary: "#000000", // --color-primary (hcw)
    appBg: "#ffffff", // --main-body-background-color (hcw)
    appContentBg: "#ffffff", // --main-body-background-color (hcw)
    appBorderColor: "#333333", // --color-border (hcw)
    textColor: "#000000", // --color-text (hcw)
    textInverseColor: "#ffffff", // --inverted-text-color (hcw)
    textMutedColor: "#333333", // --color-muted (hcw)
    barBg: "#ffffff", // --main-body-background-color (hcw)
    inputBg: "#ffffff", // --main-body-background-color (hcw)
    inputBorder: "#444444", // --color-border-light (hcw)
    inputTextColor: "#000000", // --color-text (hcw)
  }),
};

/**
 * DocsContainer that follows the DT theme toolbar global. Initial value comes
 * from the persisted `storybook-theme` key (written by the theme decorator in
 * preview.tsx); toolbar switches arrive via GLOBALS_UPDATED without a reload.
 */
export function DtDocsContainer(
  props: PropsWithChildren<DocsContainerProps>,
) {
  const [theme, setTheme] = useState<DtTheme>(readStoredTheme);

  useEffect(() => {
    const channel = addons.getChannel();
    const onGlobalsUpdated = ({
      globals,
    }: {
      globals?: { theme?: unknown };
    }) => {
      if (globals && isDtTheme(globals.theme)) {
        setTheme(globals.theme);
      }
    };
    channel.on(GLOBALS_UPDATED, onGlobalsUpdated);
    return () => channel.off(GLOBALS_UPDATED, onGlobalsUpdated);
  }, []);

  return <DocsContainer {...props} theme={DOCS_THEMES[theme]} />;
}
