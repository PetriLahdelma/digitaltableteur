import contract from "./Toast.contract.json";
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Toast, { type ToastTone, type ToastPosition } from "@dt/Toast";
import Button from "@dt/Button";
import { ToastProvider, useToast } from "@/providers/ToastProvider";
import { expect, userEvent, waitFor, within } from "storybook/test";
import schema from "./schema.json";

const meta: Meta<typeof Toast> = {
  title: "Feedback/Toast",
  component: Toast,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=393-35",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    // Content

    message: {
      control: "text",
      description: "Message text displayed in the toast",
      table: { category: "Content", type: { summary: "string" } },
    },

    // State (v1.1.0)

    open: {
      control: "boolean",
      description: "Controls toast visibility.",
      table: { category: "State", type: { summary: "boolean" } },
    },

    tone: {
      control: { type: "select" },
      options: ["success", "error", "warning", "info"],
      description: "Semantic colour.",
      table: {
        category: "State",
        type: { summary: "\"success\" | \"error\" | \"warning\" | \"info\"" },
        defaultValue: { summary: "info" },
      },
    },

    // Appearance

    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size variant (v1.1.0+)",
      table: {
        category: "Appearance",
        type: { summary: "\"sm\" | \"md\" | \"lg\"" },
        defaultValue: { summary: "md" },
      },
    },

    position: {
      control: { type: "select" },
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
      description: "Position on screen (v1.1.0+)",
      table: {
        category: "Appearance",
        type: { summary: "ToastPosition" },
        defaultValue: { summary: "bottom-center" },
      },
    },

    // Behavior

    duration: {
      control: "number",
      description: "Auto-dismiss duration in milliseconds",
      table: {
        category: "Behavior",
        type: { summary: "number" },
        defaultValue: { summary: "3000" },
      },
    },
    onClose: {
      action: "closed",
      description: "Close callback",
      table: { category: "Behavior", type: { summary: "() => void" } },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: function DefaultStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Show Toast</Button>
        <Toast
          message="Toast notification!"
          open={open}
          onClose={() => setOpen(false)}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const showButton = canvas.getByRole("button", { name: /show toast/i });
    await userEvent.click(showButton);

    await waitFor(() => {
      expect(canvas.getByText(/toast notification/i)).toBeInTheDocument();
    });
    const toasts = canvas.getAllByRole("status");
    const toast = toasts.find((el) =>
      /toast notification/i.test(el.textContent ?? ""),
    );
    expect(toast).toBeDefined();
  },
};

/** Buttons fire the same toast with each semantic tone. */
export const Tones: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "One toast, four tones. The filled icon carries the meaning alongside color; error and warning announce assertively (role=alert), success and info stay polite.",
      },
    },
  },
  render: function TonesStory() {
    const [tone, setTone] = useState<ToastTone | null>(null);
    const messages: Record<ToastTone, string> = {
      success: "Operation completed successfully.",
      error: "An error occurred. Please try again.",
      warning: "Your session will expire soon.",
      info: "New features available.",
    };
    return (
      <>
        {(Object.keys(messages) as ToastTone[]).map((t) => (
          <Button
            key={t}
            variant="secondary"
            size="sm"
            onClick={() => setTone(t)}
          >
            {t}
          </Button>
        ))}
        <Toast
          message={tone ? messages[tone] : ""}
          open={tone !== null}
          tone={tone ?? undefined}
          onClose={() => setTone(null)}
        />
      </>
    );
  },
};

/** Six placements; the toast is position: fixed so it anchors to the viewport. */
export const Placement: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "position anchors the toast to a viewport corner or edge center. The app default is bottom-center; keep one placement per app so toasts are predictable.",
      },
    },
  },
  render: function PlacementStory() {
    const positions: ToastPosition[] = [
      "top-left",
      "top-center",
      "top-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ];
    const [position, setPosition] = useState<ToastPosition | null>(null);
    return (
      <>
        {positions.map((p) => (
          <Button
            key={p}
            variant="secondary"
            size="sm"
            onClick={() => setPosition(p)}
          >
            {p}
          </Button>
        ))}
        <Toast
          message={position ? `Anchored ${position}.` : ""}
          open={position !== null}
          tone="info"
          position={position ?? undefined}
          onClose={() => setPosition(null)}
        />
      </>
    );
  },
};

/** The recommended integration: fire toasts through the app-root provider. */
export const ProviderDriven: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The imperative API most consumers use: ToastProvider mounts one live region at the app shell; useToast().showToast(message, { tone, duration, position }) fires it from anywhere below.",
      },
    },
  },
  render: function ProviderDrivenStory() {
    function SaveButton() {
      const { showToast } = useToast();
      return (
        <Button
          onClick={() =>
            showToast("Settings saved.", { tone: "success", duration: 4000 })
          }
        >
          Save settings
        </Button>
      );
    }
    return (
      <ToastProvider>
        <SaveButton />
      </ToastProvider>
    );
  },
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  args: {
    open: true,
    message: "Saved successfully.",
    tone: "success",
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
          "The canonical post-action confirmation: success tone, default bottom-center placement, auto-dismiss after 3 seconds.",
      },
    },
  },
  render: function ExampleStory() {
    const [open, setOpen] = React.useState(true);
    return (
      <Toast
        message="Saved successfully."
        open={open}
        tone="success"
        onClose={() => setOpen(false)}
      />
    );
  },
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
