"use client";

import React from "react";

import Badge from "../Badge/Badge";
import Icon from "../Icon/Icon";
import { useTranslate } from "../../lib/translation";
import { cn } from "../../lib/cn";
import styles from "./TaskList.module.css";

/** Where a task stands. Only started and completed tasks show a mark; "not started" is announced to screen readers only. */
export type TaskListStatus =
  "notStarted" | "inProgress" | "completed" | "cannotStart";

/** A step inside a task, listed while the task is open. */
export interface TaskListStep {
  /** Stable key, passed to onSelect. */
  id: string;
  /** Step name, for example "Goals and scope". */
  label: string;
  /** Marks the step as done with a check. @default false */
  done?: boolean;
}

/** One task: a named group of steps with a status. */
export interface TaskListTask {
  /** Stable key, passed to onSelect. */
  id: string;
  /** Verb-led or noun task name, for example "Project and investment". */
  label: string;
  /** One short line under the name, for example "Needed before our call". */
  hint?: string;
  /** Progress of the task. */
  status: TaskListStatus;
  /** Steps shown while this task is the current one. */
  steps?: TaskListStep[];
}

export interface TaskListProps {
  /** Tasks in order. */
  tasks: TaskListTask[];
  /** Accessible name of the navigation landmark, for example "Intake parts". */
  label: string;
  /** The task the person is working on; its steps are listed. */
  currentTaskId?: string;
  /** The step on screen, marked with aria-current="step". */
  currentStepId?: string;
  /**
   * Called when a task or step is chosen. Every task can be opened, so past
   * steps stay reachable (Baymard: people click step indicators to go back).
   * Tasks with status "cannotStart" are not interactive.
   */
  onSelect?: (taskId: string, stepId?: string) => void;
  /** Overrides the translated status words. */
  statusLabels?: Partial<Record<TaskListStatus, string>>;
  /** Merged onto the nav element. */
  className?: string;
}

const STATUS_KEYS: Record<TaskListStatus, [string, string]> = {
  notStarted: ["taskListStatusNotStarted", "Not started"],
  inProgress: ["taskListStatusInProgress", "In progress"],
  completed: ["taskListStatusCompleted", "Completed"],
  cannotStart: ["taskListStatusCannotStart", "Cannot start yet"],
};

/**
 * Navigation for a long form done in parts, in any order and over several
 * sessions: every part with its status, the open part with its steps. After
 * the GOV.UK task list, as a persistent rail beside the form.
 */
export function TaskList({
  tasks,
  label,
  currentTaskId,
  currentStepId,
  onSelect,
  statusLabels,
  className,
}: TaskListProps) {
  const t = useTranslate();
  const statusText = (status: TaskListStatus) =>
    statusLabels?.[status] ?? t(...STATUS_KEYS[status]);

  return (
    <nav aria-label={label} className={cn(styles.root, className)}>
      <ol className={styles.tasks}>
        {tasks.map((task, index) => {
          const isCurrent = task.id === currentTaskId;
          const statusId = `tasklist-${task.id}-status`;
          const hintId = task.hint ? `tasklist-${task.id}-hint` : undefined;
          const status = (
            <span id={statusId} className={styles.status}>
              {task.status === "completed" ? (
                <span className={styles.completed}>
                  <Icon name="check" size={16} decorative />
                  {statusText(task.status)}
                </span>
              ) : task.status === "cannotStart" ? (
                <span className={styles.muted}>{statusText(task.status)}</span>
              ) : task.status === "notStarted" ? (
                // Only started and completed tasks are marked; a column of
                // "Not started" badges is noise. Screen readers still hear it.
                <span className={styles.visuallyHidden}>
                  {statusText(task.status)}
                </span>
              ) : (
                <Badge size="sm" variant="secondary" tone="info">
                  {statusText(task.status)}
                </Badge>
              )}
            </span>
          );
          const name = (
            <span className={styles.name}>
              <span className={styles.number} aria-hidden="true">
                {index + 1}
              </span>
              <span className={styles.nameText}>
                <span className={styles.label}>{task.label}</span>
                {task.hint ? (
                  <span id={hintId} className={styles.hint}>
                    {task.hint}
                  </span>
                ) : null}
              </span>
            </span>
          );
          return (
            <li
              key={task.id}
              className={cn(styles.task, isCurrent && styles.taskCurrent)}
            >
              {task.status === "cannotStart" || !onSelect ? (
                <div className={styles.row}>
                  {name}
                  {status}
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.row}
                  aria-current={
                    isCurrent && !currentStepId ? "step" : undefined
                  }
                  aria-describedby={[hintId, statusId]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSelect(task.id)}
                >
                  {name}
                  {status}
                </button>
              )}
              {isCurrent && task.steps?.length ? (
                <ol className={styles.steps}>
                  {task.steps.map((step) => (
                    <li key={step.id}>
                      <button
                        type="button"
                        className={styles.step}
                        aria-current={
                          step.id === currentStepId ? "step" : undefined
                        }
                        onClick={() => onSelect?.(task.id, step.id)}
                      >
                        <span className={styles.stepMark} aria-hidden="true">
                          {step.done ? (
                            <Icon name="check" size={16} decorative />
                          ) : null}
                        </span>
                        <span>{step.label}</span>
                        {step.done ? (
                          <span className={styles.visuallyHidden}>
                            {t("taskListStepDone", "done")}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ol>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

TaskList.displayName = "TaskList";

export default TaskList;
