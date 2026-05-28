import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { fn, userEvent, within } from "storybook/test";
import { CategoryFilter } from "./CategoryFilter";
import contract from "./CategoryFilter.contract.json";

const categories = [
  { value: "all", label: "All" },
  { value: "design", label: "Design" },
  { value: "accessibility", label: "Accessibility" },
  { value: "engineering", label: "Engineering" },
];

function CategoryFilterDemo(
  args: Omit<React.ComponentProps<typeof CategoryFilter>, "activeCategory" | "onCategoryChange"> & {
    activeCategory?: string;
  },
) {
  const [active, setActive] = useState(args.activeCategory ?? "all");
  return (
    <CategoryFilter
      {...args}
      activeCategory={active}
      onCategoryChange={(v) => {
        setActive(v);
        args.onCategoryChange?.(v);
      }}
    />
  );
}

const defaultArgs = {
  categories,
  activeCategory: "all",
  onCategoryChange: fn(),
  variant: "pills" as const,
  size: "md" as const,
};

const meta = {
  title: "Molecules/CategoryFilter",
  component: CategoryFilter,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    categories: {
      control: false,
      description: "Filter options (value + label)",
    },
    activeCategory: {
      control: "text",
      description: "Currently selected category value",
    },
    onCategoryChange: {
      action: "categoryChange",
      description: "Selection change handler",
    },
    variant: {
      control: "select",
      options: ["pills", "underline", "minimal"],
      description: "Visual treatment",
      table: { defaultValue: { summary: "pills" } },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Control size",
      table: { defaultValue: { summary: "md" } },
    },
    className: {
      control: "text",
      description: "Nav wrapper class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof CategoryFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <CategoryFilterDemo {...args} />,
};
export const Playground: Story = {
  render: (args) => <CategoryFilterDemo {...args} />,
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <CategoryFilterDemo
      categories={categories}
      activeCategory="design"
      onCategoryChange={fn()}
      variant="pills"
    />
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
  render: (args) => <CategoryFilterDemo {...args} />,
};
