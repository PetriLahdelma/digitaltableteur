import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DtToastElement } from "../../../../../packages/web-components/src/native/toast";
import {
  DtToastStackElement,
  type DtToastStackItem,
  type DtToastStackPosition,
} from "../../../../../packages/web-components/src/native/toast-stack";
import { TriggerButton, assertNative, nativeStoryParameters } from "../NativeStory";

if (!customElements.get("dt-toast")) {
  customElements.define("dt-toast", DtToastElement);
}
if (!customElements.get("dt-toast-stack")) {
  customElements.define("dt-toast-stack", DtToastStackElement);
}

const seedToasts: DtToastStackItem[] = [
  {
    id: "saved",
    message: "Settings saved.",
    tone: "success",
    duration: 60_000,
  },
  {
    id: "changed",
    message: "Language changed to English",
    duration: 60_000,
  },
  {
    id: "notice",
    message: "This content is only available in English",
    tone: "info",
    duration: 60_000,
  },
];
const PLAYGROUND_TONES = ["info", "success", "warning", "error"] as const;

type Args = {
  toasts: DtToastStackItem[];
  position: DtToastStackPosition;
  max: number;
  onDismiss?: (id: string) => void;
};

function NativeToastStack({ toasts, position, max, onDismiss }: Args) {
  const ref = useRef<DtToastStackElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.toasts = toasts;
    element.position = position;
    element.max = max;
  }, [max, position, toasts]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !onDismiss) return;
    const handleDismiss = (event: Event) => {
      onDismiss((event as CustomEvent<{ id: string }>).detail.id);
    };
    element.addEventListener("dismiss", handleDismiss);
    return () => element.removeEventListener("dismiss", handleDismiss);
  }, [onDismiss]);

  return React.createElement("dt-toast-stack", { ref });
}

function PlaygroundHarness({ position, max }: Pick<Args, "position" | "max">) {
  const [toasts, setToasts] = useState<DtToastStackItem[]>([]);
  const counter = useRef(0);

  const push = useCallback(() => {
    counter.current += 1;
    const tone = PLAYGROUND_TONES[counter.current % PLAYGROUND_TONES.length];
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
      <TriggerButton onClick={push}>Push toast</TriggerButton>
      <NativeToastStack
        max={max}
        onDismiss={dismiss}
        position={position}
        toasts={toasts}
      />
    </div>
  );
}

const meta = {
  title: "Web Components/Feedback/ToastStack",
  component: NativeToastStack,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Native `dt-toast-stack` composes keyed `dt-toast` live regions, starts timers only while items are visible, and emits controlled `dismiss` events with stable IDs.",
      },
    },
  },
  args: {
    toasts: seedToasts,
    position: "bottom-center",
    max: 5,
  },
  argTypes: {
    toasts: { control: "object" },
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
    max: { control: { type: "number", min: 1, step: 1 } },
    onDismiss: { control: false },
  },
} satisfies Meta<typeof NativeToastStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  play: assertNative("dt-toast-stack"),
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => (
    <PlaygroundHarness max={args.max} position={args.position} />
  ),
};

export const Example: Story = {
  tags: ["beta-matrix", "example"],
  args: {
    toasts: seedToasts,
    position: "bottom-center",
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix", "example"],
  globals: { forcedColors: "active" },
  args: { toasts: seedToasts },
};
