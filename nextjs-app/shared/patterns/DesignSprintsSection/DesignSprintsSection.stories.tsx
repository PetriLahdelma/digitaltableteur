import { DesignSprintsSection } from "./DesignSprintsSection";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./DesignSprintsSection.contract.json";

const defaultArgs = {
  id: "design-sprints",
};

const meta = {
  title: "Patterns/DesignSprintsSection",
  component: DesignSprintsSection,
  tags: ["stable", "autodocs"],
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
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
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
