import React from "react";
import ArticleCard from "./ArticleCard";

export default {
  title: "Components/ArticleCard",
  component: ArticleCard,
  args: {
    title: "How to Build a Design System",
    lead: "A practical guide to building and scaling a design system for modern teams.",
    link: "/blog/design-system-guide",
    readTime: "5 min read",
    colorClass: "teal",
  },
  argTypes: {
    title: { control: "text" },
    lead: { control: "text" },
    link: { control: "text" },
    readTime: { control: "text" },
    colorClass: {
      control: {
        type: "select",
        options: ["teal", "purple", "blue", "orange", "green"],
      },
    },
    className: { control: "text" },
  },
};

const Template: any = (args: any) => <ArticleCard {...args} />;

export const Default = Template.bind({});

export const WithCustomClass = Template.bind({});
WithCustomClass.args = {
  title: "Branding in 2025",
  lead: "What the future holds for digital branding and identity.",
  link: "/blog/branding-2025",
  readTime: "7 min read",
  colorClass: "purple",
  className: "custom-class",
};
