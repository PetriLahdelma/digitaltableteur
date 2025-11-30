import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ChatWidget from "../ChatWidget";
import { emailWorkflowReducer, initialEmailWorkflowState } from "./reducer";
import {
  EmailWorkflowAction,
  EmailWorkflowState,
  createInitialDraft,
} from "./types";

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
      <div data-story-state={wfState.step}>
        {wfState.step === "promptStart" && <div>Prompt: compose or cancel</div>}
        {wfState.step.startsWith("collecting") && "draft" in wfState && (
          <div>Collecting field: {wfState.step.replace("collecting", "")}</div>
        )}
        {wfState.step === "review" && "draft" in wfState && (
          <div>Review summary</div>
        )}
        {wfState.step === "sending" && <div>Sending…</div>}
        {wfState.step === "success" && <div>Success!</div>}
        {wfState.step === "error" && (
          <div>Error: {(wfState as any).errorCode || "unknown"}</div>
        )}
        <button onClick={() => dispatch({ type: "CANCEL" })}>Reset</button>
      </div>
    </div>
  );
};

const meta: Meta<typeof WorkflowHarness> = {
  title: "Components/AI/Chat/Custom Components/EmailWorkflow",
  component: WorkflowHarness,
  parameters: {},
};
export default meta;

type Story = StoryObj<typeof WorkflowHarness>;

export const Prompt: Story = {
  args: { state: { step: "promptStart" } },
};
export const CollectingFullName: Story = {
  args: { state: { step: "collectingFullName", draft: createInitialDraft() } },
};
export const Review: Story = {
  args: { state: { step: "review", draft: createInitialDraft() } },
};
export const Sending: Story = {
  args: { state: { step: "sending", draft: createInitialDraft() } },
};
export const Success: Story = {
  args: { state: { step: "success" } },
};
export const ErrorState: Story = {
  args: {
    state: {
      step: "error",
      draft: createInitialDraft(),
      errorCode: "sendFailed",
    },
  },
};
