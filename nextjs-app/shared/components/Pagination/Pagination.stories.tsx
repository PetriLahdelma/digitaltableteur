import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { fn, userEvent, within } from "storybook/test";
import { Pagination } from "./Pagination";
import contract from "./Pagination.contract.json";

function PaginationDemo(args: React.ComponentProps<typeof Pagination>) {
  const [page, setPage] = useState(args.currentPage ?? 1);
  return (
    <Pagination
      {...args}
      currentPage={page}
      onPageChange={(p) => {
        setPage(p);
        args.onPageChange?.(p);
      }}
    />
  );
}

const defaultArgs = {
  currentPage: 2,
  totalPages: 8,
  onPageChange: fn(),
  siblingCount: 1,
};

const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-pagination",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    currentPage: { control: "number", description: "Active page (1-indexed)" },
    totalPages: { control: "number", description: "Total page count" },
    onPageChange: {
      action: "pageChange",
      description: "Page change callback",
    },
    siblingCount: {
      control: "number",
      description: "Pages shown on each side of current",
      table: { defaultValue: { summary: "1" } },
    },
    className: {
      control: "text",
      description: "Nav wrapper class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <PaginationDemo {...args} />,
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <PaginationDemo {...args} />,
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
    <PaginationDemo currentPage={3} totalPages={12} onPageChange={fn()} />
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
  render: (args) => <PaginationDemo {...args} />,
};
