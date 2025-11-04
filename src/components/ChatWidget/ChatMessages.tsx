import React from "react";
import { useTranslation } from "react-i18next";
import type { UIMessage } from "ai";
import styles from "./ChatWidget.module.css";
import MarkdownMessage from "@dt/MarkdownMessage";
import OpenHours from "@dt/OpenHours/OpenHours";

interface ChatMessagesProps {
  messages: UIMessage[];
  isStreaming: boolean;
}

const isSupportedRole = (role: UIMessage["role"]) =>
  role === "assistant" || role === "user";

const getMessageText = (message: UIMessage) => {
  if (!Array.isArray(message.parts) || message.parts.length === 0) {
    return "";
  }

  return message.parts
    .map((part) => {
      if (part.type === "text" && "text" in part) {
        return typeof part.text === "string" ? part.text : "";
      }
      if (part.type === "reasoning" && "text" in part) {
        return typeof part.text === "string" ? part.text : "";
      }
      if (part.type === "tool-result" || part.type.startsWith("tool-")) {
        const toolPart = part as unknown as {
          type: string;
          toolName?: string;
          toolCallId: string;
        };
        const label = toolPart.toolName ?? toolPart.toolCallId ?? "tool";
        return `[${label} result available]`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
};

const ChatMessages = React.forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, isStreaming }, ref) => {
    const { t } = useTranslation();
    const conversation = messages.filter((message) =>
      isSupportedRole(message.role),
    );

    return (
      <div className={styles.messages} ref={ref}>
        {conversation.map((message) => {
          const copy = getMessageText(message);
          const isAssistant = message.role === "assistant";
          const thinking = t("chatThinking", "Thinking…");
          const ellipsis = t("chatEllipsis", "…");
          const fallback = isAssistant
            ? isStreaming
              ? thinking
              : ellipsis
            : "";

          // Token replacement for dynamic components inside markdown stream
          const TOKEN = "[[openHours]]";
          if (copy.includes(TOKEN)) {
            const segments = copy.split(TOKEN);
            return (
              <div
                key={message.id}
                className={styles.message}
                data-role={message.role}
              >
                {segments.map((seg, i) => (
                  <React.Fragment key={i}>
                    {seg && (
                      <MarkdownMessage
                        content={seg}
                        fallback={fallback}
                        data-role={message.role}
                      />
                    )}
                    {i < segments.length - 1 && <OpenHours compact />}
                  </React.Fragment>
                ))}
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={styles.message}
              data-role={message.role}
            >
              <MarkdownMessage
                content={copy}
                fallback={fallback}
                data-role={message.role}
              />
            </div>
          );
        })}
      </div>
    );
  },
);

ChatMessages.displayName = "ChatMessages";

export default ChatMessages;
