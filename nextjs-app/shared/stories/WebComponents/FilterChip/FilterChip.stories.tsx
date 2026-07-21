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
  pressed: boolean;
  count?: number;
  variant: "underline" | "minimal" | "pill";
  size: "sm" | "md" | "lg";
  disabled: boolean;
};
function Chip(args: Args) {
  return <NativeElement tagName="dt-filter-chip" attributes={args} />;
}

const meta = {
  title: "Web Components/Actions/FilterChip",
  component: Chip,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: { component: "Native dt-filter-chip custom element." },
    },
  },
  args: {
    label: "Articles",
    pressed: true,
    count: 12,
    variant: "pill",
    size: "md",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["underline", "minimal", "pill"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    pressed: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-filter-chip") };
export const Playground: Story = { tags: ["beta-matrix"] };
export const Variants: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["underline", "minimal", "pill"] as const).map((variant) => (
        <NativeElement
          key={variant}
          tagName="dt-filter-chip"
          attributes={{ label: variant, variant, pressed: true }}
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
          tagName="dt-filter-chip"
          attributes={{ label: size, size, pressed: true }}
        />
      ))}
    </Row>
  ),
};
export const Counts: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeElement
        tagName="dt-filter-chip"
        attributes={{ label: "All", count: 48, pressed: true }}
      />
      <NativeElement
        tagName="dt-filter-chip"
        attributes={{ label: "Case studies", count: 6 }}
      />
    </Row>
  ),
};
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  render: () => (
    <Row>
      <NativeElement
        tagName="dt-filter-chip"
        attributes={{ label: "All", pressed: true }}
      />
      <NativeElement
        tagName="dt-filter-chip"
        attributes={{ label: "Design systems" }}
      />
      <NativeElement
        tagName="dt-filter-chip"
        attributes={{ label: "Accessibility" }}
      />
    </Row>
  ),
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
