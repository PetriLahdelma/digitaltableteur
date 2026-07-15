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
  label: string;
  tone: "neutral" | "info" | "success" | "warning" | "error";
  size: "sm" | "md" | "lg";
  pulse: boolean;
};
function NativeStatusDot(args: Args) {
  return <NativeElement tagName="dt-status-dot" attributes={args} />;
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
  args: { label: "Online", tone: "success", size: "md", pulse: false },
  argTypes: {
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
            attributes={{ label: tone, tone }}
          />
        ),
      )}
    </Row>
  ),
};
export const Live: Story = {
  ...exampleStory,
  args: { label: "Live", tone: "success", pulse: true },
};
export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeElement
          key={size}
          tagName="dt-status-dot"
          attributes={{ label: size, size }}
        />
      ))}
    </Row>
  ),
};
export const Example: Story = {
  ...exampleStory,
  args: { label: "Deployment healthy", tone: "success" },
};
export const ForcedColors: Story = { ...forcedColorsStory };
