import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { userEvent, within } from "storybook/test";
import { ExpandableSection } from "./ExpandableSection";
import contract from "./ExpandableSection.contract.json";

function ExpandableSectionDemo(
  args: React.ComponentProps<typeof ExpandableSection>,
) {
  const [open, setOpen] = useState(args.defaultExpanded ?? false);
  return (
    <ExpandableSection {...args} expanded={open} onExpandedChange={setOpen} />
  );
}

const defaultArgs = {
  collapsedLabel: "Add project details",
  expandedLabel: "Hide project details",
  defaultExpanded: false,
  children: (
    <p className="text-sm text-muted-foreground">
      Optional fields appear here when expanded.
    </p>
  ),
};

const meta = {
  title: "Layout/ExpandableSection",
  component: ExpandableSection,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-expandable-section",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    collapsedLabel: {
      control: "text",
      description: "Trigger label when collapsed",
    },
    expandedLabel: {
      control: "text",
      description: "Trigger label when expanded",
    },
    defaultExpanded: {
      control: "boolean",
      description: "Initial open state (uncontrolled)",
    },
    expanded: {
      control: "boolean",
      description: "Controlled open state",
    },
    onExpandedChange: {
      action: "expandedChange",
      description: "Open state change handler",
    },
    children: {
      control: false,
      description: "Disclosed panel content",
    },
    className: {
      control: "text",
      description: "Container class names",
      table: { disable: true },
    },
    staggerDelay: {
      control: "number",
      description: "Child animation stagger in ms",
      table: { defaultValue: { summary: "60" } },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof ExpandableSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <ExpandableSectionDemo {...args} />,
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <ExpandableSectionDemo {...args} />,
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button"));
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (contact form editorial)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => {
    const [tier2, setTier2] = useState(false);
    const [tier3, setTier3] = useState(false);
    return (
      <div style={{ maxWidth: 480, display: "grid", gap: "0.75rem" }}>
        <ExpandableSection
          collapsedLabel="Add project details"
          expandedLabel="Hide project details"
          expanded={tier2}
          onExpandedChange={setTier2}
        >
          <div
            style={{
              display: "grid",
              gap: "0.5rem",
              paddingBlockStart: "0.75rem",
            }}
          >
            <label className="text-sm">Budget range</label>
            <select className="rounded border px-2 py-1 text-sm">
              <option>Select…</option>
              <option>Under €10k</option>
            </select>
            <ExpandableSection
              collapsedLabel="+ Tell us more"
              expandedLabel="− Hide"
              expanded={tier3}
              onExpandedChange={setTier3}
            >
              <textarea
                className="mt-2 w-full rounded border p-2 text-sm"
                rows={3}
                placeholder="What should we read first?"
              />
            </ExpandableSection>
          </div>
        </ExpandableSection>
      </div>
    );
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
  render: (args) => <ExpandableSectionDemo {...args} />,
};
