import contract from "./SocialShare.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SocialShare } from "@dt/SocialShare";
import React from "react";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Site/SocialShare",
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
  tags: ["stable", "!autodocs"],
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
} satisfies Meta<typeof SocialShare>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    url: "https://digitaltableteur.com",
    title: "Digitaltableteur - Portfolio",
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
    const section = canvas.getByRole("region", { name: "Share" });
    expect(
      within(section).getByText("Share", { selector: "p" }),
    ).toBeVisible();
    expect(
      canvas.getByRole("link", { name: "Share on LinkedIn" }),
    ).toBeInTheDocument();
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

export const Playground: Story = {
  tags: ["beta-matrix"],
  argTypes: {
    channels: {
      control: { type: "select" },
      options: ["default", "two"],
      mapping: {
        default: undefined,
        two: ["linkedin", "twitter"],
      },
      description:
        "Share channels; the full default set when unset. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "SocialShareChannel[]" } },
    },
  },
  args: {
    ...Default.args,
    channels: "two" as never,
  },
};
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
