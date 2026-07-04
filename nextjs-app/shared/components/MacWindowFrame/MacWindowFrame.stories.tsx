import contract from "./MacWindowFrame.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import MacWindowFrame from "@dt/MacWindowFrame";

const meta: Meta<typeof MacWindowFrame> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // children keeps an authored text control (content slot).
  argTypes: {
    children: { control: "text", description: "Content to render inside the frame" },
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

// onAction is seeded so the action button exists and actionLabelKey can
// drive it from the panel (the button hides itself without a callback).
export const Playground: Story = {
  tags: ["beta-matrix"],
  args: { children: sampleContent, onAction: fn() },
};
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
