import type { Meta, StoryObj } from "@storybook/react-vite";
import GroupLabel from "./GroupLabel";
import contract from "./GroupLabel.contract.json";

const defaultArgs = {
  htmlFor: "newsletter-options",
  children: "Notification preferences",
  required: false,
  disabled: false,
};

const meta = {
  title: "Forms/GroupLabel",
  component: GroupLabel,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-group-label",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    htmlFor: {
      control: "text",
      description: "ID of the grouped control for label association",
    },
    children: {
      control: "text",
      description: "Group legend text",
    },
    tooltipText: {
      control: "text",
      description: "Optional browser tooltip",
    },
    required: {
      control: "boolean",
      description: "Shows required asterisk",
    },
    disabled: {
      control: "boolean",
      description: "Muted disabled styling",
    },
    title: {
      control: "text",
      description: "Native title attribute override",
      table: { disable: true },
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof GroupLabel>;

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
    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
      <GroupLabel htmlFor="contact-topic">What can we help with?</GroupLabel>
      <div
        id="contact-topic"
        role="group"
        aria-labelledby="contact-topic-label"
      >
        <p className="text-sm text-muted-foreground">
          Checkbox group slots here
        </p>
      </div>
    </fieldset>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
