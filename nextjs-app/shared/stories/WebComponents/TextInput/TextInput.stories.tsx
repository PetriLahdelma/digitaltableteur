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
  label: string;
  type: "text" | "number" | "email" | "password" | "search" | "tel";
  size: "sm" | "md" | "lg";
  value?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled: boolean;
  required: boolean;
  clearable: boolean;
  hideLabel: boolean;
};

function NativeTextInput({ helperText, hideLabel, ...args }: Args) {
  return (
    <div style={{ width: "20rem", maxWidth: "90vw" }}>
      <NativeElement
        tagName="dt-text-input"
        attributes={{
          ...args,
          "helper-text": helperText,
          "hide-label": hideLabel,
        }}
      />
    </div>
  );
}

const meta = {
  title: "Web Components/Forms/TextInput",
  component: NativeTextInput,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: {
        component: "Form-associated native dt-text-input custom element.",
      },
    },
  },
  args: {
    label: "Text Input",
    type: "text",
    size: "md",
    value: "Hello",
    disabled: false,
    required: false,
    clearable: false,
    hideLabel: false,
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "number", "email", "password", "search", "tel"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof NativeTextInput>;

export default meta;
type Story = StoryObj<typeof meta>;
export const TextInputStory: Story = {
  ...exampleStory,
  args: { type: "text", label: "Name" },
};
export const NumberInput: Story = {
  ...exampleStory,
  args: { type: "number", label: "Team size" },
};
export const EmailInput: Story = {
  ...exampleStory,
  args: { type: "email", label: "Email address" },
};
export const PasswordInput: Story = {
  ...exampleStory,
  args: { type: "password", label: "Password" },
};
export const SearchInput: Story = {
  ...exampleStory,
  args: { type: "search", label: "Search", clearable: true, value: "tokens" },
};
export const InputWithError: Story = {
  ...exampleStory,
  args: { error: "Enter a valid email address.", value: "invalid" },
};
export const DisabledInput: Story = {
  ...exampleStory,
  args: { disabled: true, value: "Unavailable" },
};
export const Clearable: Story = {
  ...exampleStory,
  args: {
    label: "Search",
    type: "search",
    value: "design systems",
    clearable: true,
  },
};
export const Default: Story = { play: assertNative("dt-text-input") };
export const Playground: Story = {};
export const Example: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      <NativeElement
        tagName="dt-text-input"
        attributes={{ label: "Name", name: "name", required: true }}
      />
      <NativeElement
        tagName="dt-text-input"
        attributes={{
          label: "Email",
          name: "email",
          type: "email",
          "helper-text": "Used for project updates.",
        }}
      />
    </Stack>
  ),
};
export const ForcedColors: Story = { ...forcedColorsStory };
