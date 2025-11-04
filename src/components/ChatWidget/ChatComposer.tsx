import React from "react";
import Button from "@dt/Button";
import { IoSend } from "react-icons/io5";
import { ChatTextArea } from "../Inputs/TextArea";
import styles from "./ChatWidget.module.css";
import { useTranslation } from "react-i18next";
import Text from "@dt/Text";

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
  minRows?: number; // controls initial height
  maxRows?: number; // controls max auto-grow height
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
  minRows = 1,
  maxRows = 6,
}) => {
  const { t } = useTranslation();
  const resolvedPlaceholder =
    placeholder ??
    t("chatPlaceholder", "Ask about a open hours, service, or approach…");
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
          minRows={minRows}
          maxRows={maxRows}
          maxLength={maxLength}
          disabled={isSending}
          aria-live="polite"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const isShift = e.shiftKey;
              if (!isShift) {
                // Send on plain Enter
                const form = e.currentTarget.form;
                if (form) {
                  e.preventDefault();
                  const submitEvent = new Event("submit", {
                    cancelable: true,
                    bubbles: true,
                  });
                  form.dispatchEvent(submitEvent);
                }
              }
              // If Shift+Enter, allow default (newline) by not preventing.
            }
          }}
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
      <Text
        size="S"
        terminals="sans"
        className={styles.shortcutHint}
        aria-live="polite"
      >
        {t(
          "chatShortcutHint",
          "Press Enter to send. Use Shift + Enter for a new line.",
        )}
      </Text>
    </form>
  );
};

export default ChatComposer;
