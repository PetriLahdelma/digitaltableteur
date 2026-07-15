import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stage,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  label: string;
  value: number;
  max: number;
  state: "neutral" | "info" | "success" | "warning" | "error";
  size: "sm" | "md" | "lg";
  indeterminate: boolean;
};
function NativeProgress(args: Args) {
  return (
    <Stage width="24rem">
      <NativeElement tagName="dt-progress" attributes={args} />
    </Stage>
  );
}
const meta = {
  title: "Web Components/Feedback/Progress",
  component: NativeProgress,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-progress custom element." } },
  },
  args: {
    label: "Upload progress",
    value: 68,
    max: 100,
    state: "info",
    size: "md",
    indeterminate: false,
  },
  argTypes: {
    state: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "error"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    indeterminate: { control: "boolean" },
  },
} satisfies Meta<typeof NativeProgress>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-progress") };
export const Playground: Story = {};
export const Determinate: Story = { ...exampleStory, args: { value: 42 } };
export const Indeterminate: Story = {
  ...exampleStory,
  args: { indeterminate: true },
};
export const States: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(["neutral", "info", "success", "warning", "error"] as const).map(
        (state) => (
          <NativeElement
            key={state}
            tagName="dt-progress"
            attributes={{ label: state, value: 68, state }}
          />
        ),
      )}
    </Stack>
  ),
};
export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeElement
          key={size}
          tagName="dt-progress"
          attributes={{ label: size, value: 68, size }}
        />
      ))}
    </Stack>
  ),
};
export const Example: Story = {
  ...exampleStory,
  args: { label: "Profile completeness", value: 80, state: "success" },
};
export const ForcedColors: Story = { ...forcedColorsStory };
