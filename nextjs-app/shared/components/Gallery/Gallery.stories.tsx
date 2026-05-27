import type { Meta, StoryObj } from "@storybook/react-vite";
import Gallery from "./Gallery";
import contract from "./Gallery.contract.json";

// Alpha-tier story scaffold for Gallery. The component lives outside the
// previous catalog (per `npm run audit:catalog` on 2026-05-26) and is being
// brought in as part of the Bucket-1 catalog-gap migration documented in
// nextjs-app/shared/foundations/05-Roadmap.mdx. Stories are intentionally
// minimal at alpha — Default + Playground prove the contract surface; the
// Example + ForcedColors stories are added at the alpha -> beta promotion.

const meta = {
  title: "Molecules/Gallery",
  component: Gallery,
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
      options: ["2", "3", "4"],
      table: { defaultValue: { summary: "3" } },
    },
  },
  args: {
    columns: "3",
  },
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
