import React from "react";
import { useTranslation } from "react-i18next";
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

<<<<<<< Updated upstream
=======
          // Dynamic component embedding tokens:
          // OpenHours:
          // 1. Explicit token [[openHours]] -> replaced inline.
          // 2. Automatic injection when assistant text mentions "open hours" concepts.
          const TOKEN_OPEN_HOURS = "[[openHours]]";
          // ServicesGrid:
          // 1. Explicit token [[servicesGrid]] -> replaced inline.
          const TOKEN_SERVICES_GRID = "[[servicesGrid]]";
          const lower = copy.toLowerCase();
          const mentionsOpenHours =
            /open\s*hours|opening\s*hours|hours\s*of\s*operation|operating\s*times|business\s*hours|what\s+are\s+your\s+hours|what\s+time\s+are\s+you\s+open|when\s+are\s+you\s+open|are\s+you\s+open|availability|today['’]s?\s+hours|current\s+hours|closing\s*time|closing\s+time|opening\s*time/.test(
              lower,
            );
          const mentionsServices =
            /\bservices?\b|\bcapabilities\b|\bofferings?\b|what\s+do\s+you\s+offer|what\s+services\s+do\s+you\s+provide|your\s+services|studio\s+services/.test(
              lower,
            );

          // Handle OpenHours explicit token (assistant only)
          if (isAssistant && copy.includes(TOKEN_OPEN_HOURS)) {
            const segments = copy.split(TOKEN_OPEN_HOURS);
            return (
              <React.Fragment key={message.id}>
                {segments.map((seg, i) => (
                  <React.Fragment key={i}>
                    {seg && (
                      <div className={styles.message} data-role={message.role}>
                        <MarkdownMessage
                          content={seg}
                          fallback={fallback}
                          data-role={message.role}
                        />
                      </div>
                    )}
                    {i < segments.length - 1 && (
                      <div className={styles.fullSpan} data-role={message.role}>
                        <OpenHours compact />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          } else if (isAssistant && mentionsOpenHours) {
            // Auto-inject component after markdown if not explicitly tokenized (assistant only)
            return (
              <React.Fragment key={message.id}>
                <div className={styles.message} data-role={message.role}>
                  <MarkdownMessage
                    content={copy}
                    fallback={fallback}
                    data-role={message.role}
                  />
                </div>
                <div className={styles.fullSpan} data-role={message.role}>
                  <OpenHours compact />
                </div>
              </React.Fragment>
            );
          } else if (!isAssistant && copy.includes(TOKEN_OPEN_HOURS)) {
            // User attempted to use [[openHours]] token; render markdown without component (token removed)
            const sanitized = copy.replaceAll(TOKEN_OPEN_HOURS, "").trim();
            return (
              <div
                key={message.id}
                className={styles.message}
                data-role={message.role}
              >
                <MarkdownMessage
                  content={sanitized}
                  fallback={fallback}
                  data-role={message.role}
                />
              </div>
            );
          }

          // ServicesGrid injection logic (avoid duplicates):
          // Priority: explicit token(s) -> render in-place. Heuristic only fires if no token present.
          if (
            isAssistant &&
            message.id !== "intro" &&
            copy.includes(TOKEN_SERVICES_GRID)
          ) {
            const segments = copy.split(TOKEN_SERVICES_GRID);
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
                        {/* Only render first ServicesGrid even if multiple tokens */}
                        {i === 0 && <ServicesGrid />}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </div>
            );
          } else if (
            isAssistant &&
            message.id !== "intro" &&
            mentionsServices
          ) {
            // Heuristic injection only if token not used.
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
                <ServicesGrid />
              </div>
            );
          }

>>>>>>> Stashed changes
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
