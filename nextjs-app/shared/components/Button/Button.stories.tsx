import contract from "./Button.contract.json";
import { userEvent, within, expect } from "storybook/test";
import React from "react";
import { Meta, StoryFn, type StoryObj } from "@storybook/react-vite";
import Button from "@dt/Button";
import { useTranslation } from "react-i18next";
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
    children: {
      control: "text",
      description: "Button label.",
      table: { category: "Content", type: { summary: "ReactNode" } },
    },
    icon: {
      control: "text",
      description:
        "Leading icon: a React node, a component, or a Phosphor icon name (e.g. 'arrow-left').",
      table: { category: "Content", type: { summary: "ReactNode | string" } },
    },
    endIcon: {
      control: "text",
      description: "Trailing icon: a React node, a component, or an icon name.",
      table: { category: "Content", type: { summary: "ReactNode | string" } },
    },
    variant: {
      control: { type: "inline-radio" },
      options: ["primary", "secondary", "tertiary"],
      description: "Visual weight.",
      table: {
        category: "Appearance",
        type: { summary: "primary | secondary | tertiary" },
        defaultValue: { summary: "primary" },
      },
    },
    tone: {
      control: { type: "inline-radio" },
      options: ["neutral", "error", "warning", "success", "info"],
      description: "Semantic color, orthogonal to variant. Matches design tokens.",
      table: {
        category: "Appearance",
        type: { summary: "neutral | error | warning | success | info" },
        defaultValue: { summary: "neutral" },
      },
    },
    size: {
      control: { type: "inline-radio" },
      options: ["sm", "md", "lg"],
      description: "Control size.",
      table: {
        category: "Appearance",
        type: { summary: "sm | md | lg" },
        defaultValue: { summary: "md" },
      },
    },
    surface: {
      control: { type: "inline-radio" },
      options: ["default", "onDark", "onBrand"],
      description:
        "Surface the button sits on; prefer this over absolute colors on tinted bands.",
      table: {
        category: "Appearance",
        type: { summary: "default | onDark | onBrand" },
        defaultValue: { summary: "default" },
      },
    },
    rounded: {
      control: "boolean",
      description: "Fully rounded (pill) corners.",
      table: { category: "Appearance", type: { summary: "boolean" } },
    },
    disabled: {
      control: "boolean",
      description: "Disables interaction and dims the control.",
      table: { category: "State", type: { summary: "boolean" } },
    },
    loading: {
      control: "boolean",
      description: "Shows a loading state and blocks interaction; sets aria-busy.",
      table: { category: "State", type: { summary: "boolean" } },
    },
    onClick: {
      action: "clicked",
      description: "Click handler. On link buttons, fires alongside navigation.",
      table: { category: "Behavior", type: { summary: "(e: MouseEvent) => void" } },
    },
    href: {
      control: "text",
      description: "When set, the button renders as an anchor.",
      table: { category: "Behavior", type: { summary: "string" } },
    },
    submits: {
      control: "boolean",
      description: "When true, sets type='submit'.",
      table: { category: "Behavior", type: { summary: "boolean" } },
    },
    target: {
      control: "text",
      description: "Anchor target (link buttons only); _blank auto-adds rel='noopener noreferrer'.",
      table: { category: "Behavior", type: { summary: "string" } },
    },
    accessibleName: {
      control: "text",
      description: "Accessible name; required for icon-only buttons.",
      table: { category: "Accessibility", type: { summary: "string" } },
    },
    accessibleDescription: {
      control: "text",
      description: "Extra context for assistive tech. Maps to aria-describedby.",
      table: { category: "Accessibility", type: { summary: "string" } },
    },
    accessibleNameRef: {
      control: "text",
      description: "id of an element that labels this button. Maps to aria-labelledby.",
      table: { category: "Accessibility", type: { summary: "string" } },
    },
    tooltip: {
      control: "text",
      description: "Native tooltip text; also a fallback accessible name for icon-only buttons.",
      table: { category: "Accessibility", type: { summary: "string" } },
    },
    className: {
      control: "text",
      description: "Additional CSS classes merged onto the rendered element.",
      table: { category: "Advanced", type: { summary: "string" } },
    },
  },
} as Meta;

type Story = StoryObj<typeof Button>;

const Label = ({ tKey }: { tKey: string }) => {
  const { t } = useTranslation();
  return <>{t(tKey)}</>;
};

