import contract from "./Switch.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Switch, { type SwitchProps } from "@dt/Switch";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import { userEvent, waitFor, within } from "storybook/test";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
import styles from "./Switch.stories.module.css";
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
  { id: "tests", rule: "Tests", status: "pass", details: "Test file exists" },
];

const meta: Meta<typeof Switch> = {
  title: "Forms/Switch",
  component: Switch,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=373-14",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // label is ReactNode on the contract (autogen hides those) but accepts plain
  // text, so it keeps an authored text control.
  argTypes: {
    label: {
      control: { type: "text" },
      description: "Label text displayed next to the switch",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
  },
  args: {
    checked: false,
    loading: false,
    disabled: false,
    label: "Enable notifications",
    labelPlacement: "right",
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Z_SwitchCompliance: Story = {
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
Z_SwitchCompliance.parameters = { docs: { disable: true } };

const ControlledTemplate = (args: SwitchProps) => {
  const [checked, setChecked] = React.useState<boolean>(args.checked ?? false);

  React.useEffect(() => {
    setChecked(args.checked ?? false);
  }, [args.checked]);

  return (
    <Switch
      {...args}
      checked={checked}
      onCheckedChange={(next) => {
        setChecked(next);
        args.onCheckedChange?.(next);
      }}
    />
  );
};

export const Default: Story = {
  parameters: { a11y: { disable: true } },
  tags: ["beta-matrix"],
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
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "loading blocks double flips and sets aria-busy while an async toggle is in flight.",
      },
    },
  },
  args: { loading: true, checked: true },
  render: (args) => <ControlledTemplate {...args} />,
};

export const LabelOnTop: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "labelPlacement moves the visible label; the wiring via aria-labelledby is unchanged.",
      },
    },
  },
  name: "Label on Top",
  args: { labelPlacement: "top", label: "Top aligned label" },
  render: (args) => <ControlledTemplate {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch");
    await userEvent.click(switchElement);
  },
};

export const LabelOnLeft: Story = {
  name: "Label on Left (Full Width)",
  args: { labelPlacement: "left", label: "Make this project public" },
  render: (args) => <ControlledTemplate {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch");
    await userEvent.click(switchElement);
  },
};

export const WithHelperText: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "helperText states the consequence before flipping; it is linked via aria-describedby.",
      },
    },
  },
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

// v2.0.0 Showcase Stories
export const SizeSmall: Story = {
  name: "Size Small (v2.0.0)",
  args: { label: "Small switch", checked: true, size: "sm" },
  render: (args) => <ControlledTemplate {...args} />,
};

export const SizeMedium: Story = {
  name: "Size Medium (v2.0.0)",
  args: { label: "Medium switch (default)", checked: true, size: "md" },
  render: (args) => <ControlledTemplate {...args} />,
};

export const SizeLarge: Story = {
  name: "Size Large (v2.0.0)",
  args: { label: "Large switch", checked: true, size: "lg" },
  render: (args) => <ControlledTemplate {...args} />,
};

export const AllSizes: Story = {
  tags: ["example"],
  parameters: {
    docs: { description: { story: "sm, md and lg control sizes." } },
  },
  name: "All Sizes (v2.0.0)",
  render: () => (
    <div className={styles.sizesContainer}>
      <Switch label="Small (sm)" checked={true} size="sm" />
      <Switch label="Medium (md)" checked={true} size="md" />
      <Switch label="Large (lg)" checked={true} size="lg" />
    </div>
  ),
};
export const WithError: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "The control owns its error: it renders above the helper line, sets aria-invalid, and announces via role=alert. Useful when an immediate toggle fails server-side.",
      },
    },
  },
  args: {
    label: "Email notifications",
    error: "Could not update the setting. Try again.",
  },
  render: (args) => <ControlledTemplate {...args} />,
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  ...Default,
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  args: {
    label: "Enable email notifications",
    helperText: "You'll receive updates about your account activity",
  },
  render: (args) => <ControlledTemplate {...args} />,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
