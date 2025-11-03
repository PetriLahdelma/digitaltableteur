import React from "react";
import type { UIMessage } from "ai";
import styles from "./ChatWidget.module.css";

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
      if (part.type === "reasoning") {
        return part.reasoning?.join("\n") ?? "";
      }
      if (part.type === "tool-result") {
        return `[${part.toolName ?? "tool"} result available]`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
};

const ChatMessages = React.forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, isStreaming }, ref) => {
    const conversation = messages.filter((message) =>
      isSupportedRole(message.role),
    );

    return (
      <div className={styles.messages} ref={ref}>
        {conversation.map((message) => {
          const copy = getMessageText(message);
          const isAssistant = message.role === "assistant";
          const fallback =
            isAssistant && isStreaming ? "Thinking…" : isAssistant ? "…" : "";

          return (
            <div
              key={message.id}
              className={styles.message}
              data-role={message.role}
            >
              <p>{copy || fallback}</p>
            </div>
          );
        })}
      </div>
    );
  },
);

ChatMessages.displayName = "ChatMessages";

export default ChatMessages;
