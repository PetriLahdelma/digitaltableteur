import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  Stack,
  Stage,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";
import { DtModalElement } from "../../../../../packages/web-components/src/native/modal";

if (!customElements.get("dt-modal")) {
  customElements.define("dt-modal", DtModalElement);
}

type ModalArgs = {
  title: string;
  description?: string;
  severity?: "success" | "error" | "warning" | "info";
  showCloseIcon: boolean;
  dismissOnBackdrop: boolean;
  showFooter: boolean;
};

function NativeModal(args: ModalArgs) {
  return (
    <Stage width="min(36rem, 90vw)">
      <NativeElement
        tagName="dt-modal"
        attributes={{
          title: args.title,
          description: args.description,
          severity: args.severity,
          "show-close-icon": args.showCloseIcon,
          "dismiss-on-backdrop": args.dismissOnBackdrop ? "true" : "false",
          "show-footer": args.showFooter ? "true" : "false",
          "default-open": true,
        }}
      >
        Modal body content.
      </NativeElement>
    </Stage>
  );
}

function OpenableModal(args: ModalArgs & { controlled?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const modal = rootRef.current?.querySelector("dt-modal");
    if (!(modal instanceof DtModalElement)) return;

    if (args.controlled) {
      const close = () => setOpen(false);
      modal.addEventListener("dismiss-request", close);
      return () => modal.removeEventListener("dismiss-request", close);
    }

    const sync = (event: Event) => {
      const detail = (event as CustomEvent<{ open: boolean }>).detail;
      setOpen(detail.open);
    };
    modal.addEventListener("open-change", sync);
    return () => modal.removeEventListener("open-change", sync);
  }, [args.controlled]);

  const modalAttributes = {
    title: args.title,
    description: args.description,
    severity: args.severity,
    "show-close-icon": args.showCloseIcon,
    "dismiss-on-backdrop": args.dismissOnBackdrop ? "true" : "false",
    "show-footer": args.showFooter ? "true" : "false",
    controlled: args.controlled,
    open: args.controlled ? open : undefined,
  };

  return (
    <div ref={rootRef}>
      <button
        type="button"
        onClick={() => {
          if (args.controlled) {
            setOpen(true);
            return;
          }
          rootRef.current?.querySelector<DtModalElement>("dt-modal")?.show();
        }}
      >
        Open modal
      </button>
      <NativeElement tagName="dt-modal" attributes={modalAttributes}>
        Modal body content.
      </NativeElement>
    </div>
  );
}

const meta = {
  title: "Web Components/Feedback/Modal",
  component: NativeModal,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native `dt-modal` custom element with light-DOM body/footer/menu/icon slots, Escape and backdrop dismissal, and controlled or uncontrolled open state.",
      },
    },
  },
  args: {
    title: "Confirm changes",
    description: "Your edits will be applied immediately.",
    showCloseIcon: true,
    dismissOnBackdrop: true,
    showFooter: true,
  },
  argTypes: {
    severity: {
      control: "inline-radio",
      options: [undefined, "success", "error", "warning", "info"],
      labels: { undefined: "none" },
    },
    showCloseIcon: { control: "boolean" },
    dismissOnBackdrop: { control: "boolean" },
    showFooter: { control: "boolean" },
  },
} satisfies Meta<typeof NativeModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <OpenableModal {...args} />,
  play: assertNative("dt-modal"),
};

export const Playground: Story = {};

export const Controlled: Story = {
  ...exampleStory,
  render: (args) => <OpenableModal {...args} controlled />,
};

export const Confirmation: Story = {
  ...exampleStory,
  render: () => (
    <Stage width="min(40rem, 90vw)">
      <NativeElement
        tagName="dt-modal"
        attributes={{
          title: "Delete this project?",
          description:
            "This removes the project and its history for everyone in the workspace.",
          severity: "warning",
          "show-close-icon": true,
          "default-open": true,
        }}
      >
        Type the project name to confirm elsewhere; this demo keeps it short.
        <NativeElement
          tagName="dt-button"
          slot="footer"
          attributes={{ variant: "secondary", label: "Cancel" }}
        />
        <NativeElement
          tagName="dt-button"
          slot="footer"
          attributes={{ tone: "error", label: "Delete project" }}
        />
      </NativeElement>
    </Stage>
  ),
};

export const FormInModal: Story = {
  ...exampleStory,
  render: () => (
    <Stage width="min(40rem, 90vw)">
      <NativeElement
        tagName="dt-modal"
        attributes={{
          title: "Rename workspace",
          "show-close-icon": true,
          "default-open": true,
        }}
      >
        <Stack>
          <NativeElement
            tagName="dt-text-input"
            attributes={{ label: "Workspace name", value: "Digitaltableteur" }}
          />
        </Stack>
        <NativeElement
          tagName="dt-button"
          slot="footer"
          attributes={{ variant: "secondary", label: "Cancel" }}
        />
        <NativeElement
          tagName="dt-button"
          slot="footer"
          attributes={{ label: "Save" }}
        />
      </NativeElement>
    </Stage>
  ),
};

export const Severities: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["success", "error", "warning", "info"] as const).map((severity) => (
        <Stage key={severity} width="18rem">
          <NativeElement
            tagName="dt-modal"
            attributes={{
              title: `${severity[0].toUpperCase()}${severity.slice(1)} dialog`,
              severity,
              "show-close-icon": true,
              "default-open": true,
            }}
          >
            {severity} state
          </NativeElement>
        </Stage>
      ))}
    </Row>
  ),
};

export const ForcedColors: Story = { ...forcedColorsStory };
