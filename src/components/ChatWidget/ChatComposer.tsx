import React, { useImperativeHandle, useRef } from "react";
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
}

export interface ChatComposerHandle {
  focusInput: () => void;
}

const ChatComposer = React.forwardRef<ChatComposerHandle, ChatComposerProps>(
  (
    {
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
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const resolvedPlaceholder =
      placeholder ??
      t("chatPlaceholder", "Ask about a project, service, or approach…");
    const resolvedLabel = label ?? t("chatInputLabel", "Ask Donny a question");
    const resolvedSendLabel = sendLabel ?? t("chatSend", "Send message");
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        focusInput: () => {
          if (textAreaRef.current) {
            textAreaRef.current.focus();
          }
        },
      }),
      [],
    );

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
          ref={textAreaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              // Trigger submit programmatically while preserving normal Enter behavior for newlines.
              const form = e.currentTarget.form;
              if (form) {
                e.preventDefault();
                // Construct a synthetic submit event to reuse existing logic.
                const submitEvent = new Event("submit", {
                  cancelable: true,
                  bubbles: true,
                });
                form.dispatchEvent(submitEvent);
              }
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
          "chatShortcutSubmit",
          "Press '⌘ + Enter' (Mac) or 'Ctrl + Enter' on PC to prompt instantly.",
        )}
      </Text>
    </form>
    );
  },
);

ChatComposer.displayName = "ChatComposer";

export default ChatComposer;
