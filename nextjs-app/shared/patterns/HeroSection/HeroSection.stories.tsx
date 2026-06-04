import { HeroSection } from "./HeroSection";
import { Container } from "../../components/Container";
import Title from "@dt/Title";
import Text from "@dt/Text";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./HeroSection.contract.json";

const defaultArgs = {
  background: "gradient" as const,
  minHeight: "hero" as const,
  align: "center" as const,
  justify: "center" as const,
  children: (
    <Container size="lg">
      <Title level={1} terminals="sans">
        Hero shell
      </Title>
      <Text as="p" terminals="sans">
        Composable full-bleed marketing hero wrapper.
      </Text>
    </Container>
  ),
};

const meta = {
  title: "Patterns/HeroSection",
  component: HeroSection,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-hero-section",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: { control: false, description: "Hero content slot" },
    background: {
      control: "select",
      options: ["gradient", "solid", "image", "transparent"],
      description: "Background treatment",
      table: { defaultValue: { summary: "gradient" } },
    },
    backgroundImage: {
      control: "text",
      description: "Image URL when background is image",
    },
    minHeight: {
      control: "select",
      options: ["screen", "hero", "half", "auto"],
      description: "Minimum block height",
      table: { defaultValue: { summary: "hero" } },
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
      description: "Vertical alignment of content",
      table: { defaultValue: { summary: "center" } },
    },
    justify: {
      control: "select",
      options: ["start", "center", "end"],
      description: "Horizontal alignment of content",
    },
    className: {
      control: "text",
      description: "Section class names",
      table: { disable: true },
    },
    as: {
      control: "text",
      description: "Polymorphic element",
      table: { disable: true },
    },
    ariaLabel: {
      control: "text",
      description: "Accessible name",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  tags: ["beta-matrix"],
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <HeroSection
      background="gradient"
      minHeight="half"
      align="center"
      justify="center"
    >
      <Container size="lg">
        <Title level={1} terminals="sans">
          Marketing hero frame
        </Title>
      </Container>
    </HeroSection>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
