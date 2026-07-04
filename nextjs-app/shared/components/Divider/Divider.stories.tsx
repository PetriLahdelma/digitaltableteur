import type { Meta, StoryObj } from "@storybook/react-vite";
import Divider from "./Divider";
import contract from "./Divider.contract.json";

const meta = {
  title: "Layout/Divider",
  component: Divider,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=368-6",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: { orientation: "horizontal", decorative: true },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  ...Playground,
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{ inlineSize: "min(24rem, 100%)", fontFamily: "var(--font-text)" }}
    >
      <p>Section one</p>
      <Divider />
      <p>Section two</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--space-layout-16)",
        alignItems: "stretch",
        minBlockSize: "6rem",
      }}
    >
      <span>Left</span>
      <Divider orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};

/** The default: a decorative rule (role none) that supports visual grouping without announcing anything to AT. */
export const DecorativeRhythm: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "The default: a decorative rule (role none) that supports visual grouping without announcing anything to AT." } },
  },
  render: () => (
    <div style={{ maxWidth: "24rem" }}>
      <p style={{ margin: "0 0 0.75rem" }}>Intro block of content.</p>
      <Divider />
      <p style={{ margin: "0.75rem 0 0" }}>The next thought, visually set apart.</p>
    </div>
  ),
};

/** Setting decorative false announces role separator with aria-orientation — for splits that carry structure, like menu groups. */
export const MeaningfulSeparator: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Setting decorative false announces role separator with aria-orientation — for splits that carry structure, like menu groups." } },
  },
  render: () => (
    <div role="menu" aria-label="Actions" style={{ maxWidth: "12rem", border: "1px dashed var(--color-border, #999)", padding: "0.5rem" }}>
      <div role="menuitem">Rename</div>
      <div role="menuitem">Duplicate</div>
      <Divider decorative={false} />
      <div role="menuitem">Delete</div>
    </div>
  ),
};

/** Vertical dividers take their height from the flex row — give the row an explicit alignment or height. */
export const VerticalInRow: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Vertical dividers take their height from the flex row — give the row an explicit alignment or height." } },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "stretch", gap: "0.75rem", height: "2rem" }}>
      <span style={{ alignSelf: "center" }}>Docs</span>
      <Divider orientation="vertical" />
      <span style={{ alignSelf: "center" }}>API</span>
      <Divider orientation="vertical" />
      <span style={{ alignSelf: "center" }}>Support</span>
    </div>
  ),
};
