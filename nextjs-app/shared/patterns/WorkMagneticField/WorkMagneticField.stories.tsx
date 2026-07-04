import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkMagneticField } from "./WorkMagneticField";
import contract from "./WorkMagneticField.contract.json";

const sampleProjects = [
  {
    title: "SAP Build Apps Design System",
    slug: "sap-build-apps",
    thumbnail: "/images/portfolio/sap-build-apps/Build Product Icon_1000px.png",
    category: "Design Systems",
    tags: ["Enterprise", "Low-Code"],
  },
  {
    title: "Helsinki Design System",
    slug: "helsinki-design-system",
    thumbnail: "/images/portfolio/helsinki-design-system/HDS_logo.png",
    category: "Design Systems",
    tags: ["Accessibility", "React"],
  },
  {
    title: "New Things Co",
    slug: "new-things-co",
    thumbnail: "/images/portfolio/new_things_co/new_things_co_item.webp",
    category: "Branding",
    tags: ["Branding", "Web Design"],
  },
];

const defaultArgs = {
  title: "Selected work",
  projects: sampleProjects,
  showViewAll: true,
};

const meta = {
  title: "Patterns/WorkMagneticField",
  component: WorkMagneticField,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-work-magnetic-field",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    title: { control: "text", description: "Section heading" },
    projects: {
      control: false,
      description: "Portfolio cards with magnetic hover",
    },
    showViewAll: {
      control: "boolean",
      description: "Show link to full work index",
    },
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
    donnyTarget: {
      control: "text",
      description: "Donny spotlight target id",
      table: { disable: true },
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
  args: defaultArgs,
} satisfies Meta<typeof WorkMagneticField>;

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
  name: "Example (homepage work grid)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  args: defaultArgs,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
