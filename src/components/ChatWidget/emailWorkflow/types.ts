export interface EmailDraft {
  fullName: string;
  email: string;
  phone?: string;
  interest: string[]; // store as array internally, join when sending
  message: string;
}

export type EmailWorkflowState =
  | { step: "idle" }
  | { step: "promptStart" }
  | { step: "collectingFullName"; draft: EmailDraft }
  | { step: "collectingEmail"; draft: EmailDraft }
  | { step: "collectingPhone"; draft: EmailDraft }
  | { step: "collectingInterest"; draft: EmailDraft }
  | { step: "collectingMessage"; draft: EmailDraft }
  | { step: "review"; draft: EmailDraft }
  | { step: "sending"; draft: EmailDraft }
  | { step: "success" }
  | { step: "error"; draft: EmailDraft; errorCode?: string };

export type EmailWorkflowAction =
  | { type: "TRIGGER" }
  | { type: "CANCEL" }
  | { type: "COMPOSE" }
  | { type: "SET_FIELD"; field: keyof EmailDraft; value: string }
  | { type: "NEXT" }
  | { type: "EDIT"; field: keyof EmailDraft }
  | { type: "SEND_REQUEST" }
  | { type: "SEND_SUCCESS" }
  | { type: "SEND_ERROR"; errorCode?: string };

export const createInitialDraft = (): EmailDraft => ({
  fullName: "",
  email: "",
  phone: "",
  interest: [],
  message: "",
});
