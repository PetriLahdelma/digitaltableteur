import React from "react";
import { useTranslate } from "../../lib/translation";
import styles from "./AIProcessingState.module.css";

/**
 * AIProcessingState component
 *
 * Indicates LLM cognitive processing state with an animated gradient effect.
 * This is NOT a skeleton loader - it represents uncertainty and mental progress
 * rather than a predictable content structure.
 *
 * Design rationale:
 * - Skeletons imply known structure being filled in
 * - This component indicates cognitive processing without predicting output shape
 * - Provides presence/aliveness feedback during thinking state
 *
 * @example
 * ```tsx
 * <AIProcessingState mode="thinking" />
 * <AIProcessingState mode="generating" intensity="prominent" />
 * ```
 */

export type ProcessingMode = "thinking" | "generating" | "analyzing";
export type IntensityLevel = "subtle" | "moderate" | "prominent";

export interface AIProcessingStateProps {
  /**
   * The cognitive processing mode to display
   * @default "thinking"
   */
  mode?: ProcessingMode;

  /**
   * Visual intensity of the animation
   * @default "subtle"
   */
  intensity?: IntensityLevel;

  /**
   * Custom message override (if translation not desired)
   */
  customMessage?: string;

  /**
   * Additional CSS class for styling extension
   */
  className?: string;
}

/**
 * AIProcessingState - Cognitive processing feedback component for LLM interactions
 *
 * Displays an animated gradient indicator when the AI is processing a response.
 * Unlike skeleton loaders, this component indicates mental progress without
 * predicting the output structure.
 */
const AIProcessingState: React.FC<AIProcessingStateProps> = ({
  mode = "thinking",
  intensity = "subtle",
  customMessage,
  className = "",
}) => {
  const t = useTranslate();

  // Get localized message based on mode
  const getMessage = (): string => {
    if (customMessage) return customMessage;

    switch (mode) {
      case "thinking":
        return t("chat.ai.thinking");
      case "generating":
        return t("chat.ai.generating");
      case "analyzing":
        return t("chat.ai.analyzing");
      default:
        return t("chat.ai.thinking");
    }
  };

  const message = getMessage();

  const intensityClass = `intensity${intensity.charAt(0).toUpperCase()}${intensity.slice(1)}`;

  return (
    <div
      className={`${styles.container} ${styles[intensityClass]} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
      data-testid="ai-processing-state"
      data-mode={mode}
      data-intensity={intensity}
    >
      <span className={styles.text} aria-hidden="true">
        {message}
      </span>
    </div>
  );
};

export default AIProcessingState;
