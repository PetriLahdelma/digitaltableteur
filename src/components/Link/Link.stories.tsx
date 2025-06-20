import React from "react";
import Link from "./Link";
import { Meta, StoryFn } from "@storybook/react-webpack5";
import { FaExternalLinkAlt } from "react-icons/fa";

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

const Template: StoryFn<typeof Link> = (args) => <Link {...args} />;

export const Playground = Template.bind({});
Playground.args = {
  size: "M",
  href: "https://example.com",
  children: "Playground Link",
};

export const Small = Template.bind({});
Small.args = {
  size: "S",
  href: "https://example.com",
  children: "Small Link",
};

export const Medium = Template.bind({});
Medium.args = {
  size: "M",
  href: "https://example.com",
  children: "Medium Link",
};

export const Large = Template.bind({});
Large.args = {
  size: "L",
  href: "https://example.com",
  children: "Large Link",
};
