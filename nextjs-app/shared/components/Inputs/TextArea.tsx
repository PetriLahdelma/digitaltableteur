import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import styles from "./Inputs.module.css";
import Label from "@dt/Label";
import HelperText from "@dt/HelperText";

interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label: string;
  value?: string;
  error?: string;
  helperText?: string;
  onChange?: (value: string) => void;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  placeholder,
  value = "",
  error,
  helperText,
  onChange,
  disabled = false,
  rows = 4,
  ...rest
}) => {
  const [textValue, setTextValue] = useState(value);

  useEffect(() => {
    setTextValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  return (
    <div className={styles["input-container"]}>
      <Label
        htmlFor={label}
        required={!!error}
        tooltipText={error}
        disabled={disabled}
      >
        {label}
      </Label>
      <textarea
        id={label}
        className={`${styles.input} ${error ? styles.error : ""}`}
        placeholder={placeholder}
        value={textValue}
        onChange={handleChange}
        disabled={disabled}
        rows={rows}
        {...rest}
      />
      {error && <HelperText state="error">{error}</HelperText>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </div>
  );
};

export default TextArea;

type ChatTextAreaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> & {
  minRows?: number;
  maxRows?: number;
  onValueChange?: (value: string) => void;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

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
    }, [maxRows, minRows]);

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
