import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { DtPhoneInputElement } from "../../../../../packages/web-components/src/native/phone-input";
import {
  NativeElement,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

if (!customElements.get("dt-phone-input")) {
  customElements.define("dt-phone-input", DtPhoneInputElement);
}

type Args = {
  label: string;
  value?: string;
  defaultValue?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  disabled: boolean;
  required: boolean;
  defaultCountry: string;
  name: string;
};

function NativePhoneInput({
  defaultValue,
  helperText,
  defaultCountry,
  ...args
}: Args) {
  return (
    <div style={{ width: "22rem", maxWidth: "90vw" }}>
      <NativeElement
        tagName="dt-phone-input"
        attributes={{
          ...args,
          "default-value": defaultValue,
          "helper-text": helperText,
          "default-country": defaultCountry,
        }}
      />
    </div>
  );
}

const meta = {
  title: "Web Components/Forms/PhoneInput",
  component: NativePhoneInput,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: {
        component:
          "Form-associated native international telephone field. It formats with libphonenumber-js and emits E.164 values through value-change without a React runtime.",
      },
    },
  },
  args: {
    label: "Phone number",
    placeholder: "Enter phone number",
    defaultCountry: "FI",
    name: "phone",
    disabled: false,
    required: false,
  },
  argTypes: {
    defaultCountry: {
      control: "select",
      options: ["FI", "SE", "GB", "US", "DE", "FR", "JP"],
    },
  },
} satisfies Meta<typeof NativePhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await assertNative("dt-phone-input")({ canvasElement });
    const element = canvasElement.querySelector(
      "dt-phone-input",
    ) as DtPhoneInputElement;
    const input = element.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;
    await userEvent.type(input, "401234567");
    await waitFor(() => {
      expect(element.value).toBe("+358401234567");
      expect(input.value.replace(/\s/g, "")).toBe("+358401234567");
    });
  },
};

export const WithHelperText: Story = {
  ...exampleStory,
  args: { helperText: "Include country code." },
};

export const WithError: Story = {
  ...exampleStory,
  args: { error: "Invalid phone number." },
};

export const Required: Story = {
  ...exampleStory,
  args: { required: true },
};

export const Disabled: Story = {
  ...exampleStory,
  args: { value: "+358401234567", disabled: true },
};

export const CountryDefault: Story = {
  ...exampleStory,
  args: { defaultCountry: "SE" },
};

export const InternationalNumbers: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      <NativePhoneInput {...meta.args} label="Finland" value="+358401234567" />
      <NativePhoneInput
        {...meta.args}
        label="United States"
        value="+12025551234"
      />
      <NativePhoneInput
        {...meta.args}
        label="United Kingdom"
        value="+442071234567"
      />
      <NativePhoneInput {...meta.args} label="Sweden" value="+46701234567" />
    </Stack>
  ),
};

export const Playground: Story = {};

export const Example: Story = {
  ...exampleStory,
  args: {
    helperText: "We use this only to arrange the project call.",
    defaultCountry: "FI",
  },
};

export const ForcedColors: Story = { ...forcedColorsStory };