const Template: StoryFn = (args: React.ComponentProps<typeof Button>) => (
  <Button {...args} />
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
    {children}
  </div>
);

export const Primary = Template.bind({});
export const Default = Primary;
Primary.args = {
  variant: "primary",
  children: <Label tKey="buttonPrimary" />,
};
Primary.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole("button");
  await userEvent.click(button);
  expect(args.onClick).toHaveBeenCalled();
  await userEvent.tab();
  expect(button).toHaveFocus();
};

export const Secondary = Template.bind({});
Secondary.args = { variant: "secondary", children: <Label tKey="buttonSecondary" /> };

export const Tertiary = Template.bind({});
Tertiary.args = { variant: "tertiary", children: <Label tKey="buttonTertiary" /> };

export const Tones = () => (
  <Row>
    <Button tone="neutral">Neutral</Button>
    <Button tone="error">Error</Button>
    <Button tone="warning">Warning</Button>
    <Button tone="success">Success</Button>
    <Button tone="info">Info</Button>
  </Row>
);

export const DestructiveActions = () => (
  <Row>
    <Button variant="primary" tone="error">
      Delete
    </Button>
    <Button variant="secondary" tone="error">
      Delete
    </Button>
    <Button variant="tertiary" tone="error">
      Delete
    </Button>
  </Row>
);

export const Sizes = () => (
  <Row>
    <Button size="sm">
      <Label tKey="buttonSmall" />
    </Button>
    <Button size="md">
      <Label tKey="buttonMedium" />
    </Button>
    <Button size="lg">
      <Label tKey="buttonLarge" />
    </Button>
  </Row>
);

export const IconLeft = Template.bind({});
IconLeft.args = {
  variant: "primary",
  icon: "arrow-left",
  children: <Label tKey="buttonLeftIcon" />,
};

export const IconRight = Template.bind({});
IconRight.args = {
  variant: "primary",
  endIcon: "arrow-right",
  children: <Label tKey="buttonRightIcon" />,
};

export const IconOnly = Template.bind({});
IconOnly.args = {
  variant: "primary",
  icon: "magnifying-glass",
  accessibleName: "Search",
  tooltip: "Search",
};

export const States = () => (
  <Row>
    <Button variant="primary">Default</Button>
    <Button variant="primary" disabled>
      Disabled
    </Button>
    <Button variant="primary" loading>
      Loading
    </Button>
    <Button variant="primary" rounded>
      Rounded
    </Button>
  </Row>
);

export const Loading = Template.bind({});
Loading.args = { variant: "primary", loading: true, children: "Saving..." };
Loading.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole("button");
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute("aria-busy", "true");
};

// Edge case: long label and a long Finnish/Swedish locale string must not break layout.
export const LongLabel = () => (
  <div style={{ display: "grid", gap: "1rem", maxWidth: 320 }}>
    <Button variant="primary">
      Download the complete annual accessibility report
    </Button>
    <Button variant="secondary" icon="arrow-left">
      Takaisin etusivulle ja hakutuloksiin
    </Button>
  </div>
);

export const Surfaces = () => (
  <div style={{ display: "grid", gap: "1rem" }}>
    <div
      style={{
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        padding: "1.5rem",
        backgroundColor: "var(--color-primary)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <Button variant="primary" surface="onDark">
        Primary
      </Button>
      <Button variant="secondary" surface="onDark">
        Secondary
      </Button>
      <Button variant="tertiary" surface="onDark">
        Tertiary
      </Button>
    </div>
    <div
      style={{
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        padding: "1.5rem",
        backgroundColor: "var(--logo-background)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <Button variant="primary" surface="onBrand">
        Primary
      </Button>
      <Button variant="secondary" surface="onBrand">
        Secondary
      </Button>
    </div>
  </div>
);

export const AsLink = () => (
  <Row>
    <Button href="/about" variant="primary">
      Internal link
    </Button>
    <Button href="https://example.com" variant="secondary" target="_blank">
      External link
    </Button>
    <Button href="/contact" variant="tertiary" endIcon="arrow-right">
      Link with icon
    </Button>
  </Row>
);
AsLink.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const external = canvas.getByRole("link", { name: /external link/i });
  expect(external).toHaveAttribute("rel", "noopener noreferrer");
};

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
