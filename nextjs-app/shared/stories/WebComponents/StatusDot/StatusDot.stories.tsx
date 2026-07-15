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
  children: string;
  label?: string;
  tone: "neutral" | "info" | "success" | "warning" | "error";
  size: "sm" | "md" | "lg";
  pulse: boolean;
};
function NativeStatusDot(args: Args) {
  const { children, ...attributes } = args;
  return (
    <NativeElement tagName="dt-status-dot" attributes={attributes}>
      {children}
    </NativeElement>
  );
}
const meta = {
  title: "Web Components/Feedback/StatusDot",
  component: NativeStatusDot,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: { component: "Native dt-status-dot custom element." },
    },
  },
  args: {
    children: "Operational",
    tone: "success",
    size: "md",
    pulse: false,
  },
  argTypes: {
    children: {
      control: "text",
      description: "Visible text rendered through the default slot.",
    },
    label: {
      control: "text",
      description:
        "Screen-reader-only fallback when the default slot is empty.",
    },
    tone: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "error"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    pulse: { control: "boolean" },
  },
} satisfies Meta<typeof NativeStatusDot>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-status-dot") };
export const Playground: Story = {};
export const Tones: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["neutral", "info", "success", "warning", "error"] as const).map(
        (tone) => (
          <NativeElement
            key={tone}
            tagName="dt-status-dot"
            attributes={{ tone }}
          >
            {tone}
          </NativeElement>
        ),
      )}
    </Row>
  ),
};
export const Live: Story = {
  ...exampleStory,
  args: { children: "Live", tone: "success", pulse: true },
};
export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeElement key={size} tagName="dt-status-dot" attributes={{ size }}>
          {size}
        </NativeElement>
      ))}
    </Row>
  ),
};
export const SrOnlyLabel: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-status-dot"
      attributes={{ label: "Connection lost", tone: "error" }}
    />
  ),
};
export const Example: Story = {
  ...exampleStory,
  args: { children: "Deployment healthy", tone: "success" },
};
export const ForcedColors: Story = { ...forcedColorsStory };
