import React, { useImperativeHandle, useRef } from "react";
import Button from "@dt/Button";
import { ChatTextArea } from "./ChatTextArea";
import Label from "@dt/Label";
import HelperText from "@dt/HelperText";
import styles from "./ChatWidget.module.css";
import { useTranslate } from "../../lib/translation";
import Icon from "@dt/Icon";

/**
 * Props for the ChatComposer component.
 *
 * @interface ChatComposerProps
 * @property {string} [labelId] - Optional ID for the label element (default: "donny-input-label")
 * @property {string} inputId - Required ID for the input element
 * @property {string} [placeholder] - Optional placeholder text for the textarea
 * @property {string} [label] - Optional label text
 * @property {string} [sendLabel] - Optional accessible label for the send button
 * @property {string} value - Current value of the textarea (controlled)
 * @property {function} onValueChange - Callback fired when textarea value changes
 * @property {function} onSubmit - Callback fired when form is submitted
 * @property {function} [onReset] - Callback fired when the inline reset button is clicked; button is hidden when omitted
 * @property {boolean} isSending - Whether a message is currently being sent (disables input)
 * @property {number} [maxLength] - Maximum character length (default: 1000)
 * @property {number} [minRows] - Minimum number of visible rows (controls initial height)
 * @property {number} [maxRows] - Maximum number of visible rows (controls max auto-grow height)
 */
export interface ChatComposerProps {
  labelId?: string;
  inputId: string;
  placeholder?: string;
  label?: string;
  sendLabel?: string;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset?: () => void;
  isSending: boolean;
  maxLength?: number;
  minRows?: number; // controls initial height
  maxRows?: number; // controls max auto-grow height
}

/**
 * Imperative handle interface for ChatComposer component.
 *
 * @interface ChatComposerHandle
 * @property {function} focusInput - Focuses the textarea input programmatically
 */
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
      onReset,
      isSending,
      maxLength = 1_000,
    },
    ref,
  ) => {
    const t = useTranslate();
    const resolvedPlaceholder =
      placeholder ??
      t("chatPlaceholder", "Ask about a project, service, or approach…");
    const resolvedLabel = label ?? t("chatInputLabel", "Ask Donny a question");
    const resolvedSendLabel = sendLabel ?? t("chatSend", "Send message");
    // Visible label; resolvedSendLabel stays the accessible name and
    // contains it, satisfying WCAG 2.5.3 Label in Name.
    const sendButtonText = t("chatSendLabel", "Send");
    const resetLabel = t("chatReset", "Clear");
    const resetAriaLabel = t("chatResetAria", "Clear conversation");
    const resetShortcutTitle = t(
      "chatResetShortcutTitle",
      "Clear conversation (⌘ + Shift + ⌫ on Mac, Ctrl + Shift + Backspace on Windows)",
    );
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
        <Label htmlFor={inputId} id={labelId}>
          {resolvedLabel}
        </Label>
        <div className={styles.inputRow}>
          {/* Column wrapper keeps the textarea and the hint/clear row the
              same width, so one padding rule aligns both with the input. */}
          <div className={styles.inputColumn}>
            {/* Relative shell lets the send button sit inside the input's
                borders while remaining a real submit button right after the
                textarea in DOM and tab order. */}
            <div className={styles.inputShell}>
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
                  return;
                }
                // ⌘/Ctrl + Shift + Backspace clears the conversation,
                // mirroring the inline clear button next to the shortcut hint.
                if (
                  e.key === "Backspace" &&
                  e.shiftKey &&
                  (e.metaKey || e.ctrlKey) &&
                  onReset &&
                  !isSending
                ) {
                  e.preventDefault();
                  onReset();
                }
              }}
            />
              <Button
                type="submit"
                className={styles.sendButton}
                aria-label={resolvedSendLabel}
                disabled={isSending || !(value ?? "").trim()}
                icon={<Icon name="paper-plane-tilt" size="sm" />}
                variant="tertiary"
                size="md"
              >
                {sendButtonText}
              </Button>
            </div>
            <div className={styles.hintRow}>
              <HelperText className={styles.shortcutHint}>
                {t(
                  "chatShortcutSubmit",
                  "Press '⌘ + Enter' (Mac) or 'Ctrl + Enter' to send.",
                )}
              </HelperText>
              {onReset && (
                <button
                  type="button"
                  className={styles.resetInline}
                  onClick={onReset}
                  disabled={isSending}
                  aria-label={resetAriaLabel}
                  title={resetShortcutTitle}
                >
                  <Icon name="arrow-clockwise" size="xs" />
                  {resetLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    );
  },
);

ChatComposer.displayName = "ChatComposer";

export default ChatComposer;
