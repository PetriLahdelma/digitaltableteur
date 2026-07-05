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
      <Title level={1}>
        Hero shell
      </Title>
      <Text as="p">
        Composable full-bleed marketing hero wrapper.
      </Text>
    </Container>
  ),
};

const meta = {
  title: "Patterns/HeroSection",
  component: HeroSection,
  tags: ["beta", "autodocs"],
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
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // children keeps an authored text control (content slot).
  argTypes: {
    children: { control: "text", description: "Hero content slot" },
  },
  args: defaultArgs,
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
// background seeded to "image" with a real URL so backgroundImage has a live
// path; children seeded as text so the panel control matches what renders.
export const Playground: Story = {
  tags: ["beta-matrix"],
  args: {
    children: "Composable full-bleed marketing hero wrapper.",
    background: "image",
    backgroundImage: "/images/portfolio/helsinki-design-system/HDS_logo.png",
  },
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
        <Title level={1}>
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
