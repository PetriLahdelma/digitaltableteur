import contract from "./NextLayout.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NextLayout } from "./NextLayout";
import Title from "@dt/Title";
import Text from "@dt/Text";

const meta: Meta<typeof NextLayout> = {
  argTypes: {},
  title: "Templates/NextLayout",
  component: NextLayout,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof NextLayout>;

const sampleMain = (
  <div style={{ padding: "var(--space-layout-24)" }}>
    <Title level={1} terminals="sans">
      Page content
    </Title>
    <Text as="p" terminals="sans">
      Production shell: skip link, header, main landmark, footer, chat, consent.
    </Text>
  </div>
);

export const Default: Story = {
  render: () => <NextLayout>{sampleMain}</NextLayout>,
};
export const Playground: Story = { ...Default };
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <NextLayout>{sampleMain}</NextLayout>,
};
export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  render: () => <NextLayout>{sampleMain}</NextLayout>,
};
