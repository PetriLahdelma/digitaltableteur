import type { Meta, StoryObj } from "@storybook/react-vite";
import { ValueCard } from "./ValueCard";
import contract from "./ValueCard.contract.json";

// Alpha-tier story scaffold for ValueCard. The component lives outside the
// previous catalog (per `npm run audit:catalog` on 2026-05-26) and is being
// brought in as part of the Bucket-1 catalog-gap migration documented in
// nextjs-app/shared/foundations/05-Roadmap.mdx. Stories are intentionally
// minimal at alpha — Default + Playground prove the contract surface; the
// Example + ForcedColors stories are added at the alpha -> beta promotion.

const meta = {
  title: "Molecules/ValueCard",
  component: ValueCard,
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
    variant: {
      control: "select",
      options: ["default", "bordered", "elevated"],
      table: { defaultValue: { summary: "default" } },
    },
  },
  args: {
    variant: "default",
  },
} satisfies Meta<typeof ValueCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
