import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  content: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  size: "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
  lineHeight?: "tight" | "snug" | "normal" | "relaxed" | "loose";
  unstyled: boolean;
};

function NativeTitle({ lineHeight, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-title"
      attributes={{ ...args, "line-height": lineHeight }}
    />
  );
}

const meta = {
  title: "Web Components/Content/Title",
  component: NativeTitle,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: { description: { component: "Native dt-title heading." } },
  },
  args: {
    content: "Play with the Title component!",
    level: 2,
    size: "m",
    unstyled: false,
  },
  argTypes: {
    as: {
      control: "select",
      options: [undefined, "h1", "h2", "h3", "h4", "h5", "h6", "div"],
    },
    level: { control: "inline-radio", options: [1, 2, 3, 4, 5, 6] },
    size: {
      control: "select",
      options: ["xxs", "xs", "s", "m", "l", "xl", "xxl"],
    },
    lineHeight: {
      control: "select",
      options: ["tight", "snug", "normal", "relaxed", "loose"],
    },
  },
} satisfies Meta<typeof NativeTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-title") };
export const Playground: Story = {};
export const AllSizes: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(["xxs", "xs", "s", "m", "l", "xl", "xxl"] as const).map((size) => (
        <NativeElement
          key={size}
          tagName="dt-title"
          attributes={{ level: 2, size, content: `${size} title` }}
        />
      ))}
    </Stack>
  ),
};
export const AllLevels: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {([1, 2, 3, 4, 5, 6] as const).map((level) => (
        <NativeElement
          key={level}
          tagName="dt-title"
          attributes={{ level, content: `Heading level ${level}` }}
        />
      ))}
    </Stack>
  ),
};
export const CustomTagAndClass: Story = {
  render: () => (
    <>
      <style>
        {".custom-title::part(title) { color: var(--color-info); }"}
      </style>
      <NativeElement
        tagName="dt-title"
        attributes={{
          as: "div",
          class: "custom-title",
          content: "Custom tag and part styling",
          size: "m",
        }}
      />
    </>
  ),
};
export const LineHeights: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(["tight", "snug", "normal", "relaxed", "loose"] as const).map(
        (lineHeight) => (
          <NativeElement
            key={lineHeight}
            tagName="dt-title"
            attributes={{
              level: 2,
              "line-height": lineHeight,
              content: `${lineHeight} heading rhythm`,
            }}
          />
        ),
      )}
    </Stack>
  ),
};
export const Example: Story = {
  ...exampleStory,
  args: { content: "A stronger digital product", level: 1, size: "l" },
};
export const ForcedColors: Story = { ...forcedColorsStory };
