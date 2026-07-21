import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";

type SpacerArgs = {
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  axis: "vertical" | "horizontal";
};

const visualizeCss = `
  .dt-spacer-viz {
    display: flex;
    padding: 1rem;
    justify-content: center;
    align-items: stretch;
    border: 1px dashed var(--color-border);
    border-radius: 8px;
  }
  .dt-spacer-viz[data-axis="vertical"] {
    inline-size: 16rem;
    flex-direction: column;
  }
  .dt-spacer-viz[data-axis="horizontal"] {
    block-size: 5rem;
    flex-direction: row;
  }
  .dt-spacer-viz > dt-spacer {
    outline: 1px dashed color-mix(in srgb, var(--color-info) 55%, transparent);
    outline-offset: -1px;
    background-color: color-mix(in srgb, var(--color-info) 16%, transparent);
  }
`;

function VisualizedSpacer({ size, axis }: SpacerArgs) {
  return (
    <>
      <style>{visualizeCss}</style>
      <div className="dt-spacer-viz" data-axis={axis}>
        <NativeElement tagName="dt-spacer" attributes={{ size, axis }} />
      </div>
    </>
  );
}

const meta = {
  title: "Web Components/Layout/Spacer",
  component: VisualizedSpacer,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-spacer gap primitive." } },
  },
  args: { size: "md", axis: "vertical" },
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl", "2xl"] },
    axis: { control: "inline-radio", options: ["vertical", "horizontal"] },
  },
} satisfies Meta<typeof VisualizedSpacer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <VisualizedSpacer {...args} />,
  play: assertNative("dt-spacer"),
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <VisualizedSpacer {...args} />,
};

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: "0.875rem" }}>First block</span>
      <NativeElement
        tagName="dt-spacer"
        attributes={{ size: "md", axis: "vertical" }}
      />
      <span style={{ fontSize: "0.875rem" }}>
        Second block after deliberate gap
      </span>
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix", "example"],
  globals: { forcedColors: "active" },
  render: (args) => <VisualizedSpacer {...args} />,
};

export const SizeScale: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      {(["xs", "md", "2xl"] as const).map((size) => (
        <div key={size}>
          <div
            style={{
              border: "1px dashed var(--color-border, #999)",
              padding: "0.25rem",
            }}
          >
            block
          </div>
          <NativeElement tagName="dt-spacer" attributes={{ size }} />
          <div
            style={{
              border: "1px dashed var(--color-border, #999)",
              padding: "0.25rem",
            }}
          >
            after {size}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const HorizontalAxis: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span
        style={{
          border: "1px dashed var(--color-border, #999)",
          padding: "0.25rem",
        }}
      >
        left
      </span>
      <NativeElement
        tagName="dt-spacer"
        attributes={{ size: "lg", axis: "horizontal" }}
      />
      <span
        style={{
          border: "1px dashed var(--color-border, #999)",
          padding: "0.25rem",
        }}
      >
        right
      </span>
    </div>
  ),
};

export const EscapeHatchOnly: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div
          style={{
            border: "1px dashed var(--color-border, #999)",
            padding: "0.25rem",
          }}
        >
          parent gap
        </div>
        <div
          style={{
            border: "1px dashed var(--color-border, #999)",
            padding: "0.25rem",
          }}
        >
          preferred
        </div>
      </div>
      <div>
        <div
          style={{
            border: "1px dashed var(--color-border, #999)",
            padding: "0.25rem",
          }}
        >
          spacer
        </div>
        <NativeElement tagName="dt-spacer" attributes={{ size: "lg" }} />
        <div
          style={{
            border: "1px dashed var(--color-border, #999)",
            padding: "0.25rem",
          }}
        >
          escape hatch
        </div>
      </div>
    </div>
  ),
};
