import React from "react";
import Button from "@dt/Button";
import { IoSend } from "react-icons/io5";
import { ChatTextArea } from "../Inputs/TextArea";
import styles from "./ChatWidget.module.css";
import { useTranslation } from "react-i18next";

interface ChatComposerProps {
  labelId?: string;
  inputId: string;
  placeholder?: string;
  label?: string;
  sendLabel?: string;
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
  label,
  sendLabel,
  value,
  onValueChange,
  onSubmit,
  isSending,
  maxLength = 1_000,
}) => {
  const { t } = useTranslation();
  const resolvedPlaceholder =
    placeholder ??
    t("chatPlaceholder", "Ask about a project, service, or approach…");
  const resolvedLabel = label ?? t("chatInputLabel", "Ask Donny a question");
  const resolvedSendLabel = sendLabel ?? t("chatSend", "Send message");

  return (
    <form className={styles.composer} onSubmit={onSubmit}>
      <label className={styles.inputLabel} htmlFor={inputId} id={labelId}>
        {resolvedLabel}
      </label>
      <div className={styles.inputRow}>
        <ChatTextArea
          id={inputId}
          aria-labelledby={labelId}
          className={styles.input}
          placeholder={resolvedPlaceholder}
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
          aria-label={resolvedSendLabel}
          disabled={isSending || !value.trim()}
          icon={<IoSend />}
          variant="primary"
          size="m"
        />
      </div>
    </form>
  );
};

export default ChatComposer;
