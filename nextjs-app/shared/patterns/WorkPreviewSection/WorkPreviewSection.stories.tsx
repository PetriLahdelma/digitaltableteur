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
  argTypes: {
    title: { control: "text", description: "Section heading" },
    projects: { control: false, description: "Project cards" },
    layout: {
      control: "select",
      options: ["grid", "asymmetric", "featured"],
      description: "Grid composition",
      table: { defaultValue: { summary: "grid" } },
    },
    showViewAll: { control: "boolean", description: "Link to full work index" },
    className: {
      control: "text",
      description: "Section class names",
      table: { disable: true },
    },
    id: {
      control: "text",
      description: "Section id",
      table: { defaultValue: { summary: "work" } },
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
