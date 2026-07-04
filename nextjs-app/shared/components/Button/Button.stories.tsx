import contract from "./Button.contract.json";
import { action } from "storybook/actions";
import { userEvent, within, expect } from "storybook/test";
import React from "react";
import { Meta, StoryFn, type StoryObj } from "@storybook/react-vite";
import Button from "@dt/Button";
import { useTranslation } from "react-i18next";
import schema from "./schema.json";

// Selectable async behaviors for the clickAction control: picking one and
// clicking the button demonstrates the pending/dedupe handling live.
const clickActionPresets: Record<
  string,
  ((e: React.MouseEvent<HTMLButtonElement>) => Promise<void>) | undefined
> = {
  none: undefined,
  resolve: (e) => {
    action("clickAction (resolves in 1.2s)")(e);
    return new Promise((resolve) => setTimeout(resolve, 1200));
  },
  reject: (e) => {
    action("clickAction (rejects in 1.2s)")(e);
    return new Promise((_, reject) => setTimeout(reject, 1200));
  },
};
const clickActionLabels = {
  none: "none",
  resolve: "async success (1.2s)",
  reject: "async failure (1.2s)",
};

export default {
  title: "Actions/Button",
  component: Button,
  tags: ["stable", "autodocs"],
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
    clickAction: {
      control: { type: "select", labels: clickActionLabels },
      options: Object.keys(clickActionPresets),
      mapping: clickActionPresets,
      description:
        "Async click handler (button form only). While the returned promise is pending, the button shows its loading state, sets aria-busy, and disables itself to dedupe repeat clicks. onClick still fires first if both are provided. Rejections are swallowed after clearing the pending state — callers own error UX. The presets here let you click and watch the pending state live.",
      table: {
        category: "Behavior",
        type: { summary: "(e: MouseEvent<HTMLButtonElement>) => void | Promise<void>" },
        defaultValue: { summary: "undefined" },
      },
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
    rel: {
      control: "text",
      description:
        "Anchor rel (link buttons only). Left empty, _blank targets auto-add 'noopener noreferrer'.",
      table: { category: "Behavior", type: { summary: "string" } },
    },
      form: { table: { disable: true } },
      id: { table: { disable: true } },
      name: { table: { disable: true } },
      ref: { table: { disable: true } },
      type: { table: { disable: true } },
      value: { table: { disable: true } }
},
  // Seeded so every text/boolean control renders an operable widget instead of
  // a "Set string" button; each value matches the component's no-op default.
  args: {
    icon: "",
    endIcon: "",
    href: "",
    target: "",
    rel: "",
    submits: false,
    disabled: false,
    loading: false,
    rounded: false,
    accessibleName: "",
    accessibleNameRef: "",
    accessibleDescription: "",
    tooltip: "",
    className: "",
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

Tones.tags = ["example"];
Tones.parameters = {
  docs: {
    description: {
      story:
        "The five semantic tones, orthogonal to variant; the label must carry the meaning, not the color alone.",
    },
  },
};

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

DestructiveActions.tags = ["example"];
DestructiveActions.parameters = {
  docs: {
    description: {
      story:
        "tone=error across all three weights; pair with a confirmation step for irreversible actions.",
    },
  },
};

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

Sizes.tags = ["example"];
Sizes.parameters = {
  docs: { description: { story: "sm, md and lg control sizes." } },
};

export const IconLeft = Template.bind({});
IconLeft.args = {
  variant: "primary",
  icon: "arrow-left",
  children: <Label tKey="buttonLeftIcon" />,
};

IconLeft.tags = ["example"];
IconLeft.parameters = {
  docs: {
    description: {
      story: "Leading icon by Phosphor name; it reinforces the label.",
    },
  },
};

export const IconRight = Template.bind({});
IconRight.args = {
  variant: "primary",
  endIcon: "arrow-right",
  children: <Label tKey="buttonRightIcon" />,
};

IconRight.tags = ["example"];
IconRight.parameters = {
  docs: {
    description: { story: "Trailing icon, for example a forward chevron." },
  },
};

export const IconOnly = Template.bind({});
IconOnly.args = {
  variant: "primary",
  icon: "magnifying-glass",
  accessibleName: "Search",
  tooltip: "Search",
};

IconOnly.tags = ["example"];
IconOnly.parameters = {
  docs: {
    description: {
      story:
        "Icon-only buttons require accessibleName; tooltip alone is not an accessible name.",
    },
  },
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

States.tags = ["example"];
States.parameters = {
  docs: {
    description: {
      story: "Default, disabled, loading and rounded side by side.",
    },
  },
};

export const Loading = Template.bind({});
Loading.args = { variant: "primary", loading: true, children: "Saving..." };
Loading.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole("button");
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute("aria-busy", "true");
};

// Auto-loading driven entirely by the promise returned from clickAction: no
// externally-managed `loading` state prop required.
export const AsyncAction = () => (
  <Button
    variant="primary"
    clickAction={() =>
      new Promise<void>((resolve) => setTimeout(resolve, 1500))
    }
  >
    Save
  </Button>
);
AsyncAction.tags = ["example"];
AsyncAction.parameters = {
  docs: {
    description: {
      story:
        "clickAction returns a promise; the button owns the busy state and dedupes repeat clicks.",
    },
  },
};
AsyncAction.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole("button");
  await userEvent.click(button);
  expect(button).toHaveAttribute("aria-busy", "true");
  expect(button).toBeDisabled();
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

LongLabel.tags = ["example"];
LongLabel.parameters = {
  docs: {
    description: {
      story: "Long labels and long fi/sv locale strings must wrap, not break layout.",
    },
  },
};

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

Surfaces.tags = ["example"];
Surfaces.parameters = {
  docs: {
    description: {
      story:
        "surface=onDark and surface=onBrand instead of color overrides on tinted bands.",
    },
  },
};

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
AsLink.tags = ["example"];
AsLink.parameters = {
  docs: {
    description: {
      story:
        "With href the button renders an anchor; _blank targets get rel=noopener noreferrer automatically.",
    },
  },
};
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
