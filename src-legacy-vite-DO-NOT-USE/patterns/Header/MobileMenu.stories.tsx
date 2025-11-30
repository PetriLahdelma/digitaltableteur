import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import MobileMenu from "./MobileMenu";
import Button from "@dt/Button";

const meta: Meta<typeof MobileMenu> = {
  title: "Patterns/Header/MobileMenu",
  component: MobileMenu,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Mobile-first navigation sheet that mirrors the desktop header controls (language, theme, and primary routes).",
      },
    },
  },
  args: {
    isOpen: false,
    onClose: () => {},
    onNavigate: () => {},
  },
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Controls menu visibility",
    },
    onClose: {
      action: "close",
      description: "Callback when menu is closed",
    },
    onNavigate: {
      action: "navigate",
      description: "Callback when navigation item is clicked",
    },
  },
};

export default meta;

type Story = StoryObj<typeof MobileMenu>;

/**
 * Interactive demo with a button to open the menu
 */
export const Playground: Story = {
  render: () => {
    const DemoScaffold = () => {
      const [isOpen, setOpen] = useState(false);

      return (
        <div
          style={{
            minHeight: "100vh",
            background:
              "linear-gradient(135deg, rgb(98 0 255 / 10%), rgb(0 200 255 / 20%))",
            padding: "2rem",
          }}
        >
          <Button type="button" onClick={() => setOpen(true)}>
            Open mobile menu
          </Button>
          <MobileMenu
            isOpen={isOpen}
            onClose={() => setOpen(false)}
            onNavigate={() => setOpen(false)}
          />
        </div>
      );
    };

    return <DemoScaffold />;
  },
};

/**
 * Menu shown in static open state for visual testing
 */
export const StaticOpen: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The menu displayed in its open state. Click the close button or backdrop to close.",
      },
    },
  },
};
