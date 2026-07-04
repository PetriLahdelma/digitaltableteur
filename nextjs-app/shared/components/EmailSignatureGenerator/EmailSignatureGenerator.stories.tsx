import contract from "./EmailSignatureGenerator.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import EmailSignatureGenerator from "./EmailSignatureGenerator";
import Badge from "@dt/Badge";

const meta: Meta<typeof EmailSignatureGenerator> = {
  argTypes: {
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      className: { table: { disable: true } },
      companyName: { control: "text", description: "Company name for the signature", table: { category: "Content" } },
      companyUrl: { control: "text", description: "Company website URL", table: { category: "Content" } },
      id: { table: { disable: true } },
      logoUrl: { control: "text", description: "Company logo URL for preview (relative path works)", table: { category: "Content" } },
      logoUrlFull: { control: "text", description: "Full URL for the logo in generated HTML signature", table: { category: "Content" } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
  title: "Site/EmailSignatureGenerator",
  component: EmailSignatureGenerator,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-email-signature-generator",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A professional email signature generator with live preview, dark mode toggle, and easy copy-to-clipboard functionality. Includes instructions for Gmail, macOS Mail, and iOS Mail.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div>
        <div style={{ marginBottom: "1rem" }}>
          <Badge tone="warning" size="sm">
            Work in progress
          </Badge>
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EmailSignatureGenerator>;

/**
 * Default email signature generator with Digitaltableteur branding.
 */
export const Default: Story = {
  tags: ["beta-matrix"],
  args: { logoUrl: "https://www.digitaltableteur.com/round.png" },
};

/**
 * Email signature generator with custom company branding.
 */
export const CustomBranding: Story = {
  args: {
    companyName: "Acme Corp",
    companyUrl: "https://acme.example.com",
    logoUrl: "https://via.placeholder.com/48x48/3b82f6/ffffff?text=AC",
  },
};

export const Playground = Default;
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
