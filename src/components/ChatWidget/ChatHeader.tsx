import React from "react";
import { IoChevronDown, IoRefresh } from "react-icons/io5";
import Button from "@dt/Button";
import styles from "./ChatWidget.module.css";

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
}) => (
  <header className={styles.header}>
    <div className={styles.headerCopy}>
      <p className={styles.tagline}>DT Donny</p>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>{description}</p>
    </div>
    <div className={styles.headerActions}>
      <Button
        type="button"
        onClick={onReset}
        disabled={isSending}
        aria-label="Reset conversation"
        variant="tertiary"
        size="s"
        icon={<IoRefresh />}
      >
        Reset
      </Button>
      <Button
        type="button"
        onClick={onMinimize}
        aria-label="Minimize chat"
        variant="tertiary"
        size="s"
        icon={<IoChevronDown />}
      />
    </div>
  </header>
);

export default ChatHeader;
