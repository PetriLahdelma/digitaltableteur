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
    // This shell renders <NextLayout>, so it inherits NextLayout's React.lazy
    // chat toggle and the same capture race: cold page = no button, warmed page
    // = button, so the AT snapshot flips with worker cache warmth. NextLayout
    // already declares this wait; the shell needs it for the same reason. The
    // race only surfaced once the snapshot-dir resolver started resolving
    // templates/ at all — before that this component was never captured.
    atSnapshot: { waitForSelector: "button[aria-label^=\"Chat\"]" },
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
      <Title level={1} size="l">
        Page content
      </Title>
      <Text as="p" size="m">
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
