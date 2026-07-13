import React from "react";
import { Link } from "../../lib/linkComponent";
import { Image } from "../../lib/imageComponent";
import { useTranslate, type Translate } from "../../lib/translation";
import styles from "./ChatWidget.module.css";
import MarkdownMessage from "@dt/MarkdownMessage";
import OpenHours from "@dt/OpenHours/OpenHours";
import ServicesGrid from "@dt/ServicesGrid/ServicesGrid";
import StudioMap from "@dt/StudioMap/StudioMap";
import AIProcessingState from "./AIProcessingState";
import ChatToolResultSection from "./ChatToolResultSection";
import DonnyBookingEmbed from "@dt/DonnyBookingEmbed";
import type {
  ProcessedMessage,
  ProcessedPart,
  ProjectCardData,
  ServicePackageCardData,
  FollowUpDraftData,
  BookingEmbedData,
} from "./messageProcessor";
import { useStreamingText } from "../../hooks/useStreamingText";

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

function renderProjectCard(project: ProjectCardData) {
  return (
    <Link key={project.slug} href={project.url} className={styles.projectCard}>
      {project.thumbnail ? (
        <Image
          src={project.thumbnail}
          alt=""
          width={40}
          height={40}
          className={styles.projectCardThumb}
        />
      ) : null}
      <div className={styles.projectCardBody}>
        <span className={styles.projectCardTitle}>{project.title}</span>
        <span className={styles.projectCardMeta}>
          {project.category}
          {project.client ? ` · ${project.client}` : ""}
          {project.duration ? ` · ${project.duration}` : ""}
        </span>
        {project.description ? (
          <span className={styles.projectCardDesc}>{project.description}</span>
        ) : null}
        <span className={styles.projectCardCta}>View case study →</span>
      </div>
    </Link>
  );
}

function renderComponentPart(
  part: Extract<ProcessedPart, { kind: "component" }>,
  idx: number,
  t: Translate,
): React.ReactNode {
  const wrap = (children: React.ReactNode) => (
    <ChatToolResultSection key={idx} meta={part.meta}>
      {children}
    </ChatToolResultSection>
  );

  if (part.name === "OpenHours") {
    return (
      <div key={idx} className={styles.fullWidthComponent}>
        <OpenHours compact={part.props?.compact} />
      </div>
    );
  }
  if (part.name === "ServicesGrid") {
    return (
      <div key={idx} className={styles.fullWidthComponent}>
        <ServicesGrid />
      </div>
    );
  }
  if (part.name === "StudioMap") {
    return (
      <div key={idx} className={styles.fullWidthComponent}>
        <StudioMap compact={part.props?.compact} />
      </div>
    );
  }
  if (part.name === "NavigateLink") {
    return wrap(
      <div className={styles.toolResultCard}>
        <Link href={part.props.url} className={styles.navigateLink}>
          {t("chatNavigateTo", "Go to {{page}}", {
            page: part.props.label || part.props.url,
          })}{" "}
          →
        </Link>
      </div>,
    );
  }
  if (part.name === "VertaaUxAccessibilityOffer") {
    return wrap(
      <div className={styles.toolResultCard}>
        <div className={styles.vertaauxOffer}>
          <Link href={part.props.caseStudyUrl} className={styles.navigateLink}>
            {t("chatVertaauxCaseStudy", "Read the VertaaUX case study")} →
          </Link>
          <a
            href={part.props.productUrl}
            className={styles.navigateLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("chatVertaauxProduct", "Score your accessibility with VertaaUX")} →
          </a>
        </div>
      </div>,
    );
  }
  if (part.name === "ProjectCards") {
    return wrap(
      <div className={styles.projectCards}>
        {(part.props.projects as ProjectCardData[]).map(renderProjectCard)}
      </div>,
    );
  }
  if (part.name === "ServicePackageCards") {
    const { packages, pricingUrl } = part.props as {
      packages: ServicePackageCardData[];
      pricingUrl: string;
    };
    return wrap(
      <div className={styles.projectCards}>
        {packages.map((pkg) => (
          <Link
            key={pkg.id}
            href={`${pricingUrl}#${pkg.id}`}
            className={`${styles.projectCard}${pkg.recommended ? ` ${styles.packageRecommended}` : ""}`}
          >
            <div className={styles.projectCardBody}>
              <span className={styles.projectCardTitle}>
                {pkg.name}
                {pkg.recommended
                  ? ` · ${t("chatRecommendedPackage", "Recommended")}`
                  : ""}
              </span>
              <span className={styles.projectCardMeta}>
                {pkg.priceRangeEur} · {pkg.duration}
              </span>
              {pkg.description ? (
                <span className={styles.projectCardDesc}>{pkg.description}</span>
              ) : null}
              <span className={styles.projectCardCta}>
                {t("chatViewPricing", "View on pricing")} →
              </span>
            </div>
          </Link>
        ))}
      </div>,
    );
  }
  if (part.name === "FollowUpDraft") {
    const draftProps = part.props as FollowUpDraftData;
    const copyText = `${draftProps.subject}\n\n${draftProps.body}`;
    return wrap(
      <div className={styles.toolResultCard}>
        <div className={styles.followUpDraft}>
          <p className={styles.followUpDraftSubject}>{draftProps.subject}</p>
          <pre className={styles.followUpDraftBody}>{draftProps.body}</pre>
          <p className={styles.followUpDraftDisclaimer}>{draftProps.disclaimer}</p>
          <div className={styles.followUpDraftActions}>
            <button
              type="button"
              className={styles.followUpDraftCopy}
              onClick={() => {
                void navigator.clipboard?.writeText(copyText);
              }}
            >
              {t("chatCopyDraft", "Copy draft")}
            </button>
            <Link href={draftProps.contactUrl} className={styles.navigateLink}>
              {t("chatOpenContact", "Open contact form")} →
            </Link>
          </div>
        </div>
      </div>,
    );
  }
  if (part.name === "BookingEmbed") {
    const bookingProps = part.props as BookingEmbedData;
    return wrap(
      <div className={styles.toolResultCard}>
        <DonnyBookingEmbed {...bookingProps} />
      </div>,
    );
  }
  return null;
}

interface StreamingMarkdownPartProps {
  content: string;
  fallback: string;
  role: ProcessedMessage["role"];
  isStreaming: boolean;
}

function StreamingMarkdownPart({
  content,
  fallback,
  role,
  isStreaming,
}: StreamingMarkdownPartProps) {
  const displayedContent = useStreamingText(content, isStreaming);

  return (
    <MarkdownMessage
      content={displayedContent}
      fallback={fallback}
      data-role={role}
      density={role === "assistant" ? "chat" : "default"}
    />
  );
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isStreaming,
  workflowUI,
}) => {
  const t = useTranslate();
  const isAssistant = message.role === "assistant";
  const thinking = t("chatThinking", "Thinking…");
  const fallback = isAssistant ? (isStreaming ? thinking : "") : "";

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
                <StreamingMarkdownPart
                  key={idx}
                  content={part.content}
                  fallback={fallback}
                  role={message.role}
                  isStreaming={isAssistant && isStreaming}
                />
              );
            }
            return renderComponentPart(part, idx, t);
          })}
          {workflowUI}
        </>
      )}
    </div>
  );
};

ChatMessageBubble.displayName = "ChatMessageBubble";

export default ChatMessageBubble;
