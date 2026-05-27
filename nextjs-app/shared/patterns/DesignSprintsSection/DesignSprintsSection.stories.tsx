import contract from "./DesignSprintsSection.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DesignSprintsSection } from "./DesignSprintsSection";

const meta: Meta<typeof DesignSprintsSection> = {
  argTypes: {},
  title: "Patterns/DesignSprintsSection",
  component: DesignSprintsSection,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof DesignSprintsSection>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <DesignSprintsSection />,
};
export const ForcedColors: Story = { globals: { forcedColors: "active" } };
