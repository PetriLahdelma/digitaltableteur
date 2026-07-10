import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useCallback, useRef, useState } from "react";
import ToastStack, {
  type ToastStackItem,
  type ToastStackProps,
} from "./ToastStack";
import contract from "./ToastStack.contract.json";

const seedToasts: ToastStackItem[] = [
  { id: "saved", message: "Settings saved.", tone: "success", duration: 60000 },
  { id: "changed", message: "Language changed to English", duration: 60000 },
  {
    id: "notice",
    message: "This content is only available in English",
    tone: "info",
    duration: 60000,
  },
];

const meta = {
  title: "Feedback/ToastStack",
  component: ToastStack,
  tags: ["alpha", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
    contractStatus: contract.status,
  },
  args: { toasts: seedToasts, position: "bottom-center" },
} satisfies Meta<typeof ToastStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const PlaygroundHarness = (args: ToastStackProps) => {
  const [toasts, setToasts] = useState<ToastStackItem[]>(args.toasts);
  const counter = useRef(0);
  const tones = ["info", "success", "warning", "error"] as const;

  const push = useCallback(() => {
    counter.current += 1;
    const tone = tones[counter.current % tones.length];
    setToasts((current) => [
      ...current,
      {
        id: `toast-${counter.current}`,
        message: `Stacked toast #${counter.current}`,
        tone,
        duration: 4000,
      },
    ]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <div style={{ minHeight: "60vh", padding: "1rem" }}>
      <button type="button" onClick={push}>
        Push toast
      </button>
      <ToastStack {...args} toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

export const Playground: Story = {
  render: (args) => <PlaygroundHarness {...args} toasts={[]} />,
};

export const Example: Story = {
  name: "Example",
  args: {
    toasts: seedToasts,
    position: "bottom-center",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The language-switch case that motivated the component: the change confirmation and the content-language notice stay visible together instead of replacing each other.",
      },
    },
  },
};

export const ForcedColors: Story = {
  name: "ForcedColors",
  args: { toasts: seedToasts },
  parameters: {
    chromatic: { forcedColors: "active" },
  },
};
