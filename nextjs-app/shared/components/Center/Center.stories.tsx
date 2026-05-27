import type { Meta, StoryObj } from "@storybook/react-vite";
import { Center } from "./Center";
import contract from "./Center.contract.json";

// Alpha-tier story scaffold for Center. The component lives outside the
// previous catalog (per `npm run audit:catalog` on 2026-05-26) and is being
// brought in as part of the Bucket-1 catalog-gap migration documented in
// nextjs-app/shared/foundations/05-Roadmap.mdx. Stories are intentionally
// minimal at alpha — Default + Playground prove the contract surface; the
// Example + ForcedColors stories are added at the alpha -> beta promotion.

const meta = {
  title: "Atoms/Center",
  component: Center,
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
    axis: {
      control: "select",
      options: ["both", "horizontal", "vertical"],
      table: { defaultValue: { summary: "both" } },
    },
  },
  args: {
    axis: "both",
  },
} satisfies Meta<typeof Center>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
