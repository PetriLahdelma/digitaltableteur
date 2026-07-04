import contract from "./PhoneInput.contract.json";
import React, { useState } from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import PhoneInput from "@dt/PhoneInput";
import { useTranslation } from "react-i18next";
import schema from "./schema.json";
import styles from "./PhoneInput.stories.module.css";

const meta: Meta<typeof PhoneInput> = {
  title: "Forms/PhoneInput",
  component: PhoneInput,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-phone-input",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // defaultCountry renders a select from the contract's ISO-code union.
};

export default meta;

type PhoneInputStoryArgs = React.ComponentProps<typeof PhoneInput> & {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
};

const PhoneInputStory: React.FC<PhoneInputStoryArgs> = (args) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string | undefined>(args.value);

  // Panel edits to the value arg drive the canvas; typing still updates local state.
  React.useEffect(() => {
    if (args.value) setValue(args.value);
  }, [args.value]);

  return (
    <div className={styles.storyContainer}>
      <PhoneInput
        {...args}
        label={args.label ? t(args.label) : ""}
        placeholder={args.placeholder ? t(args.placeholder) : undefined}
        helperText={args.helperText ? t(args.helperText) : undefined}
        error={args.error ? t(args.error) : undefined}
        value={value}
        onChange={(phoneValue) => {
          setValue(phoneValue);
          args.onChange?.(phoneValue);
        }}
      />
    </div>
  );
};

const Template: StoryFn<typeof PhoneInput> = (
  args: React.ComponentProps<typeof PhoneInput>,
) => <PhoneInputStory {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: "storyPhoneInputLabel",
  placeholder: "storyPhoneInputPlaceholder",
};
Default.tags = ["example"];
Default.parameters = {
  docs: {
    description: {
      story:
        "Formats as you type for the default country (FI) and emits the E.164 value through onChange.",
    },
  },
};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByRole("textbox");

  // Type a Finnish phone number (default country already adds +358)
  await userEvent.type(input, "401234567");

  await waitFor(() => {
    const normalized = (input as HTMLInputElement).value.replace(/\s+/g, "");
    expect(normalized).toBe("+358401234567");
  });
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  label: "storyPhoneInputLabel",
  placeholder: "storyPhoneInputPlaceholder",
  helperText: "storyPhoneInputHelperText",
};
WithHelperText.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(
    /include country code|sisällytä maakoodi|inkludera landskod/i,
  );
};

export const WithError = Template.bind({});
WithError.args = {
  label: "storyPhoneInputLabel",
  placeholder: "storyPhoneInputPlaceholder",
  error: "storyPhoneInputError",
};
WithError.tags = ["example"];
WithError.parameters = {
  docs: {
    description: {
      story:
        "error replaces the helper line, sets aria-invalid, and links to the input via aria-describedby. Validate on submit with isValidPhoneNumber.",
    },
  },
};
WithError.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(
    /invalid phone number|virheellinen puhelinnumero|ogiltigt telefonnummer/i,
  );
};

export const Required = Template.bind({});
Required.args = {
  label: "storyPhoneInputLabel",
  placeholder: "storyPhoneInputPlaceholder",
  required: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: "storyPhoneInputLabel",
  placeholder: "storyPhoneInputPlaceholder",
  value: "+358401234567",
  disabled: true,
};
Disabled.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByRole("textbox");
  expect(input).toBeDisabled();
};

/** defaultCountry seeds the flag and calling code for local-format typing. */
export const CountryDefault = Template.bind({});
CountryDefault.args = {
  label: "storyPhoneInputLabel",
  placeholder: "storyPhoneInputPlaceholder",
  defaultCountry: "SE",
};
CountryDefault.tags = ["example"];
CountryDefault.parameters = {
  docs: {
    description: {
      story:
        "defaultCountry seeds the flag and calling code; a local number typed here becomes +46…",
    },
  },
};

export const InternationalNumbers: StoryFn = () => {
  const { t } = useTranslation();
  const [fi, setFi] = useState<string | undefined>("+358401234567");
  const [us, setUs] = useState<string | undefined>("+12025551234");
  const [uk, setUk] = useState<string | undefined>("+442071234567");
  const [se, setSe] = useState<string | undefined>("+46701234567");

  return (
    <div className={styles.stackContainer}>
      <div>
        <strong className={styles.stateLabel}>Finland (Default)</strong>
        <PhoneInput
          label={t("storyPhoneInputLabel")}
          value={fi}
          onChange={setFi}
        />
      </div>

      <div>
        <strong className={styles.stateLabel}>United States</strong>
        <PhoneInput
          label={t("storyPhoneInputLabel")}
          value={us}
          onChange={setUs}
        />
      </div>

      <div>
        <strong className={styles.stateLabel}>United Kingdom</strong>
        <PhoneInput
          label={t("storyPhoneInputLabel")}
          value={uk}
          onChange={setUk}
        />
      </div>

      <div>
        <strong className={styles.stateLabel}>Sweden</strong>
        <PhoneInput
          label={t("storyPhoneInputLabel")}
          value={se}
          onChange={setSe}
        />
      </div>
    </div>
  );
};
InternationalNumbers.tags = ["example"];
InternationalNumbers.parameters = {
  docs: {
    description: {
      story:
        "E.164 values render in the matching national format; the flag follows the value's country prefix.",
    },
  },
};

export const Playground = Template.bind({});
Playground.args = { ...Default.args };

export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  args: Default.args,
  play: Default.play,
  render: Template,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  parameters: { a11y: { disable: true, test: "off" } },
  args: Default.args,
  render: Template,
};
