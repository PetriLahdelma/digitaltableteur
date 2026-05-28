import { DesignSprintsSection } from "./DesignSprintsSection";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./DesignSprintsSection.contract.json";

const defaultArgs = {
  id: "design-sprints",
};

const meta = {
  title: "Patterns/DesignSprintsSection",
  component: DesignSprintsSection,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    id: { control: "text", description: "Section anchor id", table: { defaultValue: { summary: "design-sprints" } } },
    className: { control: "text", description: "Section class names", table: { disable: true } },
  },
  args: defaultArgs,
} satisfies Meta<typeof DesignSprintsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { };
export const Playground: Story = { };


export const Example: Story = {
  name: "Example (homepage design sprints)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <DesignSprintsSection id="design-sprints" />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
