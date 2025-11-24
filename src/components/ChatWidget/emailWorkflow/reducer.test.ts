import { describe, it, expect } from "vitest";
import { emailWorkflowReducer, initialEmailWorkflowState } from "./reducer";
import { createInitialDraft } from "./types";

describe("emailWorkflowReducer", () => {
  it("triggers and composes workflow", () => {
    const trigger = emailWorkflowReducer(initialEmailWorkflowState, {
      type: "TRIGGER",
    });
    expect(trigger.step).toBe("promptStart");

    // COMPOSE only advances from promptStart
    const composed = emailWorkflowReducer(trigger, { type: "COMPOSE" });
    expect(composed.step).toBe("collectingFullName");
    expect("draft" in composed && composed.draft.fullName).toBe("");

    const noop = emailWorkflowReducer(initialEmailWorkflowState, {
      type: "COMPOSE",
    });
    expect(noop.step).toBe("idle");
  });

  it("sets fields, advances steps, and edits entries", () => {
    const base = {
      step: "collectingFullName" as const,
      draft: createInitialDraft(),
    };
    const withName = emailWorkflowReducer(base, {
      type: "SET_FIELD",
      field: "fullName",
      value: "Jane Doe",
    });
    expect(withName.draft.fullName).toBe("Jane Doe");

    const withInterests = emailWorkflowReducer(base, {
      type: "SET_FIELD",
      field: "interest",
      value: "a, b , c",
    });
    expect(withInterests.draft.interest).toEqual(["a", "b", "c"]);

    const next = emailWorkflowReducer(withName, { type: "NEXT" });
    expect(next.step).toBe("collectingEmail");
    const review = emailWorkflowReducer(
      { ...next, draft: withName.draft },
      { type: "NEXT" },
    );
    const reviewStep = emailWorkflowReducer(
      { ...review, step: "review" } as any,
      { type: "NEXT" },
    );
    // At review, NEXT does not advance past the end of the sequence
    expect(reviewStep.step).toBe("review");

    const edited = emailWorkflowReducer({ ...review, step: "review" } as any, {
      type: "EDIT",
      field: "message",
    });
    expect(edited.step).toBe("collectingMessage");
  });

  it("handles send request success and errors", () => {
    const reviewState = {
      step: "review" as const,
      draft: createInitialDraft(),
    };
    const sending = emailWorkflowReducer(reviewState, { type: "SEND_REQUEST" });
    expect(sending.step).toBe("sending");

    const success = emailWorkflowReducer(sending, { type: "SEND_SUCCESS" });
    expect(success.step).toBe("success");

    const error = emailWorkflowReducer(sending, {
      type: "SEND_ERROR",
      errorCode: "boom",
    });
    expect(error.step).toBe("error");
    expect(error.errorCode).toBe("boom");
  });

  it("cancels back to idle and ignores invalid transitions", () => {
    const cancelled = emailWorkflowReducer(
      { step: "collectingEmail", draft: createInitialDraft() },
      { type: "CANCEL" },
    );
    expect(cancelled.step).toBe("idle");

    const unchanged = emailWorkflowReducer(
      { step: "collectingEmail", draft: createInitialDraft() },
      { type: "TRIGGER" },
    );
    expect(unchanged.step).toBe("collectingEmail");
  });
});
