import type { Meta, StoryObj } from "@storybook/react-vite";
import { FadeIn } from "./FadeIn";
import Text from "@dt/Text";
import contract from "./FadeIn.contract.json";

const defaultArgs = {
  direction: "up" as const,
  children: (
    <Text as="p" terminals="sans">
      Fades in on scroll
    </Text>
  ),
};

const meta = {
  title: "Site/Animations/FadeIn",
  component: FadeIn,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: { control: false, description: "Content revealed on scroll" },
    direction: {
      control: "select",
      options: ["up", "down", "left", "right", "none"],
      description: "Motion direction",
      table: { defaultValue: { summary: "up" } },
    },
    delay: { control: "number", description: "Animation delay in seconds" },
    duration: { control: "number", description: "Tween duration in seconds" },
    distance: { control: "number", description: "Travel distance in pixels" },
    threshold: {
      control: "text",
      description: "ScrollTrigger position",
      table: { disable: true },
    },
    className: {
      control: "text",
      description: "Wrapper class names",
      table: { disable: true },
    },
    as: {
      control: "text",
      description: "Polymorphic element",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof FadeIn>;

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
    <FadeIn direction="up">
      <Text as="p" terminals="sans">
        Production scroll reveal used across marketing sections.
      </Text>
    </FadeIn>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
