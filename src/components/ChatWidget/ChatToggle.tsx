import React from "react";
import Button from "@dt/Button";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import styles from "./ChatWidget.module.css";

interface ChatToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  controlsId?: string;
}

const ChatToggle = React.forwardRef<HTMLButtonElement, ChatToggleProps>(
  ({ isOpen, onToggle, controlsId }, ref) => (
    <Button
      type="button"
      rounded
      className={styles.toggle}
      ref={ref}
      data-open={isOpen}
      onClick={onToggle}
      icon={<IoChatbubbleEllipsesOutline />}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      aria-label={isOpen ? "Hide chat" : "Chat with Donny"}
      variant="primary"
      size="m"
    >
      <span className={styles.toggleLabel}>Chat</span>
    </Button>
  ),
);

ChatToggle.displayName = "ChatToggle";

export default ChatToggle;
