import React, { useImperativeHandle, useRef } from "react";
import Button from "@dt/Button";
import { ChatTextArea } from "./ChatTextArea";
import Label from "@dt/Label";
import Text from "@dt/Text";
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
 * @property {function} [onReset] - Callback for the ⌘/Ctrl + Shift + Backspace shortcut (the visible control is the header's New chat button)
 * @property {React.ReactNode} [footer] - Fine print under the input (the accuracy note and its link)
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
  /** Fine print under the input: the accuracy note and its link. */
  footer?: React.ReactNode;
  /** Interrupts a streaming reply without discarding the conversation. */
  onStop?: () => void;
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

/** True on phones and tablets without a mouse: their Return key has no easy Shift. */
const isTouchKeyboard = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: none) and (pointer: coarse)")?.matches === true;

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
      onStop,
      footer,
      isSending,
      maxLength = 1_000,
    },
    ref,
  ) => {
    const t = useTranslate();
    const resolvedPlaceholder =
      placeholder ??
      t("chatPlaceholder", "Ask about a project, service or approach…");
    // || not ??: Storybook's seeded text controls pass "", and an empty
    // accessible name is never valid — fall back to the translations.
    const resolvedLabel = label || t("chatInputLabel", "Ask Donny a question");
    const resolvedSendLabel = sendLabel || t("chatSend", "Send message");
    // Visible label; resolvedSendLabel stays the accessible name and
    // contains it, satisfying WCAG 2.5.3 Label in Name.
    const sendButtonText = t("chatSendLabel", "Send");
    const canStop = isSending && Boolean(onStop);
    const stopLabel = t("chatStop", "Stop response");
    // No visible shortcut hint: Enter sends and Shift + Enter adds a line,
    // the convention of chat inputs. Screen readers still hear it.
    const shortcutHint = t(
      "chatShortcutHint",
      "Press Enter to send. Use Shift + Enter for a new line.",
    );
    const hintId = `${inputId}-hint`;
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
          {/* Column wrapper keeps the textarea and the fine print under it
              the same width, so one padding rule aligns both. */}
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
              readOnly={isSending}
              ref={textAreaRef}
              aria-describedby={hintId}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // The Enter that confirms an IME composition (Japanese,
                  // Chinese, Korean) must not send the half-typed message.
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                  const withModifier = e.metaKey || e.ctrlKey;
                  if (e.shiftKey && !withModifier) return;
                  // On touch keyboards Return adds a line (there is no easy
                  // Shift) and the Send button sends; ⌘/Ctrl + Enter still
                  // sends from a hardware keyboard.
                  if (!withModifier && isTouchKeyboard()) return;
                  e.preventDefault();
                  if (isSending || !(value ?? "").trim()) return;
                  // Reuse the form's submit logic with a synthetic event.
                  e.currentTarget.form?.dispatchEvent(
                    new Event("submit", { cancelable: true, bubbles: true }),
                  );
                  return;
                }
                // ⌘/Ctrl + Shift + Backspace clears the conversation, the
                // shortcut for the header's New chat button.
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
                type={canStop ? "button" : "submit"}
                className={styles.sendButton}
                aria-label={canStop ? stopLabel : resolvedSendLabel}
                onClick={canStop ? onStop : undefined}
                disabled={!canStop && (isSending || !(value ?? "").trim())}
                icon={<Icon name={canStop ? "stop" : "paper-plane-tilt"} size="sm" />}
                variant="tertiary"
                size="md"
              >
                {canStop ? t("chatStopLabel", "Stop") : sendButtonText}
              </Button>
            </div>
            <span id={hintId} className={styles.visuallyHidden}>
              {shortcutHint}
            </span>
            {footer ? (
              <Text as="p" size="xs" className={styles.composerFooter}>
                {footer}
              </Text>
            ) : null}
          </div>
        </div>
      </form>
    );
  },
);

ChatComposer.displayName = "ChatComposer";

export default ChatComposer;
