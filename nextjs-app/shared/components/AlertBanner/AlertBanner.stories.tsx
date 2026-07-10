import contract from "./AlertBanner.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import AlertBanner from "@dt/AlertBanner";
import Button from "@dt/Button";

const meta: Meta<typeof AlertBanner> = {
  title: "Feedback/AlertBanner",
  component: AlertBanner,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=394-41",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite slots keep authored treatments: description is prose in
  // practice (text control), action is a real element slot (mapping preset).
  argTypes: {
    description: { control: "text", description: "Supporting body copy" },
    action: {
      control: { type: "select" },
      options: ["none", "reviewSettings"],
      mapping: {
        none: undefined,
        reviewSettings: (
          <Button variant="tertiary" size="sm">
            Review settings
          </Button>
        ),
      },
      description:
        "One follow-up rendered under the description (e.g. a tertiary Button). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
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

export const TextOnly: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "showIcon={false} drops the tone icon for a compact, text-only banner. The icon is always the semantic tone glyph — there is no per-instance icon override, so this boolean is the only icon control.",
      },
    },
  },
  args: {
    tone: "info",
    title: "Heads up",
    description: "This is an informational message.",
    showIcon: false,
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
