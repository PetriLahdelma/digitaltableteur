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
  tone: "" | "neutral" | "info" | "success" | "warning" | "error";
  size: "xs" | "sm" | "md" | "lg";
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
    // The React stories use the default padded canvas; centered starts
    // content on fractional x and shifts glyph rasterization.
    layout: "padded",
    docs: { description: { component: "Native dt-badge custom element." } },
  },
  // Mirrors the React Playground/Default args (children "Badge", no tone —
  // distinct from "neutral", exactly like the React optional tone prop).
  args: {
    label: "Badge",
    variant: "primary",
    tone: "",
    size: "md",
    removable: false,
    dot: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary"] },
    tone: {
      control: "select",
      options: ["", "neutral", "info", "success", "warning", "error"],
    },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg"] },
    removable: { control: "boolean" },
    dot: { control: "boolean" },
  },
} satisfies Meta<typeof NativeBadge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-badge") };
export const Playground: Story = { tags: ["beta-matrix"] };
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
      {(
        [
          ["xs", "Extra Small"],
          ["sm", "Small"],
          ["md", "Medium"],
          ["lg", "Large"],
        ] as const
      ).map(([size, label]) => (
        <NativeElement
          key={size}
          tagName="dt-badge"
          attributes={{ label, size }}
        />
      ))}
    </Row>
  ),
};
export const AsCount: Story = {
  ...exampleStory,
  args: { label: "3", tone: "info", size: "sm" },
};
// Replica of the React Example (TonesContent): all variants and tones in a
// wrapping flex row; the rendered-parity gate compares them 1:1.
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <NativeElement tagName="dt-badge" attributes={{ label: "Primary" }} />
      <NativeElement
        tagName="dt-badge"
        attributes={{ label: "Secondary", variant: "secondary" }}
      />
      <NativeElement
        tagName="dt-badge"
        attributes={{ label: "Success", tone: "success" }}
      />
      <NativeElement
        tagName="dt-badge"
        attributes={{ label: "Error", tone: "error" }}
      />
      <NativeElement
        tagName="dt-badge"
        attributes={{ label: "Warning", tone: "warning" }}
      />
      <NativeElement
        tagName="dt-badge"
        attributes={{ label: "Info", tone: "info" }}
      />
      <NativeElement
        tagName="dt-badge"
        attributes={{ label: "Neutral", tone: "neutral" }}
      />
    </div>
  ),
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
