import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import styles from "./ChatWidget.module.css";

type ChatTextAreaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> & {
  minRows?: number;
  maxRows?: number;
  onValueChange?: (value: string) => void;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Enable smooth animated resizing (default: true for ChatTextArea) */
  animateResize?: boolean;
};

/** Thin auto-growing textarea used by the ChatWidget composer and email workflow. */
export const ChatTextArea = React.forwardRef<
  HTMLTextAreaElement,
  ChatTextAreaProps
>(
  (
    {
      className,
      minRows = 1,
      maxRows = 6,
      onValueChange,
      onChange,
      value,
      defaultValue,
      animateResize = true,
      ...rest
    },
    forwardedRef,
  ) => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const [internalValue, setInternalValue] = useState(
      (value ?? defaultValue ?? "") as string,
    );
    const isControlled = value !== undefined;
    const currentValue = isControlled
      ? (value as string)
      : (internalValue as string);

    useImperativeHandle(
      forwardedRef,
      () => textAreaRef.current as HTMLTextAreaElement,
    );

    const resize = useCallback(() => {
      const element = textAreaRef.current;
      if (!element) return;

      if (!animateResize) {
        // Non-animated resize (instant)
        element.style.height = "auto";
        const computed = window.getComputedStyle(element);
        const lineHeight = parseFloat(computed.lineHeight || "20");
        const verticalPadding =
          parseFloat(computed.paddingTop || "0") +
          parseFloat(computed.paddingBottom || "0");
        const borderWidth =
          parseFloat(computed.borderTopWidth || "0") +
          parseFloat(computed.borderBottomWidth || "0");
        const maxHeight = lineHeight * maxRows + verticalPadding + borderWidth;
        const newHeight = Math.min(element.scrollHeight, maxHeight);
        element.style.height = `${Math.max(newHeight, lineHeight * minRows + verticalPadding + borderWidth)}px`;
        element.style.overflowY =
          element.scrollHeight > maxHeight ? "auto" : "hidden";
        return;
      }

      // Animated resize
      const currentHeight = element.getBoundingClientRect().height;
      element.style.height = "auto";

      const computed = window.getComputedStyle(element);
      const lineHeight = parseFloat(computed.lineHeight || "20");
      const verticalPadding =
        parseFloat(computed.paddingTop || "0") +
        parseFloat(computed.paddingBottom || "0");
      const borderWidth =
        parseFloat(computed.borderTopWidth || "0") +
        parseFloat(computed.borderBottomWidth || "0");

      const minHeight = lineHeight * minRows + verticalPadding + borderWidth;
      const maxHeight = lineHeight * maxRows + verticalPadding + borderWidth;
      const targetHeight = Math.max(
        minHeight,
        Math.min(element.scrollHeight, maxHeight),
      );

      // Set overflow
      if (element.scrollHeight > maxHeight) {
        element.style.overflowY = "auto";
      } else {
        element.style.overflowY = "hidden";
      }

      // Animate using RAF
      requestAnimationFrame(() => {
        if (element) {
          element.style.height = `${currentHeight}px`;
          requestAnimationFrame(() => {
            if (element) {
              element.style.height = `${targetHeight}px`;
            }
          });
        }
      });
    }, [maxRows, minRows, animateResize]);

    useEffect(() => {
      if (typeof window !== "undefined") {
        resize();
      }
    }, [currentValue, resize]);

    useEffect(() => {
      if (!isControlled) {
        setInternalValue((defaultValue ?? "") as string);
      }
    }, [defaultValue, isControlled]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) {
        setInternalValue(event.target.value);
      }
      onValueChange?.(event.target.value);
      onChange?.(event);
    };

    const assignRef = (node: HTMLTextAreaElement | null) => {
      textAreaRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const combinedClassName = [styles.chatTextArea, className]
      .filter(Boolean)
      .join(" ");

    return (
      <textarea
        {...rest}
        ref={assignRef}
        className={combinedClassName}
        rows={minRows}
        value={currentValue}
        onChange={handleChange}
      />
    );
  },
);

ChatTextArea.displayName = "ChatTextArea";
