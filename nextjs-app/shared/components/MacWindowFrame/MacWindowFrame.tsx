import React from "react";
import { useTranslate } from "../../lib/translation";
import Button from "@dt/Button";
import Text from "@dt/Text";
import Title from "@dt/Title";
import styles from "./MacWindowFrame.module.css";

export interface MacWindowFrameProps {
  /** Translation key for the window title */
  titleKey?: string;
  /** Optional label for the action button */
  actionLabelKey?: string;
  /** Called when the action button is pressed */
  onAction?: () => void;
  /** Density variant */
  density?: "comfortable" | "compact";
  /** Content to render inside the frame */
  children: React.ReactNode;
  /** Optional className passthrough */
  className?: string;
}

const governanceBlueprint = {
  component_id: "mac_window_frame",
  semantic_role: "container",
  primary_function: "Display adaptive content within a macOS-inspired chrome",
  adaptive_level: "semi-adaptive",
  context_sensitivity: {
    user_role: true,
    device: true,
    intent: true,
  },
  mutation_rules: [
    "Adjust density based on viewport and density prop",
    "Elevate contrast in high-contrast themes",
    "Hide action button when no callback provided",
  ],
  transformation_rules: [
    "Frame → Code block for developer context",
    "Frame → Narrative transcript container for conversational context",
  ],
  governance_checks: [
    "Ensure header controls are decorative with aria-hidden",
    "Use tokenized background, border, and radius",
    "Respect prefers-reduced-motion for hover effects",
  ],
  performance_metrics: ["interaction_success_rate", "friction_score"],
  evolution_log: [],
} as const;

/**
 * MacWindowFrame component.
 */
export const MacWindowFrame: React.FC<MacWindowFrameProps> = ({
  titleKey = "macWindowFrame.title",
  actionLabelKey = "macWindowFrame.action",
  onAction,
  density = "comfortable",
  children,
  className = "",
}) => {
  const t = useTranslate();
  const hasAction = Boolean(onAction);

  return (
    <div
      className={`${styles.container} ${styles[density]} ${className}`}
      data-component-id={governanceBlueprint.component_id}
    >
      <div className={styles.header}>
        <div className={styles.controls} aria-hidden="true">
          <span className={`${styles.dot} ${styles.close}`} />
          <span className={`${styles.dot} ${styles.minimize}`} />
          <span className={`${styles.dot} ${styles.maximize}`} />
        </div>
        <Title as="h3" level={3} size="m" className={styles.title}>
          {/* || not just the destructure defaults: a cleared/seeded Controls
              text field passes "" and must fall back the same way */}
          {t(titleKey || "macWindowFrame.title")}
        </Title>
        {hasAction ? (
          <Button
            variant="tertiary"
            className={styles.action}
            onClick={onAction}
            accessibleName={t(actionLabelKey || "macWindowFrame.action")}
          >
            {t(actionLabelKey || "macWindowFrame.action")}
          </Button>
        ) : (
          <span className={styles.actionPlaceholder} aria-hidden="true" />
        )}
      </div>
      <div
        className={styles.body}
        role="group"
        aria-label={t("macWindowFrame.bodyLabel")}
      >
        <Text as="div" size="m" className={styles.content}>
          {children}
        </Text>
      </div>
    </div>
  );
};

MacWindowFrame.displayName = "MacWindowFrame";
// @ts-expect-error - governance is added for documentation/analysis purposes
MacWindowFrame.governance = governanceBlueprint;

export default MacWindowFrame;
