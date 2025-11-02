import React from "react";
import Button from "@dt/Button";
import { IoSend } from "react-icons/io5";
import { ChatTextArea } from "../Inputs/TextArea";
import styles from "./ChatWidget.module.css";

interface ChatComposerProps {
  labelId?: string;
  inputId: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSending: boolean;
  maxLength?: number;
}

const ChatComposer: React.FC<ChatComposerProps> = ({
  labelId = "donny-input-label",
  inputId,
  placeholder,
  value,
  onValueChange,
  onSubmit,
  isSending,
  maxLength = 1_000,
}) => (
  <form className={styles.composer} onSubmit={onSubmit}>
    <label className={styles.inputLabel} htmlFor={inputId} id={labelId}>
      Ask Donny a question
    </label>
    <div className={styles.inputRow}>
      <ChatTextArea
        id={inputId}
        aria-labelledby={labelId}
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onValueChange={onValueChange}
        minRows={1}
        maxRows={6}
        maxLength={maxLength}
        disabled={isSending}
        aria-live="polite"
      />
      <Button
        type="submit"
        className={styles.sendButton}
        aria-label="Send message"
        disabled={isSending || !value.trim()}
        icon={<IoSend />}
        variant="primary"
        size="s"
      />
    </div>
  </form>
);

export default ChatComposer;
