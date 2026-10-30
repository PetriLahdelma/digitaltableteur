import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProcurementFaq } from "./ProcurementFaq";
import contract from "./ProcurementFaq.contract.json";

const meta = {
  title: "Patterns/ProcurementFaq",
  component: ProcurementFaq,
  tags: ["alpha", "autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1910-223",
    },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    headingLevel: {
      control: { type: "inline-radio" },
      options: [2, 3],
      description: "Heading level of the section title",
      table: { category: "Accessibility", defaultValue: { summary: "2" } },
    },
    id: {
      control: { type: "text" },
      description: "Section id, for in-page links",
      table: { category: "Advanced", defaultValue: { summary: "procurement-faq" } },
    },
    className: { table: { disable: true } },
  },
  args: { headingLevel: 2, id: "procurement-faq" },
} satisfies Meta<typeof ProcurementFaq>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ["beta-matrix"] };
