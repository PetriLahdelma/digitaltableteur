import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "./AspectRatio";
import contract from "./AspectRatio.contract.json";

// Alpha-tier story scaffold for AspectRatio. The component lives outside the
// previous catalog (per `npm run audit:catalog` on 2026-05-26) and is being
// brought in as part of the Bucket-1 catalog-gap migration documented in
// nextjs-app/shared/foundations/05-Roadmap.mdx. Stories are intentionally
// minimal at alpha — Default + Playground prove the contract surface; the
// Example + ForcedColors stories are added at the alpha -> beta promotion.

const meta = {
  title: "Atoms/AspectRatio",
  component: AspectRatio,
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
    ratio: {
      control: "select",
      options: ["1:1", "4:3", "16:9", "21:9", "3:2", "2:3"],
      table: { defaultValue: { summary: "16:9" } },
    },
  },
  args: {
    ratio: "16:9",
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
