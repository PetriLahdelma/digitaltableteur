import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { SelectableCard, SelectableCardGroup } from "./SelectableCard";
import contract from "./SelectableCard.contract.json";

const meta = {
  title: "Layout/SelectableCard",
  component: SelectableCard,
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: { description: { component: contract.description } },
  },
  // Custom MDX docs page exists; do not also enable autodocs.
  tags: ["beta", "!autodocs"],
  argTypes: {
    value: {
      control: "text",
      description: "Submitted value / selection key.",
      table: { category: "Content" },
    },
    title: {
      control: "text",
      description: "Card heading passed through to Card.",
      table: { category: "Content" },
    },
    description: {
      control: "text",
      description: "Supporting line passed through to Card.",
      table: { category: "Content" },
    },
    selected: {
      control: "boolean",
      description: "Standalone selected state (outside a group).",
      table: { category: "Behavior", defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Per-card disable; the choice stays visible.",
      table: { category: "Behavior", defaultValue: { summary: "false" } },
    },
  },
  args: {
    value: "starter",
    title: "Starter",
    description: "For solo work — 1 seat, community support.",
    selected: false,
    disabled: false,
  },
} satisfies Meta<typeof SelectableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A standalone card toggles as a controlled checkbox-style option. */
export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  render: (args) => {
    const [on, setOn] = useState(Boolean(args.selected));
    return (
      <div style={{ maxWidth: 360 }}>
        <SelectableCard
          {...args}
          selected={on}
          onSelectedChange={setOn}
        />
      </div>
    );
  },
  // Drives the toggle via the native input. Two clicks net to zero (on then off)
  // so the settled selection is unchanged and the captured AT snapshot is stable.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("checkbox");
    await userEvent.click(input);
    await expect(input).toBeChecked();
    await userEvent.click(input);
    await expect(input).not.toBeChecked();
  },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  render: Default.render,
};

/** Single-select set: an exclusive radio group rendered as cards. */
export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  render: () => {
    const [plan, setPlan] = useState("team");
    return (
      <div style={{ maxWidth: 420 }}>
        <SelectableCardGroup
          type="single"
          legend="Choose a plan"
          value={plan}
          onValueChange={(v) => setPlan(v as string)}
          name="plan"
        >
          <SelectableCard value="starter" title="Starter" description="1 seat, community support." />
          <SelectableCard value="team" title="Team" description="Up to 10 seats, priority support." />
          <SelectableCard value="scale" title="Scale" description="Unlimited seats, SLA." />
        </SelectableCardGroup>
      </div>
    );
  },
};

/** Multiple-select: each card toggles independently (checkbox semantics). */
export const MultiSelect: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [addons, setAddons] = useState<string[]>(["analytics"]);
    return (
      <div style={{ maxWidth: 420 }}>
        <SelectableCardGroup
          type="multiple"
          legend="Add-ons"
          value={addons}
          onValueChange={(v) => setAddons(v as string[])}
          helperText="Pick any that apply."
        >
          <SelectableCard value="analytics" title="Analytics" description="Usage dashboards." />
          <SelectableCard value="audit" title="Audit log" description="Exportable event history." />
          <SelectableCard value="sso" title="SSO" description="SAML / OIDC single sign-on." />
        </SelectableCardGroup>
      </div>
    );
  },
};

/** Horizontal orientation for a few short options. */
export const Horizontal: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [size, setSize] = useState("m");
    return (
      <SelectableCardGroup
        type="single"
        legend="T-shirt size"
        orientation="horizontal"
        value={size}
        onValueChange={(v) => setSize(v as string)}
        name="tshirt"
      >
        <SelectableCard value="s" title="S" />
        <SelectableCard value="m" title="M" />
        <SelectableCard value="l" title="L" />
      </SelectableCardGroup>
    );
  },
};

/** Group-level disabled and a per-card disabled option; choices stay visible. */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gap: "1.5rem", maxWidth: 420 }}>
      <SelectableCardGroup type="single" legend="Whole group disabled" disabled defaultValue="a">
        <SelectableCard value="a" title="Option A" description="Selected but disabled." />
        <SelectableCard value="b" title="Option B" />
      </SelectableCardGroup>
      <SelectableCardGroup type="single" legend="One option disabled" defaultValue="x" name="mixed">
        <SelectableCard value="x" title="Available" />
        <SelectableCard value="y" title="Unavailable" description="Out of stock." disabled />
      </SelectableCardGroup>
    </div>
  ),
};

/** Error state announces via role=alert and sets aria-invalid on the group. */
export const WithError: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <SelectableCardGroup type="single" legend="Choose a plan" error="Select a plan to continue." name="plan-err">
        <SelectableCard value="starter" title="Starter" description="1 seat." />
        <SelectableCard value="team" title="Team" description="Up to 10 seats." />
      </SelectableCardGroup>
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Forced-colors verification: selected ring and indicator map to system Highlight." } },
  },
  render: () => {
    const [plan, setPlan] = useState("team");
    return (
      <div style={{ maxWidth: 420 }}>
        <SelectableCardGroup type="single" legend="Choose a plan" value={plan} onValueChange={(v) => setPlan(v as string)} name="plan-fc">
          <SelectableCard value="starter" title="Starter" description="1 seat." />
          <SelectableCard value="team" title="Team" description="Up to 10 seats." />
        </SelectableCardGroup>
      </div>
    );
  },
};
