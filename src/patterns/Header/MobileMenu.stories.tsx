import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import MobileMenu from "./MobileMenu";

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
    isOpen: true,
  },
  argTypes: {
    onClose: { action: "close" },
    onNavigate: { action: "navigate" },
  },
};

export default meta;

type Story = StoryObj<typeof MobileMenu>;

const DemoScaffold: React.FC = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(98, 0, 255, 0.1), rgba(0, 200, 255, 0.2))",
        padding: "2rem",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: "0.75rem 1.25rem",
          borderRadius: "0.75rem",
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Open mobile menu
      </button>
      <MobileMenu
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        onNavigate={() => setOpen(false)}
      />
    </div>
  );
};

export const Playground: Story = {
  render: () => <DemoScaffold />,
};

export const StaticOpen: Story = {
  args: {
    isOpen: true,
  },
};
