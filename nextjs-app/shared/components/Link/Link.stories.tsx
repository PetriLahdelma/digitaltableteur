import contract from "./Link.contract.json";
import React from "react";
import Link from "@dt/Link";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import schema from "./schema.json";

const meta: Meta<typeof Link> = {
  title: "Atoms/Link",
  component: Link,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=371-30",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    size: {
      control: { type: "inline-radio" },
      options: ["sm", "md", "lg"],
      description: "Size.",
      table: { defaultValue: { summary: "md" } },
    },
    underline: {
      control: { type: "inline-radio" },
      options: ["always", "hover", "none"],
      description:
        "Wavy underline mode: permanent, revealed on hover/focus (nav lists), or omitted.",
      table: { defaultValue: { summary: "always" } },
    },
    href: {
      control: "text",
      description: "Destination URL; sanitised, and external links get rel=noopener noreferrer.",
    },
    children: { control: "text", description: "Link text." },
    className: { control: "text", description: "Additional CSS classes." },
  },
};

export default meta;

type Story = StoryObj<typeof Link>;

const LinkStory: React.FC<React.ComponentProps<typeof Link>> = (args) => {
  const { t } = useTranslation();
  return <Link {...args}>{t(args.children as string)}</Link>;
};

export const Playground: Story = {
  render: (args) => <LinkStory {...args} />,
  args: { size: "md", href: "https://example.com", children: "storyLinkPlayground" },
};

export const Default = Playground;

const SizesContent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "baseline" }}>
      <Link size="sm" href="/about">
        {t("storyLinkSmall")}
      </Link>
      <Link size="md" href="/about">
        {t("storyLinkMedium")}
      </Link>
      <Link size="lg" href="/about">
        {t("storyLinkLarge")}
      </Link>
    </div>
  );
};

export const Sizes: Story = { render: () => <SizesContent /> };

const UnderlineModesContent: React.FC = () => (
  <div style={{ display: "flex", gap: "1.5rem", alignItems: "baseline" }}>
    <Link href="/about" underline="always">
      Always underlined
    </Link>
    <Link href="/about" underline="hover">
      Underline on hover
    </Link>
    <Link href="/about" underline="none">
      No underline
    </Link>
  </div>
);

export const UnderlineModes: Story = { render: () => <UnderlineModesContent /> };

export const External: Story = {
  render: () => (
    <Link href="https://example.com" size="md">
      External example
    </Link>
  ),
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => (
    <LinkStory
      size="md"
      href="https://www.digitaltableteur.com"
      children="storyLinkPlayground"
    />
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  tags: ["beta-matrix"],
  render: (args) => <LinkStory {...args} />,
  args: { size: "md", href: "https://example.com", children: "storyLinkPlayground" },
};
