import contract from "./Modal.contract.json";
import React, { useState } from "react";
import { useArgs } from "storybook/preview-api";
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import { userEvent, waitFor, within } from "storybook/test";
import Modal, { type ModalProps } from "@dt/Modal";
import Button from "@dt/Button";
import TextInput from "@dt/TextInput";
import Text from "@dt/Text";
import schema from "./schema.json";

const meta = {
  title: "Feedback/Modal",
  component: Modal,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=384-13",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // authored entries cover what the contract cannot derive: children keeps a
  // text control, iconSize's type is IconProps["size"] (options listed here),
  // and the composite footer/icon/menu slots get mapping presets.
  argTypes: {
    children: {
      control: "text",
      description: "Modal content",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
    iconSize: {
      control: { type: "select" },
      options: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
      description: "Header severity icon size (Icon token scale)",
      table: {
        category: "Appearance",
        type: { summary: "IconProps[\"size\"]" },
        defaultValue: { summary: "lg" },
      },
    },
    footer: {
      control: { type: "select" },
      options: ["default", "cancelSave"],
      mapping: {
        default: undefined,
        cancelSave: (
          <>
            <Button variant="secondary">Cancel</Button>
            <Button>Save</Button>
          </>
        ),
      },
      description:
        "Footer content; defaults to a single OK button. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
    icon: {
      control: { type: "select" },
      options: ["derived", "sparkle"],
      mapping: {
        derived: undefined,
        sparkle: <span aria-hidden="true">✦</span>,
      },
      description:
        "Custom header icon (severity derives one automatically). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
    menu: {
      control: { type: "select" },
      options: ["none", "options"],
      mapping: {
        none: undefined,
        options: (
          <Button variant="tertiary" size="sm">
            Options
          </Button>
        ),
      },
      description:
        "Optional contextual menu or extra controls in the header. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Starts open in story view (so the AT matrix captures the dialog tree) but
 * closed on the docs page, where an auto-open portal would cover the docs.
 */
const Template: StoryFn<ModalProps> = (args, context) => {
  const [open, setOpen] = useState(context.viewMode !== "docs");
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal {...args} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};

/**
 * Controlled dialog: the trigger sets `isOpen`, the dialog calls `onClose` on
 * Escape, overlay click, the header close icon, and the default footer OK.
 * The page behind is marked `inert` while open, and focus returns to the
 * trigger on close.
 */
export const Default = Template.bind({});
Default.tags = ["beta-matrix"];
Default.args = {
  title: "Confirm changes",
  children: "Your edits will be applied immediately.",
  showCloseIcon: true,
};
Default.parameters = {};

/** Interaction coverage (not beta-matrix — play runs before AT capture). */
export const CloseViaIcon = Template.bind({});
CloseViaIcon.args = Default.args;
CloseViaIcon.parameters = { docs: { disable: true } };
CloseViaIcon.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  const openButton = canvas.getByRole("button", { name: /open/i });
  await userEvent.click(openButton);

  const body = within(document.body);
  await waitFor(() => body.getByRole("dialog"), { timeout: 3000 });

  const closeButton = body.getByLabelText(/close/i);
  await userEvent.click(closeButton);
};

export const Loading = Template.bind({});
Loading.tags = ["beta-matrix"];
Loading.args = {
  isLoading: true,
  title: "Saving changes",
  children: <p>Please wait while we save your edits.</p>,
  showCloseIcon: false,
};
Loading.parameters = {
  // axe-core color-contrast misreports the spinner border as the text
  // background when the spinner is the only sibling in flex layout. The
  // spinner is aria-hidden and visually decorative; the surrounding modal
  // content uses var(--color-primary) over var(--main-body-background-color)
  // which is verified via Modal.test.tsx and the non-loading variants.
  a11y: {
    config: {
      rules: [{ id: "color-contrast", enabled: false }],
    },
  },
};

export const ErrorDialog = Template.bind({});
ErrorDialog.tags = ["beta-matrix"];
ErrorDialog.args = {
  isOpen: true,
  title: "Something went wrong",
  severity: "error",
  description: "We could not save your changes. Check your connection and try again.",
};

export const SuccessDialog = Template.bind({});
SuccessDialog.tags = ["beta-matrix"];
SuccessDialog.args = {
  isOpen: true,
  title: "Changes saved",
  severity: "success",
  children: "Your edits are live.",
};

export const WarningDialog = Template.bind({});
WarningDialog.tags = ["beta-matrix"];
WarningDialog.args = {
  isOpen: true,
  title: "Unsaved changes",
  severity: "warning",
  children: "Leaving now discards your edits.",
};

export const InfoDialog = Template.bind({});
InfoDialog.tags = ["beta-matrix"];
InfoDialog.args = {
  isOpen: true,
  title: "Heads up",
  severity: "info",
  children: "This workspace is read-only during maintenance.",
};

/** Two-way choice with an explicit footer: Cancel plus the primary action. */
export const Confirmation: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Destructive or two-way choices get an explicit footer — Cancel plus a toned primary action. The default OK-only footer is for acknowledgements. severity=\"warning\" makes this an alertdialog announced assertively.",
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Delete project…
        </Button>
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Delete this project?"
          description="This removes the project and its history for everyone in the workspace."
          severity="warning"
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button tone="error" onClick={() => setOpen(false)}>
                Delete project
              </Button>
            </>
          }
        >
          <Text size="s">Type the project name to confirm elsewhere; this demo keeps it short.</Text>
        </Modal>
      </>
    );
  },
};

/** Short form in a dialog: fields in the body, actions in the footer. */
export const FormInModal: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A short form is the canonical modal task: inputs own their labels in the body, the footer carries Cancel/Save. Anything longer than a handful of fields deserves a page, not a modal.",
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Rename workspace…
        </Button>
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Rename workspace"
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </>
          }
        >
          <TextInput
            label="Workspace name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            helperText="Shown in the sidebar and invitations."
          />
        </Modal>
      </>
    );
  },
};

