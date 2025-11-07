import React from "react";
import { useTranslation } from "react-i18next";
import Button from "@dt/Button";
import styles from "../ChatWidget.module.css";
import { EmailWorkflowAction } from "./types";

interface SendStatusProps {
  step: "sending" | "success" | "error";
  retry?: () => void;
  dispatch: (action: EmailWorkflowAction) => void;
  errorCode?: string;
}

const SendStatus: React.FC<SendStatusProps> = ({
  step,
  dispatch,
  errorCode,
}) => {
  const { t } = useTranslation();
  if (step === "sending") {
    return (
      <div className={styles.workflowBlock} data-step={step}>
        <p>{t("emailWorkflow.sending")}</p>
      </div>
    );
  }
  if (step === "success") {
    return (
      <div
        className={styles.workflowBlock}
        data-step={step}
        data-testid="email-workflow-success"
      >
        <h4>{t("emailWorkflow.success.title")}</h4>
        <p>{t("emailWorkflow.success.body")}</p>
        <Button variant="primary" onClick={() => dispatch({ type: "CANCEL" })}>
          {t("emailWorkflow.done")}
        </Button>
      </div>
    );
  }
  return (
    <div className={styles.workflowBlock} data-step={step}>
      <h4>{t("emailWorkflow.error.title")}</h4>
      <p>{t("emailWorkflow.error.body")}</p>
      {errorCode && <small>{errorCode}</small>}
      <div className={styles.workflowActions}>
        <Button
          variant="primary"
          onClick={() => dispatch({ type: "SEND_REQUEST" })}
        >
          {t("emailWorkflow.error.retry")}
        </Button>
        <Button
          variant="secondary"
          onClick={() => dispatch({ type: "CANCEL" })}
        >
          {t("emailWorkflow.cancel")}
        </Button>
      </div>
    </div>
  );
};

export default SendStatus;
