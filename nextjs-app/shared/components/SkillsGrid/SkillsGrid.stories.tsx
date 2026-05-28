import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code, FigmaLogo, PenNib } from "@phosphor-icons/react";
import { SkillsGrid } from "./SkillsGrid";
import contract from "./SkillsGrid.contract.json";

const sampleSkills = [
  {
    icon: <FigmaLogo weight="duotone" className="size-8" aria-hidden />,
    name: "Figma",
    description: "Design system source of truth",
  },
  {
    icon: <Code weight="duotone" className="size-8" aria-hidden />,
    name: "React",
    description: "Component implementation",
  },
  {
    icon: <PenNib weight="duotone" className="size-8" aria-hidden />,
    name: "Sketch",
    description: "Legacy library migration",
  },
];

const defaultArgs = {
  skills: sampleSkills,
  columns: 6 as const,
  showCategories: false,
};

const meta = {
  title: "Organisms/SkillsGrid",
  component: SkillsGrid,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    skills: { control: false, description: "Skill logos with alt names" },
    showCategories: {
      control: "boolean",
      description: "Group skills under category headings",
    },
    columns: {
      control: "select",
      options: [4, 6, 8],
      description: "Grid column count",
      table: { defaultValue: { summary: "6" } },
    },
    className: {
      control: "text",
      description: "Section wrapper class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof SkillsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <SkillsGrid skills={sampleSkills} columns={6} showCategories={false} />
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
