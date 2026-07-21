import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  variant: "text" | "circle" | "rect" | "avatar" | "card";
  width?: string;
  height?: string;
  lines: number;
  label: string;
  animate: boolean;
};
function NativeSkeleton({ width, height, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-skeleton"
      attributes={{
        ...args,
        width: width && width !== "0" ? width : undefined,
        height: height && height !== "0" ? height : undefined,
        animate: args.animate ? true : "false",
      }}
    />
  );
}
const meta = {
  title: "Web Components/Feedback/Skeleton",
  component: NativeSkeleton,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: { description: { component: "Native loading placeholder." } },
  },
  args: { variant: "text", lines: 3, label: "Loading content", animate: true },
  argTypes: {
    variant: {
      control: "select",
      options: ["text", "circle", "rect", "avatar", "card"],
    },
  },
} satisfies Meta<typeof NativeSkeleton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const TextLines: Story = { ...exampleStory, args: { lines: 4 } };
export const Card: Story = { ...exampleStory, args: { variant: "card" } };
export const Avatar: Story = { ...exampleStory, args: { variant: "avatar" } };
export const Shapes: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeSkeleton
        variant="circle"
        width="48"
        height="48"
        lines={3}
        label="Loading icon"
        animate
      />
      <NativeSkeleton
        variant="rect"
        width="16rem"
        height="100"
        lines={3}
        label="Loading media"
        animate
      />
    </Row>
  ),
};
export const ComposedPage: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      <NativeSkeleton
        variant="avatar"
        lines={3}
        label="Loading avatar"
        animate
      />
      <NativeSkeleton
        variant="rect"
        height="140"
        lines={3}
        label="Loading media"
        animate
      />
      <NativeSkeleton variant="text" lines={3} label="Loading text" animate />
    </Stack>
  ),
};
export const Static: Story = { ...exampleStory, args: { animate: false } };
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-skeleton") };
export const Playground: Story = {
  tags: ["beta-matrix"], args: { width: "16rem" } };
export const Example: Story = {
  tags: ["beta-matrix"], ...exampleStory };
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
