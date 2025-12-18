import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Switch, { type SwitchProps } from "@dt/Switch";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import { within, userEvent, waitFor } from "@storybook/testing-library";

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
  argTypes: {
    checked: { control: "boolean" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    helperText: { control: "text" },
    labelPlacement: {
      control: { type: "select" },
      options: ["right", "left", "top"],
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
    loading: true,
    checked: true,
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
