import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  InstagramLogo,
  FacebookLogo,
  LinkedinLogo,
  GithubLogo,
} from "@phosphor-icons/react";
import { SocialIconLink } from "./SocialIconLink";
import contract from "./SocialIconLink.contract.json";

const meta = {
  title: "Atoms/SocialIconLink",
  component: SocialIconLink,
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: {
      description: {
        component: contract.description,
      },
    },
  },
  // Custom MDX docs pages exist for all catalog entries; do not also enable autodocs
  // or Storybook will treat it as conflicting sources of truth for the docs page.
  tags: ["!autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Hit-target size token.",
      table: { defaultValue: { summary: "md" }, category: "Appearance" },
    },
    external: {
      control: "boolean",
      description: "Open in a new tab with rel=noopener noreferrer.",
      table: { defaultValue: { summary: "true" }, category: "Behavior" },
    },
    href: {
      control: "text",
      description: "Destination URL.",
      table: { category: "Content" },
    },
    label: {
      control: "text",
      description: "Accessible name (the control is icon-only).",
      table: { category: "Accessibility" },
    },
    children: { table: { disable: true } },
  },
  args: {
    href: "https://www.linkedin.com/company/digitaltableteur/",
    label: "Digitaltableteur on LinkedIn",
    size: "md" as const,
    external: true,
    children: <LinkedinLogo aria-hidden="true" />,
  },
} satisfies Meta<typeof SocialIconLink>;

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
  name: "Example (footer social row)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-internal-8)" }}>
      <SocialIconLink
        href="https://www.instagram.com/digitaltableteur/"
        label="Digitaltableteur on Instagram"
      >
        <InstagramLogo aria-hidden="true" />
      </SocialIconLink>
      <SocialIconLink
        href="https://www.facebook.com/digitaltableteur"
        label="Digitaltableteur on Facebook"
      >
        <FacebookLogo aria-hidden="true" />
      </SocialIconLink>
      <SocialIconLink
        href="https://www.linkedin.com/company/digitaltableteur/"
        label="Digitaltableteur on LinkedIn"
      >
        <LinkedinLogo aria-hidden="true" />
      </SocialIconLink>
      <SocialIconLink
        href="https://github.com/PetriLahdelma"
        label="Petri Lahdelma on GitHub"
      >
        <GithubLogo aria-hidden="true" />
      </SocialIconLink>
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  parameters: {
    docs: {
      description: {
        story: "Forced-colors verification story.",
      },
    },
  },
};
