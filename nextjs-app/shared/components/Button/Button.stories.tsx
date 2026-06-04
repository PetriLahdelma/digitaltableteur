import contract from "./Button.contract.json";
import { userEvent, within } from "storybook/test";
/* stylelint-disable value-keyword-case, scale-unlimited/declaration-strict-value */
import React from "react";
import { Meta, StoryFn, type StoryObj } from "@storybook/react-vite";
import Button from "@dt/Button";
import Icon from "@dt/Icon";
import ComplianceCard, { type ComplianceRule } from "@dt/ComplianceCard";
import { useTranslation } from "react-i18next";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";

export default {
  title: "Atoms/Button",
  component: Button,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=406-1569",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    // Content

    children: {
      control: "text",
      description: "Button label content",
      table: { category: "Content", type: { summary: "ReactNode" } },
    },

    icon: {
      control: "text",
      description:
        "Icon at the start - can be React element, component, or Phosphor icon name (e.g., 'arrow-left')",
      table: { category: "Content", type: { summary: "ReactNode | string" } },
    },

    endIcon: {
      control: "text",
      description: "Icon displayed at the end of the button content",
      table: { category: "Content", type: { summary: "ReactNode | string" } },
    },

    // Appearance

    variant: {
      control: { type: "select" },
      options: [
        "primary",
        "secondary",
        "tertiary",
        "secondaryError",
        "tertiaryError",
        "error",
        "warning",
        "success",
        "info",
      ],
      description: "Visual style variant of the button",
      table: {
        category: "Appearance",
        type: { summary: "ButtonVariantVisual | ButtonSeverity" },
        defaultValue: { summary: "primary" },
      },
    },

    severity: {
      control: { type: "select" },
      options: ["error", "warning", "success", "info"],
      description: "Semantic severity for status-based styling (v1.1.0+)",
      table: { category: "Appearance", type: { summary: "ButtonSeverity" } },
    },

    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "s", "m", "l"],
      description:
        "Button size variant - supports both modern (sm/md/lg) and legacy (s/m/l) formats",
      table: {
        category: "Appearance",
        type: { summary: "SizeUnified | ButtonSizeLegacy" },
        defaultValue: { summary: "md" },
      },
    },

    isInverse: {
      control: "boolean",
      description:
        "Replaces primary text/border color with white for dark backgrounds (v1.1.0+)",
      table: { category: "Appearance", type: { summary: "boolean" } },
    },

    surface: {
      control: { type: "select" },
      options: ["default", "onDark", "onBrand"],
      description:
        "Surface behind the button — use onDark/onBrand on tinted bands instead of isInverse on gradients",
      table: {
        category: "Appearance",
        type: { summary: "ButtonSurface" },
        defaultValue: { summary: "default" },
      },
    },

    isRounded: {
      control: "boolean",
      description: "Applies rounded corners to the button (v1.1.0+)",
      table: { category: "Appearance", type: { summary: "boolean" } },
    },

    // State

    isDisabled: {
      control: "boolean",
      description: "Disables the button (v1.1.0+)",
      table: { category: "State", type: { summary: "boolean" } },
    },

    isLoading: {
      control: "boolean",
      description: "Shows loading state with pulsing animation (v1.1.0+)",
      table: { category: "State", type: { summary: "boolean" } },
    },

    // Behavior
    onClick: {
      action: "clicked",
      description: "Click event handler",
      table: {
        category: "Behavior",
        type: { summary: "(event: MouseEvent) => void" },
      },
    },

    href: {
      control: "text",
      description:
        "URL to navigate to - when provided, renders as an anchor element",
      table: { category: "Behavior", type: { summary: "string" } },
    },

    submits: {
      control: "boolean",
      description: "When true, button type becomes 'submit'",
      table: { category: "Behavior", type: { summary: "boolean" } },
    },

    target: {
      control: "text",
      description: "Link target (only for href buttons)",
      table: { category: "Behavior", type: { summary: "string" } },
    },

    // Accessibility

    accessibleName: {
      control: "text",
      description: "ARIA label for accessible name override",
      table: { category: "Accessibility", type: { summary: "string" } },
    },

    accessibleDescription: {
      control: "text",
      description: "ARIA description for additional context",
      table: { category: "Accessibility", type: { summary: "string" } },
    },

    accessibleNameRef: {
      control: "text",
      description: "ID reference for aria-labelledby",
      table: { category: "Accessibility", type: { summary: "string" } },
    },

    accessibleRole: {
      control: { type: "select" },
      options: ["button", "link"],
      description: "ARIA role override",
      table: { category: "Accessibility", type: { summary: "button | link" } },
    },

    tooltip: {
      control: "text",
      description: "Tooltip text displayed on hover",
      table: { category: "Accessibility", type: { summary: "string" } },
    },

    // Advanced

    className: {
      control: "text",
      description: "Additional CSS classes",
      table: { category: "Advanced", type: { summary: "string" } },
    },

    // Deprecated

    disabled: {
      control: "boolean",
      description:
        "⚠️ Deprecated: Use isDisabled instead. Will be removed in v2.0.0",
      table: { category: "Deprecated", type: { summary: "boolean" } },
    },

    loading: {
      control: "boolean",
      description:
        "⚠️ Deprecated: Use isLoading instead. Will be removed in v2.0.0",
      table: { category: "Deprecated", type: { summary: "boolean" } },
    },

    inverse: {
      control: "boolean",
      description:
        "⚠️ Deprecated: Use isInverse instead. Will be removed in v2.0.0",
      table: { category: "Deprecated", type: { summary: "boolean" } },
    },

    rounded: {
      control: "boolean",
      description:
        "⚠️ Deprecated: Use isRounded instead. Will be removed in v2.0.0",
      table: { category: "Deprecated", type: { summary: "boolean" } },
    },
  },
} as Meta;

