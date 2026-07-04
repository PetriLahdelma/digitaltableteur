import contract from "./MacWindowFrame.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import MacWindowFrame from "@dt/MacWindowFrame";

const meta: Meta<typeof MacWindowFrame> = {
  argTypes: {
    density: {
      control: { type: "select" },
      options: ["compact", "comfortable"],
      description: "Chrome density inside the window frame",
      table: { defaultValue: { summary: "compact" } },
    },
      actionLabelKey: { control: "text", description: "Optional label for the action button", table: { category: "Accessibility" } },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      className: { control: "text", description: "Optional className passthrough", table: { category: "Advanced" } },
      id: { table: { disable: true } },
      onAction: { action: "onAction", table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } },
      titleKey: { control: "text", description: "Translation key for the window title", table: { category: "Content" } }
},
  title: "Layout/MacWindowFrame",
  component: MacWindowFrame,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-mac-window-frame",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  tags: ["beta", "autodocs"],
};

export default meta;
type Story = StoryObj<typeof MacWindowFrame>;

const sampleContent = `You are a poet that creates short poems.

User: Write a poem about autumn.
AI: The leaves fall gently to the ground, painting the earth in hues profound.
The crisp air whispers through the trees, a symphony of nature's ease.`;

export const Default: Story = {
  tags: ["beta-matrix"],
  args: { children: sampleContent },
};

/** Decorative chrome around demo content — the traffic lights are paint, not controls. */
export const ShowcaseFrame: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Decorative chrome around demo content — the traffic lights are paint, not controls. Anything needing real window semantics (focus, dismissal) belongs in Modal.",
      },
    },
  },
  args: { children: sampleContent },
};

/** The action button renders only when onAction exists — wire it to something real or omit it. */
export const WithAction: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "actionLabelKey + onAction add one real action to the title bar (Replay here). Without onAction the button hides itself.",
      },
    },
  },
  args: {
    children: sampleContent,
    onAction: () => undefined,
    actionLabelKey: "macWindowFrame.action",
  },
};

/** Compact density tightens the chrome for dense grids of demos. */
export const Compact: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "density compact tightens the chrome for dense grids of demo windows.",
      },
    },
  },
  args: { density: "compact", children: sampleContent },
};

export const Playground = Default;
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
