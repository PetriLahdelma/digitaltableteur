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
  title: "Site/SkillsGrid",
  component: SkillsGrid,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-skills-grid",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
} satisfies Meta<typeof SkillsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  argTypes: {
    skills: {
      control: { type: "select" },
      options: ["sample", "few"],
      mapping: {
        sample: sampleSkills,
        few: sampleSkills.slice(0, 2),
      },
      description:
        "Skills (name, category). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "Skill[]" } },
    },
  },
  args: {
    skills: "sample" as never,
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <SkillsGrid skills={sampleSkills} columns={6} showCategories={false} />
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
