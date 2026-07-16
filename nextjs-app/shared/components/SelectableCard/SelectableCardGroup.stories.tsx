import type { Meta, StoryObj } from "@storybook/react-vite";
import { SelectableCard, SelectableCardGroup } from "./SelectableCard";
import contract from "./SelectableCardGroup.contract.json";

function PlanGroup({
  type = "single",
  orientation = "vertical",
  disabled = false,
  error,
}: {
  type?: "single" | "multiple";
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  error?: string;
}) {
  return (
    <SelectableCardGroup
      type={type}
      legend="Choose a plan"
      name="plan-group-story"
      defaultValue={type === "multiple" ? ["team"] : "team"}
      orientation={orientation}
      disabled={disabled}
      error={error}
      helperText={error ? undefined : "You can change this later."}
    >
      <SelectableCard value="starter">Starter</SelectableCard>
      <SelectableCard value="team">Team</SelectableCard>
      <SelectableCard value="scale">Scale</SelectableCard>
    </SelectableCardGroup>
  );
}

const meta = {
  title: "Layout/SelectableCardGroup",
  component: PlanGroup,
  tags: ["beta", "autodocs"],
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: { description: { component: contract.description } },
  },
  args: { type: "single", orientation: "vertical", disabled: false },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multiple"] },
    orientation: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
    },
  },
} satisfies Meta<typeof PlanGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};
export const Example: Story = {};
export const MultiSelect: Story = { args: { type: "multiple" } };
export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const Disabled: Story = { args: { disabled: true } };
export const WithError: Story = {
  args: { error: "Choose at least one plan." },
};
export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
};
