import { type Meta, type StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import SplitButton from "@dt/SplitButton";
import contract from "./SplitButton.contract.json";
import schema from "./schema.json";

const saveOptions = [
  {
    id: "save-as",
    label: "Save as",
    icon: "pencil",
  },
  {
    id: "save-cloud",
    label: "Save to cloud",
    icon: "download",
  },
  {
    id: "save-copy",
    label: "Save a copy",
    icon: "copy-simple",
  },
];

const basicOptions = [
  { id: "duplicate", label: "Duplicate" },
  { id: "archive", label: "Archive" },
];

const meta: Meta<typeof SplitButton> = {
  title: "Actions/SplitButton",
  component: SplitButton,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1052-2084",
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
        "Preferred menu alignment; Radix collision detection flips it near viewport edges.",
      table: {
        category: "Behavior",
        type: { summary: "start | end" },
        defaultValue: { summary: "end" },
      },
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
    // Trigger lives in the canvas; the menu portals to the document body.
    const menuTrigger = canvas.getByRole("button", {
      name: /more options/i,
    });
    await userEvent.click(menuTrigger);
    await waitFor(() => {
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole("menuitem", { name: /save as/i }));
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
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
      { id: "pdf", label: "Export as PDF", trailingIcon: "file-text" },
      { id: "csv", label: "Export CSV", trailingIcon: "download" },
      {
        id: "xlsx",
        label: "Export Excel",
        disabled: true,
        trailingIcon: "file-text",
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
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("menuitem", { name: /export excel/i }),
    ).toHaveAttribute("data-disabled");
    await userEvent.click(
      screen.getByRole("menuitem", { name: /export as pdf/i }),
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
          { id: "slack", label: "Slack channel", trailingIcon: "share-network" },
          { id: "email", label: "Email subscribers" },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menuTrigger = canvas.getByRole("button", {
      name: /more options/i,
    });
    await userEvent.click(menuTrigger);
    await waitFor(() => {
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });
    // Hover opens the submenu (Radix Sub).
    await userEvent.hover(
      screen.getByRole("menuitem", { name: /environment/i }),
    );
    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /production/i }),
      ).toBeInTheDocument();
    });
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

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: {
    controls: { disable: true },
    layout: "padded",
    docs: { description: { story: "Document toolbar composition." } },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem",
      }}
    >
      <SplitButton
        label="Save"
        variant="primary"
        onPrimaryClick={() => {}}
        options={saveOptions}
      />
      <SplitButton
        label="Export"
        variant="secondary"
        toggleLabel="Choose export format"
        options={[
          { id: "pdf", label: "Export as PDF", trailingIcon: "file-text" },
          { id: "csv", label: "Export CSV", trailingIcon: "download" },
        ]}
      />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: {
    label: "Save",
    variant: "primary",
    options: "save" as unknown as typeof saveOptions,
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
