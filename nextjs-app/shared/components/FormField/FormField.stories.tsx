import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormField } from "./FormField";
import contract from "./FormField.contract.json";

// Alpha-tier story scaffold for FormField. The component lives outside the
// previous catalog (per `npm run audit:catalog` on 2026-05-26) and is being
// brought in as part of the Bucket-1 catalog-gap migration documented in
// nextjs-app/shared/foundations/05-Roadmap.mdx. Stories are intentionally
// minimal at alpha — Default + Playground prove the contract surface; the
// Example + ForcedColors stories are added at the alpha -> beta promotion.

const meta = {
  title: "Molecules/FormField",
  component: FormField,
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
    orientation: {
      control: "select",
      options: ["vertical", "horizontal"],
      table: { defaultValue: { summary: "vertical" } },
    },
  },
  args: {
    orientation: "vertical",
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
