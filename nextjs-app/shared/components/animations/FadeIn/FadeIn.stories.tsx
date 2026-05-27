import contract from "./FadeIn.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FadeIn } from "./FadeIn";
import Text from "@dt/Text";

const meta: Meta<typeof FadeIn> = {
  title: "Atoms/Animations/FadeIn",
  component: FadeIn,
  tags: ["!autodocs"],
  parameters: { contractStatus: contract.status, a11y: { test: "error" } },
  argTypes: {
    direction: {
      control: "select",
      options: ["up", "down", "left", "right", "none"],
    },

    delay: { control: "number" },

    duration: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof FadeIn>;

export const Default: Story = {
  args: {
    direction: "up",
    children: (
      <Text as="p" terminals="sans">
        Fades in on scroll
      </Text>
    ),
  },
};

export const Playground: Story = { ...Default };
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <FadeIn direction="up">
      <Text as="p" terminals="sans">
        Production scroll reveal used across marketing sections.
      </Text>
    </FadeIn>
  ),
};
export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  ...Default,
};
