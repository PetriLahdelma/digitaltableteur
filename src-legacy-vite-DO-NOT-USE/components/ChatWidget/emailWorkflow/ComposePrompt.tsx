import React from "react";
import { useTranslation } from "react-i18next";
import Button from "@dt/Button";
import styles from "../ChatWidget.module.css";
import { EmailWorkflowAction } from "./types";

interface ComposePromptProps {
  dispatch: (action: EmailWorkflowAction) => void;
}

const ComposePrompt: React.FC<ComposePromptProps> = ({ dispatch }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.workflowBlock} data-step="promptStart">
      <p>{t("emailWorkflow.promptAddress")}</p>
      <p>{t("emailWorkflow.promptStartQuestion")}</p>
      <div className={styles.workflowActions}>
        <Button variant="primary" onClick={() => dispatch({ type: "COMPOSE" })}>
          {t("emailWorkflow.compose")}
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

export default ComposePrompt;
