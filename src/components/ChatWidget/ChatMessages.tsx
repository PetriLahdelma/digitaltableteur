import React from "react";
import { useTranslation } from "react-i18next";
import type { UIMessage } from "ai";
import styles from "./ChatWidget.module.css";
import MarkdownMessage from "@dt/MarkdownMessage";
import OpenHours from "@dt/OpenHours/OpenHours";
import { processConversation } from "./messageProcessor";
import ServicesGrid from "@dt/ServicesGrid/ServicesGrid";

interface ChatMessagesProps {
  messages: UIMessage[];
  isStreaming: boolean;
}

const isSupportedRole = (role: UIMessage["role"]) =>
  role === "assistant" || role === "user";

// Legacy getMessageText replaced by messageProcessor.extractCopy (kept private there)

const ChatMessages = React.forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, isStreaming }, ref) => {
    const { t } = useTranslation();
    const processed = processConversation(
      messages.filter((m) => isSupportedRole(m.role)),
    );

    return (
      <div className={styles.messages} ref={ref}>
        {processed.map((message) => {
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
            </div>
          );
        })}
      </div>
    );
  },
);

ChatMessages.displayName = "ChatMessages";

export default ChatMessages;
