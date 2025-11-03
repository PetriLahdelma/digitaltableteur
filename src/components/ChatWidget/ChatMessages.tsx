import React from "react";
import styles from "./ChatWidget.module.css";
import type { Message } from "./ChatWidget.types";

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages = React.forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages }, ref) => (
    <div className={styles.messages} ref={ref}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={styles.message}
          data-role={message.role}
        >
          <p>{message.content}</p>
        </div>
      ))}
    </div>
  ),
);

ChatMessages.displayName = "ChatMessages";

export default ChatMessages;
