import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spacer } from "./Spacer";
import contract from "./Spacer.contract.json";

const defaultArgs = {
  size: "md" as const,
  axis: "vertical" as const,
};

const meta = {
  title: "Layout/Spacer",
  component: Spacer,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-spacer",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl", "2xl"],
      description: "Tokenized gap size",
      table: { defaultValue: { summary: "md" } },
    },
    axis: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "Block (vertical) or inline (horizontal) axis",
      table: { defaultValue: { summary: "vertical" } },
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Spacer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span className="text-sm">First block</span>
      <Spacer size="md" axis="vertical" />
      <span className="text-sm">Second block after deliberate gap</span>
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};

/** Sizes map to the space scale: xs 8 to 2xl 64px. */
export const SizeScale: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Sizes map to the space scale: xs 8 to 2xl 64px. One Spacer per boundary; need more, take the next size." } },
  },
  render: () => (
    <div>
      {(["xs", "md", "2xl"] as const).map((size) => (
        <div key={size}>
          <div style={{ border: "1px dashed var(--color-border, #999)", padding: "0.25rem" }}>block</div>
          <Spacer size={size} />
          <div style={{ border: "1px dashed var(--color-border, #999)", padding: "0.25rem" }}>after {size}</div>
        </div>
      ))}
    </div>
  ),
};

/** The horizontal axis turns the gap into width for inline rows you cannot re-parent into a gapped flex container. */
export const HorizontalAxis: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "The horizontal axis turns the gap into width for inline rows you cannot re-parent into a gapped flex container." } },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ border: "1px dashed var(--color-border, #999)", padding: "0.25rem" }}>left</span>
      <Spacer size="lg" axis="horizontal" />
      <span style={{ border: "1px dashed var(--color-border, #999)", padding: "0.25rem" }}>right</span>
    </div>
  ),
};

/** Prefer the parent's gap: the left pair uses a gapped parent (the right way); the right pair shows Spacer doing the same job where the parent cannot be changed. */
export const EscapeHatchOnly: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Prefer the parent's gap: the left pair uses a gapped parent (the right way); the right pair shows Spacer doing the same job where the parent cannot be changed." } },
  },
  render: () => (
    <div style={{ display: "flex", gap: "3rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ border: "1px dashed var(--color-border, #999)", padding: "0.25rem" }}>parent gap</div>
        <div style={{ border: "1px dashed var(--color-border, #999)", padding: "0.25rem" }}>preferred</div>
      </div>
      <div>
        <div style={{ border: "1px dashed var(--color-border, #999)", padding: "0.25rem" }}>spacer</div>
        <Spacer size="lg" />
        <div style={{ border: "1px dashed var(--color-border, #999)", padding: "0.25rem" }}>escape hatch</div>
      </div>
    </div>
  ),
};
