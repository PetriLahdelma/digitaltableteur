import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContactFormEditorial } from "@dt/ContactFormEditorial";
import { ContactInquiryPanel } from "./ContactInquiryPanel";
import contract from "./ContactInquiryPanel.contract.json";

const meta = {
  title: "Patterns/ContactInquiryPanel",
  component: ContactInquiryPanel,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=664-33",
    },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    initialMode: {
      control: "radio",
      options: ["message", "book"],
      description: "Initial tab selection",
    },
    packageId: {
      control: "text",
      description: "Optional pricing package id for booking prefill",
      table: { disable: true },
    },
    messagePanel: {
      control: false,
      description: "Editorial contact form slot",
      table: { disable: true },
    },
    bookingConfig: {
      control: false,
      description: "Optional Donny booking override; defaults from packageId",
      table: { disable: true },
    },
  },
  args: {
    initialMode: "message",
    messagePanel: <ContactFormEditorial />,
  },
} satisfies Meta<typeof ContactInquiryPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};

export const Playground: Story = {
  tags: ["beta-matrix"],
};

export const Example: Story = {
  tags: ["beta-matrix"],
  name: "Example (contact page panel)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <ContactInquiryPanel messagePanel={<ContactFormEditorial />} />
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: () => (
    <ContactInquiryPanel messagePanel={<ContactFormEditorial />} />
  ),
};

export const BookMode: Story = {
  name: "Book tab (scheduling fallback)",
  args: {
    initialMode: "book",
  },
};
