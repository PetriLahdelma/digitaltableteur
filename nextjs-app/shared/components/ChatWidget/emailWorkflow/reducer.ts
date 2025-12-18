import {
  EmailWorkflowState,
  EmailWorkflowAction,
  createInitialDraft,
} from "./types";

export const emailWorkflowReducer = (
  state: EmailWorkflowState,
  action: EmailWorkflowAction,
): EmailWorkflowState => {
  switch (action.type) {
    case "TRIGGER":
      if (state.step !== "idle") return state;
      return { step: "promptStart" };
    case "CANCEL":
      return { step: "idle" };
    case "COMPOSE":
      if (state.step !== "promptStart") return state;
      return { step: "collectingFullName", draft: createInitialDraft() };
    case "SET_FIELD":
      if (!("draft" in state)) return state;
      return {
        ...state,
        draft: {
          ...state.draft,
          [action.field]:
            action.field === "interest"
              ? action.value.split(/\s*,\s*/).filter(Boolean)
              : action.value,
        },
      } as EmailWorkflowState;
    case "NEXT": {
      if (!("draft" in state)) return state;
      const sequence: EmailWorkflowState["step"][] = [
        "collectingFullName",
        "collectingEmail",
        "collectingPhone",
        "collectingInterest",
        "collectingMessage",
        "review",
      ];
      const idx = sequence.indexOf(state.step);
      if (idx === -1) return state;
      const nextStep = sequence[idx + 1];
      if (!nextStep) return state; // Already at review or beyond
      return { step: nextStep, draft: state.draft } as EmailWorkflowState;
    }
    case "EDIT":
      if (state.step !== "review") return state;
      return {
        step: `collecting${capitalize(action.field)}` as any,
        draft: state.draft,
      };
    case "SEND_REQUEST":
      if (state.step !== "review") return state;
      return { step: "sending", draft: state.draft };
    case "SEND_SUCCESS":
      return { step: "success" };
    case "SEND_ERROR":
      if (!("draft" in state))
        return {
          step: "error",
          draft: createInitialDraft(),
          errorCode: action.errorCode,
        };
      return {
        step: "error",
        draft: state.draft,
        errorCode: action.errorCode,
      };
    default:
      return state;
  }
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const initialEmailWorkflowState: EmailWorkflowState = { step: "idle" };
