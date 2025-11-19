import React from "react";
import Button from "@dt/Button";
import styles from "./ChatWidget.module.css";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";

interface ChatToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  controlsId?: string;
}

const ChatToggle = React.forwardRef<HTMLButtonElement, ChatToggleProps>(
  ({ isOpen, onToggle, controlsId }, ref) => {
    const { t } = useTranslation();
    const toggleLabel = t("chatToggleLabel", "Chat");
    const ariaLabel = isOpen
      ? t("chatToggleClose", "Hide chat")
      : t("chatToggleOpen", "Chat with Donny");

    return (
      <Button
        type="button"
        rounded
        className={styles.toggle}
        ref={ref}
        data-open={isOpen}
        onClick={onToggle}
        icon={<Icon name="chats-circle" ariaLabel={ariaLabel} />}
        aria-expanded={isOpen}
        aria-controls={controlsId}
        aria-label={ariaLabel}
        variant="primary"
        size="m"
      >
        <span className={styles.toggleLabel}>{toggleLabel}</span>
      </Button>
    );
  },
);

ChatToggle.displayName = "ChatToggle";

export default ChatToggle;
