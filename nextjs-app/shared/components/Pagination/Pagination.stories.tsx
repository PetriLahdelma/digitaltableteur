import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { fn, userEvent, within } from "storybook/test";
import { Pagination } from "./Pagination";
import contract from "./Pagination.contract.json";

function PaginationDemo(
  args: React.ComponentProps<typeof Pagination>,
) {
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
  title: "Molecules/Pagination",
  component: Pagination,
  tags: ["beta", "!autodocs"],
  parameters: {
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
  render: (args) => <PaginationDemo {...args} />,
};
export const Playground: Story = {
  render: (args) => <PaginationDemo {...args} />,
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => <PaginationDemo currentPage={3} totalPages={12} onPageChange={fn()} />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
  render: (args) => <PaginationDemo {...args} />,
};
