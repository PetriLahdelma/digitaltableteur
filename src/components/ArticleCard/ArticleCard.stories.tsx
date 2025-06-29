import React from "react";
import { within, userEvent } from "@storybook/testing-library";
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
Default.args = {
  title:
    "How to Build a Design System for Modern Teams and Ensure Consistency Across All Products",
  lead: "A practical and comprehensive guide to building, scaling, and maintaining a robust design system for modern teams, covering best practices, common pitfalls, and strategies for ensuring consistency and efficiency across all digital products and platforms.",
  link: "/blog/design-system-guide",
  readTime: "10 min read",
};
Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByRole("link", { name: /how to build a design system/i });
  await canvas.findByText(/10 min read/i);
  await canvas.findByText(/comprehensive guide to building/i);
  // Focus test
  await userEvent.tab();
};

export const WithCustomClass = Template.bind({});
WithCustomClass.args = {
  title: "Branding in 2025: Trends, Challenges, and Opportunities",
  lead: "Explore what the future holds for digital branding and identity, including emerging technologies, evolving consumer expectations, and strategies for building resilient brands in a rapidly changing landscape.",
  link: "/blog/branding-2025",
  readTime: "14 min read",
  className: "customClass",
};

WithCustomClass.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/branding in 2025/i);
  await canvas.findByText(/future holds for digital branding/i);
  await canvas.findByText(/14 min read/i);
  // Focus test
  await userEvent.tab();
};
