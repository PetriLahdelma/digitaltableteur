import Grid from "./Grid";
import Text from "@dt/Text";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./Grid.contract.json";

const defaultArgs = {
  columns: 2,
  gap: "1rem",
  children: (
    <>
      <div>
        <Text as="p">
          Cell A
        </Text>
      </div>
      <div>
        <Text as="p">
          Cell B
        </Text>
      </div>
      <div>
        <Text as="p">
          Cell C
        </Text>
      </div>
      <div>
        <Text as="p">
          Cell D
        </Text>
      </div>
    </>
  ),
};

const meta = {
  title: "Layout/Grid",
  component: Grid,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1177-1654",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite children slot keeps a mapping preset, and columns keeps a
  // bespoke number knob (number-or-template union derives as free text).
  argTypes: {
    children: {
      control: { type: "select" },
      options: ["fourCells", "sixCells"],
      mapping: {
        fourCells: defaultArgs.children,
        sixCells: (
          <>
            {["A", "B", "C", "D", "E", "F"].map((cell) => (
              <div key={cell}>
                <Text as="p">
                  Cell {cell}
                </Text>
              </div>
            ))}
          </>
        ),
      },
      description:
        "Grid cells (supports span on child props). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "ReactNode" } },
    },
    columns: { control: "number", description: "Column count or template" },
  },
  args: defaultArgs,
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
// Free-length props are seeded with VALID values: the effects probe appends
// characters, and only a valid->invalid transition shows in the style attr.
export const Playground: Story = {
  tags: ["beta-matrix"],
  args: {
    children: "fourCells" as unknown as typeof defaultArgs.children,
    rows: "2",
    rowGap: "1rem",
    colGap: "1rem",
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Grid columns={3} gap="1.5rem" style={{ maxWidth: 720 }}>
      <div>
        <Text as="p">
          Services
        </Text>
      </div>
      <div>
        <Text as="p">
          Work
        </Text>
      </div>
      <div>
        <Text as="p">
          About
        </Text>
      </div>
    </Grid>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};

/** Numeric columns make equal tracks — the workhorse card-wall setup. */
export const EqualTracks: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Numeric columns make equal tracks — the workhorse card-wall setup. Gaps take CSS strings; prefer space tokens." } },
  },
  render: () => (
    <Grid columns={3} gap="1rem">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{ border: "1px dashed var(--color-border, #999)", padding: "1rem", textAlign: "center" }}>
          Cell {i + 1}
        </div>
      ))}
    </Grid>
  ),
};

/** Grid. */
export const SpannedFeature: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Grid.Item with span promotes one child to a feature slot without touching the column template." } },
  },
  render: () => (
    <Grid columns={3} gap="1rem">
      <Grid.Item span={2}>
        <div style={{ border: "2px solid var(--color-border, #999)", padding: "1rem", textAlign: "center" }}>
          Featured (span 2)
        </div>
      </Grid.Item>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} style={{ border: "1px dashed var(--color-border, #999)", padding: "1rem", textAlign: "center" }}>
          Cell
        </div>
      ))}
    </Grid>
  ),
};

/** Per-breakpoint columns and gaps — one column on mobile, two from tablet, three from desktop. */
export const ResponsiveColumns: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Per-breakpoint columns and gaps: tabletColumns/desktopColumns and tabletGap/desktopGap resolve at the design-token breakpoints (768px / 1024px), falling back through the previous breakpoint. Resize the viewport to see the tracks change. Numeric responsive counts render as minmax(0, 1fr) tracks so cells can shrink below content width." } },
  },
  render: () => (
    <Grid columns={1} tabletColumns={2} desktopColumns={3} gap="1.25rem" tabletGap="2rem" desktopGap="2.5rem">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{ border: "1px dashed var(--color-border, #999)", padding: "1rem", textAlign: "center" }}>
          Cell {i + 1}
        </div>
      ))}
    </Grid>
  ),
};

/** A template string when tracks genuinely differ — sidebar plus content here. */
export const CustomTemplate: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "A template string when tracks genuinely differ — sidebar plus content here. Numbers for equal tracks, strings for everything else." } },
  },
  render: () => (
    <Grid columns="200px 1fr" gap="1rem">
      <div style={{ border: "1px dashed var(--color-border, #999)", padding: "1rem" }}>Sidebar</div>
      <div style={{ border: "1px dashed var(--color-border, #999)", padding: "1rem" }}>Content</div>
    </Grid>
  ),
};
