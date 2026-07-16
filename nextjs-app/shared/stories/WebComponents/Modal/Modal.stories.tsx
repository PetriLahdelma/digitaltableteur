import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  Stack,
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
  dialogTitle: string;
  description?: string;
  severity?: "success" | "error" | "warning" | "info";
  loading?: boolean;
  titleSize?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  iconSize?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  animation?: "none" | "scale" | "slide" | "fade";
  showCloseIcon: boolean;
  closeIconName?: string;
  closeButtonLabel?: string;
  dismissOnBackdrop: boolean;
  showFooter: boolean;
};

function NativeModal(args: ModalArgs) {
  return <OpenableModal {...args} />;
}

function closeContainingModal(event: MouseEvent<HTMLElement>) {
  const modal = event.currentTarget.closest("dt-modal");
  if (modal instanceof DtModalElement) modal.close();
}

function ModalText({ children }: { children: ReactNode }) {
  return (
    <NativeElement tagName="dt-text" attributes={{ size: "s" }}>
      {children}
    </NativeElement>
  );
}

function OpenableModal({
  controlled = false,
  initialOpen = false,
  triggerLabel = "Open modal",
  triggerVariant = "primary",
  children = "Your edits will be applied immediately.",
  ...args
}: ModalArgs & {
  controlled?: boolean;
  initialOpen?: boolean;
  triggerLabel?: string;
  triggerVariant?: "primary" | "secondary" | "tertiary";
  children?: ReactNode;
}) {
  const modalRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(initialOpen);

  useEffect(() => {
    const modal = modalRef.current;
    if (!(modal instanceof DtModalElement)) return;

    if (controlled) {
      const close = () => setOpen(false);
      modal.addEventListener("dismiss-request", close);
      return () => modal.removeEventListener("dismiss-request", close);
    }

    const sync = (event: Event) => {
      const detail = (event as CustomEvent<{ open: boolean }>).detail;
      setOpen(detail.open);
    };
    modal.addEventListener("open-change", sync);
    if (initialOpen) modal.show();
    return () => modal.removeEventListener("open-change", sync);
  }, [controlled, initialOpen]);

  const modalAttributes = {
    "dialog-title": args.dialogTitle,
    description: args.description,
    severity: args.severity,
    loading: args.loading,
    "title-size": args.titleSize,
    "icon-size": args.iconSize,
    animation: args.animation,
    "show-close-icon": args.showCloseIcon,
    "close-icon-name": args.closeIconName,
    "close-button-label": args.closeButtonLabel,
    "dismiss-on-backdrop": args.dismissOnBackdrop ? "true" : "false",
    "show-footer": args.showFooter ? "true" : "false",
    controlled,
    open: controlled ? open : undefined,
  };

  return (
    <>
      <NativeElement
        tagName="dt-button"
        attributes={{ label: triggerLabel, variant: triggerVariant }}
        onClick={() => {
          if (controlled) {
            setOpen(true);
            return;
          }
          if (modalRef.current instanceof DtModalElement) {
            modalRef.current.show();
          }
        }}
      />
      {createPortal(
        <NativeElement
          tagName="dt-modal"
          attributes={modalAttributes}
          elementRef={modalRef}
        >
          {children}
        </NativeElement>,
        document.body,
      )}
    </>
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
    dialogTitle: "Confirm changes",
    description: "",
    loading: false,
    titleSize: "sm",
    iconSize: "lg",
    animation: "none",
    showCloseIcon: true,
    closeIconName: "x",
    closeButtonLabel: "Close dialog",
    dismissOnBackdrop: true,
    showFooter: true,
  },
  argTypes: {
    dialogTitle: { control: { type: "text" } },
    description: { control: { type: "text" } },
    severity: {
      control: "inline-radio",
      options: [undefined, "success", "error", "warning", "info"],
      labels: { undefined: "none" },
    },
    loading: { control: { type: "boolean" } },
    titleSize: {
      control: { type: "select" },
      options: ["xxs", "xs", "sm", "md", "lg", "xl", "xxl"],
    },
    iconSize: {
      control: { type: "select" },
      options: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
    },
    animation: {
      control: "inline-radio",
      options: ["none", "scale", "slide", "fade"],
    },
    showCloseIcon: { control: "boolean" },
    closeIconName: { control: { type: "text" } },
    closeButtonLabel: { control: { type: "text" } },
    dismissOnBackdrop: { control: "boolean" },
    showFooter: { control: "boolean" },
  },
} satisfies Meta<typeof NativeModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args, context) => (
    <OpenableModal {...args} initialOpen={context.viewMode !== "docs"} />
  ),
  play: assertNative("dt-modal", "document"),
};

export const Playground: Story = {
  render: (args, context) => (
    <OpenableModal {...args} initialOpen={context.viewMode !== "docs"} />
  ),
};

export const CloseViaIcon: Story = {
  parameters: { docs: { disable: true } },
  render: (args, context) => (
    <OpenableModal {...args} initialOpen={context.viewMode !== "docs"} />
  ),
};

export const Loading: Story = {
  render: (_args, context) => (
    <OpenableModal
      dialogTitle="Saving changes"
      showCloseIcon={false}
      dismissOnBackdrop={false}
      showFooter={false}
      loading
      initialOpen={context.viewMode !== "docs"}
    >
      <ModalText>Please wait while we save your edits.</ModalText>
    </OpenableModal>
  ),
};

function severityStory(
  severity: "success" | "error" | "warning" | "info",
  dialogTitle: string,
  body: string,
): Story {
  return {
    render: (_args, context) => (
      <OpenableModal
        dialogTitle={dialogTitle}
        description={severity === "error" ? body : undefined}
        severity={severity}
        showCloseIcon={false}
        dismissOnBackdrop
        showFooter
        initialOpen={context.viewMode !== "docs"}
      >
        {severity === "error" ? null : <ModalText>{body}</ModalText>}
      </OpenableModal>
    ),
  };
}

