import contract from "./ServicesSection.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DesignSystemsIcon,
  UxInterfacesIcon,
  AiSolutionsIcon,
} from "../../components/icons/service-icons";
import { ServicesSection } from "./ServicesSection";

const meta: Meta<typeof ServicesSection> = {
  title: "Patterns/ServicesSection",
  component: ServicesSection,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    columns: { control: "radio", options: [2, 3, 4] },

    cardVariant: {
      control: "select",
      options: ["default", "bordered", "elevated", "minimal"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ServicesSection>;

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

export const Default: Story = {
  args: {
    title: "What we do",
    description: "Strategy, systems, and shipping — end to end.",
    services: sampleServices,
    columns: 3,
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
