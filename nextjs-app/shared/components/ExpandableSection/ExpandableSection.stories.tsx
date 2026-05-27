import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExpandableSection } from "./ExpandableSection";
import contract from "./ExpandableSection.contract.json";

// Alpha-tier story scaffold for ExpandableSection. The component lives outside the
// previous catalog (per `npm run audit:catalog` on 2026-05-26) and is being
// brought in as part of the Bucket-1 catalog-gap migration documented in
// nextjs-app/shared/foundations/05-Roadmap.mdx. Stories are intentionally
// minimal at alpha — Default + Playground prove the contract surface; the
// Example + ForcedColors stories are added at the alpha -> beta promotion.

const meta = {
  title: "Molecules/ExpandableSection",
  component: ExpandableSection,
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    docs: {
      description: {
        component: contract.description,
      },
    },
  },
  argTypes: {
    defaultOpen: {
      control: "select",
      options: ["true", "false"],
      table: { defaultValue: { summary: "false" } },
    },
  },
  args: {
    defaultOpen: "false",
  },
} satisfies Meta<typeof ExpandableSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
