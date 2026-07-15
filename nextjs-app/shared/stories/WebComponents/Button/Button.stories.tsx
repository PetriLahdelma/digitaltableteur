import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type ButtonArgs = {
  label: string;
  variant: "primary" | "secondary" | "tertiary";
  tone: "neutral" | "info" | "success" | "warning" | "error";
  size: "sm" | "md" | "lg";
  surface?: "default" | "onDark" | "onBrand";
  icon?: string;
  endIcon?: string;
  href?: string;
  accessibleName?: string;
  rounded?: boolean;
  disabled: boolean;
  loading: boolean;
};

function NativeButton(args: ButtonArgs) {
  return (
    <NativeElement
      tagName="dt-button"
      attributes={{
        label: args.label,
        variant: args.variant,
        tone: args.tone,
        size: args.size,
        surface: args.surface,
        icon: args.icon,
        "end-icon": args.endIcon,
        href: args.href,
        "accessible-name": args.accessibleName,
        rounded: args.rounded,
        disabled: args.disabled,
        loading: args.loading,
      }}
    />
  );
}

const meta = {
  title: "Web Components/Actions/Button",
  component: NativeButton,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-button custom element." } },
  },
  args: {
    label: "Continue",
    variant: "primary",
    tone: "neutral",
    size: "md",
    disabled: false,
    loading: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "tertiary"],
    },
    tone: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "error"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
} satisfies Meta<typeof NativeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-button") };
export const Playground: Story = {};
export const Primary: Story = {
  ...exampleStory,
  args: { label: "Primary", variant: "primary" },
};
export const Secondary: Story = {
  ...exampleStory,
  args: { label: "Secondary", variant: "secondary" },
};
export const Tertiary: Story = {
  ...exampleStory,
  args: { label: "Tertiary", variant: "tertiary" },
};

export const Variants: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeElement tagName="dt-button" attributes={{ variant: "primary" }}>
        Primary
      </NativeElement>
      <NativeElement tagName="dt-button" attributes={{ variant: "secondary" }}>
        Secondary
      </NativeElement>
      <NativeElement tagName="dt-button" attributes={{ variant: "tertiary" }}>
        Tertiary
      </NativeElement>
    </Row>
  ),
};

export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeElement key={size} tagName="dt-button" attributes={{ size }}>
          {size}
        </NativeElement>
      ))}
    </Row>
  ),
};

export const Tones: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["neutral", "error", "warning", "success", "info"] as const).map(
        (tone) => (
          <NativeElement key={tone} tagName="dt-button" attributes={{ tone }}>
            {tone}
          </NativeElement>
        ),
      )}
    </Row>
  ),
};

export const DestructiveActions: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["primary", "secondary", "tertiary"] as const).map((variant) => (
        <NativeElement
          key={variant}
          tagName="dt-button"
          attributes={{ variant, tone: "error" }}
        >
          Delete
        </NativeElement>
      ))}
    </Row>
  ),
};

export const IconLeft: Story = {
  ...exampleStory,
  args: { label: "Previous", icon: "arrow-left" },
};
export const IconRight: Story = {
  ...exampleStory,
  args: { label: "Continue", endIcon: "arrow-right" },
};
export const IconOnly: Story = {
  ...exampleStory,
  args: { label: "", icon: "plus", accessibleName: "Add item" },
};
export const Loading: Story = {
  ...exampleStory,
  args: { label: "Saving", loading: true },
};
export const LongLabel: Story = {
  ...exampleStory,
  args: {
    label: "Continue to review the complete project configuration",
  },
};
export const Surfaces: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <div style={{ padding: "1rem" }}>
        <NativeElement tagName="dt-button">Default</NativeElement>
      </div>
      <div style={{ padding: "1rem", background: "#111" }}>
        <NativeElement tagName="dt-button" attributes={{ surface: "onDark" }}>
          On dark
        </NativeElement>
      </div>
      <div style={{ padding: "1rem", background: "var(--color-primary)" }}>
        <NativeElement tagName="dt-button" attributes={{ surface: "onBrand" }}>
          On brand
        </NativeElement>
      </div>
    </Row>
  ),
};
export const AsLink: Story = {
  ...exampleStory,
  args: { label: "Read case study", href: "#case-study" },
};

export const States: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeElement tagName="dt-button" attributes={{ disabled: true }}>
        Disabled
      </NativeElement>
      <NativeElement tagName="dt-button" attributes={{ loading: true }}>
        Loading
      </NativeElement>
      <NativeElement
        tagName="dt-button"
        attributes={{ tone: "error", variant: "secondary" }}
      >
        Delete
      </NativeElement>
    </Row>
  ),
};

export const Example: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-button"
      attributes={{ icon: "arrow-right", "end-icon": "arrow-right" }}
    >
      View case study
    </NativeElement>
  ),
};

export const ForcedColors: Story = { ...forcedColorsStory };
