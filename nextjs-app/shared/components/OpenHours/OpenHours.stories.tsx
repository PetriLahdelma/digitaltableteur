import contract from "./OpenHours.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import OpenHours from "@dt/OpenHours";
import Icon from "@dt/Icon";

const meta: Meta<typeof OpenHours> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/OpenHours",
  component: OpenHours,
  tags: ["beta", "!autodocs"],
  parameters: { contractStatus: contract.status, a11y: { test: "error" } },
  // Required AT snapshots must not depend on the CI runner's wall clock.
  args: { date: new Date("2025-11-03T10:30:00Z") },
};
export default meta;

type Story = StoryObj<typeof OpenHours>;

export const Default: Story = {
  tags: ["beta-matrix"],
};

export const Compact: Story = { args: { compact: true } };

export const TodayOnly: Story = { args: { showAllDays: false } };

export const InjectedDate: Story = {
  args: { date: new Date("2025-11-01T10:30:00") },
  parameters: {
    docs: {
      description: {
        story: "Shows Saturday closed state based on injected date.",
      },
    },
  },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  argTypes: {
    date: {
      control: { type: "select" },
      // Two concrete dates on different weekdays so the highlighted-today row
      // (and open/closed badge) visibly moves regardless of the real date;
      // "now"→undefined would coincide with the machine date and read inert.
      options: ["saturday", "monday"],
      mapping: {
        saturday: new Date("2025-11-01T10:30:00"),
        monday: new Date("2025-11-03T10:30:00"),
      },
      description:
        "Reference date for the open/closed state (defaults to now). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "Date" } },
    },
  },
  args: {
    date: "saturday" as never,
  },
};
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
