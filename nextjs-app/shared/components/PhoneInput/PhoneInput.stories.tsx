import contract from "./PhoneInput.contract.json";
import React, { useState } from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Controls,
  Description,
  Heading,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import PhoneInput from "@dt/PhoneInput";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import { useTranslation } from "react-i18next";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
import styles from "./PhoneInput.stories.module.css";

const phoneInputComplianceRules: ComplianceRule[] = [
  {
    id: "file-structure",
    rule: "Complete file structure",
    status: "pass",
    details: "All 5 files present",
  },
  {
    id: "typescript-strict",
    rule: "TypeScript strict",
    status: "pass",
    details: "Proper typing with PhoneInputProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Stories use translation keys",
  },
  {
    id: "css-modules",
    rule: "CSS Modules",
    status: "pass",
    details: "No inline styles",
  },
  {
    id: "design-tokens",
    rule: "Design tokens",
    status: "pass",
    details: "Uses CSS custom properties",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "Uses logical spacing",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "CSS custom properties for colors",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Uses Label and HelperText components",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Label linked to input, disabled state",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Multiple variants with ComplianceCard",
  },
  { id: "tests", rule: "Tests", status: "pass", details: "Test file exists" },
];

const meta: Meta<typeof PhoneInput> = {
  title: "Forms/PhoneInput",
  component: PhoneInput,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-phone-input",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
    docs: {
      page: () => (
        <>
          <Primary />
          <Title />
          <Subtitle />
          <Description />
          <Controls />
          <Stories />
          <Heading>LLM Schema</Heading>
          <CodeSnippet
            code={JSON.stringify(schema, null, 2)}
            language="json"
            variant="multi"
            maxLines={20}
            showLineNumbers={true}
            allowCopy={true}
          />
        </>
      ),
    },
  },
  argTypes: {
    label: { control: "text", description: "Label text" },

    value: {
      control: "text",
      description: "Phone number value (E.164 format)",
    },

    placeholder: { control: "text", description: "Placeholder text" },

    helperText: { control: "text", description: "Helper text below input" },

    error: { control: "text", description: "Error message" },

    disabled: { control: "boolean", description: "Disabled state" },
    onChange: { action: "phone change", description: "Change handler" },
  },
};

export default meta;

export const Z_PhoneInputCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={phoneInputComplianceRules}
  />
);

type PhoneInputStoryArgs = React.ComponentProps<typeof PhoneInput> & {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
};

const PhoneInputStory: React.FC<PhoneInputStoryArgs> = (args) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string | undefined>(args.value);

  return (
    <div className={styles.storyContainer}>
      <PhoneInput
        {...args}
        label={args.label ? t(args.label) : undefined}
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
WithError.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(
    /invalid phone number|virheellinen puhelinnumero|ogiltigt telefonnummer/i,
  );
};

export const WithValue = Template.bind({});
WithValue.args = { label: "storyPhoneInputLabel", value: "+358401234567" };
WithValue.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByRole("textbox") as HTMLInputElement;

  await waitFor(() => {
    expect(input.value).toBeTruthy();
  });
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

export const AllStates: StoryFn = () => {
  const { t } = useTranslation();
  const [value1, setValue1] = useState<string | undefined>();
  const [value2, setValue2] = useState<string | undefined>("+358401234567");
  const [value3, setValue3] = useState<string | undefined>();
  const [value4, setValue4] = useState<string | undefined>("+358401234567");

  return (
    <div className={styles.stackContainer}>
      <div>
        <strong className={styles.stateLabel}>Default</strong>
        <PhoneInput
          label={t("storyPhoneInputLabel")}
          placeholder={t("storyPhoneInputPlaceholder")}
          value={value1}
          onChange={setValue1}
        />
      </div>

      <div>
        <strong className={styles.stateLabel}>With Value</strong>
        <PhoneInput
          label={t("storyPhoneInputLabel")}
          value={value2}
          onChange={setValue2}
        />
      </div>

      <div>
        <strong className={styles.stateLabel}>With Helper Text</strong>
        <PhoneInput
          label={t("storyPhoneInputLabel")}
          placeholder={t("storyPhoneInputPlaceholder")}
          helperText={t("storyPhoneInputHelperText")}
          value={value3}
          onChange={setValue3}
        />
      </div>

      <div>
        <strong className={styles.stateLabel}>With Error</strong>
        <PhoneInput
          label={t("storyPhoneInputLabel")}
          error={t("storyPhoneInputError")}
          value={value4}
          onChange={setValue4}
        />
      </div>

      <div>
        <strong className={styles.stateLabel}>Disabled</strong>
        <PhoneInput
          label={t("storyPhoneInputLabel")}
          value="+358401234567"
          disabled
        />
      </div>
    </div>
  );
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

export const Playground = Default;
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
