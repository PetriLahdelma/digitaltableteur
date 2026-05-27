import type { Meta, StoryObj } from "@storybook/react-vite";
import { SkillsGrid } from "./SkillsGrid";
import contract from "./SkillsGrid.contract.json";

// Alpha-tier story scaffold for SkillsGrid. The component lives outside the
// previous catalog (per `npm run audit:catalog` on 2026-05-26) and is being
// brought in as part of the Bucket-1 catalog-gap migration documented in
// nextjs-app/shared/foundations/05-Roadmap.mdx. Stories are intentionally
// minimal at alpha — Default + Playground prove the contract surface; the
// Example + ForcedColors stories are added at the alpha -> beta promotion.

const meta = {
  title: "Organisms/SkillsGrid",
  component: SkillsGrid,
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
    columns: {
      control: "select",
      options: ["4", "6", "8"],
      table: { defaultValue: { summary: "6" } },
    },
  },
  args: {
    columns: "6",
  },
} satisfies Meta<typeof SkillsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
