import contract from "./AnimatedGlyphBackground.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import AnimatedGlyphBackground from "./AnimatedGlyphBackground";
import type { AnimatedGlyphBackgroundProps } from "./AnimatedGlyphBackground";
import Title from "@dt/Title";
import Text from "@dt/Text";
import styles from "./AnimatedGlyphBackground.stories.module.css";

const meta: Meta<typeof AnimatedGlyphBackground> = {
  title: "Molecules/AnimatedGlyphBackground",
  component: AnimatedGlyphBackground,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-animated-glyph-background",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
  },
  argTypes: {
    tone: {
      control: { type: "select" },
      options: ["muted", "primary", "accent", "contrast"],
      description: "Color tone for the animated glyph",
      table: { defaultValue: { summary: "muted" } },
    },

    animate: { control: "boolean", description: "Toggle frame animation" },

    className: { control: "text", description: "Optional className override" },
  },
  args: { tone: "muted", animate: true },
};

export default meta;

type Story = StoryObj<typeof AnimatedGlyphBackground>;

const StoryFrame: React.FC<AnimatedGlyphBackgroundProps> = (args) => {
  const { t } = useTranslation();

  return (
    <div className={styles.stage}>
      <AnimatedGlyphBackground {...args} />
      <div className={styles.content}>
        <Title level={2} size="l" terminals="serif">
          {t("homeCtaTitle", "Ready to create something extraordinary?")}
        </Title>
        <Text as="p" size="m" terminals="sans">
          {t("homeCtaLink", "Let's talk")}
        </Text>
      </div>
    </div>
  );
};

export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <StoryFrame {...args} />,
};

export const PrimaryTone: Story = {
  args: { tone: "primary" },
  render: (args) => <StoryFrame {...args} />,
};

export const StaticFrame: Story = {
  args: { animate: false },
  render: (args) => <StoryFrame {...args} />,
};

export const Playground = Default;
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
