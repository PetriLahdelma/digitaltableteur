import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import Button from "@dt/Button";
import Text from "@dt/Text";
import { ThemeProvider, useTheme } from "./ThemeProvider";
import contract from "./ThemeProvider.contract.json";

function ThemeToggleDemo() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div style={{ display: "grid", gap: "1rem", padding: "1.5rem" }}>
      <Text as="p" terminals="sans">
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
  argTypes: {
    className: {
      control: "text",
      description: "Provider wrapper class names",
      table: { disable: true },
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
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
export const Playground: Story = {
  tags: ["beta-matrix"],
  ...Default,
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
