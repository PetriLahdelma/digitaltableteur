import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import MobileMenu from "./MobileMenu";
import Button from "@dt/Button";

const meta: Meta<typeof MobileMenu> = {
  title: "Deprecated/Header/MobileMenu",
  component: MobileMenu,
  tags: ["deprecated", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-header",
    },
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Mobile-first navigation sheet that mirrors the desktop header controls (language, theme, and primary routes).",
      },
    },
  },
  args: { isOpen: true },
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

export const Playground: Story = {
  render: () => <DemoScaffold />,
};

export const StaticOpen: Story = { args: { isOpen: true } };
