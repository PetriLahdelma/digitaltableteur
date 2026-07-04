import { userEvent, within } from "storybook/test";
import { FormFieldEditorial } from "./FormFieldEditorial";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./FormFieldEditorial.contract.json";

const defaultArgs = {
  label: "Your name",
  type: "text" as const,
  required: true,
  placeholder: "Alex Example",
};

const meta = {
  title: "Site/FormFieldEditorial",
  component: FormFieldEditorial,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-form-field-editorial",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
} satisfies Meta<typeof FormFieldEditorial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
// FormFieldEditorial is a discriminated union: it renders its own control from
// `type`, and only type="select" consumes `children` (the <option> list). The
// Playground rests in select mode so the children slot is genuine and operable.
export const Playground: Story = {
  tags: ["beta-matrix"],
  argTypes: {
    children: {
      control: { type: "select" },
      options: ["threeOptions", "twoOptions"],
      mapping: {
        threeOptions: (
          <>
            <option value="a">Option A</option>
            <option value="b">Option B</option>
            <option value="c">Option C</option>
          </>
        ),
        twoOptions: (
          <>
            <option value="a">Option A</option>
            <option value="b">Option B</option>
          </>
        ),
      },
      description:
        "Options for the select control (type=\"select\"). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "ReactNode" } },
    },
  },
  args: {
    label: "Preferred contact",
    type: "select" as const,
    required: true,
    children: "threeOptions" as never,
  },
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (editorial contact field)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <FormFieldEditorial
        label="Email"
        type="email"
        required
        placeholder="you@company.com"
      />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
