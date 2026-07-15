import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stage,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = { orientation: "horizontal" | "vertical"; decorative: boolean };
function NativeDivider(args: Args) {
  return (
    <Stage
      width={args.orientation === "horizontal" ? "24rem" : undefined}
      height={args.orientation === "vertical" ? "8rem" : undefined}
    >
      <NativeElement
        tagName="dt-divider"
        attributes={{
          orientation: args.orientation,
          decorative: args.decorative ? undefined : "false",
        }}
      />
    </Stage>
  );
}
const meta = {
  title: "Web Components/Layout/Divider",
  component: NativeDivider,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-divider custom element." } },
  },
  args: { orientation: "horizontal", decorative: true },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    decorative: { control: "boolean" },
  },
} satisfies Meta<typeof NativeDivider>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-divider") };
export const Playground: Story = {};
export const Vertical: Story = {
  ...exampleStory,
  args: { orientation: "vertical" },
};
export const MeaningfulSeparator: Story = {
  ...exampleStory,
  args: { decorative: false },
};
export const DecorativeRhythm: Story = {
  ...exampleStory,
  render: () => (
    <Stage width="24rem">
      <p>First section</p>
      <NativeElement tagName="dt-divider" />
      <p>Second section</p>
    </Stage>
  ),
};
export const VerticalInRow: Story = {
  ...exampleStory,
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: "1rem",
        height: "4rem",
      }}
    >
      <span>Before</span>
      <NativeElement
        tagName="dt-divider"
        attributes={{ orientation: "vertical" }}
      />
      <span>After</span>
    </div>
  ),
};
export const Example: Story = { ...exampleStory };
export const ForcedColors: Story = { ...forcedColorsStory };
