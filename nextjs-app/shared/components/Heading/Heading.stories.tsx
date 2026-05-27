import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "./Heading";
import contract from "./Heading.contract.json";

// Alpha-tier story scaffold for Heading. The component lives outside the
// previous catalog (per `npm run audit:catalog` on 2026-05-26) and is being
// brought in as part of the Bucket-1 catalog-gap migration documented in
// nextjs-app/shared/foundations/05-Roadmap.mdx. Stories are intentionally
// minimal at alpha — Default + Playground prove the contract surface; the
// Example + ForcedColors stories are added at the alpha -> beta promotion.

const meta = {
  title: "Atoms/Heading",
  component: Heading,
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
    level: {
      control: "select",
      options: ["1", "2", "3", "4", "5", "6"],
      table: { defaultValue: { summary: "2" } },
    },
    size: {
      control: "select",
      options: ["display", "xl", "lg", "md", "sm", "xs"],
      table: { defaultValue: { summary: "lg" } },
    },
  },
  args: {
    level: "2",
    size: "lg",
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