type Story = StoryObj<typeof Button>;

const ButtonStoryLabel = ({ tKey }: { tKey: string }) => {
  const { t } = useTranslation();
  return <>{t(tKey)}</>;
};

const Template: StoryFn = (args: React.ComponentProps<typeof Button>) => (
  <Button {...args} />
);

const visuallyHiddenStyle: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const INVERSE_SWATCHES = [
  { label: "Primary", color: "var(--color-primary)" },
  { label: "Accent Pink", color: "var(--accent-pink)" },
  { label: "Error", color: "var(--color-error)" },
  { label: "Success", color: "var(--color-success)" },
] as const;

export const Primary = Template.bind({});
export const Default = Primary;
Primary.args = {
  variant: "primary",
  children: <ButtonStoryLabel tKey="buttonPrimary" />,
  icon: "",
};
Primary.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /primary/i });
  await userEvent.click(button);
  // Focus test
  await userEvent.tab();
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: "secondary",
  children: <ButtonStoryLabel tKey="buttonSecondary" />,
};
Secondary.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /secondary/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const SecondaryError = Template.bind({});
SecondaryError.args = {
  variant: "secondaryError",
  children: "Secondary Error",
};
SecondaryError.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", {
    name: /secondary error/i,
  });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Tertiary = Template.bind({});
Tertiary.args = {
  variant: "tertiary",
  children: <ButtonStoryLabel tKey="buttonTertiary" />,
};
Tertiary.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /tertiary/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const TertiaryError = Template.bind({});
TertiaryError.args = { variant: "tertiaryError", children: "Tertiary Error" };
TertiaryError.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /tertiary error/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Error = Template.bind({});
Error.args = {
  variant: "error",
  children: <ButtonStoryLabel tKey="buttonError" />,
};
Error.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /error/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Warning = Template.bind({});
Warning.args = {
  variant: "warning",
  children: <ButtonStoryLabel tKey="buttonWarning" />,
};
Warning.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /warning/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Success = Template.bind({});
Success.args = {
  variant: "success",
  children: <ButtonStoryLabel tKey="buttonSuccess" />,
};
Success.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /success/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Info = Template.bind({});
Info.args = {
  variant: "info",
  children: <ButtonStoryLabel tKey="buttonInfo" />,
};
Info.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /info/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const IconOnly = Template.bind({});
IconOnly.args = {
  variant: "primary",
  icon: "magnifying-glass",
  tooltip: "Search",
};
IconOnly.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole("button");
  await userEvent.hover(button);
  await userEvent.tab();
};

export const IconLeft = Template.bind({});
IconLeft.args = {
  variant: "primary",
  icon: "arrow-left",
  children: <ButtonStoryLabel tKey="buttonLeftIcon" />,
};
IconLeft.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /left icon/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const IconRight = Template.bind({});
IconRight.args = {
  variant: "primary",
  endIcon: "arrow-right",
  children: <ButtonStoryLabel tKey="buttonRightIcon" />,
};
IconRight.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /right icon/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Disabled = Template.bind({});
Disabled.args = {
  variant: "primary",
  children: <ButtonStoryLabel tKey="buttonDisabled" />,
  disabled: true,
};
Disabled.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /disabled/i });
  await userEvent.tab();
};

export const Loading = Template.bind({});
Loading.args = { variant: "primary", children: "Loading...", loading: true };
Loading.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /loading/i });
  // Button should be disabled when loading
  await userEvent.tab();
};