export const ErrorDialog = severityStory(
  "error",
  "Something went wrong",
  "We could not save your changes. Check your connection and try again.",
);
export const SuccessDialog = severityStory(
  "success",
  "Changes saved",
  "Your edits are live.",
);
export const WarningDialog = severityStory(
  "warning",
  "Unsaved changes",
  "Leaving now discards your edits.",
);
export const InfoDialog = severityStory(
  "info",
  "Heads up",
  "This workspace is read-only during maintenance.",
);

export const Controlled: Story = {
  render: (args, context) => (
    <OpenableModal
      {...args}
      controlled
      initialOpen={context.viewMode !== "docs"}
    />
  ),
};

export const Confirmation: Story = {
  ...exampleStory,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Destructive or two-way choices use an explicit footer: secondary Cancel plus an error-toned action. Error severity aligns the dialog chrome with the destructive action.",
      },
    },
  },
  render: (_args, context) => (
    <OpenableModal
      dialogTitle="Delete this project?"
      description="This removes the project and its history for everyone in the workspace."
      severity="error"
      showCloseIcon={false}
      dismissOnBackdrop
      showFooter
      triggerLabel="Delete project…"
      triggerVariant="secondary"
      initialOpen={context.viewMode !== "docs"}
    >
      <ModalText>
        Type the project name to confirm elsewhere; this demo keeps it short.
      </ModalText>
      <NativeElement
        tagName="dt-button"
        slot="footer"
        attributes={{ variant: "secondary", label: "Cancel" }}
        onClick={closeContainingModal}
      />
      <NativeElement
        tagName="dt-button"
        slot="footer"
        attributes={{ tone: "error", label: "Delete project" }}
        onClick={closeContainingModal}
      />
    </OpenableModal>
  ),
};

export const FormInModal: Story = {
  ...exampleStory,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A short form is the canonical modal task: the input owns its label and helper text, while the footer carries Cancel and Save.",
      },
    },
  },
  render: (_args, context) => (
    <OpenableModal
      dialogTitle="Rename workspace"
      showCloseIcon={false}
      dismissOnBackdrop
      showFooter
      triggerLabel="Rename workspace…"
      triggerVariant="secondary"
      initialOpen={context.viewMode !== "docs"}
    >
      <Stack>
        <NativeElement
          tagName="dt-text-input"
          attributes={{
            label: "Workspace name",
            value: "Digitaltableteur",
            "helper-text": "Shown in the sidebar and invitations.",
          }}
        />
      </Stack>
      <NativeElement
        tagName="dt-button"
        slot="footer"
        attributes={{ variant: "secondary", label: "Cancel" }}
        onClick={closeContainingModal}
      />
      <NativeElement
        tagName="dt-button"
        slot="footer"
        attributes={{ label: "Save" }}
        onClick={closeContainingModal}
      />
    </OpenableModal>
  ),
};

export const Severities: Story = {
  ...exampleStory,
  parameters: {
    docs: {
      description: {
        story:
          "Severity derives the semantic icon, border color, and dialog role. Error and warning states use alertdialog semantics.",
      },
    },
  },
  render: (_args, context) => (
    <Row>
      {(["success", "error", "warning", "info"] as const).map(
        (severity, index) => (
          <OpenableModal
            key={severity}
            dialogTitle={`${severity[0].toUpperCase()}${severity.slice(1)} dialog`}
            severity={severity}
            showCloseIcon
            dismissOnBackdrop
            showFooter
            triggerLabel={`Open ${severity} dialog`}
            triggerVariant="secondary"
            initialOpen={context.viewMode !== "docs" && index === 0}
          >
            <ModalText>{severity} state</ModalText>
          </OpenableModal>
        ),
      )}
    </Row>
  ),
};

export const Scrollable: Story = {
  ...exampleStory,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Long content scrolls inside the panel while the header and footer remain available.",
      },
    },
  },
  render: (_args, context) => (
    <OpenableModal
      dialogTitle="Terms of service"
      showCloseIcon
      dismissOnBackdrop
      showFooter
      triggerLabel="View terms"
      triggerVariant="secondary"
      initialOpen={context.viewMode !== "docs"}
    >
      {Array.from({ length: 18 }, (_, index) => (
        <ModalText key={index}>
          Section {index + 1}: review this agreement before continuing.
        </ModalText>
      ))}
    </OpenableModal>
  ),
};

export const AnimatedEntrance: Story = {
  ...exampleStory,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Scale, slide, and fade entrances are removed when reduced motion is requested.",
      },
    },
  },
  render: (_args, context) => (
    <Row>
      {(["scale", "slide", "fade"] as const).map((animation, index) => (
        <OpenableModal
          key={animation}
          dialogTitle={`${animation[0].toUpperCase()}${animation.slice(1)} entrance`}
          showCloseIcon={false}
          dismissOnBackdrop
          showFooter
          animation={animation}
          triggerLabel={animation}
          triggerVariant="secondary"
          initialOpen={context.viewMode !== "docs" && index === 0}
        >
          <ModalText>
            Opened with the {animation} entrance. Motion is removed under
            reduced motion.
          </ModalText>
        </OpenableModal>
      ))}
    </Row>
  ),
};

export const Example: Story = {
  ...exampleStory,
  render: (args, context) => (
    <OpenableModal {...args} initialOpen={context.viewMode !== "docs"} />
  ),
};

export const ForcedColors: Story = {
  ...forcedColorsStory,
  render: (args, context) => (
    <OpenableModal
      {...args}
      severity="error"
      initialOpen={context.viewMode !== "docs"}
    />
  ),
};
