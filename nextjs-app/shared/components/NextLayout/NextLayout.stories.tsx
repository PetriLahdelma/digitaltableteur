import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { NextLayout } from "./NextLayout";
import Title from "@dt/Title";
import Text from "@dt/Text";
import contract from "./NextLayout.contract.json";

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

const meta = {
  title: "Templates/NextLayout",
  component: NextLayout,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    className: { control: "text", description: "Layout wrapper class names", table: { disable: true } },
  },
  args: {},
} satisfies Meta<typeof NextLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <NextLayout>{sampleMain}</NextLayout>,
};
export const Playground: Story = { ...Default };

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <NextLayout>{sampleMain}</NextLayout>,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  render: () => <NextLayout>{sampleMain}</NextLayout>,
};
