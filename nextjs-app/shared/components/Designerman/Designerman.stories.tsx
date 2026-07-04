import contract from "./Designerman.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Designerman from "@dt/Designerman";

const meta: Meta<typeof Designerman> = {
  argTypes: {
      animations: { control: "object", description: "Optional custom animations", table: { category: "Content" } },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      audioSrc: { control: "text", description: "Optional looping audio track", table: { category: "Content" } },
      children: { table: { disable: true } },
      className: { table: { disable: true } },
      columns: { control: "number", description: "Number of columns in the sheet", table: { category: "Content" } },
      frameHeight: { control: "number", description: "Frame height in px", table: { category: "Content" } },
      frameWidth: { control: "number", description: "Frame width in px", table: { category: "Content" } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      scale: { control: "number", description: "Scale multiplier for the sprite", table: { category: "Content" } },
      spriteSheet: { control: "text", description: "Sprite sheet path (e.g. /sprites/designerman.png)", table: { category: "Content" } },
      style: { table: { disable: true } }
},
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
