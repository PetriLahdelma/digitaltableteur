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
  args: Omit<
    React.ComponentProps<typeof CategoryFilter>,
    "activeCategory" | "onCategoryChange"
  > & {
    activeCategory?: string;
  },
) {
  const [active, setActive] = useState(args.activeCategory ?? "all");
  // Sync panel edits in: activeCategory would otherwise be mount-only state
  // and its Controls row would drive nothing.
  React.useEffect(() => {
    if (args.activeCategory) setActive(args.activeCategory);
  }, [args.activeCategory]);
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
  title: "Site/CategoryFilter",
  component: CategoryFilter,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-category-filter",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
} satisfies Meta<typeof CategoryFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <CategoryFilterDemo {...args} />,
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <CategoryFilterDemo {...args} />,
  argTypes: {
    categories: {
      control: { type: "select" },
      options: ["all", "few"],
      mapping: {
        all: categories,
        few: categories.slice(0, 3),
      },
      description:
        "Filter categories (value, label). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "CategoryOption[]" } },
    },
  },
  args: {
    ...defaultArgs,
    categories: "all" as never,
  },
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
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
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
  render: (args) => <CategoryFilterDemo {...args} />,
};
