import type { Meta, StoryObj } from "@storybook/react-vite";
import { Center } from "./Center";
import contract from "./Center.contract.json";

const defaultArgs = {
  children: (
    <span className="rounded bg-muted px-4 py-2 text-sm">Centered content</span>
  ),
};

const meta = {
  title: "Layout/Center",
  component: Center,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-center",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // children keeps an authored text control (content slot).
  argTypes: {
    children: {
      control: "text",
      description: "Content to center inside the flex container",
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Center>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  // Plain-text children so the panel's text control matches what renders;
  // className seeded with a height so centering is visible.
  args: { children: "Centered content", className: "min-h-32" },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Center className="h-40 w-full max-w-md rounded border border-border bg-muted/30">
      <span className="text-sm text-muted-foreground">Empty-state slot</span>
    </Center>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};

/** The classic use: one focal element dead-center in a sized box. */
export const FocalContent: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "The classic use: one focal element dead-center in a sized box. Center only centers within the space it is given." } },
  },
  render: () => (
    <Center className="min-h-48">
      <div style={{ border: "1px dashed var(--color-border, #999)", borderRadius: "50%", width: "3rem", height: "3rem", display: "grid", placeItems: "center" }}>⟳</div>
    </Center>
  ),
};

/** Empty views compose a message inside Center so it sits in the region's optical middle. */
export const EmptyView: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Empty views compose a message inside Center so it sits in the region's optical middle." } },
  },
  render: () => (
    <Center className="min-h-48">
      <div style={{ textAlign: "center" }}>
        <strong>No results</strong>
        <p style={{ margin: 0 }}>Try a broader search.</p>
      </div>
    </Center>
  ),
};

/** Without a height Center collapses to its content — the two boxes show the difference a sized box makes. */
export const NeedsABox: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Without a height Center collapses to its content — the two boxes show the difference a sized box makes." } },
  },
  render: () => (
    <div style={{ display: "flex", gap: "1rem" }}>
      <Center className="min-h-32">
        <span style={{ border: "1px dashed var(--color-border, #999)", padding: "0.25rem" }}>sized: centered</span>
      </Center>
      <Center>
        <span style={{ border: "1px dashed var(--color-border, #999)", padding: "0.25rem" }}>auto: no-op</span>
      </Center>
    </div>
  ),
};
