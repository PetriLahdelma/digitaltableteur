import React from "react";
import { useTranslate } from "../../../lib/translation";
import Button from "@dt/Button";
import Title from "@dt/Title";
import Text from "@dt/Text";
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
  const t = useTranslate();
  if (step === "sending") {
    return (
      <div className={styles.sending} role="status" aria-busy="true">
        <Text>{t("emailWorkflow.sending")}</Text>
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
        <Title level={4}>{t("emailWorkflow.success.title")}</Title>
        <p>{t("emailWorkflow.success.body")}</p>
        <Button variant="primary" onClick={() => dispatch({ type: "CANCEL" })}>
          {t("emailWorkflow.done")}
        </Button>
      </div>
    );
  }
  return (
    <div className={styles.workflowBlock} data-step={step}>
      <Title level={4}>{t("emailWorkflow.error.title")}</Title>
      <p>
        {errorCode
          ? t(`emailWorkflow.error.${errorCode}`, {
              defaultValue: t("emailWorkflow.error.unknown"),
            })
          : t("emailWorkflow.error.unknown")}
      </p>
      <div className={styles.workflowActions}>
        <Button
          variant="primary"
          onClick={() => dispatch({ type: "EDIT", field: "message" })}
        >
          {t("emailWorkflow.error.edit")}
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
