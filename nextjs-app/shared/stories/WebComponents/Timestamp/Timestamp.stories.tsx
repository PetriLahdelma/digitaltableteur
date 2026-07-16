import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";
import { DtTimestampElement } from "../../../../../packages/web-components/src/native/timestamp";
import contract from "../../../../shared/components/Timestamp/Timestamp.contract.json";

if (!customElements.get("dt-timestamp")) {
  customElements.define("dt-timestamp", DtTimestampElement);
}

const FIXED_NOW = "2026-02-19T19:00:00Z";
const RECENT = "2026-02-19T17:00:00Z";
const OLDER = "2025-11-29T12:00:00Z";

type Args = {
  value: string;
  format:
    | "auto"
    | "relative"
    | "date"
    | "date_time"
    | "time"
    | "system_date"
    | "system_date_time"
    | "system_time";
  autoThreshold: number;
  size: "xxs" | "xs" | "s" | "m";
  tone: "default" | "muted";
  showTimezone: boolean;
  tooltip: boolean;
  live: boolean;
  now?: string;
  locale?: string;
};

function NativeTimestamp({
  autoThreshold,
  showTimezone,
  tooltip,
  live,
  now,
  locale,
  ...args
}: Args) {
  return (
    <NativeElement
      tagName="dt-timestamp"
      attributes={{
        ...args,
        "auto-threshold": autoThreshold,
        "show-timezone": showTimezone ? "true" : "false",
        tooltip: tooltip ? "true" : "false",
        live: live ? "true" : "false",
        now: now || undefined,
        locale: locale || undefined,
      }}
    />
  );
}

const meta = {
  title: "Web Components/Content/Timestamp",
  component: NativeTimestamp,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component: contract.description,
      },
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
  },
  argTypes: {
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
    },
    size: { control: "inline-radio", options: ["xxs", "xs", "s", "m"] },
    tone: { control: "inline-radio", options: ["default", "muted"] },
    showTimezone: { control: "boolean" },
    tooltip: { control: "boolean" },
    live: { control: "boolean" },
  },
} satisfies Meta<typeof NativeTimestamp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-timestamp") };

export const Playground: Story = {};

export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(["xxs", "xs", "s", "m"] as const).map((size) => (
        <p key={size}>
          {size}:{" "}
          <NativeTimestamp
            value={OLDER}
            now={FIXED_NOW}
            format="date"
            size={size}
            tone="muted"
            autoThreshold={604800}
            showTimezone={false}
            tooltip
            live={false}
          />
        </p>
      ))}
    </Stack>
  ),
};

export const Relative: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
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
        <p key={label}>
          {label}:{" "}
          <NativeTimestamp
            value={value}
            now={FIXED_NOW}
            format="relative"
            size="s"
            tone="muted"
            autoThreshold={604800}
            showTimezone={false}
            tooltip
            live={false}
          />
        </p>
      ))}
    </Stack>
  ),
};

export const Tones: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(["muted", "default"] as const).map((tone) => (
        <p key={tone}>
          {tone}:{" "}
          <NativeTimestamp
            value={OLDER}
            now={FIXED_NOW}
            format="date_time"
            size="s"
            tone={tone}
            autoThreshold={604800}
            showTimezone={false}
            tooltip
            live={false}
          />
        </p>
      ))}
    </Stack>
  ),
};

export const Formats: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
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
        <p key={format}>
          {format}:{" "}
          <NativeTimestamp
            value={OLDER}
            now={FIXED_NOW}
            format={format}
            size="s"
            tone="muted"
            autoThreshold={604800}
            showTimezone={false}
            tooltip
            live={false}
          />
        </p>
      ))}
    </Stack>
  ),
};

export const Example: Story = {
  ...exampleStory,
  render: () => (
    <p>
      Last updated:{" "}
      <NativeTimestamp
        value={OLDER}
        now={FIXED_NOW}
        format="date"
        size="s"
        tone="muted"
        autoThreshold={604800}
        showTimezone={false}
        tooltip
        live={false}
      />
    </p>
  ),
};

export const ForcedColors: Story = { ...forcedColorsStory };
