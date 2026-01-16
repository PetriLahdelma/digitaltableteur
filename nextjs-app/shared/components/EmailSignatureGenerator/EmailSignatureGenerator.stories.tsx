import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import EmailSignatureGenerator from "./EmailSignatureGenerator";
import Badge from "@dt/Badge";

const meta: Meta<typeof EmailSignatureGenerator> = {
  title: "Tools/EmailSignatureGenerator",
  component: EmailSignatureGenerator,
  tags: ["autodocs"],
  parameters: {
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
        <Badge severity="warning" size="sm" style={{ marginBottom: "1rem" }}>
          Work in progress
        </Badge>
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
export const Default: Story = {};

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
