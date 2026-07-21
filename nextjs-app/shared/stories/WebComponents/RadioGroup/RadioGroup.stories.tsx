import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

const basicOptions = [
  { value: "design", label: "Design systems" },
  { value: "product", label: "Product design" },
  { value: "research", label: "UX research" },
];
type Args = {
  legend: string;
  name: string;
  options: string;
  value?: string;
  defaultValue?: string;
  orientation: "vertical" | "horizontal";
  size: "sm" | "md" | "lg";
  disabled: boolean;
  required: boolean;
  error?: string;
  helperText?: string;
};
function NativeRadioGroup({ defaultValue, helperText, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-radio-group"
      attributes={{
        ...args,
        "default-value": defaultValue,
        "helper-text": helperText,
      }}
    />
  );
}
const meta = {
  title: "Web Components/Forms/RadioGroup",
  component: NativeRadioGroup,
  tags: ["autodocs", "beta", "web-components"],
  parameters: { ...nativeStoryParameters, layout: "padded" },
  args: {
    legend: "Primary expertise",
    name: "expertise",
    options: JSON.stringify(basicOptions),
    defaultValue: "design",
    orientation: "vertical",
    size: "md",
    disabled: false,
    required: false,
    helperText: "Choose the closest match.",
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof NativeRadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ["beta-matrix"] };
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-radio-group") };
export const Basic: Story = {
  ...exampleStory,
  args: { defaultValue: "design" },
};
export const Horizontal: Story = {
  ...exampleStory,
  args: { orientation: "horizontal", defaultValue: "engineering" },
};
export const WithError: Story = {
  ...exampleStory,
  args: { error: "Choose one discipline.", required: true },
};
export const DisabledOption: Story = {
  ...exampleStory,
  args: {
    options: JSON.stringify([
      { value: "design", label: "Design" },
      { value: "engineering", label: "Engineering", disabled: true },
    ]),
  },
};
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  args: { helperText: "Used to tailor the project team." },
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
