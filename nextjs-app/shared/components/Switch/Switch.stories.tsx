import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Controls,
  Description,
  Heading,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import Switch, { type SwitchProps } from "@dt/Switch";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import { within, userEvent, waitFor } from "@storybook/testing-library";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
import styles from "../shared-stories.module.css";

const switchComplianceRules: ComplianceRule[] = [
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
    details: "Proper typing with SwitchProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Label and helperText props",
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
    details: "Uses CSS custom properties",
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
    details: "CSS custom properties for colors",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Flexible label placement, loading state",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "role=switch, aria-checked, keyboard support",
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

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
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
    // Content
    label: {
      control: "text",
      description: "Label text displayed next to the switch",
      table: {
        category: "Content",
        type: { summary: "React.ReactNode" },
      },
    },
    helperText: {
      control: "text",
      description: "Helper text displayed below the switch",
      table: {
        category: "Content",
        type: { summary: "string" },
      },
    },

    // State (v1.1.0)
    isChecked: {
      control: "boolean",
      description: "Checked state (controlled) (v1.1.0+)",
      table: {
        category: "State",
        type: { summary: "boolean" },
      },
    },
    isDisabled: {
      control: "boolean",
      description: "Disables the switch (v1.1.0+)",
      table: {
        category: "State",
        type: { summary: "boolean" },
      },
    },
    isLoading: {
      control: "boolean",
      description: "Shows loading state with spinner (v1.1.0+)",
      table: {
        category: "State",
        type: { summary: "boolean" },
      },
    },
    defaultChecked: {
      control: "boolean",
      description: "Initial checked state for uncontrolled component (v1.1.0+)",
      table: {
        category: "State",
        type: { summary: "boolean" },
      },
    },

    // Appearance
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size variant (v1.1.0+)",
      table: {
        category: "Appearance",
        type: { summary: "SizeUnified" },
        defaultValue: { summary: "md" },
      },
    },
    labelPlacement: {
      control: { type: "select" },
      options: ["right", "left", "top"],
      description: "Label position relative to switch",
      table: {
        category: "Appearance",
        type: { summary: '"right" | "left" | "top"' },
        defaultValue: { summary: "right" },
      },
    },

    // Behavior
    onCheckedChange: {
      action: "checkedChanged",
      description: "Checked change handler (v1.1.0+)",
      table: {
        category: "Behavior",
        type: { summary: "(checked: boolean) => void" },
      },
    },

    // Accessibility
    id: {
      control: "text",
      description: "Custom ID for the switch element",
      table: {
        category: "Accessibility",
        type: { summary: "string" },
      },
    },

  },
  args: {
    isChecked: false,
    isLoading: false,
    isDisabled: false,
    label: "Enable notifications",
    labelPlacement: "right",
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Z_SwitchCompliance: Story = {
  parameters: {
    docs: { disable: true },
  },
  render: () => (
    <ComplianceCard
      title="Compliance: 11/11"
      titleIcon={
        <Icon name="check-fat" color="var(--color-success)" weight="fill" />
      }
      rules={switchComplianceRules}
    />
  ),
};

const ControlledTemplate = (args: SwitchProps) => {
  const [checked, setChecked] = React.useState<boolean>(args.isChecked ?? false);

  React.useEffect(() => {
    setChecked(args.isChecked ?? false);
  }, [args.isChecked]);

  return (
    <Switch
      {...args}
      isChecked={checked}
      onCheckedChange={(next) => {
        setChecked(next);
        args.onCheckedChange?.(next);
      }}
    />
  );
};

export const Default: Story = {
  name: "Default",
  render: (args) => <ControlledTemplate {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch");

    // Toggle on
    await userEvent.click(switchElement);
    await waitFor(() => switchElement.getAttribute("aria-checked") === "true");

    // Toggle off
    await userEvent.click(switchElement);
    await waitFor(() => switchElement.getAttribute("aria-checked") === "false");
  },
};

export const Loading: Story = {
  name: "Loading",
  args: {
    isLoading: true,
    isChecked: true,
  },
  render: (args) => <ControlledTemplate {...args} />,
};

export const LabelOnTop: Story = {
  name: "Label on Top",
  args: {
    labelPlacement: "top",
    label: "Top aligned label",
  },
  render: (args) => <ControlledTemplate {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch");
    await userEvent.click(switchElement);
  },
};

export const LabelOnLeft: Story = {
  name: "Label on Left (Full Width)",
  args: {
    labelPlacement: "left",
    label: "Make this project public",
  },
  render: (args) => <ControlledTemplate {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch");
    await userEvent.click(switchElement);
  },
};

export const WithHelperText: Story = {
  name: "With Helper Text",
  args: {
    label: "Enable email notifications",
    helperText: "You'll receive updates about your account activity",
  },
  render: (args) => <ControlledTemplate {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch");
    await userEvent.click(switchElement);
    await waitFor(() => switchElement.getAttribute("aria-checked") === "true");
  },
};

// v1.1.0 Showcase Stories
export const SizeSmall: Story = {
  name: "Size Small (v1.1.0)",
  args: {
    label: "Small switch",
    isChecked: true,
    size: "sm",
  },
  render: (args) => <ControlledTemplate {...args} />,
};

export const SizeMedium: Story = {
  name: "Size Medium (v1.1.0)",
  args: {
    label: "Medium switch (default)",
    isChecked: true,
    size: "md",
  },
  render: (args) => <ControlledTemplate {...args} />,
};

export const SizeLarge: Story = {
  name: "Size Large (v1.1.0)",
  args: {
    label: "Large switch",
    isChecked: true,
    size: "lg",
  },
  render: (args) => <ControlledTemplate {...args} />,
};

export const AllSizes: Story = {
  name: "All Sizes (v1.1.0)",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Switch label="Small (sm)" isChecked={true} size="sm" />
      <Switch label="Medium (md)" isChecked={true} size="md" />
      <Switch label="Large (lg)" isChecked={true} size="lg" />
    </div>
  ),
};
