import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

const options = JSON.stringify([
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
]);
type Args = {
  label: string;
  name: string;
  options: string;
  value?: string;
  defaultValue?: string;
  helperText?: string;
  error?: string;
  size: "sm" | "md" | "lg";
  disabled: boolean;
  required: boolean;
};
function NativeSelect({ defaultValue, helperText, ...args }: Args) {
  return (
    <div style={{ width: "20rem", maxWidth: "90vw" }}>
      <NativeElement
        tagName="dt-select"
        attributes={{
          ...args,
          "default-value": defaultValue,
          "helper-text": helperText,
        }}
      />
    </div>
  );
}
function ControlledSelect() {
  const [value, setValue] = useState("design");
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = wrapperRef.current?.querySelector("dt-select");
    const update = (event: Event) =>
      setValue((event as CustomEvent<{ value: string }>).detail.value);
    element?.addEventListener("value-change", update);
    return () => element?.removeEventListener("value-change", update);
  }, []);
  return (
    <div ref={wrapperRef}>
      <NativeElement
        tagName="dt-select"
        attributes={{ label: "Discipline", name: "discipline", options, value }}
      />
    </div>
  );
}
const meta = {
  title: "Web Components/Forms/Select",
  component: NativeSelect,
  tags: ["autodocs", "stable", "web-components"],
  parameters: { ...nativeStoryParameters, layout: "padded" },
  args: {
    label: "Select an option",
    name: "selection",
    options,
    value: "option1",
    size: "md",
    disabled: false,
    required: false,
  },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof NativeSelect>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-select") };
export const Disabled: Story = { ...exampleStory, args: { disabled: true } };
export const WithCustomChildren: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-select"
      attributes={{ label: "Discipline", "default-value": "" }}
    >
      <NativeElement
        tagName="dt-select-option"
        attributes={{ value: "", label: "Select...", disabled: true }}
      />
      <NativeElement
        tagName="dt-select-option"
        attributes={{ value: "design", label: "Design" }}
      />
      <NativeElement
        tagName="dt-select-option"
        attributes={{ value: "engineering", label: "Engineering" }}
      />
    </NativeElement>
  ),
};
export const Controlled: Story = {
  ...exampleStory,
  render: () => <ControlledSelect />,
};
export const WithError: Story = {
  ...exampleStory,
  args: { error: "Choose one discipline.", required: true },
};
export const SizeSmall: Story = { ...exampleStory, args: { size: "sm" } };
export const SizeMedium: Story = { ...exampleStory, args: { size: "md" } };
export const SizeLarge: Story = { ...exampleStory, args: { size: "lg" } };
export const WithHelperText: Story = {
  ...exampleStory,
  args: { helperText: "Used to tailor the project team." },
};
export const Playground: Story = {};
export const Example: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      <NativeSelect {...meta.args} value="design" />
      <NativeSelect
        {...meta.args}
        label="Office"
        name="office"
        value=""
        options={JSON.stringify([
          { value: "", label: "Choose an office", disabled: true },
          { value: "helsinki", label: "Helsinki" },
          { value: "remote", label: "Remote" },
        ])}
      />
    </Stack>
  ),
};
export const ForcedColors: Story = { ...forcedColorsStory };
