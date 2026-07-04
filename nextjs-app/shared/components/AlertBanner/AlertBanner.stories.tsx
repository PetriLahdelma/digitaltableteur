import contract from "./AlertBanner.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import AlertBanner from "@dt/AlertBanner";
import Button from "@dt/Button";

const meta: Meta<typeof AlertBanner> = {
  title: "Feedback/AlertBanner",
  component: AlertBanner,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=394-41",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    tone: {
      control: { type: "select" },
      options: ["info", "success", "warning", "error"],
      description: "Semantic tone controlling icon and surface colors",
      table: { defaultValue: { summary: "info" } },
    },

    title: { control: "text", description: "Alert heading text" },

    description: { control: "text", description: "Supporting body copy" },

    icon: {
      control: "text",
      description: "Icon name override; falls back to the tone icon",
    },

    dismissible: {
      control: "boolean",
      description: "Shows a dismiss control when true",
      table: { defaultValue: { summary: "false" } },
    },
    onDismiss: {
      action: "dismissed",
      description: "Called when the user dismisses the banner",
      table: { disable: true },
    },
    "aria-live": {
      control: { type: "select" },
      options: ["polite", "assertive", "off"],
      description: "Live region politeness for assistive tech",
      table: { defaultValue: { summary: "polite" }, disable: true },
    },
      action: { table: { disable: true } },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      className: { table: { disable: true } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
};

export default meta;
type Story = StoryObj<typeof AlertBanner>;

export const Info: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "The default tone: a polite status with the info icon announced by name, so color is never the only signal.",
      },
    },
  },
  args: {
    tone: "info",
    title: "Heads up",
    description: "This is an informational message.",
  },
};

export const Warning: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "Warning stays a polite status; only the error tone escalates to role=alert with assertive announcement.",
      },
    },
  },
  args: {
    tone: "warning",
    title: "Check details",
    description: "There might be something you need to review.",
  },
};

export const Dismissible: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "dismissible adds a localized Close control — the only tabbable part of the banner. Persist the dismissal in the consumer.",
      },
    },
  },
  args: {
    tone: "success",
    title: "Saved",
    description: "Your changes have been stored.",
    dismissible: true,
    onDismiss: fn(),
  },
  play: async ({ args, canvasElement }) => {
    // The dismiss button is the banner's only tabbable part; it must work
    // keyboard-only.
    const canvas = within(canvasElement);
    const dismiss = canvas.getByRole("button", { name: /dismiss alert/i });
    dismiss.focus();
    await userEvent.keyboard("{Enter}");
    expect(args.onDismiss).toHaveBeenCalled();
  },
};

export const WithAction: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The action slot carries one follow-up under the description — a tertiary Button, not a link buried in prose.",
      },
    },
  },
  args: {
    tone: "info",
    title: "Cookie preferences updated",
    description: "Analytics stays off until you opt back in.",
    action: (
      <Button variant="tertiary" size="sm">
        Review settings
      </Button>
    ),
  },
};

export const Default = Info;

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  args: {
    tone: "info",
    title: "Heads up",
    description: "This is an informational message.",
  },
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix", "example"],
  parameters: {
    a11y: { disable: true },
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A dismissible success acknowledgement — the canonical post-save banner that stays until the user closes it.",
      },
    },
  },
  args: Dismissible.args,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
