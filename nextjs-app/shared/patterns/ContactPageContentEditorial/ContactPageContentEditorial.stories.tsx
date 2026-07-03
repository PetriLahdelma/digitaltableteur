import { ContactPageContentEditorial } from "./ContactPageContentEditorial";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./ContactPageContentEditorial.contract.json";

const defaultArgs = {};

const meta = {
  title: "Patterns/ContactPageContentEditorial",
  component: ContactPageContentEditorial,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-contact-page-content-editorial",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Page wrapper class names",
      table: { disable: true },
    },
    initialInquiryMode: {
      control: "select",
      options: ["message", "book"],
      description: "Deep-link tab from /contact?mode=book",
      table: { disable: true },
    },
    bookingPackageId: {
      control: "text",
      description: "Package slug from /contact?package=…",
      table: { disable: true },
    },
    bookingConfig: {
      control: false,
      description: "Server-resolved Cal.com/Calendly embed config",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof ContactPageContentEditorial>;

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
  globals: { forcedColors: "none" },
  name: "Example (contact page layout)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <ContactPageContentEditorial />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
