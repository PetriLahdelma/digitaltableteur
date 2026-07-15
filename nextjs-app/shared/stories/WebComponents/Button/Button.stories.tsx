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
  icon?: string;
  endIcon?: string;
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
        icon: args.icon,
        "end-icon": args.endIcon,
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
