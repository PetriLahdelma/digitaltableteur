import React from "react";
import { useTranslation } from "react-i18next";
import type { UIMessage } from "ai";
import styles from "./ChatWidget.module.css";
import OpenHours from "@dt/OpenHours/OpenHours";
import { processConversation, type ProcessedPart } from "./messageProcessor";

interface ChatMessagesProps {
  messages: UIMessage[];
  isStreaming: boolean;
}

const isSupportedRole = (role: UIMessage["role"]) =>
  role === "assistant" || role === "user";

const ChatMessages = React.forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, isStreaming }, ref) => {
    const { t } = useTranslation();
    const conversation = messages.filter((m) => isSupportedRole(m.role));
    const processed = processConversation(conversation);

    return (
      <div className={styles.messages} ref={ref}>
        {processed.map((msg) => {
          const isAssistant = msg.role === "assistant";
          const thinking = t("chatThinking", "Thinking…");
          const ellipsis = t("chatEllipsis", "…");
          const fallback = isAssistant
            ? isStreaming
              ? thinking
              : ellipsis
            : "";
          return (
            <React.Fragment key={msg.id}>
              {msg.parts.map((part, idx) => {
                if (part.kind === "text") {
                  const display = part.content || fallback;
                  return (
                    <div
                      key={idx}
                      className={styles.message}
                      data-role={msg.role}
                    >
                      <p>{display}</p>
                    </div>
                  );
                }
                if (part.kind === "component" && part.name === "OpenHours") {
                  return (
                    <div
                      key={idx}
                      className={styles.fullSpan}
                      data-role={msg.role}
                    >
                      <OpenHours {...part.props} />
                    </div>
                  );
                }
                return null;
              })}
            </React.Fragment>
          );
        })}
      </div>
    );
  },
);

ChatMessages.displayName = "ChatMessages";

export default ChatMessages;
