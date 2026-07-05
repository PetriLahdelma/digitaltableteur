import { Section } from "./Section";
import Text from "@dt/Text";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./Section.contract.json";

const defaultArgs = {
  spacing: "md" as const,
  background: "default" as const,
  children: (
    <Text as="p">
      Semantic section with tokenized vertical spacing.
    </Text>
  ),
};

const meta = {
  title: "Layout/Section",
  component: Section,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-section",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // children keeps an authored text control (content slot).
  argTypes: {
    children: { control: "text", description: "Section content" },
  },
  args: defaultArgs,
} satisfies Meta<typeof Section>;

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
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Section spacing="lg" background="muted" id="example-section">
      <Text as="p">
        Used across marketing patterns for vertical rhythm.
      </Text>
    </Section>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};

/** The spacing prop sets the responsive vertical band: sm for tight utility strips, md for standard content, lg and xl for showpiece sections. */
export const SpacingBands: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "The spacing prop sets the responsive vertical band: sm for tight utility strips, md for standard content, lg and xl for showpiece sections." } },
  },
  render: () => (
    <div style={{ border: "1px dashed var(--color-border, #999)" }}>
      {(["sm", "md", "lg"] as const).map((spacing) => (
        <Section key={spacing} spacing={spacing}>
          <div style={{ borderBlock: "1px dashed var(--color-border, #999)", textAlign: "center" }}>spacing {spacing}</div>
        </Section>
      ))}
    </div>
  ),
};

/** hero keeps a generous top and tight bottom; the next section takes follow (no top padding) so the page never double-gaps below the hero. */
export const HeroFollowPair: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "hero keeps a generous top and tight bottom; the next section takes follow (no top padding) so the page never double-gaps below the hero." } },
  },
  render: () => (
    <div style={{ border: "1px dashed var(--color-border, #999)" }}>
      <Section spacing="hero">
        <div style={{ textAlign: "center", fontWeight: 600 }}>Hero band (spacing hero)</div>
      </Section>
      <Section spacing="follow">
        <div style={{ textAlign: "center" }}>First content band (spacing follow)</div>
      </Section>
    </div>
  ),
};

/** The background prop swaps the band surface; inverse flips the text tokens with it. */
export const Backgrounds: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "The background prop swaps the band surface; inverse flips the text tokens with it. Alternate muted sparingly to group content." } },
  },
  render: () => (
    <div>
      {(["default", "muted", "inverse"] as const).map((background) => (
        <Section key={background} spacing="sm" background={background}>
          <div style={{ textAlign: "center" }}>background {background}</div>
        </Section>
      ))}
    </div>
  ),
};
