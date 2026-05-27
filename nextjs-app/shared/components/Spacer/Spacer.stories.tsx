import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spacer } from "./Spacer";
import contract from "./Spacer.contract.json";

// Alpha-tier story scaffold for Spacer. The component lives outside the
// previous catalog (per `npm run audit:catalog` on 2026-05-26) and is being
// brought in as part of the Bucket-1 catalog-gap migration documented in
// nextjs-app/shared/foundations/05-Roadmap.mdx. Stories are intentionally
// minimal at alpha — Default + Playground prove the contract surface; the
// Example + ForcedColors stories are added at the alpha -> beta promotion.

const meta = {
  title: "Atoms/Spacer",
  component: Spacer,
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
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl", "2xl"],
      table: { defaultValue: { summary: "md" } },
    },
    axis: {
      control: "select",
      options: ["block", "inline"],
      table: { defaultValue: { summary: "block" } },
    },
  },
  args: {
    size: "md",
    axis: "block",
  },
} satisfies Meta<typeof Spacer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
