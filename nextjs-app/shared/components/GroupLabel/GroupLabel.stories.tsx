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
  tags: ["beta", "autodocs"],
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

export const Basic: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "The group heading pointing at its primary control via htmlFor; clicking the text focuses that control.",
      },
    },
  },
  args: { htmlFor: "delivery-street", children: "Delivery address" },
};

export const RequiredMarker: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story: "required appends the asterisk marker when the underlying group must be filled.",
      },
    },
  },
  args: { htmlFor: "billing-street", children: "Billing address", required: true },
};

export const AboveCompoundWidget: Story = {
  tags: ["example"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Composition in context: a heading over a compound widget that is not a fieldset. For true same-name sets (radios, checkbox clusters) use FormField or RadioGroup, whose legend announces on every control.",
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem", maxWidth: 360 }}>
      <GroupLabel htmlFor="price-min">Price range</GroupLabel>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input id="price-min" aria-label="Minimum price" style={{ width: "6rem" }} />
        <span aria-hidden>–</span>
        <input id="price-max" aria-label="Maximum price" style={{ width: "6rem" }} />
      </div>
    </div>
  ),
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
