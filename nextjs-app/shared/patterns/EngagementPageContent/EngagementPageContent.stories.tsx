import type { Meta, StoryObj } from "@storybook/react-vite";
import { EngagementPageContent } from "./EngagementPageContent";
import contract from "./EngagementPageContent.contract.json";

const meta = {
  title: "Patterns/EngagementPageContent",
  component: EngagementPageContent,
  tags: ["alpha", "autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=2070-770",
    },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    engagementId: {
      control: { type: "select" },
      options: [
        "audit",
        "liftoff",
        "aiops",
        "partnership",
        "workshop",
        "designopsPilot",
        "agentPilot",
        "dsMcp",
        "agentWorkforce",
      ],
      description: "Which engagement page to render",
      table: { category: "Content", defaultValue: { summary: "audit" } },
    },
  },
  args: { engagementId: "audit" },
} satisfies Meta<typeof EngagementPageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ["beta-matrix"] };

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (design system audit page)",
  args: { engagementId: "audit" },
  parameters: { controls: { disable: true }, layout: "fullscreen" },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: { engagementId: "audit" },
};

export const LiftOff: Story = {
  tags: ["example"],
  args: { engagementId: "liftoff" },
  parameters: {
    docs: { description: { story: "Design System Lift-Off: four weeks, priced from the pricing page package." } },
  },
};

export const AiReadyOps: Story = {
  tags: ["example"],
  args: { engagementId: "aiops" },
  parameters: {
    docs: { description: { story: "AI-Ready Ops: three weeks of workflow, governance and guardrails." } },
  },
};

export const EmbeddedPartnership: Story = {
  tags: ["example"],
  args: { engagementId: "partnership" },
  parameters: {
    docs: {
      description: {
        story: "Embedded partnership: priced by the calculator's partnership tier; the secondary action opens it at 6 months and 4 days a week.",
      },
    },
  },
};
