import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavLink } from "./NavLink";
import contract from "./NavLink.contract.json";

// Alpha-tier story scaffold for NavLink. The component lives outside the
// previous catalog (per `npm run audit:catalog` on 2026-05-26) and is being
// brought in as part of the Bucket-1 catalog-gap migration documented in
// nextjs-app/shared/foundations/05-Roadmap.mdx. Stories are intentionally
// minimal at alpha — Default + Playground prove the contract surface; the
// Example + ForcedColors stories are added at the alpha -> beta promotion.

const meta = {
  title: "Atoms/NavLink",
  component: NavLink,
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
    href: { control: "text" },
    exact: { control: "boolean" },
    children: { control: "text" },
  },
  args: {
    href: "/about",
    children: "About",
    exact: false,
  },
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
