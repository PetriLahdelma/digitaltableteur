import { Stack } from "./Stack";
import Text from "@dt/Text";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./Stack.contract.json";

const defaultArgs = {
  direction: "vertical" as const,
  gap: "md" as const,
  children: (
    <>
      <Text as="p">
        First item
      </Text>
      <Text as="p">
        Second item
      </Text>
    </>
  ),
};

const meta = {
  title: "Layout/Stack",
  component: Stack,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-stack",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite children slot keeps a mapping preset.
  argTypes: {
    children: {
      control: { type: "select" },
      options: ["twoItems", "fourItems"],
      mapping: {
        twoItems: defaultArgs.children,
        fourItems: (
          <>
            {["First item", "Second item", "Third item", "Fourth item"].map(
              (label) => (
                <Text key={label} as="p">
                  {label}
                </Text>
              ),
            )}
          </>
        ),
      },
      description:
        "Stacked children. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "ReactNode" } },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  args: {
    children: "twoItems" as unknown as typeof defaultArgs.children,
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Stack direction="vertical" gap="sm">
      <Text as="p">
        Hero copy block
      </Text>
      <Text as="p">
        Supporting line with consistent spacing
      </Text>
    </Stack>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};

/** The token gap scale: none, xs 4, sm 8, md 16 (default), lg 24, xl 32px. */
export const GapScale: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "The token gap scale: none, xs 4, sm 8, md 16 (default), lg 24, xl 32px. Pick a step, never a custom margin." } },
  },
  render: () => (
    <div style={{ display: "flex", gap: "2rem" }}>
      {(["xs", "md", "xl"] as const).map((gap) => (
        <Stack key={gap} gap={gap}>
          <div style={{ border: "1px dashed var(--color-border, #999)", padding: "0.25rem 0.75rem" }}>gap</div>
          <div style={{ border: "1px dashed var(--color-border, #999)", padding: "0.25rem 0.75rem" }}>{gap}</div>
          <div style={{ border: "1px dashed var(--color-border, #999)", padding: "0.25rem 0.75rem" }}>steps</div>
        </Stack>
      ))}
    </div>
  ),
};

/** Horizontal direction with center alignment is the inline cluster: actions, metadata, icon rows. */
export const HorizontalCluster: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Horizontal direction with center alignment is the inline cluster: actions, metadata, icon rows." } },
  },
  render: () => (
    <Stack direction="horizontal" gap="sm" align="center">
      <button type="button">Save</button>
      <button type="button">Cancel</button>
      <span style={{ fontSize: "0.85em" }}>Last saved 2 min ago</span>
    </Stack>
  ),
};

/** Rendering as ul keeps the markup a real list while Stack owns the rhythm — list semantics without list styling. */
export const SemanticList: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Rendering as ul keeps the markup a real list while Stack owns the rhythm — list semantics without list styling." } },
  },
  render: () => (
    <Stack as="ul" gap="sm" className="list-none p-0 m-0">
      {["Design tokens", "Components", "Patterns"].map((item) => (
        <li key={item} style={{ border: "1px dashed var(--color-border, #999)", padding: "0.5rem" }}>{item}</li>
      ))}
    </Stack>
  ),
};
