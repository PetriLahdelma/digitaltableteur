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
  tags: ["alpha", "autodocs"],
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
    },
    keyboardStep: {
      control: "number",
      description: "Keyboard increment in percentage points.",
    },
    panels: { table: { disable: true } },
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = {
  tags: ["example"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole("separator");
    separator.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(separator).toHaveAttribute("aria-valuenow", "37");
  },
};
export const Vertical: Story = { args: { orientation: "vertical" } };
export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
};
