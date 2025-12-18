import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Designerman from "@dt/Designerman";

const meta: Meta<typeof Designerman> = {
  title: "Playground/Designerman",
  component: Designerman,
  tags: ["autodocs"],
  parameters: {
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
  render: (args) => <Designerman {...args} />,
};
