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
  type: "single" | "multiple";
  orientation: "vertical" | "horizontal";
  disabled: boolean;
  error?: string;
};
function Cards(args: Args) {
  return (
    <Stack>
      <NativeElement
        tagName="dt-selectable-card-group"
        attributes={{
          type: args.type,
          legend: "Choose a plan",
          name: "plan",
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
          <strong>Starter</strong>
          <p>1 seat, community support.</p>
        </NativeElement>
        <NativeElement
          tagName="dt-selectable-card"
          attributes={{ value: "team" }}
        >
          <strong>Team</strong>
          <p>Up to 10 seats, priority support.</p>
        </NativeElement>
        <NativeElement
          tagName="dt-selectable-card"
          attributes={{ value: "scale" }}
        >
          <strong>Scale</strong>
          <p>Unlimited seats, SLA.</p>
        </NativeElement>
      </NativeElement>
    </Stack>
  );
}
const meta = {
  title: "Web Components/Layout/SelectableCard",
  component: Cards,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: {
        component:
          "Native dt-selectable-card and dt-selectable-card-group custom elements.",
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
} satisfies Meta<typeof Cards>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: assertNative("dt-selectable-card-group"),
};
export const Playground: Story = {};
export const Example: Story = { ...exampleStory };
export const MultiSelect: Story = { args: { type: "multiple" } };
export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const Disabled: Story = { args: { disabled: true } };
export const WithError: Story = {
  args: { error: "Choose at least one plan." },
};
export const ForcedColors: Story = { ...forcedColorsStory };
