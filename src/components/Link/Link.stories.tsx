import React from "react";
import Link from "./Link";
import { Meta, StoryFn } from "@storybook/react-vite";
import { FaExternalLinkAlt } from "react-icons/fa";
import { within, userEvent } from "@storybook/testing-library";

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

const Template: StoryFn<typeof Link> = (
  args: React.ComponentProps<typeof Link>,
) => <Link {...args} />;

export const Playground = Template.bind({});
Playground.args = {
  size: "M",
  href: "https://example.com",
  children: "Playground Link",
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
  children: "Small Link",
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
  children: "Medium Link",
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
  children: "Large Link",
};
Large.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const link = await canvas.findByRole("link", { name: /large link/i });
  await userEvent.tab();
};
