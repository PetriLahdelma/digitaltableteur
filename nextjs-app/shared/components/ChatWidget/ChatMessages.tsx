import React from "react";
import { useTranslate } from "../../lib/translation";
import type { UIMessage } from "ai";
import Text from "@dt/Text";
import styles from "./ChatWidget.module.css";
import { processConversation } from "./messageProcessor";
import ChatMessageBubble from "./ChatMessageBubble";
import ComposePrompt from "./emailWorkflow/ComposePrompt";
import FieldPrompt from "./emailWorkflow/FieldPrompt";
import ReviewSummary from "./emailWorkflow/ReviewSummary";
import SendStatus from "./emailWorkflow/SendStatus";
import { EmailWorkflowState, EmailWorkflowAction } from "./emailWorkflow/types";

/**
 * Props for the ChatMessages component.
 *
 * @interface ChatMessagesProps
 * @property {UIMessage[]} messages - Array of chat messages to display
 * @property {boolean} isStreaming - Whether the assistant is currently streaming a response
 * @property {EmailWorkflowState} [emailWorkflow] - Optional email workflow state for inline email composition
 * @property {function} [dispatchEmailWorkflow] - Optional dispatcher for email workflow actions
 */
export interface ChatMessagesProps {
  messages: UIMessage[];
  isStreaming: boolean;
  emailWorkflow?: EmailWorkflowState;
  dispatchEmailWorkflow?: (action: EmailWorkflowAction) => void;
}

const isSupportedRole = (role: UIMessage["role"]) =>
  role === "assistant" || role === "user";

// Legacy getMessageText replaced by messageProcessor.extractCopy (kept private there)

const ChatMessages = React.forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, isStreaming, emailWorkflow, dispatchEmailWorkflow }, ref) => {
    const t = useTranslate();
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

    // Empty state when no messages
    if (processed.length === 0) {
      return (
        <div
          className={styles.messages}
          ref={ref}
          role="log"
          aria-live="polite"
          aria-busy={isStreaming}
          aria-label={t("chatMessages.ariaLabel", "Chat messages")}
          tabIndex={0}
        >
          <div className={styles.emptyState}>
            <Text className={styles.emptyStateText}>
              {t("chatMessages.empty")}
            </Text>
          </div>
        </div>
      );
    }

    return (
      <div
        className={styles.messages}
        ref={ref}
        role="log"
        aria-live="polite"
        aria-busy={isStreaming}
        aria-label={t("chatMessages.ariaLabel", "Chat messages")}
        aria-relevant="additions"
        tabIndex={0}
      >
        {processed.map((message, msgIndex) => {
          const workflowUI =
            msgIndex === lastAssistantIndex ? renderWorkflow() : null;

          return (
            <ChatMessageBubble
              key={message.id}
              message={message}
              isStreaming={
                isStreaming &&
                msgIndex === lastAssistantIndex &&
                msgIndex === processed.length - 1
              }
              workflowUI={workflowUI}
            />
          );
        })}
      </div>
    );
  },
);

ChatMessages.displayName = "ChatMessages";

export default ChatMessages;
