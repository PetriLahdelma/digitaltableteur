import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Timestamp } from "./Timestamp";
import Text from "@dt/Text";
import contract from "./Timestamp.contract.json";

/**
 * Every story pins `value` and `now` so relative output is deterministic:
 * AT snapshots and visual baselines must never ride on wall-clock time.
 */
const FIXED_NOW = "2026-02-19T19:00:00Z";
const RECENT = "2026-02-19T17:00:00Z"; // 2 hours before FIXED_NOW
const OLDER = "2025-11-29T12:00:00Z";

const meta = {
  title: "Content/Timestamp",
  component: Timestamp,
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: {
      description: {
        component: contract.description,
      },
    },
  },
  // Custom MDX docs pages exist for all catalog entries; do not also enable autodocs
  // or Storybook will treat it as conflicting sources of truth for the docs page.
  tags: ["!autodocs"],
  argTypes: {
    value: {
      control: "text",
      description: "ISO 8601 string, Unix seconds, or Date to display.",
      table: { category: "Content", type: { summary: "string | number | Date" } },
    },
    format: {
      control: { type: "select" },
      options: [
        "auto",
        "relative",
        "date",
        "date_time",
        "time",
        "system_date",
        "system_date_time",
        "system_time",
      ],
      description:
        "Display format; auto shows relative time until autoThreshold, then the full date.",
      table: { category: "Appearance", defaultValue: { summary: "auto" } },
    },
    autoThreshold: {
      control: "number",
      description: "Seconds before auto switches from relative to date_time.",
      table: { category: "Behavior", defaultValue: { summary: "604800" } },
    },
    size: {
      control: { type: "select" },
      options: ["xxs", "xs", "s", "m", "l", "xl", "xxl"],
      description: "Text-ladder size.",
      table: { category: "Appearance", defaultValue: { summary: "s" } },
    },
    tone: {
      control: "radio",
      options: ["default", "muted"],
      description: "Color role: body text or muted metadata.",
      table: { category: "Appearance", defaultValue: { summary: "muted" } },
    },
    showTimezone: {
      control: "boolean",
      description: "Append the timezone abbreviation to time-bearing formats.",
      table: { category: "Appearance", defaultValue: { summary: "false" } },
    },
    tooltip: {
      control: "boolean",
      description: "Native full-date tooltip on relative output.",
      table: { category: "Behavior", defaultValue: { summary: "true" } },
    },
    live: {
      control: "boolean",
      description: "Tick relative output while mounted (30s cadence).",
      table: { category: "Behavior", defaultValue: { summary: "false" } },
    },
    now: {
      control: "text",
      description:
        "Reference now for deterministic relative output (stories/tests).",
      table: { category: "Advanced", type: { summary: "string | number | Date" } },
    },
    locale: {
      control: "text",
      description: "Locale override; defaults to the active site language.",
      table: { category: "Advanced", type: { summary: "string" } },
    },
    className: {
      control: "text",
      description: "Optional className passthrough.",
      table: { category: "Advanced" },
    },
  },
  args: {
    value: RECENT,
    now: FIXED_NOW,
    format: "auto",
    size: "s",
    tone: "muted",
    showTimezone: false,
    tooltip: true,
    live: false,
    locale: "",
    className: "",
  },
} satisfies Meta<typeof Timestamp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};

export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Formats: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "All display formats against the same fixed value: user-facing date/date_time/time and the system variants for logs and dev tools.",
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {(
        [
          "relative",
          "date",
          "date_time",
          "time",
          "system_date",
          "system_date_time",
          "system_time",
        ] as const
      ).map((format) => (
        <Text as="p" size="s" key={format}>
          {format}: <Timestamp value={OLDER} now={FIXED_NOW} format={format} />
        </Text>
      ))}
    </div>
  ),
};

export const Example: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "In-copy composition, the privacy-policy idiom: a label with an absolute date.",
      },
    },
  },
  render: () => (
    <Text as="p" size="xs">
      Last updated: <Timestamp value={OLDER} format="date" now={FIXED_NOW} />
    </Text>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  parameters: {
    docs: {
      description: {
        story: "Forced-colors verification story.",
      },
    },
  },
};
