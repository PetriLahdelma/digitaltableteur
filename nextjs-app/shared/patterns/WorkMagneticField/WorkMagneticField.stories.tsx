import contract from "./WorkMagneticField.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkMagneticField } from "./WorkMagneticField";

const meta: Meta<typeof WorkMagneticField> = {
  title: "Patterns/WorkMagneticField",
  component: WorkMagneticField,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: { showViewAll: { control: "boolean" } },
};

export default meta;
type Story = StoryObj<typeof WorkMagneticField>;

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

export const Default: Story = {
  args: { title: "Selected work", projects: sampleProjects, showViewAll: true },
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
