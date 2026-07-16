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
  variant: "primary" | "secondary";
  tone: "neutral" | "info" | "success" | "warning" | "error";
  size: "sm" | "md" | "lg";
  removable: boolean;
  dot: boolean;
};
function NativeBadge(args: Args) {
  return <NativeElement tagName="dt-badge" attributes={args} />;
}
const meta = {
  title: "Web Components/Content/Badge",
  component: NativeBadge,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-badge custom element." } },
  },
  args: {
    label: "Beta",
    variant: "primary",
    tone: "warning",
    size: "md",
    removable: false,
    dot: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary"] },
    tone: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "error"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    removable: { control: "boolean" },
    dot: { control: "boolean" },
  },
} satisfies Meta<typeof NativeBadge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-badge") };
export const Playground: Story = {};
export const Tones: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["neutral", "info", "success", "warning", "error"] as const).map(
        (tone) => (
          <NativeElement
            key={tone}
            tagName="dt-badge"
            attributes={{ label: tone, tone }}
          />
        ),
      )}
    </Row>
  ),
};
export const SecondaryVariants: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeElement tagName="dt-badge" attributes={{ label: "Primary" }} />
      <NativeElement
        tagName="dt-badge"
        attributes={{ label: "Secondary", variant: "secondary" }}
      />
    </Row>
  ),
};
export const Removable: Story = {
  ...exampleStory,
  args: { label: "Design systems", removable: true },
};
export const WithIcon: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement tagName="dt-badge" attributes={{ label: "Verified" }}>
      <NativeElement
        tagName="dt-icon"
        slot="icon"
        attributes={{ name: "check" }}
      />
    </NativeElement>
  ),
};
export const LifecycleDots: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeElement
        tagName="dt-badge"
        attributes={{ label: "Stable", tone: "success", dot: true }}
      />
      <NativeElement
        tagName="dt-badge"
        attributes={{ label: "Beta", tone: "warning", dot: true }}
      />
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
          tagName="dt-badge"
          attributes={{ label: size, size }}
        />
      ))}
    </Row>
  ),
};
export const AsCount: Story = {
  ...exampleStory,
  args: { label: "3", tone: "info", size: "sm" },
};
export const Example: Story = {
  ...exampleStory,
  args: { label: "New", tone: "info" },
};
export const ForcedColors: Story = { ...forcedColorsStory };
