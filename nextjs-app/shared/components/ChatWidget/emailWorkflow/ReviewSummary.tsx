import React from "react";
import { useTranslate } from "../../../lib/translation";
import Button from "@dt/Button";
import Title from "@dt/Title";
import styles from "../ChatWidget.module.css";
import { EmailWorkflowAction, EmailDraft } from "./types";

interface ReviewSummaryProps {
  draft: EmailDraft;
  dispatch: (action: EmailWorkflowAction) => void;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ draft, dispatch }) => {
  const t = useTranslate();
  return (
    <div className={styles.summary}>
      <Title level={4}>{t("emailWorkflow.review.title")}</Title>
      <dl className={styles.fields}>
        <dt>{t("emailWorkflow.field.fullName")}</dt>
        <dd>{draft.fullName || "—"}</dd>
        <dt>{t("emailWorkflow.field.email")}</dt>
        <dd>{draft.email || "—"}</dd>
        <dt>{t("emailWorkflow.field.phone")}</dt>
        <dd>{draft.phone || "—"}</dd>
        <dt>{t("emailWorkflow.field.interest")}</dt>
        <dd>{draft.interest.length ? draft.interest.join(", ") : "—"}</dd>
        <dt>{t("emailWorkflow.field.message")}</dt>
        <dd>{draft.message || "—"}</dd>
      </dl>
      <div className={styles.workflowActions}>
        <Button
          variant="primary"
          onClick={() => dispatch({ type: "SEND_REQUEST" })}
        >
          {t("emailWorkflow.review.send")}
        </Button>
        <Button
          variant="secondary"
          onClick={() => dispatch({ type: "CANCEL" })}
        >
          {t("emailWorkflow.cancel")}
        </Button>
      </div>
      <div className={styles.editActions}>
        <Button
          variant="tertiary"
          onClick={() => dispatch({ type: "EDIT", field: "fullName" })}
        >
          {t("emailWorkflow.field.fullName")}
        </Button>
        <Button
          variant="tertiary"
          onClick={() => dispatch({ type: "EDIT", field: "email" })}
        >
          {t("emailWorkflow.field.email")}
        </Button>
        <Button
          variant="tertiary"
          onClick={() => dispatch({ type: "EDIT", field: "phone" })}
        >
          {t("emailWorkflow.field.phone")}
        </Button>
        <Button
          variant="tertiary"
          onClick={() => dispatch({ type: "EDIT", field: "interest" })}
        >
          {t("emailWorkflow.field.interest")}
        </Button>
        <Button
          variant="tertiary"
          onClick={() => dispatch({ type: "EDIT", field: "message" })}
        >
          {t("emailWorkflow.field.message")}
        </Button>
      </div>
    </div>
  );
};

export default ReviewSummary;
