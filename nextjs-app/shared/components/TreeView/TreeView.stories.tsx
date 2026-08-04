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
      table: { defaultValue: { summary: "md" } },
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
/**
 * A node with `disabled` stays discoverable (focusable via the roving
 * tabindex, announced with aria-disabled) but cannot be selected.
 */
export const DisabledNode: Story = {
  args: {
    nodes: [
      {
        id: "components",
        label: "Components",
        children: [
          { id: "button", label: "Button" },
          { id: "legacy", label: "LegacyWidget", disabled: true, description: "retired" },
        ],
      },
    ],
    defaultExpandedIds: ["components"],
    defaultSelectedId: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const legacy = canvas.getByRole("treeitem", { name: /LegacyWidget/ });
    await expect(legacy).toHaveAttribute("aria-disabled", "true");
    legacy.focus();
    await userEvent.keyboard("{Enter}");
    await expect(legacy).toHaveAttribute("aria-selected", "false");
  },
};

/**
 * 312 nodes over three levels; only visible nodes render, so collapsed
 * branches cost nothing. Used as the representative large-tree performance
 * case (see spec Design notes).
 */
export const LargeTree: Story = {
  tags: ["example"],
  args: {
    "aria-label": "Large hierarchy",
    nodes: Array.from({ length: 8 }, (_, s) => ({
      id: `s${s}`,
      label: `Section ${s + 1}`,
      children: Array.from({ length: 6 }, (_, f) => ({
        id: `s${s}-f${f}`,
        label: `Folder ${s + 1}.${f + 1}`,
        children: Array.from({ length: 5 }, (_, l) => ({
          id: `s${s}-f${f}-l${l}`,
          label: `Item ${s + 1}.${f + 1}.${l + 1}`,
        })),
      })),
    })),
    defaultExpandedIds: ["s0"],
    defaultSelectedId: null,
  },
};

/**
 * The full keyboard contract driven by real key events: ArrowDown/ArrowUp
 * rove, ArrowRight expands then enters, ArrowLeft collapses or climbs to the
 * parent, Home/End jump, Enter selects.
 */
export const KeyboardInteraction: Story = {
  tags: ["example"],
  args: { defaultExpandedIds: [], defaultSelectedId: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const foundations = canvas.getByRole("treeitem", { name: "Foundations" });
    foundations.focus();
    // ArrowRight on a collapsed branch expands it without moving focus.
    await userEvent.keyboard("{ArrowRight}");
    await expect(foundations).toHaveAttribute("aria-expanded", "true");
    await expect(foundations).toHaveFocus();
    // Second ArrowRight enters the branch.
    await userEvent.keyboard("{ArrowRight}");
    const color = canvas.getByRole("treeitem", { name: "Color" });
    await expect(color).toHaveFocus();
    // Enter selects the focused leaf.
    await userEvent.keyboard("{Enter}");
    await expect(color).toHaveAttribute("aria-selected", "true");
    // ArrowLeft on a leaf climbs back to the parent; a second one collapses.
    await userEvent.keyboard("{ArrowLeft}");
    await expect(foundations).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(foundations).toHaveAttribute("aria-expanded", "false");
    // End jumps to the last visible node, Home returns to the first.
    await userEvent.keyboard("{End}");
    await expect(
      canvas.getByRole("treeitem", { name: "Components" }),
    ).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(foundations).toHaveFocus();
  },
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
};
