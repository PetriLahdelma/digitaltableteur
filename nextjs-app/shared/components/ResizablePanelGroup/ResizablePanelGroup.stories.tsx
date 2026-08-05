import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import Text from "@dt/Text";
import Title from "@dt/Title";
import { ResizablePanelGroup } from "./ResizablePanelGroup";
import contract from "./ResizablePanelGroup.contract.json";

const panel = (title: string, body: string) => (
  <div
    style={{
      display: "grid",
      gap: "var(--space-internal-8)",
      padding: "var(--space-internal-16)",
    }}
  >
    <Title as="h3" size="xs">
      {title}
    </Title>
    <Text as="p" size="s">
      {body}
    </Text>
  </div>
);

const panels = [
  {
    id: "navigation",
    ariaLabel: "Navigation",
    content: panel("Navigation", "Browse system foundations and components."),
    initialSize: 32,
    minSize: 20,
  },
  {
    id: "content",
    ariaLabel: "Content",
    content: panel("Content", "Inspect the selected component documentation."),
    initialSize: 68,
    minSize: 30,
  },
];

const meta = {
  title: "Layout/ResizablePanelGroup",
  component: ResizablePanelGroup,
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: { description: { component: contract.description } },
  },
  tags: ["beta", "autodocs"],
  args: {
    orientation: "horizontal",
    keyboardStep: 5,
    panels,
  },
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Resize axis.",
      table: { defaultValue: { summary: "horizontal" } },
    },
    keyboardStep: {
      control: "number",
      description: "Keyboard increment in percentage points.",
      table: { defaultValue: { summary: "5" } },
    },
    panels: { table: { disable: true } },
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ["beta-matrix"] };
export const Playground: Story = { tags: ["beta-matrix"] };
export const Example: Story = {
  tags: ["beta-matrix", "example"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole("separator");
    separator.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(separator).toHaveAttribute("aria-valuenow", "37");
  },
};
export const Vertical: Story = { args: { orientation: "vertical" } };

/**
 * The full separator keyboard contract with real key events: arrows step by
 * keyboardStep, Home collapses the leading panel to its minimum, End grows it
 * to the pair maximum, and every position is clamped to the min sizes and
 * announced through aria-valuenow.
 */
export const KeyboardResize: Story = {
  tags: ["example"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole("separator");
    separator.focus();
    // Home: leading panel collapses to its minSize (20).
    await userEvent.keyboard("{Home}");
    await expect(separator).toHaveAttribute("aria-valuenow", "20");
    // Arrow steps by keyboardStep from the minimum.
    await userEvent.keyboard("{ArrowRight}");
    await expect(separator).toHaveAttribute("aria-valuenow", "25");
    // End: leading panel takes everything the trailing minSize (30) allows.
    await userEvent.keyboard("{End}");
    await expect(separator).toHaveAttribute("aria-valuenow", "70");
    // Clamped: another increase cannot pass the trailing panel's minimum.
    await userEvent.keyboard("{ArrowRight}");
    await expect(separator).toHaveAttribute("aria-valuenow", "70");
    // ArrowLeft steps back down.
    await userEvent.keyboard("{ArrowLeft}");
    await expect(separator).toHaveAttribute("aria-valuenow", "65");
  },
};

/**
 * Three panels produce two independent separators; each pair clamps to its
 * own minimums.
 */
export const ThreePanels: Story = {
  args: {
    panels: [
      {
        id: "tree",
        ariaLabel: "Tree",
        content: panel("Tree", "Hierarchy."),
        initialSize: 25,
        minSize: 15,
      },
      {
        id: "editor",
        ariaLabel: "Editor",
        content: panel("Editor", "Working surface."),
        initialSize: 50,
        minSize: 30,
      },
      {
        id: "inspector",
        ariaLabel: "Inspector",
        content: panel("Inspector", "Details."),
        initialSize: 25,
        minSize: 15,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("separator")).toHaveLength(2);
    await expect(canvas.getAllByRole("region")).toHaveLength(3);
  },
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
