import React from "react";
import { useTranslation } from "react-i18next";
import type { UIMessage } from "ai";
import styles from "./ChatWidget.module.css";
import MarkdownMessage from "@dt/MarkdownMessage";
import OpenHours from "@dt/OpenHours/OpenHours";
import ServicesGrid from "@dt/ServicesGrid/ServicesGrid";

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

          // Handle OpenHours explicit token
          if (copy.includes(TOKEN_OPEN_HOURS)) {
            const segments = copy.split(TOKEN_OPEN_HOURS);
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
