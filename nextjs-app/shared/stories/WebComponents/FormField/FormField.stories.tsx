import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  legend: string;
  groupDescription?: string;
  error?: string;
  required: boolean;
  disabled: boolean;
};
function NativeFormField({ groupDescription, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-form-field"
      attributes={{ ...args, "group-description": groupDescription }}
    >
      <NativeElement
        tagName="dt-checkbox"
        attributes={{ label: "Email", checked: true }}
      />
      <NativeElement tagName="dt-checkbox" attributes={{ label: "SMS" }} />
      <NativeElement tagName="dt-checkbox" attributes={{ label: "Push" }} />
    </NativeElement>
  );
}
const meta = {
  title: "Web Components/Forms/FormField",
  component: NativeFormField,
  tags: ["autodocs", "stable", "web-components"],
  parameters: { ...nativeStoryParameters, layout: "padded" },
  args: {
    legend: "Notification channels",
    groupDescription: "Pick at least one",
    required: false,
    disabled: false,
  },
} satisfies Meta<typeof NativeFormField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-form-field") };
export const CheckboxCluster: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement tagName="dt-form-field" attributes={{ legend: "Services" }}>
      <NativeElement tagName="dt-checkbox" attributes={{ label: "Strategy" }} />
      <NativeElement tagName="dt-checkbox" attributes={{ label: "Design" }} />
    </NativeElement>
  ),
};
export const GroupError: Story = {
  ...exampleStory,
  args: { error: "Select at least one preference.", required: true },
};
export const CompositeField: Story = {
  ...exampleStory,
  args: {
    legend: "Contact preferences",
    groupDescription: "Choose all that apply.",
  },
};
export const CustomRadioSet: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement tagName="dt-form-field" attributes={{ legend: "Budget" }}>
      <NativeElement
        tagName="dt-radio"
        attributes={{ label: "Under 10k", name: "budget", value: "small" }}
      />
      <NativeElement
        tagName="dt-radio"
        attributes={{ label: "10k or more", name: "budget", value: "large" }}
      />
    </NativeElement>
  ),
};
export const Playground: Story = {};
export const Example: Story = { ...exampleStory };
export const ForcedColors: Story = { ...forcedColorsStory };
