import type { Meta, StoryObj } from "@storybook/react-vite";
import { Center } from "./Center";
import contract from "./Center.contract.json";

const defaultArgs = {
  children: (
    <span className="rounded bg-muted px-4 py-2 text-sm">Centered content</span>
  ),
};

const meta = {
  title: "Layout/Center",
  component: Center,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-center",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: {
      control: false,
      description: "Content to center inside the flex container",
    },
    className: {
      control: "text",
      description: "Additional CSS class names (often a height constraint)",
      table: { disable: true },
    },
    as: {
      control: "text",
      description: "Polymorphic wrapper element",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Center>;

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
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Center className="h-40 w-full max-w-md rounded border border-border bg-muted/30">
      <span className="text-sm text-muted-foreground">Empty-state slot</span>
    </Center>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
