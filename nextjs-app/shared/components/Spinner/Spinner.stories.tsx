import type { Meta, StoryObj } from "@storybook/react-vite";
import Spinner from "./Spinner";
import contract from "./Spinner.contract.json";

const meta = {
  title: "Feedback/Spinner",
  component: Spinner,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=368-16",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: { label: "Loading content", size: "md" },
} satisfies Meta<typeof Spinner>;

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
export const Sizes: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "sm sits inside inputs and buttons, md stands alone, lg reads at region level.",
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--space-layout-16)",
        alignItems: "center",
      }}
    >
      <Spinner size="sm" label="Loading small" />
      <Spinner size="md" label="Loading medium" />
      <Spinner size="lg" label="Loading large" />
    </div>
  ),
};
export const Example: Story = {
  tags: ["beta-matrix", "example"],
  globals: { forcedColors: "none" },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The bare default: role=status with the fallback \"Loading\" label. Name the actual wait in real usage.",
      },
    },
  },
  render: () => <Spinner />,
};

/** Spinner + visible label lockup; the visible copy is aria-hidden so the announcement stays single. */
export const WithVisibleLabel: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "For waits sighted users watch, compose a visible Text label; keep it aria-hidden and let the Spinner label carry the announcement (this is the AppLoading pattern).",
      },
    },
  },
  render: () => (
    <span
      style={{
        display: "inline-flex",
        gap: "var(--space-internal-16, 1rem)",
        alignItems: "center",
      }}
    >
      <Spinner size="lg" label="Loading application" />
      <span aria-hidden="true">Loading</span>
    </span>
  ),
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
