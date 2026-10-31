import React from "react";
import type { Meta, StoryObj, StoryFn } from "@storybook/react-vite";
import ChatHeader from "./ChatHeader";
import Icon from "@dt/Icon";

const noop = () => {};

const meta: Meta<typeof ChatHeader> = {
  title: "Site/Chat/ChatHeader",
  component: ChatHeader,
  tags: ["autodocs"],
  args: {
    title: "Chat with Donny",
    onMinimize: noop,
    onNewChat: noop,
  },
  argTypes: {
    onMinimize: { table: { disable: true } },
    onNewChat: { table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<typeof ChatHeader>;

// Thursday 15 Jan 2026, 10:00 UTC = 12:00 Europe/Helsinki: inside the
// weekday 09:00-16:59 availability window the header computes. Without a fixed
// instant the status flips to "Away" outside office hours and the accessibility
// snapshot fails depending on what time of day the suite runs. Passing
// currentDate also disables the component's 60s re-tick timer.
export const Default: Story = {
  tags: ["beta-matrix"],
  args: { currentDate: new Date("2026-01-15T10:00:00Z") },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=473-25",
    },
  },
};

