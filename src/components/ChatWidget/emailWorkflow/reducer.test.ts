import { describe, it, expect } from "vitest";
import { emailWorkflowReducer, initialEmailWorkflowState } from "./reducer";
import { createInitialDraft } from "./types";

const advance = (state: any, times: number) => {
  let s = state;
  for (let i = 0; i < times; i++) {
    s = emailWorkflowReducer(s, { type: "NEXT" });
  }
  return s;
};

describe("emailWorkflowReducer", () => {
  it("starts idle then triggers promptStart", () => {
    const triggered = emailWorkflowReducer(initialEmailWorkflowState, {
      type: "TRIGGER",
    });
    expect(triggered.step).toBe("promptStart");
  });

  it("compose creates draft and moves to collectingFullName", () => {
    const prompted = emailWorkflowReducer(initialEmailWorkflowState, {
      type: "TRIGGER",
    });
    const composed = emailWorkflowReducer(prompted, { type: "COMPOSE" });
    expect(composed.step).toBe("collectingFullName");
    expect("draft" in composed && composed.draft.fullName).toBeDefined();
  });

  it("advances through sequence to review", () => {
    let state: any = emailWorkflowReducer(initialEmailWorkflowState, {
      type: "TRIGGER",
    });
    state = emailWorkflowReducer(state, { type: "COMPOSE" });
    // set required fields
    state = emailWorkflowReducer(state, {
      type: "SET_FIELD",
      field: "fullName",
      value: "Test User",
    });
    state = emailWorkflowReducer(state, { type: "NEXT" });
    state = emailWorkflowReducer(state, {
      type: "SET_FIELD",
      field: "email",
      value: "user@example.com",
    });
    state = emailWorkflowReducer(state, { type: "NEXT" });
    state = advance(state, 3); // phone, interest, message -> review
    expect(state.step).toBe("review");
  });

  it("edit from review returns to collecting step", () => {
    let state: any = emailWorkflowReducer(initialEmailWorkflowState, {
      type: "TRIGGER",
    });
    state = emailWorkflowReducer(state, { type: "COMPOSE" });
    state = emailWorkflowReducer(state, {
      type: "SET_FIELD",
      field: "fullName",
      value: "User",
    });
    state = emailWorkflowReducer(state, { type: "NEXT" });
    state = emailWorkflowReducer(state, {
      type: "SET_FIELD",
      field: "email",
      value: "user@example.com",
    });
    state = emailWorkflowReducer(state, { type: "NEXT" });
    state = advance(state, 3); // to review
    expect(state.step).toBe("review");
    state = emailWorkflowReducer(state, { type: "EDIT", field: "email" });
    expect(state.step).toBe("collectingEmail");
  });

  it("send success transitions to success", () => {
    let state: any = emailWorkflowReducer(initialEmailWorkflowState, {
      type: "TRIGGER",
    });
    state = emailWorkflowReducer(state, { type: "COMPOSE" });
    state = emailWorkflowReducer(state, {
      type: "SET_FIELD",
      field: "fullName",
      value: "User",
    });
    state = emailWorkflowReducer(state, { type: "NEXT" });
    state = emailWorkflowReducer(state, {
      type: "SET_FIELD",
      field: "email",
      value: "user@example.com",
    });
    state = emailWorkflowReducer(state, { type: "NEXT" });
    state = advance(state, 3); // to review
    state = emailWorkflowReducer(state, { type: "SEND_REQUEST" });
    expect(state.step).toBe("sending");
    state = emailWorkflowReducer(state, { type: "SEND_SUCCESS" });
    expect(state.step).toBe("success");
  });

  it("send error transitions to error with code", () => {
    let state: any = emailWorkflowReducer(initialEmailWorkflowState, {
      type: "TRIGGER",
    });
    state = emailWorkflowReducer(state, { type: "COMPOSE" });
    state = emailWorkflowReducer(state, {
      type: "SET_FIELD",
      field: "fullName",
      value: "User",
    });
    state = emailWorkflowReducer(state, { type: "NEXT" });
    state = emailWorkflowReducer(state, {
      type: "SET_FIELD",
      field: "email",
      value: "user@example.com",
    });
    state = emailWorkflowReducer(state, { type: "NEXT" });
    state = advance(state, 3); // to review
    state = emailWorkflowReducer(state, { type: "SEND_REQUEST" });
    state = emailWorkflowReducer(state, {
      type: "SEND_ERROR",
      errorCode: "credentials",
    });
    expect(state.step).toBe("error");
    expect("draft" in state && state.errorCode).toBe("credentials");
  });

  it("cancel returns to idle from any active state", () => {
    let state: any = emailWorkflowReducer(initialEmailWorkflowState, {
      type: "TRIGGER",
    });
    state = emailWorkflowReducer(state, { type: "CANCEL" });
    expect(state.step).toBe("idle");
    state = emailWorkflowReducer(initialEmailWorkflowState, {
      type: "TRIGGER",
    });
    state = emailWorkflowReducer(state, { type: "COMPOSE" });
    state = emailWorkflowReducer(state, { type: "CANCEL" });
    expect(state.step).toBe("idle");
  });
});
