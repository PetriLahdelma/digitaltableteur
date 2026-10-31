import React from "react";
import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";
import type { API_HashEntry } from "storybook/internal/types";
import usage from "../nextjs-app/shared/foundations/dist/component-usage-counts.json";

/** Production pages that render each component (npm run report:component-usage). */
const USAGE = (usage as { counts: Record<string, { prod: number }> }).counts;

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
/**
 * The component's production usage after its name: the number of production
 * pages that render it, or "unused" when none does, so dead components stand
 * out in the sidebar. Only component entries carry it (one per component).
 */
function usageCount(item: API_HashEntry): React.ReactNode {
  if (item.type !== "component") return null;
  const entry = USAGE[item.name];
  if (!entry) return null;
  const unused = entry.prod === 0;
  return React.createElement(
    "span",
    {
      className: unused ? "dt-usage dt-usage--unused" : "dt-usage",
      title: unused
        ? "Not rendered on any production page"
        : `Rendered on ${entry.prod} production page${entry.prod === 1 ? "" : "s"}`,
    },
    unused ? "unused" : String(entry.prod),
  );
}

function renderLabel(item: API_HashEntry): React.ReactNode {
  if (item.type !== "component" && item.type !== "docs") return item.name;
  const tags: string[] = (item as { tags?: string[] }).tags ?? [];
  const status = STATUS_TAGS.find((candidate) => tags.includes(candidate));
  const count = usageCount(item);
  if (!status && !count) return item.name;
  const labelClass =
    status === "deprecated"
      ? "dt-sidebar-label dt-sidebar-label--deprecated"
      : "dt-sidebar-label";
  return React.createElement(
    "span",
    { className: labelClass },
    item.name,
    status
      ? React.createElement("span", {
          className: `dt-status-dot dt-status-dot--${status}`,
          "aria-hidden": "true",
        })
      : null,
    count,
  );
}

addons.setConfig({
  theme: dtTheme,
  sidebar: {
    renderLabel,
  },
});
