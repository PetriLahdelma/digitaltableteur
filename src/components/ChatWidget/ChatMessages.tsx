import React from "react";
import { useTranslation } from "react-i18next";
import type { UIMessage } from "ai";
import styles from "./ChatWidget.module.css";
import MarkdownMessage from "@dt/MarkdownMessage";
import OpenHours from "@dt/OpenHours/OpenHours";
import { processConversation } from "./messageProcessor";
import ServicesGrid from "@dt/ServicesGrid/ServicesGrid";
import ComposePrompt from "./emailWorkflow/ComposePrompt";
import FieldPrompt from "./emailWorkflow/FieldPrompt";
import ReviewSummary from "./emailWorkflow/ReviewSummary";
import SendStatus from "./emailWorkflow/SendStatus";
import { EmailWorkflowState, EmailWorkflowAction } from "./emailWorkflow/types";

interface ChatMessagesProps {
  messages: UIMessage[];
  isStreaming: boolean;
  emailWorkflow?: EmailWorkflowState; // made optional for backward stories/tests
  dispatchEmailWorkflow?: (action: EmailWorkflowAction) => void;
}

const isSupportedRole = (role: UIMessage["role"]) =>
  role === "assistant" || role === "user";

// Legacy getMessageText replaced by messageProcessor.extractCopy (kept private there)

const ChatMessages = React.forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, isStreaming, emailWorkflow, dispatchEmailWorkflow }, ref) => {
    const { t } = useTranslation();
    const processed = processConversation(
      messages.filter((m) => isSupportedRole(m.role)),
    );

    // Determine the last assistant message index to append workflow UI inside it
    const lastAssistantIndex = React.useMemo(() => {
      for (let i = processed.length - 1; i >= 0; i--) {
        if (processed[i].role === "assistant") return i;
      }
      return -1;
    }, [processed]);

    const safeWorkflow: EmailWorkflowState = emailWorkflow || { step: "idle" };
    const renderWorkflow = () => {
      if (safeWorkflow.step === "idle") return null;
      if (safeWorkflow.step === "promptStart") {
        return <ComposePrompt dispatch={dispatchEmailWorkflow!} />;
      }
      if (
        safeWorkflow.step.startsWith("collecting") &&
        "draft" in safeWorkflow
      ) {
        return (
          <FieldPrompt
            step={safeWorkflow.step as any}
            draft={(safeWorkflow as any).draft}
            dispatch={dispatchEmailWorkflow!}
          />
        );
      }
      if (safeWorkflow.step === "review" && "draft" in safeWorkflow) {
        return (
          <ReviewSummary
            draft={(safeWorkflow as any).draft}
            dispatch={dispatchEmailWorkflow!}
          />
        );
      }
      if (
        safeWorkflow.step === "sending" ||
        safeWorkflow.step === "success" ||
        safeWorkflow.step === "error"
      ) {
        return (
          <SendStatus
            step={safeWorkflow.step as any}
            dispatch={dispatchEmailWorkflow!}
            errorCode={
              safeWorkflow.step === "error"
                ? (safeWorkflow as any).errorCode
                : undefined
            }
          />
        );
      }
      return null;
    };

    return (
      <div className={styles.messages} ref={ref}>
        {processed.map((message, msgIndex) => {
          const isAssistant = message.role === "assistant";
          const thinking = t("chatThinking", "Thinking…");
          const ellipsis = t("chatEllipsis", "…");
          const fallback = isAssistant
            ? isStreaming
              ? thinking
              : ellipsis
            : "";

          return (
            <div
              key={message.id}
              className={styles.message}
              data-role={message.role}
            >
              {message.parts.map((part, idx) => {
                if (part.kind === "text") {
                  return (
                    <MarkdownMessage
                      key={idx}
                      content={part.content}
                      fallback={fallback}
                      data-role={message.role}
                    />
                  );
                }
                if (part.kind === "component" && part.name === "OpenHours") {
                  return (
                    <React.Fragment key={idx}>
                      <br />
                      <OpenHours compact={part.props?.compact} />
                    </React.Fragment>
                  );
                }
                if (part.kind === "component" && part.name === "ServicesGrid") {
                  return (
                    <React.Fragment key={idx}>
                      <br />
                      <ServicesGrid />
                    </React.Fragment>
                  );
                }
                return null;
              })}
              {msgIndex === lastAssistantIndex && renderWorkflow()}
            </div>
          );
        })}
      </div>
    );
  },
);

ChatMessages.displayName = "ChatMessages";

export default ChatMessages;
