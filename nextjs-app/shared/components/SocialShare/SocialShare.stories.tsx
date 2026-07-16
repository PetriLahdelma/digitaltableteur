import contract from "./SocialShare.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SocialShare } from "@dt/SocialShare";
import React from "react";
import { expect, userEvent, within } from "storybook/test";

/**
 * navigator.share availability differs between browsers, headless contexts,
 * and farm runner OSes, and SocialShare branches its rendered tree on it
 * (native Share button vs Copy to clipboard). AT snapshots need ONE
 * deterministic branch, so stories pin the capability OFF (the fallback is
 * also the more common real-world path) and restore it on unmount — same
 * recipe as HomeHero's Math.random pin.
 */
const NAVIGATOR_PROTO = Object.getPrototypeOf(navigator) as { share?: unknown };
const NATIVE_SHARE_DESCRIPTOR = Object.getOwnPropertyDescriptor(
  NAVIGATOR_PROTO,
  "share",
);

const withoutNativeShare = (Story: React.ComponentType) => {
  // The component's `"share" in navigator` check walks the prototype chain,
  // so the pin must remove the prototype member, not shadow the instance.
  if (NATIVE_SHARE_DESCRIPTOR) delete NAVIGATOR_PROTO.share;
  React.useEffect(
    () => () => {
      if (NATIVE_SHARE_DESCRIPTOR)
        Object.defineProperty(
          NAVIGATOR_PROTO,
          "share",
          NATIVE_SHARE_DESCRIPTOR,
        );
    },
    [],
  );
  return <Story />;
};

const meta = {
  title: "Site/SocialShare",
  component: SocialShare,
  decorators: [withoutNativeShare],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-social-share",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "centered",
  },
  tags: ["stable", "autodocs"],
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
  // Keyboard-drive only: clicking would open the copy Toast, a TIMED live
  // region — AT capture then races the toast lifecycle (the settled tree
  // depends on machine speed). Plays on AT-captured stories must never arm
  // timed state; click behavior is covered in unit tests.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const links = canvas.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    await userEvent.tab();
    expect(links[0]).toHaveFocus();
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
    expect(within(section).getByText("Share", { selector: "p" })).toBeVisible();
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
    // Mock native share support for this story ONLY. configurable is
    // mandatory: without it the own-property can never be deleted and the
    // mock leaks into every later story in the same page session (this
    // poisoned Playground/Example/ForcedColors AT captures in scoped runs
    // while tag-filtered farm runs skipped this story — permanent mismatch).
    const previous = Object.getOwnPropertyDescriptor(navigator, "share");
    Object.defineProperty(navigator, "share", {
      configurable: true,
      writable: true,
      value: () => Promise.resolve(),
    });
    return () => {
      if (previous) Object.defineProperty(navigator, "share", previous);
      else delete (navigator as { share?: unknown }).share;
    };
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
