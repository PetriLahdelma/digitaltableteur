import React from "react";
import ArticleCard from "./ArticleCard";

export default {
  title: "Components/ArticleCard",
  component: ArticleCard,
  args: {
    title:
      "How to Build a Design System for Modern Teams and Ensure Consistency Across All Products",
    lead: "A practical and comprehensive guide to building, scaling, and maintaining a robust design system for modern teams, covering best practices, common pitfalls, and strategies for ensuring consistency and efficiency across all digital products and platforms.",
    link: "/blog/design-system-guide",
    readTime: "10 min read",
  },
  argTypes: {
    title: { control: "text" },
    lead: { control: "text" },
    link: { control: "text" },
    readTime: { control: "text" },
    className: { control: "text" },
  },
};

const Template: any = (args: any) => <ArticleCard {...args} />;

export const Default = Template.bind({});

export const WithCustomClass = Template.bind({});
WithCustomClass.args = {
  title: "Branding in 2025: Trends, Challenges, and Opportunities",
  lead: "Explore what the future holds for digital branding and identity, including emerging technologies, evolving consumer expectations, and strategies for building resilient brands in a rapidly changing landscape.",
  link: "/blog/branding-2025",
  readTime: "14 min read",
  className: "customClass",
};
