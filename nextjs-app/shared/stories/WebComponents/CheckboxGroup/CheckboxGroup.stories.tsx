import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

const options = JSON.stringify([
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
  { value: "option4", label: "Option 4" },
  { value: "option5", label: "Option 5" },
]);
type Args = {
  label: string;
  name: string;
  options: string;
  showMasterCheckbox: boolean;
  masterLabel: string;
  defaultSelected?: string;
};
function NativeCheckboxGroup({
  showMasterCheckbox,
  masterLabel,
  defaultSelected,
  ...args
}: Args) {
  return (
    <NativeElement
      tagName="dt-checkbox-group"
      attributes={{
        ...args,
        "show-master-checkbox": showMasterCheckbox,
        "master-label": masterLabel,
        "default-selected": defaultSelected,
      }}
    />
  );
}
const meta = {
  title: "Web Components/Forms/CheckboxGroup",
  component: NativeCheckboxGroup,
  tags: ["autodocs", "stable", "web-components"],
  parameters: { ...nativeStoryParameters, layout: "padded" },
  args: {
    label: "Group Label",
    name: "interests",
    options,
    showMasterCheckbox: true,
    masterLabel: "Select All",
  },
} satisfies Meta<typeof NativeCheckboxGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-checkbox-group") };
export const WithMasterCheckbox: Story = {
  ...exampleStory,
  args: { showMasterCheckbox: true },
};
export const WithoutMasterCheckbox: Story = {
  ...exampleStory,
  args: { showMasterCheckbox: false },
};
export const WithIndeterminateState: Story = {
  ...exampleStory,
  args: { defaultSelected: JSON.stringify(["strategy"]) },
};
export const Playground: Story = {};
export const Example: Story = {
  ...exampleStory,
  args: { defaultSelected: JSON.stringify(["strategy", "design"]) },
};
export const ForcedColors: Story = { ...forcedColorsStory };
