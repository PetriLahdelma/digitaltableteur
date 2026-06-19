import contract from "./NextLayoutShell.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NextLayout } from "@dt/NextLayout";
import Title from "@dt/Title";
import Text from "@dt/Text";

const meta: Meta = {
  argTypes: {},
  tags: ["beta", "!autodocs"],
  title: "Templates/NextLayoutShell",
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-next-layout-shell",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Production app chrome from NextLayout (header, main, footer, chat).",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const shellContent = (
  <NextLayout>
    <div style={{ padding: "var(--space-layout-24)", maxWidth: "48rem" }}>
      <Title level={1} size="l" terminals="serif">
        Page content
      </Title>
      <Text as="p" size="m" terminals="sans">
        Same shell as app/layout.tsx — verify chrome and main landmark together.
      </Text>
    </div>
  </NextLayout>
);

export const Default: Story = {
  tags: ["beta-matrix"],
  render: () => shellContent,
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  ...Default,
};
export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true } },
  render: () => shellContent,
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: () => shellContent,
};
