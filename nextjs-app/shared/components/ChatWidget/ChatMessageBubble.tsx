import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import styles from "./ChatWidget.module.css";
import MarkdownMessage from "@dt/MarkdownMessage";
import OpenHours from "@dt/OpenHours/OpenHours";
import ServicesGrid from "@dt/ServicesGrid/ServicesGrid";
import StudioMap from "@dt/StudioMap/StudioMap";
import AIProcessingState from "./AIProcessingState";
import type { ProcessedMessage, ProjectCardData } from "./messageProcessor";

/**
 * Props for the ChatMessageBubble component.
 *
 * @interface ChatMessageBubbleProps
 * @property {ProcessedMessage} message - The processed message object containing role and parts
 * @property {boolean} isStreaming - Whether the assistant is currently streaming a response
 * @property {React.ReactNode} [workflowUI] - Optional email workflow UI to append to assistant messages
 */
export interface ChatMessageBubbleProps {
  message: ProcessedMessage;
  isStreaming: boolean;
  workflowUI?: React.ReactNode;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isStreaming,
  workflowUI,
}) => {
  const { t } = useTranslation();
  const isAssistant = message.role === "assistant";
  const thinking = t("chatThinking", "Thinking…");
  const ellipsis = t("chatEllipsis", "…");
  const fallback = isAssistant ? (isStreaming ? thinking : "") : "";

  // Check if message is empty and streaming (thinking state)
  const hasContent = message.parts.some(
    (part) => part.kind === "text" && part.content.trim().length > 0,
  );
  const showProcessingState = isAssistant && isStreaming && !hasContent;

  return (
    <div
      className={styles.message}
      data-role={message.role}
      data-testid={`chat-message-${message.role}`}
    >
      {showProcessingState ? (
        <AIProcessingState mode="thinking" intensity="moderate" />
      ) : (
        <>
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
                <div key={idx} className={styles.fullWidthComponent}>
                  <OpenHours compact={part.props?.compact} />
                </div>
              );
            }
            if (part.kind === "component" && part.name === "ServicesGrid") {
              return (
                <div key={idx} className={styles.fullWidthComponent}>
                  <ServicesGrid />
                </div>
              );
            }
            if (part.kind === "component" && part.name === "StudioMap") {
              return (
                <div key={idx} className={styles.fullWidthComponent}>
                  <StudioMap compact={part.props?.compact} />
                </div>
              );
            }
            if (part.kind === "component" && part.name === "NavigateLink") {
              return (
                <div key={idx} className={styles.toolResultCard}>
                  <Link
                    href={part.props.url}
                    className={styles.navigateLink}
                  >
                    {t("chatNavigateTo", "Go to {{page}}", { page: part.props.label || part.props.url })} →
                  </Link>
                </div>
              );
            }
            if (
              part.kind === "component" &&
              part.name === "VertaaUxAccessibilityOffer"
            ) {
              return (
                <div key={idx} className={styles.toolResultCard}>
                  <div className={styles.vertaauxOffer}>
                    <Link
                      href={part.props.caseStudyUrl}
                      className={styles.navigateLink}
                    >
                      {t("chatVertaauxCaseStudy", "Read the VertaaUX case study")} →
                    </Link>
                    <a
                      href={part.props.productUrl}
                      className={styles.navigateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t(
                        "chatVertaauxProduct",
                        "Score your accessibility with VertaaUX",
                      )}{" "}
                      →
                    </a>
                  </div>
                </div>
              );
            }
            if (part.kind === "component" && part.name === "ProjectCards") {
              return (
                <div key={idx} className={styles.projectCards}>
                  {(part.props.projects as ProjectCardData[]).map((project) => (
                    <Link
                      key={project.slug}
                      href={project.url}
                      className={styles.projectCard}
                    >
                      <span className={styles.projectCardTitle}>{project.title}</span>
                      <span className={styles.projectCardMeta}>
                        {project.category}{project.client ? ` · ${project.client}` : ""}{project.duration ? ` · ${project.duration}` : ""}
                      </span>
                      {project.description && (
                        <span className={styles.projectCardDesc}>{project.description}</span>
                      )}
                      <span className={styles.projectCardCta}>View case study →</span>
                    </Link>
                  ))}
                </div>
              );
            }
            return null;
          })}
          {workflowUI}
        </>
      )}
    </div>
  );
};

ChatMessageBubble.displayName = "ChatMessageBubble";

export default ChatMessageBubble;
