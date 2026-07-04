import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormField } from "./FormField";
import Checkbox from "@dt/Checkbox";
import Radio from "@dt/Radio";
import TextInput from "@dt/TextInput";
import contract from "./FormField.contract.json";

const channels = (
  <>
    <Checkbox label="Email" defaultChecked />
    <Checkbox label="SMS" />
    <Checkbox label="Push" />
  </>
);

const radioSet = (
  <>
    <Radio name="pref" value="email" label="Email" defaultChecked />
    <Radio name="pref" value="phone" label="Phone" />
  </>
);

const textPair = (
  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
    <TextInput label="Opens" type="text" placeholder="09:00" />
    <TextInput label="Closes" type="text" placeholder="17:00" />
  </div>
);

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
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // only the composite children slot needs an authored mapping preset.
  argTypes: {
    children: {
      control: { type: "select" },
      options: ["checkboxCluster", "radioSet", "textPair"],
      mapping: { checkboxCluster: channels, radioSet, textPair },
      description:
        "The grouped controls; each keeps its own label. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "ReactNode" } },
    },
  },
  args: {
    legend: "Notification channels",
    groupDescription: "Pick at least one",
    children: "checkboxCluster",
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
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
};
