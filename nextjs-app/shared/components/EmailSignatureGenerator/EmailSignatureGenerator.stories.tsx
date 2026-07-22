import contract from "./EmailSignatureGenerator.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import EmailSignatureGenerator from "./EmailSignatureGenerator";
import Badge from "@dt/Badge";

const meta: Meta<typeof EmailSignatureGenerator> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
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
    logoUrl: "/logo192.png",
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
