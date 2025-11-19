import type { Meta, StoryObj } from "@storybook/react";
import { SocialShare } from "./SocialShare";

const meta = {
  title: "Components/SocialShare",
  component: SocialShare,
  parameters: {
    layout: "centered",
    wip: { disabled: false },
  },
  tags: ["autodocs"],
  argTypes: {
    url: {
      control: "text",
      description: "The URL to share",
    },
    title: {
      control: "text",
      description: "The title to share",
    },
  },
} satisfies Meta<typeof SocialShare>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    url: "https://digitaltableteur.com",
    title: "Digital Tableteur - Portfolio",
  },
};

export const BlogPost: Story = {
  args: {
    url: "https://digitaltableteur.com/blog/workflow-tips",
    title: "Workflow Tips for Developers",
  },
};

export const MobileView: Story = {
  args: {
    url: "https://digitaltableteur.com",
    title: "Mobile Social Share Test",
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const WithNativeShare: Story = {
  args: {
    url: "https://digitaltableteur.com",
    title: "Native Share API Test",
  },
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
