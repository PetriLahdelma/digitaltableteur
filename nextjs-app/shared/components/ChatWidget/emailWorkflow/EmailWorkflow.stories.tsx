import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ChatWidget from "../ChatWidget";
import { emailWorkflowReducer, initialEmailWorkflowState } from "./reducer";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  EmailWorkflowAction,
  EmailWorkflowState,
  createInitialDraft,
} from "./types";
import Button from "@dt/Button";
import Text from "@dt/Text";
import Title from "@dt/Title";
import styles from "../ChatWidget.module.css";

// Simple harness to inject state
const WorkflowHarness: React.FC<{ state: EmailWorkflowState }> = ({
  state,
}) => {
  const [wfState, setWfState] = React.useState(state);
  const dispatch = (action: EmailWorkflowAction) => {
    setWfState((s) => emailWorkflowReducer(s, action));
  };
  // Clone ChatWidget minimal subset – for Storybook we rely on ChatWidget logic already integrated; here we only showcase states.
  return (
    <div style={{ maxWidth: 420 }}>
      <div className={styles.workflowBlock} data-story-state={wfState.step}>
        {wfState.step === "promptStart" && (
          <Text>Prompt: compose or cancel</Text>
        )}
        {wfState.step.startsWith("collecting") && "draft" in wfState && (
          <Text>
            Collecting field: {wfState.step.replace("collecting", "")}
          </Text>
        )}
        {wfState.step === "review" && "draft" in wfState && (
          <Text>Review summary</Text>
        )}
        {wfState.step === "sending" && <Text>Sending…</Text>}
        {wfState.step === "success" && <Text>Success!</Text>}
        {wfState.step === "error" && (
          <Text>Error: {(wfState as any).errorCode || "unknown"}</Text>
        )}
        <Button
          variant="secondary"
          onClick={() => dispatch({ type: "CANCEL" })}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

const meta: Meta<typeof WorkflowHarness> = {
  title: "Site/Chat/EmailWorkflow",
  component: WorkflowHarness,
  tags: ["autodocs"],
  parameters: {},
};
export default meta;

type Story = StoryObj<typeof WorkflowHarness>;

export const Prompt: Story = {
  tags: ["beta-matrix"],
  args: { state: { step: "promptStart" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getByText(/compose or cancel/i)).toBeInTheDocument();
    });
    const resetButton = canvas.getByRole("button", { name: /reset/i });
    await userEvent.click(resetButton);
  },
};
export const CollectingFullName: Story = {
  args: { state: { step: "collectingFullName", draft: createInitialDraft() } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getByText(/collecting/i)).toBeInTheDocument();
    });
  },
};
export const Review: Story = {
  args: { state: { step: "review", draft: createInitialDraft() } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getByText(/review/i)).toBeInTheDocument();
    });
  },
};
export const Sending: Story = {
  args: { state: { step: "sending", draft: createInitialDraft() } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getByText(/sending/i)).toBeInTheDocument();
    });
  },
};
export const Success: Story = {
  args: { state: { step: "success" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getByText(/success/i)).toBeInTheDocument();
    });
  },
};
export const ErrorState: Story = {
  args: {
    state: {
      step: "error",
      draft: createInitialDraft(),
      errorCode: "sendFailed",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getByText(/error/i)).toBeInTheDocument();
    });
  },
};
