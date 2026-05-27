import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnimatedDialog } from "./AnimatedDialog";
import contract from "./AnimatedDialog.contract.json";

// Alpha-tier story scaffold for AnimatedDialog. The component lives outside the
// previous catalog (per `npm run audit:catalog` on 2026-05-26) and is being
// brought in as part of the Bucket-1 catalog-gap migration documented in
// nextjs-app/shared/foundations/05-Roadmap.mdx. Stories are intentionally
// minimal at alpha — Default + Playground prove the contract surface; the
// Example + ForcedColors stories are added at the alpha -> beta promotion.

const meta = {
  title: "Molecules/AnimatedDialog",
  component: AnimatedDialog,
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
      options: ["sm", "md", "lg", "xl", "full"],
      table: { defaultValue: { summary: "md" } },
    },
    severity: {
      control: "select",
      options: ["default", "success", "warning", "error", "info"],
      table: { defaultValue: { summary: "default" } },
    },
    animationType: {
      control: "select",
      options: ["scale", "slide", "fade"],
      table: { defaultValue: { summary: "scale" } },
    },
  },
  args: {
    size: "md",
    severity: "default",
    animationType: "scale",
  },
} satisfies Meta<typeof AnimatedDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
