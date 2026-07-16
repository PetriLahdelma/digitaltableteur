import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

const defaultItems = JSON.stringify([
  "First list item",
  "Second list item",
  "Third list item",
]);

type Args = {
  items: string;
  as: "ul" | "ol";
  size: "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
  lineHeight?: "tight" | "snug" | "normal" | "relaxed" | "loose";
  spacing: "compact" | "normal" | "relaxed";
  listStyleType?:
    | "disc"
    | "circle"
    | "square"
    | "decimal"
    | "decimal-leading-zero"
    | "lower-alpha"
    | "upper-alpha"
    | "lower-roman"
    | "upper-roman"
    | "none"
    | "dash";
};

function NativeList({ lineHeight, listStyleType, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-list"
      attributes={{
        ...args,
        "line-height": lineHeight,
        "list-style-type": listStyleType,
      }}
    />
  );
}

const meta = {
  title: "Web Components/Content/List",
  component: NativeList,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: { description: { component: "Native dt-list typography." } },
  },
  args: { items: defaultItems, as: "ul", size: "m", spacing: "normal" },
  argTypes: {
    items: { control: "object" },
    as: { control: "inline-radio", options: ["ul", "ol"] },
    size: {
      control: "select",
      options: ["xxs", "xs", "s", "m", "l", "xl", "xxl"],
    },
    lineHeight: {
      control: "select",
      options: ["tight", "snug", "normal", "relaxed", "loose"],
    },
    spacing: {
      control: "inline-radio",
      options: ["compact", "normal", "relaxed"],
    },
    listStyleType: {
      control: "select",
      options: [
        "disc",
        "circle",
        "square",
        "decimal",
        "decimal-leading-zero",
        "lower-alpha",
        "upper-alpha",
        "lower-roman",
        "upper-roman",
        "none",
        "dash",
      ],
    },
  },
} satisfies Meta<typeof NativeList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-list") };
export const Playground: Story = {};
export const UnorderedList: Story = {
  ...exampleStory,
  args: { as: "ul", listStyleType: "disc" },
};
export const OrderedList: Story = {
  ...exampleStory,
  args: { as: "ol", listStyleType: "decimal" },
};
export const DifferentSizes: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(["xxs", "xs", "s", "m", "l", "xl", "xxl"] as const).map((size) => (
        <NativeElement
          key={size}
          tagName="dt-list"
          attributes={{ items: defaultItems, size }}
        />
      ))}
    </Stack>
  ),
};
export const DifferentSpacing: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(["compact", "normal", "relaxed"] as const).map((spacing) => (
        <NativeElement
          key={spacing}
          tagName="dt-list"
          attributes={{ items: defaultItems, spacing }}
        />
      ))}
    </Stack>
  ),
};
export const DifferentListStyles: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(
        [
          "disc",
          "circle",
          "square",
          "decimal",
          "decimal-leading-zero",
          "lower-alpha",
          "upper-alpha",
          "lower-roman",
          "upper-roman",
          "none",
          "dash",
        ] as const
      ).map((listStyleType) => (
        <NativeElement
          key={listStyleType}
          tagName="dt-list"
          attributes={{
            items: defaultItems,
            as: [
              "decimal",
              "decimal-leading-zero",
              "lower-alpha",
              "upper-alpha",
              "lower-roman",
              "upper-roman",
            ].includes(listStyleType)
              ? "ol"
              : "ul",
            "list-style-type": listStyleType,
          }}
        />
      ))}
    </Stack>
  ),
};
export const WithComplexItems: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement tagName="dt-list">
      <li>
        <strong>Bold lead</strong> with supporting text
      </li>
      <li>
        <em>Emphasized lead</em> with supporting text
      </li>
      <li>
        <NativeElement tagName="dt-icon" attributes={{ name: "check" }} /> With
        an icon
      </li>
    </NativeElement>
  ),
};
export const WithLineHeights: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(["tight", "snug", "normal", "relaxed", "loose"] as const).map(
        (lineHeight) => (
          <NativeElement
            key={lineHeight}
            tagName="dt-list"
            attributes={{
              items: defaultItems,
              "line-height": lineHeight,
            }}
          />
        ),
      )}
    </Stack>
  ),
};
export const Example: Story = { ...exampleStory };
export const ForcedColors: Story = { ...forcedColorsStory };
