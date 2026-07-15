import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  label: string;
  checked: boolean;
  disabled: boolean;
  loading: boolean;
  size: "sm" | "md" | "lg";
  labelPlacement: "left" | "right" | "top";
  helperText?: string;
  error?: string;
};
function NativeSwitch({ labelPlacement, helperText, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-switch"
      attributes={{
        ...args,
        "label-placement": labelPlacement,
        "helper-text": helperText,
      }}
    />
  );
}
const meta = {
  title: "Web Components/Forms/Switch",
  component: NativeSwitch,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    contractStatus: "beta",
    docs: {
      description: {
        component: "Native immediate-action dt-switch custom element.",
      },
    },
  },
  args: {
    label: "Enable notifications",
    checked: false,
    disabled: false,
    loading: false,
    size: "md",
    labelPlacement: "right",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    labelPlacement: {
      control: "inline-radio",
      options: ["left", "right", "top"],
    },
  },
} satisfies Meta<typeof NativeSwitch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-switch") };
export const Loading: Story = {
  ...exampleStory,
  args: { checked: true, loading: true },
};
export const LabelOnTop: Story = {
  ...exampleStory,
  name: "Label on Top",
  args: { labelPlacement: "top" },
};
export const LabelOnLeft: Story = {
  ...exampleStory,
  name: "Label on Left (Full Width)",
  args: { labelPlacement: "left" },
};
export const WithHelperText: Story = {
  ...exampleStory,
  args: { helperText: "Applies to all devices." },
};
export const SizeSmall: Story = {
  ...exampleStory,
  name: "Size Small (v2.0.0)",
  args: { size: "sm" },
};
export const SizeMedium: Story = {
  ...exampleStory,
  name: "Size Medium (v2.0.0)",
  args: { size: "md" },
};
export const SizeLarge: Story = {
  ...exampleStory,
  name: "Size Large (v2.0.0)",
  args: { size: "lg" },
};
export const AllSizes: Story = {
  ...exampleStory,
  name: "All Sizes (v2.0.0)",
  render: () => (
    <Row>
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeElement
          key={size}
          tagName="dt-switch"
          attributes={{ label: size, size, checked: true }}
        />
      ))}
    </Row>
  ),
};
export const WithError: Story = {
  ...exampleStory,
  args: { error: "Could not update this preference." },
};
export const Playground: Story = {};
export const Example: Story = {
  ...exampleStory,
  args: { label: "Dark mode", checked: true },
};
export const ForcedColors: Story = { ...forcedColorsStory };
