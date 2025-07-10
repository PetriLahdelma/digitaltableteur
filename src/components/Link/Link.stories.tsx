import React from "react";
import Link from "./Link";
import { Meta, StoryFn } from "@storybook/react-vite";
import { FaExternalLinkAlt } from "react-icons/fa";
import { within, userEvent } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";

export default {
  title: "Components/Link",
  component: Link,
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
Playground.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const link = await canvas.findByRole("link", { name: /playground link/i });
  await userEvent.click(link);
  // Focus test
  await userEvent.tab();
};

export const Small = Template.bind({});
Small.args = {
  size: "S",
  href: "https://example.com",
  children: "storyLinkSmall",
};
Small.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const link = await canvas.findByRole("link", { name: /small link/i });
  await userEvent.tab();
};

export const Medium = Template.bind({});
Medium.args = {
  size: "M",
  href: "https://example.com",
  children: "storyLinkMedium",
};
Medium.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const link = await canvas.findByRole("link", { name: /medium link/i });
  await userEvent.tab();
};

export const Large = Template.bind({});
Large.args = {
  size: "L",
  href: "https://example.com",
  children: "storyLinkLarge",
};
Large.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const link = await canvas.findByRole("link", { name: /large link/i });
  await userEvent.tab();
};
