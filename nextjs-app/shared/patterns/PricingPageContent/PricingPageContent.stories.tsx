import type { Meta, StoryObj } from "@storybook/react-vite";

import { PricingPageContent } from "./PricingPageContent";

const meta = {
  title: "Patterns/PricingPageContent",
  component: PricingPageContent,
  tags: ["wip"],
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
  },
} satisfies Meta<typeof PricingPageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
