import type { Meta, StoryObj } from "@storybook/react-vite";
import { Display } from "./Display";
import contract from "./Display.contract.json";

// Alpha-tier story scaffold for Display. The component lives outside the
// previous catalog (per `npm run audit:catalog` on 2026-05-26) and is being
// brought in as part of the Bucket-1 catalog-gap migration documented in
// nextjs-app/shared/foundations/05-Roadmap.mdx. Stories are intentionally
// minimal at alpha — Default + Playground prove the contract surface; the
// Example + ForcedColors stories are added at the alpha -> beta promotion.

const meta = {
  title: "Atoms/Display",
  component: Display,
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
      options: ["xs", "sm", "md", "lg", "xl"],
      table: { defaultValue: { summary: "lg" } },
    },
    weight: {
      control: "select",
      options: ["regular", "medium", "semibold", "bold"],
      table: { defaultValue: { summary: "bold" } },
    },
  },
  args: {
    size: "lg",
    weight: "bold",
  },
} satisfies Meta<typeof Display>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
