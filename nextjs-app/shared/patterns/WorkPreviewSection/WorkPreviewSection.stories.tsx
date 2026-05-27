import contract from "./WorkPreviewSection.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkPreviewSection } from "./WorkPreviewSection";

const meta: Meta<typeof WorkPreviewSection> = {
  argTypes: {},
  title: "Patterns/WorkPreviewSection",
  component: WorkPreviewSection,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof WorkPreviewSection>;

const projects = [
  {
    title: "SAP Build Apps",
    slug: "sap-build-apps",
    thumbnail: "/images/portfolio/sap-build-apps/Build Product Icon_1000px.png",
    category: "Design Systems",
    tags: ["Enterprise"],
  },
  {
    title: "New Things Co",
    slug: "new-things-co",
    thumbnail: "/images/portfolio/new_things_co/new_things_co_item.webp",
    category: "Branding",
    tags: ["Identity"],
  },
];

export const Default: Story = {
  args: { title: "Work", projects, showViewAll: true },
};
export const Playground: Story = { ...Default };
export const Example: Story = {
  parameters: { controls: { disable: true } },
  args: Default.args,
};
export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: Default.args,
};
