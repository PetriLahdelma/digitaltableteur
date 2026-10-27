import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";

import TaskList, { type TaskListTask } from "@dt/TaskList";

expect.extend(toHaveNoViolations);

const tasks: TaskListTask[] = [
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
  { id: "c", label: "Check and submit", status: "cannotStart" },
];

describe("TaskList", () => {
  it("marks only started and completed tasks; not started is for screen readers", () => {
    render(
      <TaskList
        label="Parts"
        tasks={[{ id: "n", label: "Business and audience", status: "notStarted" }]}
        onSelect={vi.fn()}
      />,
    );
    const button = screen.getByRole("button", { name: /Business and audience/ });
    expect(button).toHaveAccessibleDescription("Not started");
    expect(screen.getByText("Not started").className).toMatch(/visuallyHidden/);
  });

  it("is a named navigation landmark with every task in order", () => {
    render(<TaskList label="Intake parts" tasks={tasks} onSelect={vi.fn()} />);
    const nav = screen.getByRole("navigation", { name: "Intake parts" });
    expect(nav.querySelectorAll(":scope > ol > li")).toHaveLength(3);
  });

  it("lists the steps of the current task only, marking the one on screen", () => {
    const { rerender } = render(
      <TaskList
        label="Parts"
        tasks={tasks}
        onSelect={vi.fn()}
        currentTaskId="a"
      />,
    );
    expect(
      screen.queryByRole("button", { name: /Investment/ }),
    ).not.toBeInTheDocument();
    rerender(
      <TaskList
        label="Parts"
        tasks={tasks}
        onSelect={vi.fn()}
        currentTaskId="b"
        currentStepId="b2"
      />,
    );
    expect(screen.getByRole("button", { name: /^Investment/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(
      screen.getByRole("button", { name: /Goals and scope/ }),
    ).toHaveTextContent("done");
  });

  it("reports the chosen task and step, and keeps a blocked task inert", () => {
    const onSelect = vi.fn();
    render(
      <TaskList
        label="Parts"
        tasks={tasks}
        onSelect={onSelect}
        currentTaskId="b"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Client intake/ }));
    fireEvent.click(screen.getByRole("button", { name: /Goals and scope/ }));
    expect(onSelect.mock.calls).toEqual([["a"], ["b", "b1"]]);
    expect(
      screen.queryByRole("button", { name: /Check and submit/ }),
    ).not.toBeInTheDocument();
  });

  it("describes each task with its hint and status", () => {
    render(<TaskList label="Parts" tasks={tasks} onSelect={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /Client intake/ }),
    ).toHaveAccessibleDescription(/Needed before our call.*Completed/);
  });

  it("takes translated status words", () => {
    render(
      <TaskList
        label="Osat"
        tasks={tasks}
        statusLabels={{ inProgress: "Kesken" }}
      />,
    );
    expect(screen.getByText("Kesken")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <TaskList
        label="Parts"
        tasks={tasks}
        onSelect={vi.fn()}
        currentTaskId="b"
        currentStepId="b1"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
