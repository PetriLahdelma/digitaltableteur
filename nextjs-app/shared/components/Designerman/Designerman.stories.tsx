import contract from "./Designerman.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Designerman from "@dt/Designerman";

const meta: Meta<typeof Designerman> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/Designerman",
  component: Designerman,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-designerman",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Keyboard controls: ←/→ or A/D to move, Shift to run, Space/W to jump, J punch, K blast, L block. Uses the 4x3 sheet at `/public/sprite.png` (64x64 frames, 4 columns).",
      },
    },
  },
  args: {
    spriteSheet: "/sprite.png",
    frameWidth: 64,
    frameHeight: 64,
    columns: 4,
    scale: 3,
    audioSrc: "/designerman.mp3",
  },
};

export default meta;
type Story = StoryObj<typeof Designerman>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <Designerman {...args} />,
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  argTypes: {
    animations: {
      control: { type: "select" },
      options: ["default", "altIdleFrame"],
      mapping: {
        default: undefined,
        // Single static frame at a different sprite index: visibly different,
        // canvas stays stable for the effects probe.
        altIdleFrame: { idle: { frames: [1], fps: 1, loop: true } },
      },
      description:
        "Per-animation frame overrides. Pick a preset here; compose your own in code.",
      table: {
        category: "Content",
        type: { summary: "Partial<Record<AnimationName, AnimationConfig>>" },
      },
    },
  },
  args: {
    animations: "default" as never,
  },
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
