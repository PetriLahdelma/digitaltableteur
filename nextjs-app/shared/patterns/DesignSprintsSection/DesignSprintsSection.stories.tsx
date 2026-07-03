import { DesignSprintsSection } from "./DesignSprintsSection";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./DesignSprintsSection.contract.json";

const defaultArgs = {
  id: "design-sprints",
};

const meta = {
  title: "Patterns/DesignSprintsSection",
  component: DesignSprintsSection,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-design-sprints-section",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    id: {
      control: "text",
      description: "Section anchor id",
      table: { defaultValue: { summary: "design-sprints" } },
    },
    className: {
      control: "text",
      description: "Section class names",
      table: { disable: true },
    },
    donnyTarget: {
      control: "text",
      description: "Donny spotlight target id",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof DesignSprintsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  tags: ["beta-matrix"],
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (homepage design sprints)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <DesignSprintsSection id="design-sprints" />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
