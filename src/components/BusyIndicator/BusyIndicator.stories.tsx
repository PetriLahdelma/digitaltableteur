import React, { useEffect, useState } from "react";
import BusyIndicator from "./BusyIndicator";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof BusyIndicator> = {
  title: "Feedback/BusyIndicator",
  component: BusyIndicator,
  parameters: { wip: { disabled: false } },
};
export default meta;

type Story = StoryObj<typeof BusyIndicator>;

export const Indeterminate: Story = {
  args: { size: "m" },
};

export const SmallInline: Story = { args: { size: "s" } };
export const Large: Story = { args: { size: "l" } };
export const Overlay: Story = { args: { size: "m", variant: "overlay" } };

const DeterminateDemo: React.FC = () => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setP((v) => (v >= 1 ? 1 : v + 0.1)), 300);
    return () => clearInterval(id);
  }, []);
  return (
    <BusyIndicator
      progress={p}
      label={`Loading ${Math.round(p * 100)}%`}
      size="m"
    />
  );
};

export const Determinate: Story = { render: () => <DeterminateDemo /> };

export const Completed: Story = {
  args: { progress: 1, size: "m" },
};
