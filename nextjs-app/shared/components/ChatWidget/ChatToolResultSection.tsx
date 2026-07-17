import React from "react";
import Icon from "@dt/Icon";
import styles from "./ChatWidget.module.css";
import type { ToolResultMeta } from "./messageProcessor";

export interface ChatToolResultSectionProps {
  meta?: ToolResultMeta;
  children: React.ReactNode;
}

const ChatToolResultSection: React.FC<ChatToolResultSectionProps> = ({
  meta,
  children,
}) => {
  if (!meta) {
    return <>{children}</>;
  }

  return (
    <section
      className={styles.toolResultSection}
      /* || not ??: an empty sectionTitle must not blank the region's
         accessible name — fall back to the tool label. */
      aria-label={meta.sectionTitle || meta.toolLabel}
    >
      <div className={styles.toolResultMeta}>
        <Icon name="Wrench" size="xs" decorative />
        <span className={styles.toolResultMetaLabel}>
          {meta.timestamp ? (
            <>
              <time dateTime={meta.timestampIso}>{meta.timestamp}</time>
              <span aria-hidden="true"> · </span>
            </>
          ) : null}
          Used {meta.toolLabel}
        </span>
      </div>
      {meta.sectionTitle ? (
        <h3 className={styles.toolSectionTitle}>{meta.sectionTitle}</h3>
      ) : null}
      {children}
    </section>
  );
};

ChatToolResultSection.displayName = "ChatToolResultSection";

export default ChatToolResultSection;