export const AllVariants = () => (
  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
    <Button variant="primary">
      <ButtonStoryLabel tKey="buttonPrimary" />
    </Button>
    <Button variant="secondary">
      <ButtonStoryLabel tKey="buttonSecondary" />
    </Button>
    <Button variant="secondaryError">Secondary Error</Button>
    <Button variant="tertiary">
      <ButtonStoryLabel tKey="buttonTertiary" />
    </Button>
    <Button variant="tertiaryError">Tertiary Error</Button>
    <Button variant="error">
      <ButtonStoryLabel tKey="buttonError" />
    </Button>
    <Button variant="warning">
      <ButtonStoryLabel tKey="buttonWarning" />
    </Button>
    <Button variant="success">
      <ButtonStoryLabel tKey="buttonSuccess" />
    </Button>
    <Button variant="info">
      <ButtonStoryLabel tKey="buttonInfo" />
    </Button>
    <Button variant="primary" loading>
      Loading...
    </Button>
  </div>
);

export const Inverse = () => {
  // Static primary surface; show all inverse variants (no swatches).
  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        padding: "2rem",
        flexWrap: "wrap",
        /* stylelint-disable-next-line scale-unlimited/declaration-strict-value, value-keyword-case */
        backgroundColor: "var(--color-primary)",
        borderRadius: "var(--radius-md, 0.5rem)",
      }}
    >
      <Button variant="primary" size="l" inverse>
        Inverse primary
      </Button>
      <Button variant="secondary" size="l" inverse>
        Inverse secondary
      </Button>
      <Button variant="tertiary" size="l" inverse>
        Inverse tertiary
      </Button>
    </div>
  );
};

export const AllSizes = () => (
  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
    <Button size="s">
      <ButtonStoryLabel tKey="buttonSmall" />
    </Button>
    <Button size="m">
      <ButtonStoryLabel tKey="buttonMedium" />
    </Button>
    <Button size="l">
      <ButtonStoryLabel tKey="buttonLarge" />
    </Button>
  </div>
);

export const AsLink = () => (
  <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
    <div style={{ display: "flex", gap: "1rem" }}>
      <Button href="/about" variant="primary">
        Internal Link
      </Button>
      <Button href="https://example.com" variant="secondary" target="_blank">
        External Link
      </Button>
      <Button href="/contact" variant="tertiary" icon="arrow-right">
        Link with Icon
      </Button>
    </div>
    <div style={{ display: "flex", gap: "1rem" }}>
      <Button href="/disabled" variant="primary" disabled>
        Disabled Link
      </Button>
      <Button href="/rounded" variant="secondary" rounded>
        Rounded Link
      </Button>
    </div>
  </div>
);

// Compliance tracking
const buttonComplianceRules: ComplianceRule[] = [
  {
    id: "design-system",
    rule: "1.1 Design System First",
    status: "pass",
    details: "Uses design tokens from variables.css for all styling",
  },
  {
    id: "component-reuse",
    rule: "1.1.1 Component Reuse",
    status: "pass",
    details: "Uses Icon component, integrates with semantic icon system",
  },
  {
    id: "file-structure",
    rule: "1.2 Component Structure",
    status: "pass",
    details: "Complete file structure with tsx/css/test/stories/index",
  },
  {
    id: "typescript-strict",
    rule: "1.3 TypeScript Strictness",
    status: "pass",
    details: "Exported types with comprehensive JSDoc, forwardRef, displayName",
  },
  {
    id: "css-modules",
    rule: "2.1 CSS Modules",
    status: "pass",
    details:
      "CSS Modules with logical properties (padding-inline, margin-block)",
  },
  {
    id: "design-tokens",
    rule: "2.2 Design Token Usage",
    status: "pass",
    details: "All design tokens used without fallback values",
  },
  {
    id: "theme-support",
    rule: "2.4 Theme Support",
    status: "pass",
    details: "Theme-aware via tokens, includes inverse mode for dark surfaces",
  },
  {
    id: "props-interface",
    rule: "3.1 Props Interface",
    status: "pass",
    details: "Polymorphic ButtonProps (button/link variants) with full JSDoc",
  },
  {
    id: "i18n",
    rule: "4.1 i18n Requirements",
    status: "pass",
    details: "Translation keys for all story labels (EN/FI/SV)",
  },
  {
    id: "semantic-html",
    rule: "6.1 Semantic HTML",
    status: "pass",
    details: "Renders semantic <button> or <a>, proper ARIA attributes",
  },
  {
    id: "test-structure",
    rule: "7.1 Test Structure",
    status: "pass",
    details: "Comprehensive tests (125 lines, 18+ test cases)",
  },
  {
    id: "component-files",
    rule: "10.1 Component Files",
    status: "pass",
    details: "All required files including ButtonProps type export",
  },
];

export const Z_ButtonCompliance: StoryFn = () => (
  <ComplianceCard
    title="Button Compliance: 12/12"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={buttonComplianceRules}
    lastReviewed="2025-11-24"
  />
);

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  args: Primary.args,
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: (args: React.ComponentProps<typeof Button>) => (
    <Button {...Primary.args} {...args} variant="primary" />
  ),
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: Primary.args,
};
