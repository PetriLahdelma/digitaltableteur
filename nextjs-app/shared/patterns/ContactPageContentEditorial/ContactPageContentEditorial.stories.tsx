import { ContactPageContentEditorial } from "./ContactPageContentEditorial";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./ContactPageContentEditorial.contract.json";

const defaultArgs = {};

const meta = {
  title: "Patterns/ContactPageContentEditorial",
  component: ContactPageContentEditorial,
  tags: ["stable", "autodocs"],
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
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // bookingConfig keeps a labeled preset. bookingPackageId/bookingConfig are
  // effect-exempt in audit:controls (observable only with a booking provider
  // configured via env; Storybook runs providerless — resolution unit-tested
  // in donny-booking).
  argTypes: {
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
        "Server-resolved Cal.com/Calendly embed config. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "SiteBookingConfig" } },
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
