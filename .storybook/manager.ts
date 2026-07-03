import React from "react";
import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";
import type { API_HashEntry } from "storybook/internal/types";

const brandImage =
  process.env.NODE_ENV === "production"
    ? "./storybook_logo.svg"
    : "/storybook_logo.svg";

/**
 * DT manager theme. The manager app cannot load variables.css, so token
 * values are copied as hex with their source token named alongside; this is
 * the documented exception to the no-hardcoded-colors rule (see the Phase 2
 * plan's Global Constraints). Values come from the `.themeDark` block.
 */
const dtTheme = create({
  base: "dark",
  brandTitle: "Digitaltableteur",
  brandUrl: "https://digitaltableteur.com",
  brandImage,
  brandTarget: "_self",

  fontBase:
    '"Satoshi", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontCode: 'ui-monospace, "SF Mono", Menlo, monospace',

  colorPrimary: "#6fa8ff", // --color-primary (dark)
  colorSecondary: "#6fa8ff", // --color-primary (dark)

  appBg: "#181a1b", // --main-body-background-color (dark)
  appContentBg: "#181a1b", // --main-body-background-color (dark)
  appPreviewBg: "#ffffff", // preview iframe default (light theme)
  appBorderColor: "#333333", // --color-border (dark)
  appBorderRadius: 8,

  textColor: "#e0e0e0", // --color-text (dark)
  textInverseColor: "#041b23", // --color-primary (light)
  textMutedColor: "#888888", // --color-muted (dark)

  barBg: "#181a1b", // --main-body-background-color (dark)
  barTextColor: "#888888", // --color-muted (dark)
  barHoverColor: "#6fa8ff", // --color-primary (dark)
  barSelectedColor: "#6fa8ff", // --color-primary (dark)

  inputBg: "#181a1b", // --main-body-background-color (dark)
  inputBorder: "#444444", // --color-border-light (dark)
  inputTextColor: "#e0e0e0", // --color-text (dark)
  inputBorderRadius: 4,
});

const STATUS_TAGS = ["stable", "beta", "alpha", "deprecated"] as const;

/**
 * Appends a lifecycle dot to component/docs sidebar entries whose meta
 * carries a status tag (stable = solid, beta = hollow, alpha = muted,
 * deprecated = struck). Dot styles live in manager-head.html.
 */
function renderLabel(item: API_HashEntry): React.ReactNode {
  if (item.type !== "component" && item.type !== "docs") return item.name;
  const tags: string[] = (item as { tags?: string[] }).tags ?? [];
  const status = STATUS_TAGS.find((candidate) => tags.includes(candidate));
  if (!status) return item.name;
  return React.createElement(
    "span",
    { className: "dt-sidebar-label" },
    item.name,
    React.createElement("span", {
      className: `dt-status-dot dt-status-dot--${status}`,
      "aria-hidden": "true",
    }),
  );
}

addons.setConfig({
  theme: dtTheme,
  sidebar: {
    renderLabel,
  },
});
