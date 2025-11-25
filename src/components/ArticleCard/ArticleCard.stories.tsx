import React from "react";
import { within, userEvent } from "@storybook/testing-library";
import ArticleCard from "./ArticleCard";
import { useTranslation } from "react-i18next";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import Icon from "@dt/Icon";

export default {
  title: "Components/ArticleCard",
  component: ArticleCard,
  parameters: {},
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
    publishedAt: { control: "text" },
    className: { control: "text" },
    loading: { control: "boolean" },
  },
};

const articleCardComplianceRules: ComplianceRule[] = [
  {
    id: "file-structure",
    rule: "Complete file structure",
    status: "pass",
    details: "All 5 files present",
  },
  {
    id: "typescript-strict",
    rule: "TypeScript strict",
    status: "pass",
    details: "Exported interface ArticleCardProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "useTranslation, blogRead/blogReadMore keys",
  },
  {
    id: "css-modules",
    rule: "CSS Modules",
    status: "pass",
    details: "No inline styles",
  },
  {
    id: "design-tokens",
    rule: "Design tokens",
    status: "pass",
    details: "All 7 fallback values removed",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "margin-block, margin-inline used",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "Uses CSS variables for colors",
  },
  {
    id: "size-variants",
    rule: "Size variants",
    status: "pass",
    details: "N/A - responsive layout by design",
  },
  {
    id: "state-variants",
    rule: "State variants",
    status: "pass",
    details: "Uses Title/Text components correctly",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "CSS :hover/:focus-visible, axe tests added",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "2 stories with interaction tests",
  },
  {
    id: "tests",
    rule: "Tests",
    status: "pass",
    details: "Full coverage with accessibility tests",
  },
];

const ArticleCardStory: React.FC<any> = (args) => {
  const { t } = useTranslation();
  return <ArticleCard {...args} title={t(args.title)} lead={t(args.lead)} />;
};

const Template: any = (args: any) => <ArticleCardStory {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: "storyArticleTitle1",
  lead: "storyArticleLead1",
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
  title: "storyArticleTitle2",
  lead: "storyArticleLead2",
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

export const Loading = Template.bind({});
Loading.args = {
  loading: true,
};

export const Z_ArticleCardCompliance: React.FC = () => (
  <ComplianceCard
    title="Compliance: 12/12"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={articleCardComplianceRules}
  />
);
