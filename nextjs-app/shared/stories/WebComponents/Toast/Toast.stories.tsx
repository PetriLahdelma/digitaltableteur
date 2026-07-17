import React, { useLayoutEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import {
  DtToastElement,
  type DtToastPosition,
  type DtToastTone,
} from "../../../../../packages/web-components/src/native/toast";
import { DtToastStackElement } from "../../../../../packages/web-components/src/native/toast-stack";
import {
  NativeElement,
  Row,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";

if (!customElements.get("dt-toast")) {
  customElements.define("dt-toast", DtToastElement);
}
if (!customElements.get("dt-toast-stack")) {
  customElements.define("dt-toast-stack", DtToastStackElement);
}

type Args = {
  open: boolean;
  message: string;
  tone: DtToastTone;
  position: DtToastPosition;
  size: "sm" | "md" | "lg";
  duration: number;
  inline: boolean;
  onClose?: () => void;
};

function NativeToast({ onClose, ...args }: Args) {
  const ref = useRef<DtToastElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.message = args.message;
    element.tone = args.tone;
    element.position = args.position;
    element.size = args.size;
    element.duration = args.duration;
    element.inline = args.inline;
    element.open = args.open;
  }, [
    args.duration,
    args.inline,
    args.message,
    args.open,
    args.position,
    args.size,
    args.tone,
  ]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !onClose) return;
    element.addEventListener("close", onClose);
    return () => element.removeEventListener("close", onClose);
  }, [onClose]);

  return React.createElement("dt-toast", { ref });
}

const baseArgs: Args = {
  open: true,
  message: "Saved successfully.",
  tone: "success",
  position: "bottom-center",
  size: "md",
  duration: 3000,
  inline: false,
};

function DefaultDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <NativeElement
        tagName="dt-button"
        attributes={{ label: "Show Toast" }}
        onClick={() => setOpen(true)}
      />
      <NativeToast
        {...baseArgs}
        message="Toast notification!"
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const meta = {
  title: "Web Components/Feedback/Toast",
  component: NativeToast,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: {
        component:
          "Native `dt-toast` keeps its live region mounted while closed, maps warning/error to assertive announcements, and emits a composed `close` event after its timer.",
      },
    },
  },
  args: baseArgs,
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["neutral", "success", "error", "warning", "info"],
    },
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
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    onClose: { control: false },
  },
} satisfies Meta<typeof NativeToast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultDemo />,
  play: async ({ canvasElement }) => {
    await assertNative("dt-toast")({ canvasElement });
    const button = canvasElement.querySelector<HTMLElement>("dt-button");
    await userEvent.click(button!);
    await waitFor(() => {
      const toast = canvasElement.querySelector<DtToastElement>("dt-toast");
      expect(toast?.shadowRoot?.querySelector(".message")).toHaveTextContent(
        "Toast notification!",
      );
    });
  },
};

export const Tones: Story = {
  tags: ["example"],
  render: function TonesStory() {
    const [tone, setTone] = useState<DtToastTone | null>(null);
    const messages: Record<DtToastTone, string> = {
      neutral: "Language changed to English.",
      success: "Operation completed successfully.",
      error: "An error occurred. Please try again.",
      warning: "Your session will expire soon.",
      info: "New features available.",
    };
    return (
      <>
        <Row>
          {(Object.keys(messages) as DtToastTone[]).map((value) => (
            <NativeElement
              key={value}
              tagName="dt-button"
              attributes={{ label: value, variant: "secondary", size: "sm" }}
              onClick={() => setTone(value)}
            />
          ))}
        </Row>
        <NativeToast
          {...baseArgs}
          duration={60_000}
          message={tone ? messages[tone] : ""}
          open={tone !== null}
          tone={tone ?? "neutral"}
          onClose={() => setTone(null)}
        />
      </>
    );
  },
};

export const Placement: Story = {
  tags: ["example"],
  parameters: {
    docs: { story: { inline: false, iframeHeight: 360 } },
  },
  render: function PlacementStory() {
    const positions: DtToastPosition[] = [
      "top-left",
      "top-center",
      "top-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ];
    const [position, setPosition] = useState<DtToastPosition | null>(null);
    return (
      <>
        <Row>
          {positions.map((value) => (
            <NativeElement
              key={value}
              tagName="dt-button"
              attributes={{ label: value, variant: "secondary", size: "sm" }}
              onClick={() => setPosition(value)}
            />
          ))}
        </Row>
        <NativeToast
          {...baseArgs}
          duration={60_000}
          message={position ? `Anchored ${position}.` : ""}
          open={position !== null}
          position={position ?? "bottom-center"}
          tone="info"
          onClose={() => setPosition(null)}
        />
      </>
    );
  },
};

export const ProviderDriven: Story = {
  tags: ["example"],
  render: function ProviderDrivenStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <NativeElement
          tagName="dt-button"
          attributes={{ label: "Save settings" }}
          onClick={() => setOpen(true)}
        />
        <NativeToast
          {...baseArgs}
          duration={4000}
          message="Settings saved."
          open={open}
          onClose={() => setOpen(false)}
        />
      </>
    );
  },
};

export const Stacked: Story = {
  tags: ["example"],
  render: () =>
    React.createElement("dt-toast-stack", {
      ref: (element: DtToastStackElement | null) => {
        if (!element) return;
        element.position = "bottom-center";
        element.toasts = [
          {
            id: "saved",
            message: "Settings saved.",
            tone: "success",
            duration: 600_000,
          },
          {
            id: "lang",
            message: "Language changed to English",
            duration: 600_000,
          },
          {
            id: "notice",
            message: "This content is only available in English",
            tone: "info",
            duration: 600_000,
          },
        ];
      },
    }),
};

export const Playground: Story = {
  args: { duration: 60_000 },
};

export const Example: Story = {
  tags: ["example"],
  args: { duration: 60_000 },
};

export const ForcedColors: Story = {
  tags: ["example"],
  globals: { forcedColors: "active" },
  args: { duration: 60_000 },
};
