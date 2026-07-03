import contract from "./Modal.contract.json";
import React, { useState } from "react";
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
  argTypes: {
    // Content
    title: {
      control: "text",
      description: "Title shown in the header; becomes the accessible name",
      table: { category: "Content", type: { summary: "string" } },
    },
    description: {
      control: "text",
      description: "Supporting text (aria-describedby; DialogDescription parity)",
      table: { category: "Content", type: { summary: "string" } },
    },
    children: {
      control: "text",
      description: "Modal content",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
    footer: {
      control: false,
      description: "Footer content (e.g. action buttons); defaults to a single OK button",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
    icon: {
      control: false,
      description: "Custom header icon (severity derives one automatically)",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
    menu: {
      control: false,
      description: "Optional contextual menu or extra controls",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },

    // State
    isOpen: {
      control: "boolean",
      description: "Controls modal visibility",
      table: { category: "State", type: { summary: "boolean" } },
    },
    severity: {
      control: { type: "select" },
      options: ["success", "error", "warning", "info"],
      description:
        "Semantic status: derives the header icon; error/warning render role=alertdialog",
      table: {
        category: "State",
        type: { summary: "ModalSeverity" },
        defaultValue: { summary: "info" },
      },
    },
    isLoading: {
      control: "boolean",
      description: "Shows loading state with spinner",
      table: { category: "State", type: { summary: "boolean" } },
    },

    // Appearance
    titleSize: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Title size",
      table: {
        category: "Appearance",
        type: { summary: "TitleSizeUnified" },
        defaultValue: { summary: "S" },
      },
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
    titleTerminals: {
      control: { type: "select" },
      options: ["sans", "serif"],
      description: "Title font terminals",
      table: {
        category: "Appearance",
        type: { summary: "\"sans\" | \"serif\"" },
        defaultValue: { summary: "serif" },
      },
    },
    showCloseIcon: {
      control: "boolean",
      description: "Show close icon button in header",
      table: {
        category: "Appearance",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    closeIconName: {
      control: "text",
      description: "Custom close icon name",
      table: {
        category: "Appearance",
        type: { summary: "string" },
        defaultValue: { summary: "x" },
      },
    },
    animation: {
      control: { type: "select" },
      options: ["none", "scale", "slide", "fade"],
      description:
        "Entrance animation applied to the panel on open (respects prefers-reduced-motion)",
      table: {
        category: "Appearance",
        type: { summary: "ModalAnimation" },
        defaultValue: { summary: "none" },
      },
    },

    // Behavior
    onClose: {
      action: "closed",
      description: "Close callback (Escape, overlay click, close icon, footer OK)",
      table: { category: "Behavior", type: { summary: "() => void" } },
    },

    // Accessibility
    closeButtonLabel: {
      control: "text",
      description: "Custom close button aria-label",
      table: {
        category: "Accessibility",
        type: { summary: "string" },
        defaultValue: { summary: "Close dialog" },
      },
    },

    // Advanced
    className: {
      control: false,
      description: "Additional CSS classes on the panel",
      table: { category: "Advanced" },
    },
    showFooter: {
      control: false,
      description: "Set false to omit the footer region for composed bodies",
      table: { category: "Advanced" },
    },
    panelRef: {
      control: false,
      description: "Ref on the dialog panel for animation hooks",
      table: { category: "Advanced" },
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

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  render: Template,
  args: Default.args,
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
