import contract from "./AuthorBio.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import AuthorBio from "@dt/AuthorBio";
import { getAuthors } from "../../data/authors";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import Icon from "@dt/Icon";

const meta: Meta<typeof AuthorBio> = {
  argTypes: {
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      className: { control: "text", description: "Optional CSS class for styling extension", table: { category: "Advanced" } },
      heading: { control: "text", description: "Optional custom heading text (defaults to author.name)", table: { category: "Content" } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      slug: { control: "text", description: "Author slug to fetch data from authors.ts", table: { category: "Content" } },
      style: { table: { disable: true } }
},
  title: "Site/AuthorBio",
  component: AuthorBio,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-author-bio",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof AuthorBio>;

const [defaultAuthor] = getAuthors();

export const Default: Story = {
  tags: ["beta-matrix"],
  args: { slug: defaultAuthor?.slug ?? "petri-lahdelma" },
};

export const CustomHeading: Story = {
  args: {
    slug: defaultAuthor?.slug ?? "petri-lahdelma",
    heading: "Meet the author",
  },
};

const authorBioComplianceRules: ComplianceRule[] = [
  {
    id: "file-structure",
    rule: "Complete file structure",
    status: "pass",
    details:
      "All files present: .tsx, .module.css, .stories.tsx, .test.tsx, index.ts",
  },
  {
    id: "typescript-strict",
    rule: "TypeScript strict",
    status: "pass",
    details: "export interface, JSDoc comments, displayName",
  },
  {
    id: "translation-support",
    rule: "Translation support (i18n)",
    status: "pass",
    details: "useTranslation(), keys in all 3 locales (EN/FI/SV)",
  },
  {
    id: "css-modules",
    rule: "CSS Modules only",
    status: "pass",
    details: "No inline styles found",
  },
  {
    id: "design-tokens",
    rule: "Design tokens (no fallbacks)",
    status: "pass",
    details: "All fallbacks removed, consistent token usage",
  },
  {
    id: "logical-properties",
    rule: "Logical CSS properties",
    status: "pass",
    details: "Uses margin-block, padding-inline correctly",
  },
  {
    id: "theme-support",
    rule: "Theme support (4 themes)",
    status: "pass",
    details: "Consistent tokens: --color-text, --main-body-background-color",
  },
  {
    id: "component-reuse",
    rule: "Component reuse (Title/Text)",
    status: "pass",
    details: "Uses Avatar, Text, Title components",
  },
  {
    id: "accessibility",
    rule: "Accessibility (a11y)",
    status: "pass",
    details:
      "Semantic <section>, aria-label, heading hierarchy, axe tests pass",
  },
  {
    id: "props-interface",
    rule: "Props interface design",
    status: "pass",
    details: "Exported interface with JSDoc documentation",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Stories exist with variants",
  },
  {
    id: "tests",
    rule: "Unit tests (Vitest >80%)",
    status: "pass",
    details: "Comprehensive tests: 50+ test cases, accessibility, edge cases",
  },
];

export const Z_AuthorBioCompliance: Story = {
  parameters: { docs: { disable: true } },
  render: () => (
    <ComplianceCard
      title="AuthorBio Compliance: 12/12"
      titleIcon={
        <Icon name="check-fat" color="var(--color-success)" weight="fill" />
      }
      rules={authorBioComplianceRules}
      lastReviewed="2025-11-24"
    />
  ),
};

export const Playground = Default;
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
