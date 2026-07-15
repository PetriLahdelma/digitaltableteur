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
  as:
    | "p"
    | "span"
    | "div"
    | "strong"
    | "em"
    | "cite"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";
  size: "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
  lineHeight?: "tight" | "snug" | "normal" | "relaxed" | "loose";
};

function NativeText({ lineHeight, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-text"
      attributes={{ ...args, "line-height": lineHeight }}
    />
  );
}

const meta = {
  title: "Web Components/Content/Text",
  component: NativeText,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: { description: { component: "Native dt-text typography." } },
  },
  args: {
    content: "This is default text.",
    as: "p",
    size: "m",
  },
  argTypes: {
    as: {
      control: "select",
      options: [
        "p",
        "span",
        "div",
        "strong",
        "em",
        "cite",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ],
    },
    size: {
      control: "select",
      options: ["xxs", "xs", "s", "m", "l", "xl", "xxl"],
    },
    lineHeight: {
      control: "select",
      options: ["tight", "snug", "normal", "relaxed", "loose"],
    },
  },
} satisfies Meta<typeof NativeText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-text") };
export const Playground: Story = {};
export const AsSpan: Story = { args: { as: "span", content: "Inline text" } };
export const CustomClass: Story = {
  render: () => (
    <>
      <style>
        {
          ".custom-text::part(text) { color: var(--color-info); font-weight: 600; }"
        }
      </style>
      <NativeElement
        tagName="dt-text"
        attributes={{ class: "custom-text", content: "Custom class and part" }}
      />
    </>
  ),
};
export const AllTags: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(
        [
          "p",
          "span",
          "div",
          "strong",
          "em",
          "cite",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
        ] as const
      ).map((as) => (
        <NativeElement
          key={as}
          tagName="dt-text"
          attributes={{ as, content: `${as} text` }}
        />
      ))}
    </Stack>
  ),
};
export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(["xxs", "xs", "s", "m", "l", "xl", "xxl"] as const).map((size) => (
        <NativeElement
          key={size}
          tagName="dt-text"
          attributes={{ size, content: `${size} body text` }}
        />
      ))}
    </Stack>
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
            tagName="dt-text"
            attributes={{
              "line-height": lineHeight,
              content: `${lineHeight}: A longer sample demonstrates the typography rhythm across multiple lines of body copy.`,
            }}
          />
        ),
      )}
    </Stack>
  ),
};
export const Example: Story = {
  ...exampleStory,
  args: { content: "Body copy for a marketing section.", size: "l" },
};
export const ForcedColors: Story = { ...forcedColorsStory };
