import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import AnimatedGlyphBackground from "./AnimatedGlyphBackground";
import type { AnimatedGlyphBackgroundProps } from "./AnimatedGlyphBackground";
import Title from "@dt/Title";
import Text from "@dt/Text";
import styles from "./AnimatedGlyphBackground.stories.module.css";

const meta: Meta<typeof AnimatedGlyphBackground> = {
  title: "Components/AnimatedGlyphBackground",
  component: AnimatedGlyphBackground,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    tone: {
      control: { type: "select" },
      options: ["muted", "primary", "accent", "contrast"],
      description: "Color tone for the animated glyph",
    },
    animate: {
      control: "boolean",
      description: "Toggle frame animation",
    },
    className: {
      control: "text",
      description: "Optional className override",
    },
  },
  args: {
    tone: "muted",
    animate: true,
  },
};

export default meta;

type Story = StoryObj<typeof AnimatedGlyphBackground>;

const StoryFrame: React.FC<AnimatedGlyphBackgroundProps> = (args) => {
  const { t } = useTranslation();

  return (
    <div className={styles.stage}>
      <AnimatedGlyphBackground {...args} />
      <div className={styles.content}>
        <Title level={2} size="L" terminals="serif">
          {t("homeCtaTitle", "Ready to create something extraordinary?")}
        </Title>
        <Text as="p" size="M" terminals="sans">
          {t("homeCtaLink", "Let's talk")}
        </Text>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <StoryFrame {...args} />,
};

export const PrimaryTone: Story = {
  args: {
    tone: "primary",
  },
  render: (args) => <StoryFrame {...args} />,
};

export const StaticFrame: Story = {
  args: {
    animate: false,
  },
  render: (args) => <StoryFrame {...args} />,
};
