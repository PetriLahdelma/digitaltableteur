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

          // Dynamic OpenHours embedding:
          // 1. Explicit token [[openHours]] -> replaced inline.
          // 2. Automatic injection when assistant text mentions "open hours" concepts.
          const TOKEN = "[[openHours]]";
          const lower = copy.toLowerCase();
          const mentionsOpenHours =
            /open\s*hours|opening\s*hours|hours\s*of\s*operation|operating\s*times|business\s*hours|what\s+are\s+your\s+hours|what\s+time\s+are\s+you\s+open|when\s+are\s+you\s+open|are\s+you\s+open|availability|today['’]s?\s+hours|current\s+hours|closing\s*time|closing\s+time|opening\s*time/.test(
              lower,
            );

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
                    {i < segments.length - 1 && (
                      <>
                        <br />
                        <OpenHours compact />
                      </>
                    )}
                  </React.Fragment>
                ))}
              </div>
            );
          } else if (
            (isAssistant || message.role === "user") &&
            mentionsOpenHours
          ) {
            // Auto-inject component after markdown if not explicitly tokenized.
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
                <br />
                <OpenHours compact />
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
