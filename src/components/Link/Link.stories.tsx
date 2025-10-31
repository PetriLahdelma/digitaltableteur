import React from "react";
import Link from "./Link";
import { Meta, StoryFn } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";

export default {
  title: "Components/Link",
  component: Link,
  parameters: {
    test: { disable: true },
    visualRegression: { disable: true },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["S", "M", "L"],
      description: "Size of the link",
    },
    href: { control: "text", description: "Link URL" },
    children: { control: "text", description: "Link text" },
    className: { control: "text", description: "Custom class name" },
  },
} as Meta;

const LinkStory: React.FC<React.ComponentProps<typeof Link>> = (args) => {
  const { t } = useTranslation();
  return <Link {...args}>{t(args.children as string)}</Link>;
};

const Template: StoryFn<typeof Link> = (
  args: React.ComponentProps<typeof Link>,
) => <LinkStory {...args} />;

export const Playground = Template.bind({});
Playground.args = {
  size: "M",
  href: "https://example.com",
  children: "storyLinkPlayground",
};
export const Small = Template.bind({});
Small.args = {
  size: "S",
  href: "https://example.com",
  children: "storyLinkSmall",
};

export const Medium = Template.bind({});
Medium.args = {
  size: "M",
  href: "https://example.com",
  children: "storyLinkMedium",
};

export const Large = Template.bind({});
Large.args = {
  size: "L",
  href: "https://example.com",
  children: "storyLinkLarge",
};
