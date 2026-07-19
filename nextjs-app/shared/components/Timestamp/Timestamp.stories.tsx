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
  tags: ["stable", "autodocs"],
  argTypes: {
    value: {
      control: "text",
      description:
        "ISO 8601 calendar date or instant, Unix seconds, or Date to display.",
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
      options: ["xxs", "xs", "s", "m"],
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
    autoThreshold: 604800,
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
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: {
    docs: {
      description: {
        story:
          "Drive every prop from the Controls panel. `value` and `now` are pinned so relative output stays deterministic; clear `now` to read against the live clock.",
      },
    },
  },
};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The text-ladder sizes from xxs to m. Timestamp is metadata, so it caps at body size (m) — it inherits the Text type scale and aligns inline with surrounding copy.",
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {(["xxs", "xs", "s", "m"] as const).map((size) => (
        <Text as="p" size="s" key={size}>
          {size}:{" "}
          <Timestamp value={OLDER} now={FIXED_NOW} format="date" size={size} />
        </Text>
      ))}
    </div>
  ),
};

export const Relative: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Relative output across the age ladder, from seconds to months before the fixed reference `now`. Each renders a native full-date tooltip on hover.",
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {(
        [
          ["30 seconds", "2026-02-19T18:59:30Z"],
          ["5 minutes", "2026-02-19T18:55:00Z"],
          ["3 hours", "2026-02-19T16:00:00Z"],
          ["2 days", "2026-02-17T19:00:00Z"],
          ["3 weeks", "2026-01-29T19:00:00Z"],
          ["2 months", "2025-12-19T19:00:00Z"],
        ] as const
      ).map(([label, value]) => (
        <Text as="p" size="s" key={label}>
          {label}:{" "}
          <Timestamp value={value} now={FIXED_NOW} format="relative" />
        </Text>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "`muted` (default) for secondary metadata like list timestamps; `default` when the value carries body-text weight.",
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {(["muted", "default"] as const).map((tone) => (
        <Text as="p" size="s" key={tone}>
          {tone}:{" "}
          <Timestamp value={OLDER} now={FIXED_NOW} format="date_time" tone={tone} />
        </Text>
      ))}
    </div>
  ),
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
  tags: ["beta-matrix"],
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
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  parameters: {
    docs: {
      description: {
        story: "Forced-colors verification story.",
      },
    },
  },
};
