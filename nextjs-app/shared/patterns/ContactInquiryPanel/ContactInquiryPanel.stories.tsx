import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { ContactFormEditorial } from "@dt/ContactFormEditorial";
import { ContactInquiryPanel } from "./ContactInquiryPanel";
import contract from "./ContactInquiryPanel.contract.json";

const meta = {
  title: "Patterns/ContactInquiryPanel",
  component: ContactInquiryPanel,
  tags: ["stable", "autodocs"],
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
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // messagePanel keeps a mapping preset. packageId/bookingConfig are
  // effect-exempt in audit:controls (observable only with a booking provider
  // configured via env; Storybook runs providerless and shows the coming-soon
  // fallback — resolution is unit-tested in donny-booking).
  argTypes: {
    messagePanel: {
      control: { type: "select" },
      options: ["editorialForm", "placeholder"],
      mapping: {
        editorialForm: <ContactFormEditorial />,
        placeholder: <p>Message form slot</p>,
      },
      description:
        "Editorial contact form slot. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
    bookingConfig: {
      control: { type: "select" },
      options: ["resolved", "comingSoon"],
      mapping: {
        resolved: undefined,
        comingSoon: {
          configured: false,
          provider: "none",
          meetingLabel: "Intro call",
          embedUrl: "",
          fallbackUrl: "",
          prefillApplied: false,
        },
      },
      description:
        "Optional booking override; defaults from packageId. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "SiteBookingConfig" } },
    },
  },
  args: {
    initialMode: "message",
    messagePanel: "editorialForm" as unknown as ReactNode,
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
