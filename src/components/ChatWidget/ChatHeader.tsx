import React from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import Button from "@dt/Button";
import styles from "./ChatWidget.module.css";
import { useTranslation } from "react-i18next";

interface ChatHeaderProps {
  title: string;
  description: string;
  onReset: () => void;
  onMinimize: () => void;
  isSending: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  description,
  onReset,
  onMinimize,
  isSending,
}) => {
  const { t } = useTranslation();
  const tagline = t("chatTagline", "DT Donny");
  const resetLabel = t("chatReset", "Reset");
  const resetAriaLabel = t("chatResetAria", "Reset conversation");
  const minimizeAriaLabel = t("chatMinimizeAria", "Minimize chat");

  return (
    <header className={styles.header}>
      <div className={styles.headerCopy}>
        <p className={styles.tagline}>{tagline}</p>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{description}</p>
      </div>
      <div className={styles.headerActions}>
        <Button
          type="button"
          onClick={onReset}
          disabled={isSending}
          aria-label={resetAriaLabel}
          variant="tertiary"
          size="s"
          icon={<IoMdRefresh />}
        >
          {resetLabel}
        </Button>
        <Button
          type="button"
          onClick={onMinimize}
          aria-label={minimizeAriaLabel}
          variant="tertiary"
          size="s"
          icon={<FaChevronDown />}
        />
      </div>
    </header>
  );
};

export default ChatHeader;
