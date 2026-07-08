import React, { useState } from "react";
import { useTranslate } from "../../../lib/translation";
import Button from "@dt/Button";
import Text from "@dt/Text";
import TextInput from "@dt/TextInput";
import TextArea from "@dt/TextArea";
import CheckboxGroup from "@dt/CheckboxGroup";
import styles from "../ChatWidget.module.css";
import { EmailWorkflowAction, EmailDraft } from "./types";
import { generateErrors } from "@dt/ContactForm/contactValidation";

interface FieldPromptProps {
  step: EmailWorkflowState["step"];
  draft: EmailDraft;
  dispatch: (action: EmailWorkflowAction) => void;
}

type EmailWorkflowState = any; // avoid circular import complexity for this scaffold

const FieldPrompt: React.FC<FieldPromptProps> = ({ step, draft, dispatch }) => {
  const t = useTranslate();
  const [localValue, setLocalValue] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    message?: string;
  }>({});

  React.useEffect(() => {
    // Initialize local value based on step
    if (step === "collectingFullName") setLocalValue(draft.fullName);
    else if (step === "collectingEmail") setLocalValue(draft.email);
    else if (step === "collectingPhone") setLocalValue(draft.phone || "");
    else if (step === "collectingMessage") setLocalValue(draft.message);
  }, [step, draft]);

  const handleNext = () => {
    // Basic validation only for required fields
    if (
      step === "collectingFullName" ||
      step === "collectingEmail" ||
      step === "collectingMessage"
    ) {
      const validation = generateErrors(t, {
        fullName: step === "collectingFullName" ? localValue : draft.fullName,
        email: step === "collectingEmail" ? localValue : draft.email,
        message: step === "collectingMessage" ? localValue : draft.message,
      });
      if (
        (step === "collectingFullName" && validation.fullName) ||
        (step === "collectingEmail" && validation.email) ||
        (step === "collectingMessage" && validation.message)
      ) {
        setErrors(validation);
        return;
      }
    }
    // Persist value to reducer
    if (step === "collectingFullName") {
      dispatch({ type: "SET_FIELD", field: "fullName", value: localValue });
    } else if (step === "collectingEmail") {
      dispatch({ type: "SET_FIELD", field: "email", value: localValue });
    } else if (step === "collectingPhone") {
      dispatch({ type: "SET_FIELD", field: "phone", value: localValue });
    } else if (step === "collectingMessage") {
      dispatch({ type: "SET_FIELD", field: "message", value: localValue });
    }
    dispatch({ type: "NEXT" });
  };

  const handleSkip = () => {
    // Phone and interest can be skipped
    if (step === "collectingPhone") {
      dispatch({ type: "NEXT" });
      return;
    }
    if (step === "collectingInterest") {
      dispatch({ type: "NEXT" });
      return;
    }
  };

  if (step === "collectingInterest") {
    return (
      <div className={styles.workflowBlock} data-step={step}>
        <Text>{t("emailWorkflow.field.interest.choose")}</Text>
        <CheckboxGroup
          label={t("emailWorkflow.field.interest")}
          options={[
            {
              label: t("contactInterestBrandStrategy"),
              value: "brand-strategy",
            },
            {
              label: t("contactInterestDesignCreative"),
              value: "design-creative",
            },
            {
              label: t("contactInterestDigitalProducts"),
              value: "digital-products",
            },
            {
              label: t("contactInterestHelpMeChoose"),
              value: "help-me-choose",
            },
          ]}
          onChange={(selected) =>
            dispatch({
              type: "SET_FIELD",
              field: "interest",
              value: selected.join(", "),
            })
          }
        />
        <div className={styles.workflowActions}>
          <Button variant="primary" onClick={handleNext}>
            {t("emailWorkflow.action.next")}
          </Button>
          <Button variant="secondary" onClick={handleSkip}>
            {t("emailWorkflow.action.skip")}
          </Button>
        </div>
      </div>
    );
  }

  const labelMap: Record<string, string> = {
    collectingFullName: t("emailWorkflow.field.fullName"),
    collectingEmail: t("emailWorkflow.field.email"),
    collectingPhone: t("emailWorkflow.field.phone"),
    collectingMessage: t("emailWorkflow.field.message"),
  };

  const errorForStep =
    (step === "collectingFullName" && errors.fullName) ||
    (step === "collectingEmail" && errors.email) ||
    (step === "collectingMessage" && errors.message) ||
    "";

  return (
    <div className={styles.workflowBlock} data-step={step}>
      {step === "collectingMessage" ? (
        <TextArea
          label={labelMap[step]}
          value={localValue}
          onChange={(val) => setLocalValue(String(val))}
          error={errorForStep}
          placeholder={t("emailWorkflow.field.message")}
          required
        />
      ) : (
        <TextInput
          label={labelMap[step]}
          type={step === "collectingEmail" ? "email" : "text"}
          value={localValue}
          onChange={(val) => setLocalValue(String(val))}
          error={errorForStep}
          required={step !== "collectingPhone"}
        />
      )}
      <div className={styles.workflowActions}>
        <Button variant="primary" onClick={handleNext}>
          {t("emailWorkflow.action.next")}
        </Button>
        {(step === "collectingPhone" || step === "collectingInterest") && (
          <Button variant="secondary" onClick={handleSkip}>
            {t("emailWorkflow.action.skip")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FieldPrompt;
