import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { StatList, type StatListItem } from "./StatList";
import contract from "./StatList.contract.json";

/* The production use: the Colophon page's "By the numbers" band. */
const items: StatListItem[] = [
  { id: "components", value: 191, label: "Components in the catalog", note: "108 stable" },
  { id: "tokens", value: 228, label: "Design tokens" },
  { id: "themes", value: 4, label: "Themes", note: "Light, dark and two high-contrast" },
  { id: "languages", value: 3, label: "Languages" },
];

const meta = {
  title: "Content/StatList",
  component: StatList,
  tags: ["alpha", "!autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  args: { items, variant: "rule", size: "md", align: "start" },
  argTypes: {
    items: { table: { disable: true } },
    variant: {
      control: "radio",
      options: ["rule", "card"],
      description: "rule: a hairline above each figure. card: each figure on a surface tile.",
      table: { defaultValue: { summary: "rule" } },
    },
    size: {
      control: "radio",
      options: ["md", "lg"],
      description: "Figure size: md for rows of four or more, lg for two or three.",
      table: { defaultValue: { summary: "md" } },
    },
    align: {
      control: "radio",
      options: ["start", "center"],
      description: "Text alignment inside each item.",
      table: { defaultValue: { summary: "start" } },
    },
  },
} satisfies Meta<typeof StatList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "A figure out of a total, as on the Storybook guide pages, then the card band the Colophon uses.",
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "4rem", maxInlineSize: "60rem" }}>
      <StatList
        items={[
          { id: "pairs", value: 48, of: 48, label: "Contrast pairs passing", note: "Across 4 themes" },
          { id: "reviewed", value: 166, of: 193, label: "Components with a reviewed accessibility record" },
          { id: "tree", value: 149, of: 193, label: "Accessibility tree verified" },
        ]}
      />
      <StatList items={items} variant="card" align="center" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("term")).toHaveLength(3 + items.length);
    await expect(canvas.getAllByText("of 193")).toHaveLength(2);
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  args: { variant: "card" },
  globals: { forcedColors: "active" },
  parameters: {
    docs: { description: { story: "Forced-colors verification story." } },
  },
};
