import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { NextLayout } from "./NextLayout";
import Title from "@dt/Title";
import Text from "@dt/Text";
import contract from "./NextLayout.contract.json";

const sampleMain = (
  <div style={{ padding: "var(--space-layout-24)" }}>
    <Title level={1}>
      Page content
    </Title>
    <Text as="p">
      Production shell: skip link, header, main landmark, footer, chat, consent.
    </Text>
  </div>
);

const meta = {
  title: "Templates/NextLayout",
  component: NextLayout,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-next-layout",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: {},
} satisfies Meta<typeof NextLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: () => <NextLayout>{sampleMain}</NextLayout>,
};
// Args-driven children (no hardcoded JSX children, which would override the
// panel's text control and turn it into a liar).
export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <NextLayout {...args} />,
  args: {
    children: "Page content rendered inside the production shell.",
  },
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <NextLayout>{sampleMain}</NextLayout>,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: () => <NextLayout>{sampleMain}</NextLayout>,
};
