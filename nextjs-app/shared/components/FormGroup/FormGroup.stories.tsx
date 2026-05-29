import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormGroup } from "./FormGroup";
import { CheckboxField } from "../CheckboxField/CheckboxField";
import contract from "./FormGroup.contract.json";

const defaultArgs = {
  legend: "Areas of interest",
  description: "Pick all that apply",
  children: (
    <>
      <CheckboxField label="Design systems" defaultChecked />
      <CheckboxField label="Accessibility audits" />
    </>
  ),
};

const meta = {
  title: "Molecules/FormGroup",
  component: FormGroup,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: {
      control: false,
      description: "Grouped controls inside the fieldset",
    },
    legend: {
      control: "text",
      description: "Fieldset legend / accessible group name",
    },
    description: {
      control: "text",
      description: "Optional helper copy below legend",
    },
    className: {
      control: "text",
      description: "Fieldset class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof FormGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <FormGroup legend="Contact reason" description="Choose one or more topics">
      <CheckboxField label="New project" />
      <CheckboxField label="Workshop / training" />
      <CheckboxField label="Speaking" />
    </FormGroup>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
