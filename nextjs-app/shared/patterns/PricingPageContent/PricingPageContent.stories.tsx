import type { Meta, StoryObj } from "@storybook/react-vite";
import { PricingPageContent } from "./PricingPageContent";
import contract from "./PricingPageContent.contract.json";

const meta = {
  title: "Patterns/PricingPageContent",
  component: PricingPageContent,
  tags: ["beta", "autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-pricing-page-content",
    },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
} satisfies Meta<typeof PricingPageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};

export const Playground: Story = {
  tags: ["beta-matrix"],
};

export const Example: Story = {
  tags: ["beta-matrix"],
  name: "Example (pricing page)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <PricingPageContent />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: () => <PricingPageContent />,
};
