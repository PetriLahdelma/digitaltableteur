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
  tags: ["stable", "autodocs"],
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
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite services slot keeps a mapping preset.
  argTypes: {
    services: {
      control: { type: "select" },
      options: ["three", "two"],
      mapping: {
        three: sampleServices,
        two: sampleServices.slice(0, 2),
      },
      description:
        "Service tiles (icon, title, description). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "ServiceItem[]" } },
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
  // services arg is a mapping key resolved by the preset above.
  args: {
    services: "three" as unknown as typeof sampleServices,
  },
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
