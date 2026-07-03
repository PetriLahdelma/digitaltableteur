import { userEvent, within } from "storybook/test";
import { SkipLink } from "./SkipLink";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./SkipLink.contract.json";

const defaultArgs = {
  href: "#main-content",
  children: "Skip to main content",
};

const meta = {
  title: "Navigation/SkipLink",
  component: SkipLink,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-skip-link",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    href: {
      control: "text",
      description: "Target fragment for main content",
      table: { defaultValue: { summary: "#main-content" } },
    },
    children: { control: "text", description: "Visible link text on focus" },
    className: {
      control: "text",
      description: "Link class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  tags: ["beta-matrix"],
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => <SkipLink />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
