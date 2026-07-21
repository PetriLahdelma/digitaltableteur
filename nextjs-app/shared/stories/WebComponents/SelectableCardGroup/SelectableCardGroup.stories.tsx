import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  type: "single" | "multiple";
  orientation: "vertical" | "horizontal";
  disabled: boolean;
  error?: string;
};

function NativeSelectableCardGroup(args: Args) {
  return (
    <NativeElement
      tagName="dt-selectable-card-group"
      attributes={{
        type: args.type,
        legend: "Choose a plan",
        name: "native-plan-group-story",
        "default-value":
          args.type === "multiple" ? JSON.stringify(["team"]) : "team",
        orientation: args.orientation,
        disabled: args.disabled,
        error: args.error,
        "helper-text": args.error ? undefined : "You can change this later.",
      }}
    >
      <NativeElement
        tagName="dt-selectable-card"
        attributes={{ value: "starter" }}
      >
        Starter
      </NativeElement>
      <NativeElement
        tagName="dt-selectable-card"
        attributes={{ value: "team" }}
      >
        Team
      </NativeElement>
      <NativeElement
        tagName="dt-selectable-card"
        attributes={{ value: "scale" }}
      >
        Scale
      </NativeElement>
    </NativeElement>
  );
}

const meta = {
  title: "Web Components/Layout/SelectableCardGroup",
  component: NativeSelectableCardGroup,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: {
        component:
          "Native dt-selectable-card-group selection owner for dt-selectable-card options.",
      },
    },
  },
  args: { type: "single", orientation: "vertical", disabled: false },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multiple"] },
    orientation: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
    },
  },
} satisfies Meta<typeof NativeSelectableCardGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  play: assertNative("dt-selectable-card-group"),
};
export const Playground: Story = { tags: ["beta-matrix"] };
export const Example: Story = {
  tags: ["beta-matrix"], ...exampleStory };
export const MultiSelect: Story = { args: { type: "multiple" } };
export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const Disabled: Story = { args: { disabled: true } };
export const WithError: Story = {
  args: { error: "Choose at least one plan." },
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
