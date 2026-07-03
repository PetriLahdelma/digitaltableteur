import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormField } from "./FormField";
import Checkbox from "@dt/Checkbox";
import Radio from "@dt/Radio";
import TextInput from "@dt/TextInput";
import contract from "./FormField.contract.json";

const meta = {
  title: "Forms/FormField",
  component: FormField,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-form-field",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    legend: {
      control: "text",
      description: "Accessible name for the group; rendered as the fieldset legend.",
      table: { category: "Content", type: { summary: "string" } },
    },
    children: {
      control: false,
      description: "The grouped controls; each keeps its own label.",
      table: { category: "Content", type: { summary: "ReactNode" } },
    },
    groupDescription: {
      control: "text",
      description: "Helper text for the whole set, shown under the legend.",
      table: { category: "Content", type: { summary: "string" } },
    },
    error: {
      control: "text",
      description: "Group-level error shown after the controls with role=alert.",
      table: { category: "State", type: { summary: "string" } },
    },
    required: {
      control: "boolean",
      description: "Appends a visual asterisk to the legend.",
      table: { category: "State", type: { summary: "boolean" } },
    },
    disabled: {
      control: "boolean",
      description: "Disables every contained control via the fieldset.",
      table: { category: "State", type: { summary: "boolean" } },
    },
    className: {
      control: "text",
      description: "Merged onto the fieldset.",
      table: { category: "Advanced", type: { summary: "string" } },
    },
  },
  args: {
    legend: "Notification channels",
    groupDescription: "Pick at least one",
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

const channels = (
  <>
    <Checkbox label="Email" defaultChecked />
    <Checkbox label="SMS" />
    <Checkbox label="Push" />
  </>
);

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  render: (args) => <FormField {...args}>{channels}</FormField>,
};

export const CheckboxCluster: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "The canonical case: several checkboxes answering one question. The legend is announced on every control.",
      },
    },
  },
  render: () => (
    <FormField legend="Notification channels" groupDescription="Pick at least one">
      {channels}
    </FormField>
  ),
};

export const GroupError: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "Cross-control validation lives on the group; per-control failures belong on each control's own error prop.",
      },
    },
  },
  render: () => (
    <FormField
      legend="Notification channels"
      error="Pick at least one channel"
      required
    >
      <Checkbox label="Email" />
      <Checkbox label="SMS" />
    </FormField>
  ),
};

export const CompositeField: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "A composite field: two inputs answering one question share a legend, while each input keeps its own label.",
      },
    },
  },
  render: () => (
    <FormField legend="Opening hours" groupDescription="24-hour format">
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
        <TextInput label="Opens" type="text" placeholder="09:00" />
        <TextInput label="Closes" type="text" placeholder="17:00" />
      </div>
    </FormField>
  ),
};

export const CustomRadioSet: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "Composing raw Radio atoms under a FormField legend. For standard sets prefer RadioGroup, which manages selection state for you.",
      },
    },
  },
  render: () => (
    <FormField legend="Contact preference">
      <Radio name="pref" value="email" label="Email" defaultChecked />
      <Radio name="pref" value="phone" label="Phone" />
    </FormField>
  ),
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  render: (args) => <FormField {...args}>{channels}</FormField>,
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true } },
  render: () => (
    <FormField legend="Notification channels" groupDescription="Pick at least one">
      {channels}
    </FormField>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: (args) => <FormField {...args}>{channels}</FormField>,
};
