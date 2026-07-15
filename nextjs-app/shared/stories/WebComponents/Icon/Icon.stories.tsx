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
  name: string;
  weight: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  size: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  color?: string;
  rotate: number;
  flip?: "horizontal" | "vertical" | "both";
  spin: boolean;
  pulse: boolean;
  ariaLabel?: string;
};
function NativeIcon({ ariaLabel, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-icon"
      attributes={{ ...args, "aria-label": ariaLabel }}
    />
  );
}
const meta = {
  title: "Web Components/Content/Icon",
  component: NativeIcon,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component: "Framework-free dt-icon rendered from raw SVG data.",
      },
    },
  },
  args: {
    name: "sparkle",
    weight: "regular",
    size: "xl",
    rotate: 0,
    spin: false,
    pulse: false,
    ariaLabel: "Sparkle",
  },
  argTypes: {
    weight: {
      control: "select",
      options: ["thin", "light", "regular", "bold", "fill", "duotone"],
    },
    size: {
      control: "select",
      options: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
    },
    rotate: { control: "select", options: [0, 90, 180, 270] },
    flip: {
      control: "select",
      options: [undefined, "horizontal", "vertical", "both"],
    },
  },
} satisfies Meta<typeof NativeIcon>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-icon") };
export const Playground: Story = {};
export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["xs", "sm", "md", "lg", "xl", "2xl"] as const).map((size) => (
        <NativeElement
          key={size}
          tagName="dt-icon"
          attributes={{ name: "sparkle", size, "aria-label": size }}
        />
      ))}
    </Row>
  ),
};
export const Weights: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["thin", "light", "regular", "bold", "fill", "duotone"] as const).map(
        (weight) => (
          <NativeElement
            key={weight}
            tagName="dt-icon"
            attributes={{
              name: "star",
              weight,
              size: "lg",
              "aria-label": weight,
            }}
          />
        ),
      )}
    </Row>
  ),
};
export const Animated: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeElement
        tagName="dt-icon"
        attributes={{ name: "spinner", spin: true, "aria-label": "Loading" }}
      />
      <NativeElement
        tagName="dt-icon"
        attributes={{ name: "heart", pulse: true, "aria-label": "Favorite" }}
      />
    </Row>
  ),
};
export const Transformations: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {([0, 90, 180, 270] as const).map((rotate) => (
        <NativeElement
          key={rotate}
          tagName="dt-icon"
          attributes={{
            name: "arrow-right",
            rotate,
            "aria-label": `${rotate} degrees`,
          }}
        />
      ))}
    </Row>
  ),
};
export const ColorShowcase: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(
        [
          "var(--color-primary)",
          "var(--color-success)",
          "var(--color-error)",
        ] as const
      ).map((color) => (
        <NativeElement
          key={color}
          tagName="dt-icon"
          attributes={{ name: "circle", color, size: "xl", decorative: true }}
        />
      ))}
    </Row>
  ),
};
export const DecorativeVsInformative: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeElement
        tagName="dt-icon"
        attributes={{ name: "sparkle", decorative: true, size: "xl" }}
      />
      <NativeElement
        tagName="dt-icon"
        attributes={{ name: "warning", "aria-label": "Warning", size: "xl" }}
      />
    </Row>
  ),
};
export const Example: Story = {
  ...exampleStory,
  args: {
    name: "check-circle",
    weight: "duotone",
    size: "lg",
    ariaLabel: "Complete",
  },
};
export const ForcedColors: Story = { ...forcedColorsStory };
