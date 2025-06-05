import React from "react";
import Link from "./Link";
import { Meta, StoryFn } from "@storybook/react-webpack5";

export default {
  title: "Components/Link",
  component: Link,
  argTypes: {
    size: {
      control: {
        type: "select",
        options: ["S", "M", "L"],
      },
    },
    href: { control: "text" },
  },
} as Meta;

const Template: StoryFn<typeof Link> = (args) => <Link {...args} />;

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

export const ExternalLink = Template.bind({});
ExternalLink.args = {
  size: "M",
  href: "https://external.com",
  children: "External Link",
};
