import { useEffect } from "react";
import { userEvent, within } from "storybook/test";
import { HomeHero } from "./HomeHero";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./HomeHero.contract.json";

const defaultArgs = {
  scrollTargetId: "services",
};

// HomeHero picks its title/subtext at random on mount (per-visit-random is a
// product decision). AT snapshots must be deterministic, so stories pin
// Math.random to always select the first option; restored on unmount.
const trueRandom = Math.random;
function PinnedRandomDecorator(Story: React.ComponentType) {
  Math.random = () => 0;
  useEffect(() => () => {
    Math.random = trueRandom;
  }, []);
  return <Story />;
}

const meta = {
  title: "Patterns/HomeHero",
  component: HomeHero,
  tags: ["stable", "autodocs"],
  decorators: [PinnedRandomDecorator],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-home-hero",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
} satisfies Meta<typeof HomeHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  tags: ["beta-matrix"],
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (homepage hero)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <HomeHero scrollTargetId="services" />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
