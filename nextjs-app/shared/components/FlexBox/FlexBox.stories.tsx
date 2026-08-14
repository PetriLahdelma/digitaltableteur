import FlexBox from "./FlexBox";
import Text from "@dt/Text";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./FlexBox.contract.json";

const defaultArgs = {
  direction: "row" as const,
  gap: "1rem",
  align: "center" as const,
  children: (
    <>
      <Text as="span">
        Alpha
      </Text>
      <Text as="span">
        Beta
      </Text>
      <Text as="span">
        Gamma
      </Text>
    </>
  ),
};

const meta = {
  title: "Layout/FlexBox",
  component: FlexBox,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1176-1698",
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
      options: ["threeLabels", "sixLabels"],
      mapping: {
        threeLabels: defaultArgs.children,
        sixLabels: (
          <>
            {["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"].map(
              (label) => (
                <Text key={label} as="span">
                  {label}
                </Text>
              ),
            )}
          </>
        ),
      },
      description: "Flex items. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof FlexBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
// Gap overrides seeded with valid lengths so the effects probe's appended
// characters produce a measurable valid->invalid style change.
export const Playground: Story = {
  tags: ["beta-matrix"],
  args: {
    children: "threeLabels" as unknown as typeof defaultArgs.children,
    rowGap: "1rem",
    columnGap: "1rem",
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <FlexBox
      direction="column"
      gap="0.75rem"
      align="stretch"
      style={{ maxWidth: 320 }}
    >
      <Text as="p">
        Stacked editorial row
      </Text>
      <Text as="p">
        Second line with deliberate rhythm
      </Text>
    </FlexBox>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};

/** The bread-and-butter use: a mixed-height inline cluster aligned on center with a token gap. */
export const InlineCluster: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "The bread-and-butter use: a mixed-height inline cluster aligned on center with a token gap." } },
  },
  render: () => (
    <FlexBox align="center" gap="var(--space-internal-8, 0.5rem)">
      <span style={{ fontSize: "1.5rem" }}>★</span>
      <span>Aligned label</span>
      <span style={{ fontSize: "0.75rem", border: "1px solid var(--color-border, #999)", borderRadius: "999px", padding: "0 0.5rem" }}>badge</span>
    </FlexBox>
  ),
};

/** justify space-between pins the ends — toolbars, card headers, footer rows. */
export const SpaceBetween: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "justify space-between pins the ends — toolbars, card headers, footer rows." } },
  },
  render: () => (
    <FlexBox justify="space-between" align="center" style={{ border: "1px dashed var(--color-border, #999)", padding: "0.5rem" }}>
      <strong>Left anchor</strong>
      <span>Right anchor</span>
    </FlexBox>
  ),
};

/** Numbers are px; strings pass through — so token gaps are strings. */
export const ColumnWithTokenGap: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Numbers are px; strings pass through — so token gaps are strings. When every gap is a token step, Stack is the sharper tool." } },
  },
  render: () => (
    <FlexBox direction="column" gap="var(--space-internal-16, 1rem)">
      {["First", "Second", "Third"].map((label) => (
        <div key={label} style={{ border: "1px dashed var(--color-border, #999)", padding: "0.5rem" }}>{label}</div>
      ))}
    </FlexBox>
  ),
};
