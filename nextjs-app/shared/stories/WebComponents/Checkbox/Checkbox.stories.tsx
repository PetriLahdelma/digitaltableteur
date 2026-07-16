import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  label: string;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  size: "sm" | "md" | "lg";
  error?: string;
  helperText?: string;
  required: boolean;
};
function NativeCheckbox({ helperText, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-checkbox"
      attributes={{ ...args, "helper-text": helperText }}
    />
  );
}
const meta = {
  title: "Web Components/Forms/Checkbox",
  component: NativeCheckbox,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: {
        component: "Form-associated native dt-checkbox custom element.",
      },
    },
  },
  args: {
    label: "Default Checkbox",
    checked: true,
    indeterminate: false,
    disabled: false,
    size: "md",
    required: false,
  },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof NativeCheckbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-checkbox") };
export const Checked: Story = { ...exampleStory, args: { checked: true } };
export const Indeterminate: Story = {
  ...exampleStory,
  args: { label: "Select all", indeterminate: true },
};
export const Disabled: Story = { ...exampleStory, args: { disabled: true } };
export const DisabledChecked: Story = {
  ...exampleStory,
  args: { disabled: true, checked: true },
};
export const AllStates: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      <NativeElement
        tagName="dt-checkbox"
        attributes={{ label: "Unchecked" }}
      />
      <NativeElement
        tagName="dt-checkbox"
        attributes={{ label: "Checked", checked: true }}
      />
      <NativeElement
        tagName="dt-checkbox"
        attributes={{ label: "Mixed", indeterminate: true }}
      />
      <NativeElement
        tagName="dt-checkbox"
        attributes={{ label: "Disabled", disabled: true }}
      />
    </Stack>
  ),
};
export const SizeSmall: Story = { ...exampleStory, args: { size: "sm" } };
export const SizeMedium: Story = { ...exampleStory, args: { size: "md" } };
export const SizeLarge: Story = { ...exampleStory, args: { size: "lg" } };
export const AllSizes: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeElement
          key={size}
          tagName="dt-checkbox"
          attributes={{ label: size, size, checked: true }}
        />
      ))}
    </Row>
  ),
};
export const Validation: Story = {
  ...exampleStory,
  args: {
    required: true,
    error: "Consent is required.",
    helperText: "You can withdraw consent later.",
  },
};
export const SelectAllParent: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      <NativeElement
        tagName="dt-checkbox"
        attributes={{ label: "Select all", indeterminate: true }}
      />
      <NativeElement
        tagName="dt-checkbox"
        attributes={{ label: "Typography", checked: true }}
      />
      <NativeElement
        tagName="dt-checkbox"
        attributes={{ label: "Color tokens" }}
      />
    </Stack>
  ),
};
export const Playground: Story = {};
export const Example: Story = {
  ...exampleStory,
  args: { label: "I agree to the terms", required: true },
};
export const ForcedColors: Story = { ...forcedColorsStory };
