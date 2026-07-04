import React from "react";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import SplitButton from "@dt/SplitButton";
import contract from "./SplitButton.contract.json";
import schema from "./schema.json";

const saveOptions = [
  {
    id: "save-as",
    label: "Save as",
    title: "Choose a new name for this draft",
    icon: "pencil",
  },
  {
    id: "save-cloud",
    label: "Save to cloud",
    title: "Sync to shared workspace",
    icon: "cloud-arrow-up",
  },
  {
    id: "save-copy",
    label: "Save a copy",
    title: "Duplicate and keep editing",
    icon: "copy",
  },
];

const basicOptions = [
  { id: "duplicate", label: "Duplicate" },
  { id: "archive", label: "Archive" },
];

const meta: Meta<typeof SplitButton> = {
  title: "Actions/SplitButton",
  component: SplitButton,
  tags: ["alpha", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=406-1569",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    label: {
      control: "text",
      description: "Main label rendered on the primary segment.",
      table: { category: "Content", type: { summary: "ReactNode" } },
    },
    options: {
      control: {
        type: "select",
        labels: { save: "save menu (3 items, icons)", basic: "two plain actions" },
      },
      options: ["save", "basic"],
      mapping: { save: saveOptions, basic: basicOptions },
      description:
        "Menu entries; leaf options carry onSelect, parent options carry children (one nested level). Presets here; pass SplitButtonOption[] in code.",
      table: { category: "Content", type: { summary: "SplitButtonOption[]" } },
    },
    variant: {
      control: { type: "inline-radio" },
      options: ["primary", "secondary", "tertiary"],
      description: "Visual weight shared by both segments (Button scale).",
      table: {
        category: "Appearance",
        type: { summary: "primary | secondary | tertiary" },
        defaultValue: { summary: "primary" },
      },
    },
    size: {
      control: { type: "inline-radio" },
      options: ["sm", "md", "lg"],
      description: "Control size shared by both segments.",
      table: {
        category: "Appearance",
        type: { summary: "sm | md | lg" },
        defaultValue: { summary: "md" },
      },
    },
    surface: {
      control: { type: "inline-radio" },
      options: ["default", "onDark", "onBrand"],
      description: "Surface the control sits on; prefer over color overrides.",
      table: {
        category: "Appearance",
        type: { summary: "default | onDark | onBrand" },
        defaultValue: { summary: "default" },
      },
    },
    rounded: {
      control: "boolean",
      description: "Fully rounded (pill) corners.",
      table: { category: "Appearance", type: { summary: "boolean" } },
    },
    disabled: {
      control: "boolean",
      description: "Disables both segments.",
      table: { category: "State", type: { summary: "boolean" } },
    },
    menuAlign: {
      control: { type: "inline-radio" },
      options: ["start", "end"],
      description:
        "Preferred menu alignment; collision detection may flip it near viewport edges.",
      table: {
        category: "Behavior",
        type: { summary: "start | end" },
        defaultValue: { summary: "end" },
      },
    },
    usePortal: {
      control: "boolean",
      description:
        "Render the menu in a document.body portal to escape overflow-hidden containers.",
      table: { category: "Behavior", type: { summary: "boolean" } },
    },
    onPrimaryClick: {
      action: "primaryClick",
      description: "Fires when the primary segment is activated.",
      table: { category: "Behavior", type: { summary: "(e: MouseEvent) => void" } },
    },
    toggleLabel: {
      control: "text",
      description:
        "Accessible name for the menu toggle; defaults to the localized 'More options'.",
      table: { category: "Accessibility", type: { summary: "string" } },
    },
    accessibleName: {
      control: "text",
      description: "Accessible name override for the primary segment.",
      table: { category: "Accessibility", type: { summary: "string" } },
    },
    tooltip: {
      control: "text",
      description: "Native tooltip on the primary segment.",
      table: { category: "Accessibility", type: { summary: "string" } },
    },
    className: {
      control: "text",
      description: "Forwarded to the outer wrapper.",
      table: { category: "Advanced", type: { summary: "string" } },
    },
  },
  // Seeded so every text/boolean control renders an operable widget; each
  // value matches the component's no-op default.
  args: {
    disabled: false,
    usePortal: false,
    toggleLabel: "",
    accessibleName: "",
    tooltip: "",
    className: "",
  },
};

export default meta;
type Story = StoryObj<typeof SplitButton>;

export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    label: "Save",
    variant: "primary",
    // "save" resolves through the options control mapping to saveOptions.
    options: "save" as unknown as typeof saveOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menuTrigger = canvas.getByRole("button", {
      name: /moreOptions|more options/i,
    });
    await userEvent.click(menuTrigger);
    await waitFor(() => {
      expect(canvas.getByRole("menu")).toBeInTheDocument();
    });
    const saveAsOption = canvas.getByRole("menuitem", { name: /save as/i });
    await userEvent.click(saveAsOption);
  },
};

export const Variants: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "Both segments share Button's weight scale; the pair reads as one control in all three weights.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <SplitButton label="Save" variant="primary" options={saveOptions} />
      <SplitButton label="Save" variant="secondary" options={saveOptions} />
      <SplitButton label="Save" variant="tertiary" options={saveOptions} />
    </div>
  ),
};

