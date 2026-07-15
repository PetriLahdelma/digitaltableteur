import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  icon: string;
  label: string;
  variant: "primary" | "secondary" | "tertiary";
  tone: "neutral" | "info" | "success" | "warning" | "error";
  size: "sm" | "md" | "lg";
  disabled: boolean;
};

function NativeIconButton(args: Args) {
  return <NativeElement tagName="dt-icon-button" attributes={args} />;
}

const meta = {
  title: "Web Components/Actions/IconButton",
  component: NativeIconButton,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: { component: "Native dt-icon-button custom element." },
    },
  },
  args: {
    icon: "moon",
    label: "Toggle dark mode",
    variant: "tertiary",
    tone: "neutral",
    size: "md",
    disabled: false,
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
  },
} satisfies Meta<typeof NativeIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-icon-button") };
export const Playground: Story = {};
export const Variants: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["primary", "secondary", "tertiary"] as const).map((variant) => (
        <NativeElement
          key={variant}
          tagName="dt-icon-button"
          attributes={{ icon: "star", label: variant, variant }}
        />
      ))}
    </Row>
  ),
};
export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeElement
          key={size}
          tagName="dt-icon-button"
          attributes={{ icon: "x", label: `Close ${size}`, size }}
        />
      ))}
    </Row>
  ),
};
export const DestructiveTone: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeElement
        tagName="dt-icon-button"
        attributes={{
          icon: "trash",
          label: "Delete",
          tone: "error",
          variant: "secondary",
        }}
      />
      <NativeElement
        tagName="dt-icon-button"
        attributes={{
          icon: "trash",
          label: "Delete",
          tone: "error",
          variant: "tertiary",
        }}
      />
    </Row>
  ),
};
export const Example: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-icon-button"
      attributes={{ icon: "list", label: "Open navigation", tooltip: "Menu" }}
    />
  ),
};
export const ForcedColors: Story = { ...forcedColorsStory };
