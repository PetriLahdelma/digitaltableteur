import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stage,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  titleText: string;
  description: string;
  icon?: string;
  headingLevel: "h2" | "h3" | "h4";
  size: "sm" | "md" | "lg";
  withAction: boolean;
};
function NativeEmptyState({
  titleText,
  headingLevel,
  withAction,
  ...args
}: Args) {
  return (
    <Stage width="32rem">
      <NativeElement
        tagName="dt-empty-state"
        attributes={{
          ...args,
          "title-text": titleText,
          "heading-level": headingLevel,
        }}
      >
        {withAction ? (
          <NativeElement tagName="dt-button" slot="action">
            Clear filters
          </NativeElement>
        ) : null}
      </NativeElement>
    </Stage>
  );
}
const meta = {
  title: "Web Components/Content/EmptyState",
  component: NativeEmptyState,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-empty-state composition." } },
  },
  args: {
    titleText: "No results",
    description: "Try another filter.",
    icon: "magnifying-glass",
    headingLevel: "h2",
    size: "md",
    withAction: true,
  },
  argTypes: {
    headingLevel: { control: "inline-radio", options: ["h2", "h3", "h4"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    withAction: { control: "boolean" },
  },
} satisfies Meta<typeof NativeEmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-empty-state") };
export const Playground: Story = {};
export const WithAction: Story = { ...exampleStory };
export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeElement
          key={size}
          tagName="dt-empty-state"
          attributes={{
            "title-text": `${size} empty state`,
            description: "Nothing here yet.",
            size,
          }}
        />
      ))}
    </div>
  ),
};
export const ClearedFilters: Story = {
  ...exampleStory,
  args: {
    titleText: "No matching projects",
    description: "Clear filters to see every project.",
    icon: "funnel",
    withAction: true,
  },
};
export const Example: Story = {
  ...exampleStory,
  args: {
    titleText: "No saved items",
    description: "Save a case study to find it here.",
    icon: "bookmark",
    withAction: false,
  },
};
export const ForcedColors: Story = { ...forcedColorsStory };
