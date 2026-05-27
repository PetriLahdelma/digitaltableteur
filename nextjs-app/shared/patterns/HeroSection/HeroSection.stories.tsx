import contract from "./HeroSection.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HeroSection } from "./HeroSection";
import Title from "@dt/Title";
import Text from "@dt/Text";

const meta: Meta<typeof HeroSection> = {
  title: "Patterns/HeroSection",
  component: HeroSection,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    background: {
      control: "select",
      options: ["gradient", "solid", "image", "transparent"],
    },

    minHeight: {
      control: "select",
      options: ["screen", "hero", "half", "auto"],
    },

    align: { control: "select", options: ["start", "center", "end"] },

    justify: { control: "select", options: ["start", "center", "end"] },
  },
};

export default meta;
type Story = StoryObj<typeof HeroSection>;

const sampleContent = (
  <>
    <Title level={1} terminals="sans">
      Hero shell
    </Title>
    <Text as="p" terminals="sans">
      Production hero wrapper used by HomeHero.
    </Text>
  </>
);

export const Default: Story = {
  args: {
    background: "transparent",
    minHeight: "half",
    align: "center",
    justify: "center",
    children: sampleContent,
  },
};

export const Playground: Story = { ...Default };
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <HeroSection
      minHeight="half"
      align="center"
      justify="center"
      background="transparent"
    >
      {sampleContent}
    </HeroSection>
  ),
};
export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  ...Default,
};
