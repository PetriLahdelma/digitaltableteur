import contract from "./EnhancedProjectCard.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { EnhancedProjectCard } from "./EnhancedProjectCard";

const meta: Meta<typeof EnhancedProjectCard> = {
  title: "Molecules/EnhancedProjectCard",
  component: EnhancedProjectCard,
  tags: ["!autodocs"],
  parameters: { contractStatus: contract.status, a11y: { test: "error" } },
  argTypes: {
    aspectRatio: {
      control: "select",
      options: ["square", "video", "portrait", "landscape"],
    },

    showCategory: { control: "boolean" },

    showDescription: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof EnhancedProjectCard>;

export const Default: Story = {
  args: {
    title: "Helsinki Design System",
    slug: "helsinki-design-system",
    thumbnail: "/images/portfolio/helsinki-design-system/HDS_logo.png",
    category: "Design Systems",
    tags: ["Accessibility", "React"],
    aspectRatio: "video",
    showCategory: true,
  },
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
