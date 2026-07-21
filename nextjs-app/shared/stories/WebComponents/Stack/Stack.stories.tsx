import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  TriggerButton,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  direction: "vertical" | "horizontal";
  gap: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align: "stretch" | "start" | "center" | "end";
  justify: "start" | "center" | "end" | "between" | "around";
  wrap: boolean;
};

function Items() {
  return (
    <>
      <NativeElement
        tagName="dt-text"
        attributes={{ as: "p", content: "First item" }}
      />
      <NativeElement
        tagName="dt-text"
        attributes={{ as: "p", content: "Second item" }}
      />
    </>
  );
}

function DiagnosticItems() {
  return (
    <>
      <span
        style={{ border: "1px dashed var(--color-border)", padding: "0.5rem" }}
      >
        First item
      </span>
      <span
        style={{ border: "1px dashed var(--color-border)", padding: "0.5rem" }}
      >
        Second item
      </span>
    </>
  );
}

function NativeStack(args: Args) {
  return (
    <NativeElement tagName="dt-stack" attributes={args}>
      <Items />
    </NativeElement>
  );
}

const meta = {
  title: "Web Components/Layout/Stack",
  component: NativeStack,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-stack flex primitive." } },
  },
  args: {
    direction: "vertical",
    gap: "md",
    align: "stretch",
    justify: "start",
    wrap: false,
  },
  argTypes: {
    direction: { control: "inline-radio", options: ["vertical", "horizontal"] },
    gap: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl"] },
    align: {
      control: "select",
      options: ["stretch", "start", "center", "end"],
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around"],
    },
  },
} satisfies Meta<typeof NativeStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-stack") };
export const Playground: Story = { tags: ["beta-matrix"] };
export const GapScale: Story = {
  ...exampleStory,
  render: () => (
    <div style={{ display: "flex", gap: "2rem" }}>
      {(["xs", "md", "xl"] as const).map((gap) => (
        <NativeElement key={gap} tagName="dt-stack" attributes={{ gap }}>
          <DiagnosticItems />
        </NativeElement>
      ))}
    </div>
  ),
};
export const HorizontalCluster: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-stack"
      attributes={{ direction: "horizontal", gap: "sm", align: "center" }}
    >
      <TriggerButton>Save</TriggerButton>
      <TriggerButton>Cancel</TriggerButton>
      <span>Last saved 2 min ago</span>
    </NativeElement>
  ),
};
export const SemanticList: Story = {
  ...exampleStory,
  render: () => (
    <>
      <style>
        {
          ".semantic-list::part(stack) { list-style: none; padding: 0; margin: 0; } .semantic-list > li { border: 1px dashed var(--color-border, #999); padding: 0.5rem; }"
        }
      </style>
      <NativeElement
        tagName="dt-stack"
        attributes={{ as: "ul", gap: "sm", class: "semantic-list" }}
      >
        <li>Design tokens</li>
        <li>Components</li>
        <li>Patterns</li>
      </NativeElement>
    </>
  ),
};
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  args: { direction: "vertical", gap: "sm" },
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
