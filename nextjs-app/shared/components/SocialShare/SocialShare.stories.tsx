import contract from "./SocialShare.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SocialShare } from "@dt/SocialShare";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

const socialShareComplianceRules: ComplianceRule[] = [
  {
    id: "file-structure",
    rule: "Complete file structure",
    status: "pass",
    details: "All 5 files present",
  },
  {
    id: "typescript-strict",
    rule: "TypeScript strict",
    status: "pass",
    details: "Proper typing with SocialShareProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Uses i18n for share/copy labels",
  },
  {
    id: "css-modules",
    rule: "CSS Modules",
    status: "pass",
    details: "No inline styles",
  },
  {
    id: "design-tokens",
    rule: "Design tokens",
    status: "pass",
    details: "Uses CSS custom properties",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "Uses gap and margin-inline",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "CSS custom properties for colors",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Progressive Web Share API enhancement",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "ARIA labels, keyboard navigation, toast feedback",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Multiple variants with ComplianceCard",
  },
  {
    id: "tests",
    rule: "Tests",
    status: "pass",
    details: "Test file exists with feature detection tests",
  },
];

const meta = {
  title: "Molecules/SocialShare",
  component: SocialShare,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-social-share",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "centered",
  },
  tags: ["beta", "!autodocs"],
  argTypes: {
    url: { control: "text", description: "The URL to share" },
    title: { control: "text", description: "The title to share" },
    variant: {
      control: "select",
      options: ["inline", "article"],
      description: "Layout variant",
    },
    showHeading: {
      control: "boolean",
      description: "Show share heading above channel row",
    },
    channels: {
      control: "object",
      description: "Ordered list of share channels",
    },
  },
} satisfies Meta<typeof SocialShare>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Z_SocialShareCompliance: Story = {
  parameters: { docs: { disable: true } },
  render: () => (
    <ComplianceCard
      title="Compliance: 11/11"
      titleIcon={
        <Icon name="check-fat" color="var(--color-success)" weight="fill" />
      }
      rules={socialShareComplianceRules}
    />
  ),
};

export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    url: "https://digitaltableteur.com",
    title: "Digital Tableteur - Portfolio",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);

    // Click first social share button
    await userEvent.click(buttons[0]);
  },
};

export const BlogPost: Story = {
  args: {
    url: "https://digitaltableteur.com/blog/workflow-tips",
    title: "Workflow Tips for Developers",
    variant: "article",
    showHeading: true,
    channels: [
      "linkedin",
      "twitter",
      "facebook",
      "reddit",
      "whatsapp",
      "instagram",
    ],
  },
  parameters: { layout: "padded" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Share")).toBeInTheDocument();
    expect(canvas.getByLabelText("Share on LinkedIn")).toBeInTheDocument();
    const buttons = canvas.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  },
};

export const MobileView: Story = {
  args: {
    url: "https://digitaltableteur.com",
    title: "Mobile Social Share Test",
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const WithNativeShare: Story = {
  args: { url: "https://digitaltableteur.com", title: "Native Share API Test" },
  parameters: {
    docs: {
      description: {
        story:
          "This story simulates native share support. On devices that support the Web Share API (iOS Safari, Android Chrome), this will show a native share button instead of copy to clipboard.",
      },
    },
  },
  beforeEach: () => {
    // Mock native share support for this story
    Object.defineProperty(navigator, "share", {
      writable: true,
      value: () => Promise.resolve(),
    });
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
