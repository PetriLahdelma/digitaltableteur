import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextLink } from "./TextLink";
import contract from "./TextLink.contract.json";

/** Mirrors `SiteFooter` legal links row. */
const footerLinkArgs = {
  href: "/privacy-policy",
  children: "Privacy policy",
  variant: "muted" as const,
  underline: "hover" as const,
};

const meta = {
  title: "Atoms/TextLink",
  component: TextLink,
  tags: ["alpha", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    docs: {
      description: {
        component: contract.description,
      },
    },
  },
  argTypes: {
    href: { control: "text", table: { category: "Content" } },
    children: { control: "text", table: { category: "Content" } },
    variant: {
      control: "select",
      options: ["default", "muted", "accent"],
      table: { defaultValue: { summary: "default" } },
    },
    underline: {
      control: "select",
      options: ["always", "hover", "none"],
      table: { defaultValue: { summary: "hover" } },
    },
    external: { control: "boolean" },
  },
  args: footerLinkArgs,
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {};

export const Example: Story = {
  name: "Example (footer legal row)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <nav
      aria-label="Legal"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem 1.5rem",
        fontSize: "0.875rem",
      }}
    >
      <TextLink href="/privacy-policy" variant="muted" underline="hover">
        Privacy policy
      </TextLink>
      <TextLink href="/imprint" variant="muted" underline="hover">
        Imprint
      </TextLink>
      <TextLink href="/ai-use" variant="muted" underline="hover">
        AI use
      </TextLink>
      <TextLink href="/accessibility" variant="muted" underline="hover">
        Accessibility
      </TextLink>
    </nav>
  ),
};

export const ExternalAccent: Story = {
  args: {
    href: "https://www.digitaltableteur.com",
    children: "digitaltableteur.com",
    variant: "accent",
    underline: "always",
    external: true,
  },
};
