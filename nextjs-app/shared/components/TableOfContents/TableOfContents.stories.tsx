import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { expect, userEvent, within } from "storybook/test";

import { TableOfContents, type TOCItem } from "./TableOfContents";
import contract from "./TableOfContents.contract.json";

const items: TOCItem[] = [
  { id: "overview", text: "Overview", level: 2 },
  { id: "setup", text: "Setup", level: 3 },
  { id: "api", text: "API", level: 2 },
  { id: "limits", text: "Known limits", level: 3 },
];

function Demo(args: ComponentProps<typeof TableOfContents>) {
  const [activeId, setActiveId] = useState(args.activeId ?? "overview");
  return (
    <TableOfContents
      {...args}
      activeId={activeId}
      onItemClick={(id) => {
        setActiveId(id);
        args.onItemClick?.(id);
      }}
    />
  );
}

const meta = {
  title: "Navigation/TableOfContents",
  component: TableOfContents,
  tags: ["alpha", "autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    items: {
      control: { type: "select" },
      options: ["default", "short"],
      mapping: { default: items, short: items.slice(0, 2) },
      description: "Heading entries to render, in document order.",
      table: { category: "Content", type: { summary: "TOCItem[]" } },
    },
    className: {
      control: "text",
      description: "Additional CSS class names.",
      table: { category: "Appearance" },
    },
  },
  args: {
    items: "default" as unknown as ComponentProps<typeof TableOfContents>["items"],
    activeId: "overview",
    sticky: false,
    className: "",
  },
} satisfies Meta<typeof TableOfContents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {
  render: (args) => <Demo {...args} />,
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const api = canvas.getByRole("button", { name: "API" });
  await userEvent.click(api);
  await expect(api).toHaveAttribute("aria-current", "location");
};

export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Demo items={items} activeId="setup" sticky />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: {
    items,
    activeId: "api",
  },
};
