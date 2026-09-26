import { CaseStudySummary } from "./CaseStudySummary";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./CaseStudySummary.contract.json";

const defaultArgs = {
  outcome:
    "Fragmented component recreation became one library of 100+ production components with 1:1 Figma-to-React parity.",
  role: "Design System Lead, with a team of four.",
  constraints: [
    "Distributed team across time zones",
    "Integration into an existing enterprise design language",
    "WCAG 2.1 AA in light and dark themes",
  ],
  decisions: [
    {
      title: "A guild with a defined lifecycle",
      detail: "Bi-weekly reviews decided what entered the library and when it left.",
    },
    {
      title: "Tokens as the shared language",
      detail: "Design and code referred to the same semantic names.",
    },
  ],
  evidence: [
    {
      claim: "100+ production components",
      source: "Self-reported, from project records",
    },
    {
      claim: "The product is publicly available",
      source: "Live product",
      href: "https://example.com",
    },
  ],
};

const meta = {
  title: "Patterns/CaseStudySummary",
  component: CaseStudySummary,
  tags: ["alpha", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-case-study-summary",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
} satisfies Meta<typeof CaseStudySummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
