import React from "react";
import { useTranslate } from "../../../lib/translation";
import Button from "@dt/Button";
import Text from "@dt/Text";
import styles from "../ChatWidget.module.css";
import { EmailWorkflowAction } from "./types";

interface ComposePromptProps {
  dispatch: (action: EmailWorkflowAction) => void;
}

const ComposePrompt: React.FC<ComposePromptProps> = ({ dispatch }) => {
  const t = useTranslate();
  return (
    <div className={styles.root}>
      <Text>{t("emailWorkflow.promptAddress")}</Text>
      <Text>{t("emailWorkflow.promptStartQuestion")}</Text>
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
