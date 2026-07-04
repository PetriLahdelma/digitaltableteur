import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkPreviewSection } from "./WorkPreviewSection";
import contract from "./WorkPreviewSection.contract.json";

const sampleProjects = [
  {
    title: "SAP Build Apps Design System",
    slug: "sap-build-apps",
    thumbnail: "/images/portfolio/sap-build-apps/Build Product Icon_1000px.png",
    category: "Design Systems",
    tags: ["Enterprise"],
  },
  {
    title: "Helsinki Design System",
    slug: "helsinki-design-system",
    thumbnail: "/images/portfolio/helsinki-design-system/HDS_logo.png",
    category: "Design Systems",
    tags: ["Accessibility"],
  },
];

const defaultArgs = {
  title: "Selected work",
  projects: sampleProjects,
  layout: "grid" as const,
  showViewAll: true,
};

const meta = {
  title: "Patterns/WorkPreviewSection",
  component: WorkPreviewSection,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-work-preview-section",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite projects slot keeps a mapping preset.
  argTypes: {
    projects: {
      control: { type: "select" },
      options: ["two", "one"],
      mapping: {
        two: sampleProjects,
        one: sampleProjects.slice(0, 1),
      },
      description:
        "Project cards. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "ProjectItem[]" } },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof WorkPreviewSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  // projects arg is a mapping key resolved by the preset above.
  args: {
    projects: "two" as unknown as typeof sampleProjects,
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  args: defaultArgs,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
