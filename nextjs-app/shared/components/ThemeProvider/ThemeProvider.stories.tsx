import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { userEvent, within } from "storybook/test";
import Button from "@dt/Button";
import Text from "@dt/Text";
import { ThemeProvider, useTheme } from "./ThemeProvider";
import contract from "./ThemeProvider.contract.json";

function ThemeToggleDemo() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div style={{ display: "grid", gap: "1rem", padding: "1.5rem" }}>
      <Text as="p">
        Active theme: <strong>{theme}</strong>
      </Text>
      <Button variant="primary" onClick={toggleTheme}>
        Cycle theme
      </Button>
    </div>
  );
}

const meta = {
  title: "Foundations/ThemeProvider",
  component: ThemeProvider,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-theme-provider",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the children slot keeps a mapping preset so the theme-reading demo stays
  // available in the panel.
  argTypes: {
    children: {
      control: { type: "select" },
      options: ["toggleDemo", "plainText"],
      mapping: {
        toggleDemo: <ThemeToggleDemo />,
        plainText: "Themed subtree content",
      },
      description:
        "Subtree that receives the theme context. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
  },
  args: {},
} satisfies Meta<typeof ThemeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: () => (
    <ThemeProvider>
      <ThemeToggleDemo />
    </ThemeProvider>
  ),
};
// Args-driven so forcedTheme and the children preset actually drive the
// canvas (the shared render hardcodes its subtree).
export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <ThemeProvider {...args} />,
  args: {
    children: "toggleDemo" as unknown as ReactNode,
  },
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button"));
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <ThemeProvider>
      <ThemeToggleDemo />
    </ThemeProvider>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: () => (
    <ThemeProvider>
      <ThemeToggleDemo />
    </ThemeProvider>
  ),
};
