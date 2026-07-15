import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = { value: string; label: string; disabled: boolean };
function NativeSelectOption(args: Args) {
  return (
    <NativeElement
      tagName="dt-select"
      attributes={{
        label: "Select an option",
        value: args.disabled ? "option1" : args.value,
      }}
    >
      <NativeElement
        tagName="dt-select-option"
        attributes={{ value: "option1", label: "Option 1" }}
      />
      <NativeElement tagName="dt-select-option" attributes={args} />
      <NativeElement
        tagName="dt-select-option"
        attributes={{ value: "option3", label: "Option 3" }}
      />
    </NativeElement>
  );
}
const meta = {
  title: "Web Components/Forms/SelectOption",
  component: NativeSelectOption,
  tags: ["autodocs", "web-components"],
  parameters: { ...nativeStoryParameters, layout: "padded" },
  args: { value: "option2", label: "Option 2", disabled: false },
} satisfies Meta<typeof NativeSelectOption>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-select-option") };
export const Disabled: Story = { ...exampleStory, args: { disabled: true } };
export const Playground: Story = {};
export const Example: Story = { ...exampleStory };
export const ForcedColors: Story = { ...forcedColorsStory };
