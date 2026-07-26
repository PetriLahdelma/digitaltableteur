import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { TreeView, type TreeViewNode } from "./TreeView";
import contract from "./TreeView.contract.json";

const nodes: TreeViewNode[] = [
  {
    id: "foundations",
    label: "Foundations",
    children: [
      { id: "color", label: "Color" },
      { id: "typography", label: "Typography" },
    ],
  },
  {
    id: "components",
    label: "Components",
    children: [
      { id: "button", label: "Button", description: "Stable" },
      { id: "data-table", label: "DataTable", description: "Alpha" },
    ],
  },
];

const meta = {
  title: "Navigation/TreeView",
  component: TreeView,
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: { description: { component: contract.description } },
  },
  tags: ["alpha", "autodocs"],
  args: {
    "aria-label": "Design system",
    defaultExpandedIds: ["components"],
    defaultSelectedId: "button",
    nodes,
    size: "md",
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Tree density.",
    },
    nodes: { table: { disable: true } },
    defaultExpandedIds: { table: { disable: true } },
    defaultSelectedId: { table: { disable: true } },
  },
} satisfies Meta<typeof TreeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = {
  tags: ["example"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const components = canvas.getByRole("treeitem", { name: "Components" });
    components.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(
      canvas.getByRole("treeitem", { name: /Button/ }),
    ).toHaveFocus();
  },
};
export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
};