export const ExportFormats: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "A menu of parallel format choices with one disabled entry; disabled options are skipped by keyboard navigation.",
      },
    },
  },
  args: {
    label: "Export",
    variant: "secondary",
    toggleLabel: "Choose export format",
    options: [
      { id: "pdf", label: "Export as PDF", trailingIcon: "file-pdf" },
      { id: "csv", label: "Export CSV", trailingIcon: "file-csv" },
      {
        id: "xlsx",
        label: "Export Excel",
        disabled: true,
        trailingIcon: "file-xls",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menuTrigger = canvas.getByRole("button", {
      name: /choose export format/i,
    });
    await userEvent.click(menuTrigger);
    await waitFor(() => {
      expect(canvas.getByRole("menu")).toBeInTheDocument();
    });
    expect(
      canvas.getByRole("menuitem", { name: /export excel/i }),
    ).toBeDisabled();
    await userEvent.click(
      canvas.getByRole("menuitem", { name: /export as pdf/i }),
    );
  },
};

export const NestedSubmenus: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "One optional submenu level via children; opens on hover, ArrowRight, or Enter. Parent options cannot carry onSelect (compile-time enforced).",
      },
    },
  },
  args: {
    label: "Publish",
    options: [
      {
        id: "environment",
        label: "Environment",
        children: [
          { id: "prod", label: "Production", trailingIcon: "check" },
          { id: "staging", label: "Staging" },
        ],
      },
      {
        id: "notify",
        label: "Notify",
        children: [
          { id: "slack", label: "Slack channel", trailingIcon: "bell" },
          { id: "email", label: "Email subscribers" },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menuTrigger = canvas.getByRole("button", {
      name: /moreOptions|more options/i,
    });
    await userEvent.click(menuTrigger);
    await waitFor(() => {
      expect(canvas.getByRole("menu")).toBeInTheDocument();
    });
    const envOption = canvas.getByRole("menuitem", { name: /environment/i });
    await userEvent.hover(envOption);
    await waitFor(() => {
      expect(
        canvas.getByRole("menuitem", { name: /production/i }),
      ).toBeInTheDocument();
    });
    await userEvent.click(
      canvas.getByRole("menuitem", { name: /production/i }),
    );
  },
};

export const DisabledState: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story: "disabled turns off both segments at once.",
      },
    },
  },
  args: {
    label: "Save",
    options: saveOptions,
    disabled: true,
  },
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  args: {
    label: "Save",
    variant: "primary",
    size: "md",
    // "save" resolves through the options control mapping to saveOptions.
    options: "save" as unknown as typeof saveOptions,
  },
};

type EdgeDetectionProps = React.ComponentProps<typeof SplitButton> & {
  previewPlacement?: "left" | "right" | "top" | "bottom";
};

/**
 * Dev QA harness (not an example): moves the trigger near a viewport edge to
 * verify the collision-aware menu placement flips correctly.
 */
const EdgeDetectionPreview = ({
  previewPlacement = "right",
  ...splitArgs
}: EdgeDetectionProps) => {
  const PREVIEW_MARGIN = 24;
  const MIN_BLOCK_SIZE = 220;
  const MIN_INLINE_SIZE = 220;
  const areaRef = React.useRef<HTMLDivElement | null>(null);
  const [previewSize, setPreviewSize] = React.useState({ width: 0, height: 0 });

  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const parent = areaRef.current?.parentElement;
    if (!parent) return;

    const updateSize = () => {
      const rect = parent.getBoundingClientRect();
      setPreviewSize({ width: rect.width, height: rect.height });
    };

    updateSize();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateSize());
      observer.observe(parent);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const justifyContent =
    previewPlacement === "left"
      ? "flex-start"
      : previewPlacement === "right"
        ? "flex-end"
        : "center";
  const alignItems =
    previewPlacement === "top"
      ? "flex-start"
      : previewPlacement === "bottom"
        ? "flex-end"
        : "center";

  const computedWidth =
    previewSize.width > 0
      ? Math.max(previewSize.width - PREVIEW_MARGIN * 2, MIN_INLINE_SIZE)
      : undefined;

  const computedHeight =
    previewSize.height > 0
      ? Math.max(previewSize.height - PREVIEW_MARGIN * 2, MIN_BLOCK_SIZE)
      : undefined;

  return (
    <div
      ref={areaRef}
      style={{
        display: "flex",
        width: previewSize.width > 0 ? `${previewSize.width}px` : "100%",
        blockSize: previewSize.height > 0 ? `${previewSize.height}px` : "100%",
        minBlockSize: "95vh",
        padding: `${PREVIEW_MARGIN}px`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent,
          alignItems,
          minHeight: `${MIN_BLOCK_SIZE}px`,
          padding: "1.5rem",
          inlineSize: computedWidth ? `${computedWidth}px` : "100%",
          blockSize: computedHeight ? `${computedHeight}px` : undefined,
          border: "1px dashed var(--color-border)",
          boxSizing: "border-box",
        }}
      >
        <SplitButton
          label="Copy"
          variant="secondary"
          options={[
            { id: "copy", label: "Copy" },
            { id: "copy-no-comments", label: "Copy w/o comments" },
          ]}
          {...splitArgs}
        />
      </div>
    </div>
  );
};

export const EdgeDetection: StoryObj<EdgeDetectionProps> = {
  render: (args) => <EdgeDetectionPreview {...args} />,
  args: { previewPlacement: "right" },
  argTypes: {
    previewPlacement: {
      options: ["left", "right", "top", "bottom"],
      control: { type: "inline-radio" },
      description:
        "Moves the trigger near an edge to verify automatic menu alignment.",
    },
  },
};
