import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import TaskList, { type TaskListTask } from "@dt/TaskList";
import contract from "./TaskList.contract.json";

/* The production use: the client intake's parts, part B open on its first section. */
const intakeTasks: TaskListTask[] = [
  {
    id: "a",
    label: "Client intake",
    hint: "Needed before our call",
    status: "completed",
  },
  {
    id: "b",
    label: "Project and investment",
    status: "inProgress",
    steps: [
      { id: "b1", label: "Goals and scope", done: true },
      { id: "b2", label: "Investment" },
    ],
  },
  { id: "c", label: "Business and audience", status: "notStarted" },
  { id: "d", label: "Positioning and today", status: "notStarted" },
  { id: "e", label: "Check and submit", status: "cannotStart", unnumbered: true },
];

const meta = {
  title: "Navigation/TaskList",
  component: TaskList,
  tags: ["alpha", "!autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: {
    label: "Intake parts",
    tasks: intakeTasks,
    currentTaskId: "b",
    currentStepId: "b2",
  },
} satisfies Meta<typeof TaskList>;

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

function Interactive() {
  const [current, setCurrent] = useState({
    task: "b",
    step: "b2" as string | undefined,
  });
  return (
    <TaskList
      label="Intake parts"
      tasks={intakeTasks}
      currentTaskId={current.task}
      currentStepId={current.step}
      onSelect={(task, step) => setCurrent({ task, step })}
    />
  );
}

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Choosing a part opens it; the part's steps list under it and the one on screen is marked.",
      },
    },
  },
  render: () => <Interactive />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /Goals and scope/ }),
    );
    await expect(
      canvas.getByRole("button", { name: /Goals and scope/ }),
    ).toHaveAttribute("aria-current", "step");
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  parameters: {
    docs: { description: { story: "Forced-colors verification story." } },
  },
};
