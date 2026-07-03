import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DesignSystemsIcon,
  UxInterfacesIcon,
  AiSolutionsIcon,
} from "../../components/icons/service-icons";
import { ServicesSection } from "./ServicesSection";
import contract from "./ServicesSection.contract.json";

const sampleServices = [
  {
    icon: <UxInterfacesIcon />,
    title: "UX & interfaces",
    description: "Research-led product UI for web and mobile.",
  },
  {
    icon: <DesignSystemsIcon />,
    title: "Design systems",
    description: "Tokens, components, and governance that scale.",
  },
  {
    icon: <AiSolutionsIcon />,
    title: "GenAI experiences",
    description: "Human-centered flows with trustworthy AI patterns.",
  },
];

const defaultArgs = {
  title: "What we do",
  description: "Strategy, systems, and shipping — end to end.",
  services: sampleServices,
  columns: 3 as const,
  cardVariant: "bordered" as const,
};

const meta = {
  title: "Patterns/ServicesSection",
  component: ServicesSection,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-services-section",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    title: { control: "text", description: "Section heading" },
    description: {
      control: "text",
      description: "Lead copy below the heading",
    },
    services: {
      control: false,
      description: "Service tiles (icon, title, description)",
    },
    columns: {
      control: "radio",
      options: [2, 3, 4],
      description: "Responsive column count",
      table: { defaultValue: { summary: "3" } },
    },
    cardVariant: {
      control: "select",
      options: ["default", "bordered", "elevated", "minimal"],
      description: "ServiceCard surface variant",
      table: { defaultValue: { summary: "default" } },
    },
    className: {
      control: "text",
      description: "Section class names",
      table: { disable: true },
    },
    id: {
      control: "text",
      description: "Section id",
      table: { defaultValue: { summary: "services" } },
    },
    donnyTarget: {
      control: "text",
      description: "Donny spotlight target id",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof ServicesSection>;

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
  name: "Example (homepage services)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  args: defaultArgs,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
