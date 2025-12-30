import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Heading,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import Tabs, { TabsProps } from "@dt/Tabs";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import { within, userEvent, waitFor } from "@storybook/testing-library";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";

// expect is available globally in Storybook browser tests
declare const expect: (typeof import("vitest"))["expect"];

const tabsComplianceRules: ComplianceRule[] = [
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
    details: "Proper typing with TabsProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Uses i18n for labels",
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
    details: "Replaced --font-sans with var(--font-text)",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "Uses gap for layout",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "CSS custom properties",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Variant system (default, pills, underline), size options",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "role=tablist, aria-selected, keyboard navigation",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Multiple variants with ComplianceCard",
  },
  {
    id: "tests",
    rule: "Tests",
    status: "pass",
    details: "Test file exists",
  },
];

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
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
          <Heading>LLM Schema</Heading>
          <CodeSnippet
            code={JSON.stringify(schema, null, 2)}
            language="json"
            variant="multi"
            maxLines={20}
            showLineNumbers={true}
            allowCopy={true}
          />
        </>
      ),
    },
  },
  argTypes: {
    // Content
    tabs: {
      control: "object",
      description: "Array of tab items with key, label, and optional disabled state",
      table: {
        category: "Content",
        type: { summary: "TabItem[]" },
      },
    },

    // State (v1.1.0)
    activeTab: {
      control: "text",
      description: "Active tab shorthand (v1.1.0+)",
      table: {
        category: "State",
        type: { summary: "string" },
      },
    },
    defaultActiveTab: {
      control: "text",
      description: "Default active tab shorthand (v1.1.0+)",
      table: {
        category: "State",
        type: { summary: "string" },
      },
    },

    // Appearance
    variant: {
      control: { type: "select" },
      options: ["default", "pills", "underline"],
      description: "Visual style variant",
      table: {
        category: "Appearance",
        type: { summary: '"default" | "pills" | "underline"' },
        defaultValue: { summary: "default" },
      },
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "s", "m", "l"],
      description: "Size variant - supports both modern (sm/md/lg) and legacy (s/m/l) formats",
      table: {
        category: "Appearance",
        type: { summary: "SizeUnified" },
        defaultValue: { summary: "md" },
      },
    },

    // Behavior
    onTabChange: {
      action: "tabChanged",
      description: "Tab change handler",
      table: {
        category: "Behavior",
        type: { summary: "(key: string) => void" },
      },
    },

    // Advanced
    className: {
      control: "text",
      description: "Additional CSS classes",
      table: {
        category: "Advanced",
        type: { summary: "string" },
      },
    },

    // Deprecated
    activeTabKey: {
      control: "text",
      description: "⚠️ Deprecated: Use activeTab instead. Will be removed in v2.0.0",
      table: {
        category: "Deprecated",
        type: { summary: "string" },
      },
    },
    defaultActiveTabKey: {
      control: "text",
      description: "⚠️ Deprecated: Use defaultActiveTab instead. Will be removed in v2.0.0",
      table: {
        category: "Deprecated",
        type: { summary: "string" },
      },
    },
  },
};
export default meta;

export const Z_TabsCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={tabsComplianceRules}
  />
);
Z_TabsCompliance.parameters = {
  docs: { disable: true },
};

const Template: StoryFn<TabsProps> = (args) => <Tabs {...args} />;

export const Default = Template.bind({});
Default.args = {
  tabs: [
    { key: "tab1", label: "Tab 1" },
    { key: "tab2", label: "Tab 2" },
    { key: "tab3", label: "Tab 3" },
  ],
  variant: "default",
  size: "m",
};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const tabs = canvas.getAllByRole("tab");

  // Click second tab
  await userEvent.click(tabs[1]);
  await waitFor(() => expect(tabs[1]).toHaveAttribute("aria-selected", "true"));

  // Click third tab
  await userEvent.click(tabs[2]);
  await waitFor(() => expect(tabs[2]).toHaveAttribute("aria-selected", "true"));

  // Keyboard navigation
  tabs[0].focus();
  await userEvent.keyboard("{ArrowRight}");
};

export const Pills = Template.bind({});
Pills.args = {
  tabs: [
    { key: "tab1", label: "Overview" },
    { key: "tab2", label: "Details" },
    { key: "tab3", label: "Settings" },
  ],
  variant: "pills",
};
Pills.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const tabs = canvas.getAllByRole("tab");
  await userEvent.click(tabs[1]);
  await userEvent.click(tabs[2]);
};

export const Underline = Template.bind({});
Underline.args = {
  tabs: [
    { key: "tab1", label: "Home" },
    { key: "tab2", label: "Profile" },
    { key: "tab3", label: "Messages" },
  ],
  variant: "underline",
};
Underline.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const tabs = canvas.getAllByRole("tab");
  await userEvent.click(tabs[2]);
};

export const WithDisabled = Template.bind({});
WithDisabled.args = {
  tabs: [
    { key: "tab1", label: "Active" },
    { key: "tab2", label: "Disabled", disabled: true },
    { key: "tab3", label: "Active" },
  ],
};
WithDisabled.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const tabs = canvas.getAllByRole("tab");

  // Try clicking disabled tab (should not activate)
  await userEvent.click(tabs[1]);

  // Click active tab
  await userEvent.click(tabs[2]);
  await waitFor(() => expect(tabs[2]).toHaveAttribute("aria-selected", "true"));
};

// v1.1.0 Showcase Stories
export const SizeSmall = Template.bind({});
SizeSmall.args = {
  tabs: [
    { key: "tab1", label: "Small Tab 1" },
    { key: "tab2", label: "Small Tab 2" },
    { key: "tab3", label: "Small Tab 3" },
  ],
  size: "sm",
  variant: "default",
};

export const SizeMedium = Template.bind({});
SizeMedium.args = {
  tabs: [
    { key: "tab1", label: "Medium Tab 1" },
    { key: "tab2", label: "Medium Tab 2" },
    { key: "tab3", label: "Medium Tab 3" },
  ],
  size: "md",
  variant: "default",
};

export const SizeLarge = Template.bind({});
SizeLarge.args = {
  tabs: [
    { key: "tab1", label: "Large Tab 1" },
    { key: "tab2", label: "Large Tab 2" },
    { key: "tab3", label: "Large Tab 3" },
  ],
  size: "lg",
  variant: "default",
};

export const ControlledTabs: StoryFn = () => {
  const [activeTab, setActiveTab] = React.useState("tab1");
  return (
    <div>
      <p style={{ marginBottom: "1rem" }}>
        Active tab (v1.1.0): <strong>{activeTab}</strong>
      </p>
      <Tabs
        tabs={[
          { key: "tab1", label: "First" },
          { key: "tab2", label: "Second" },
          { key: "tab3", label: "Third" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};