/** Long content scrolls inside the panel; header and footer stay pinned. */
export const Scrollable: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The panel caps at 90vh and the content region scrolls on its own — header and footer stay in reach. If users routinely scroll a modal, the content probably wants a page instead.",
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          View terms
        </Button>
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Terms of service"
          showCloseIcon
        >
          {Array.from({ length: 12 }, (_, i) => (
            <Text key={i} size="s">
              Section {i + 1}. These example terms exist to overflow the panel
              so the body scrolls while the header and footer stay pinned in
              place for orientation and escape.
            </Text>
          ))}
        </Modal>
      </>
    );
  },
};

/** Entrance animation on the panel, dropped under prefers-reduced-motion. */
export const AnimatedEntrance: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "animation applies a GSAP entrance to the panel: scale, slide, or fade. It is skipped entirely under prefers-reduced-motion, so treat it as garnish — never information.",
      },
    },
  },
  render: () => {
    const [animation, setAnimation] = useState<ModalProps["animation"]>();
    return (
      <>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["scale", "slide", "fade"] as const).map((kind) => (
            <Button
              key={kind}
              variant="secondary"
              onClick={() => setAnimation(kind)}
            >
              {kind}
            </Button>
          ))}
        </div>
        <Modal
          isOpen={animation !== undefined}
          onClose={() => setAnimation(undefined)}
          title="Animated entrance"
          animation={animation}
        >
          Opened with the {animation} entrance.
        </Modal>
      </>
    );
  },
};

/**
 * Args-driven visibility so the isOpen control actually drives the canvas
 * (the shared Template owns isOpen internally and would ignore the panel).
 * Docs mode still renders closed — an auto-open portal would cover the page.
 */
const PlaygroundRender: StoryFn<ModalProps> = (args, context) => {
  const [{ isOpen }, updateArgs] = useArgs();
  const open = context.viewMode === "docs" ? false : Boolean(isOpen);
  return (
    <>
      <Button onClick={() => updateArgs({ isOpen: true })}>Open modal</Button>
      <Modal
        {...args}
        isOpen={open}
        onClose={() => updateArgs({ isOpen: false })}
      />
    </>
  );
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  render: PlaygroundRender,
  // severity seeded so the header icon exists (iconSize drives it); showFooter
  // seeded true because the component treats undefined as true but the panel's
  // boolean seed would otherwise read false and hide the whole footer region.
  args: { ...Default.args, isOpen: true, severity: "info", showFooter: true },
};

export const Example = {
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: Template,
  args: Default.args,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: Template,
  args: {
    title: "Something went wrong",
    severity: "error",
    description: "We could not save your changes. Check your connection and try again.",
  },
};
