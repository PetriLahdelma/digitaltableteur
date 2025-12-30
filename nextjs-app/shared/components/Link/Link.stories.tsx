import React from "react";
import Link from "@dt/Link";
import { Meta, StoryFn } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Heading,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import { useTranslation } from "react-i18next";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import Icon from "@dt/Icon";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
import styles from "../shared-stories.module.css";

const linkComplianceRules: ComplianceRule[] = [
  {
    id: "css-modules",
    rule: "CSS Modules only (no inline styles)",
    status: "pass",
    details: "All styles via CSS Modules",
  },
  {
    id: "design-tokens",
    rule: "Design tokens for spacing/colors",
    status: "pass",
    details: "Uses CSS custom properties",
  },
  {
    id: "logical-properties",
    rule: "Logical CSS properties",
    status: "pass",
    details: "Uses logical spacing",
  },
  {
    id: "composition",
    rule: "Component reuse (Icon)",
    status: "pass",
    details: "Uses Icon component",
  },
  {
    id: "typescript-strict",
    rule: "TypeScript strict mode",
    status: "pass",
    details: "Proper typing with LinkProps",
  },
  {
    id: "accessibility",
    rule: "Accessibility (external link icon with label)",
    status: "pass",
    details: "External links with aria-label",
  },
  {
    id: "translation-support",
    rule: "i18n for link text",
    status: "pass",
    details: "Stories use translation keys",
  },
  {
    id: "tests",
    rule: "Unit tests present",
    status: "pass",
    details: "Test file exists",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Multiple size variants",
  },
  {
    id: "font-tokens",
    rule: "Font token compliance (--font-text)",
    status: "pass",
    details: "Uses design system fonts",
  },
  {
    id: "no-hardcoded",
    rule: "No hardcoded values",
    status: "pass",
    details: "All values from tokens",
  },
];

export default {
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
  parameters: {
    test: { disable: true },
    visualRegression: { disable: true },
    llm: {
      schema,
    },
    docs: {
      page: () => (
        <>
          <Primary />
          <Title />
          <Subtitle />
          <Description />
          <Controls />
          <Stories />
          <details className={styles.schemaDetails}>
            <summary className={styles.schemaSummary}>
              <Heading>LLM Schema</Heading>
            </summary>
            <div className={styles.schemaContent}>
              <CodeSnippet
                code={JSON.stringify(schema, null, 2)}
                language="json"
                variant="multi"
                maxLines={20}
                showLineNumbers={true}
                allowCopy={true}
              />
            </div>
          </details>
        </>
      ),
    },
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
Small.parameters = {
  visualRegression: {
    threshold: 0.004,
  },
};

export const Medium = Template.bind({});
Medium.args = {
  size: "M",
  href: "https://example.com",
  children: "storyLinkMedium",
};
Medium.parameters = {
  visualRegression: {
    threshold: 0.004,
  },
};

export const Large = Template.bind({});
Large.args = {
  size: "L",
  href: "https://example.com",
  children: "storyLinkLarge",
};
Large.parameters = {
  visualRegression: {
    threshold: 0.004,
  },
};

export const Z_LinkCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={linkComplianceRules}
  />
);
