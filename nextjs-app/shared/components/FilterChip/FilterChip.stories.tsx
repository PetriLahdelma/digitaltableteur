import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { FilterChip } from "./FilterChip";
import contract from "./FilterChip.contract.json";

const meta = {
  title: "Actions/FilterChip",
  component: FilterChip,
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
    pressed: {
      control: "boolean",
      description: "Whether this chip's filter is active (aria-pressed).",
      table: { category: "Behavior" },
    },
    variant: {
      control: "radio",
      options: ["pill", "rectangle", "underline", "minimal"],
      description: "Visual treatment.",
      table: { defaultValue: { summary: "pill" }, category: "Appearance" },
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Size token.",
      table: { defaultValue: { summary: "md" }, category: "Appearance" },
    },
    count: {
      control: { type: "select" },
      options: ["none", "few", "many"],
      mapping: { none: undefined, few: 3, many: 12 },
      description: "Optional count suffix, rendered as (n).",
      table: { category: "Content" },
    },
    children: {
      control: "text",
      description: "Chip label.",
      table: { category: "Content" },
    },
    onClick: { table: { disable: true } },
  },
  args: {
    pressed: false,
    variant: "pill" as const,
    size: "md" as const,
    count: "none" as unknown as number,
    className: "",
    children: "Design systems",
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  // Drives the toggle via keyboard + pointer. The chip is controlled with no
  // handler wired here, so the interaction is a no-op on the accessibility tree
  // (focus/press state is not serialised into AT snapshots) — this exercises the
  // control without perturbing the captured snapshot.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole("button", { name: "Design systems" });
    await userEvent.tab();
    await expect(chip).toHaveFocus();
    await expect(chip).toHaveAttribute("aria-pressed", "false");
    await userEvent.keyboard("{Enter}");
    await userEvent.click(chip);
  },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

function ExampleGroup() {
  const [active, setActive] = useState<string | null>(null);
  const tags = ["Design systems", "Accessibility", "AI", "Branding"];
  return (
    <div
      role="group"
      aria-label="Filter by topic"
      style={{ display: "flex", gap: "var(--space-internal-8)", flexWrap: "wrap" }}
    >
      <FilterChip pressed={active === null} onClick={() => setActive(null)} count={12}>
        All
      </FilterChip>
      {tags.map((tag) => (
        <FilterChip
          key={tag}
          pressed={active === tag}
          onClick={() => setActive(tag)}
          count={3}
        >
          {tag}
        </FilterChip>
      ))}
    </div>
  );
}

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (filter group)",
  parameters: { controls: { disable: true } },
  render: () => <ExampleGroup />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: { pressed: true },
  parameters: {
    docs: {
      description: {
        story: "Forced-colors verification story.",
      },
    },
  },
};
