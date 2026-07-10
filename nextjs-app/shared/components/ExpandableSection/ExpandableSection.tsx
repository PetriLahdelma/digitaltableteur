"use client";

import { useState, useRef, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/cn";
import styles from "./ExpandableSection.module.css";

export interface ExpandableSectionProps {
  /** Trigger label when collapsed */
  collapsedLabel: string;
  /** Trigger label when expanded (optional, defaults to collapsedLabel) */
  expandedLabel?: string;
  /** Whether the section is initially expanded */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Callback when expansion state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Content to reveal */
  children: ReactNode;
  /** Additional className for the container */
  className?: string;
}

export function ExpandableSection({
  collapsedLabel,
  expandedLabel,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  children,
  className,
}: ExpandableSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;
  // Reduced-motion bypass: framer-motion's MotionConfig only skips transforms
  // (x/y/scale), not opacity/height. Under reduce we therefore set the morph
  // animation duration to 0 so axe never samples partial-opacity expansion
  // frames (which were tripping color-contrast on the revealed body copy).
  const prefersReducedMotion = useReducedMotion();
  const morphTransition = prefersReducedMotion
    ? { height: { duration: 0 }, opacity: { duration: 0 } }
    : {
        height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
        opacity: { duration: 0.3, ease: [0.33, 1, 0.68, 1] as const },
      };
  const innerTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const, delay: 0.1 };

  const contentRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const newValue = !isExpanded;
    if (!isControlled) {
      setInternalExpanded(newValue);
    }
    onExpandedChange?.(newValue);
  };

  const label = isExpanded ? (expandedLabel || collapsedLabel) : collapsedLabel;

  return (
    <div className={cn(styles.container, className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleToggle}
        className={styles.trigger}
        aria-expanded={isExpanded}
      >
        <span
          className={cn(styles.icon, isExpanded && styles.iconExpanded)}
          aria-hidden="true"
        >
          +
        </span>
        <span>{label}</span>
      </button>

      {/* Expandable content with morphing animation */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            ref={contentRef}
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={morphTransition}
            className={styles.content}
          >
            <motion.div
              initial={prefersReducedMotion ? false : { y: 16 }}
              animate={{ y: 0 }}
              exit={prefersReducedMotion ? { y: 0 } : { y: 16 }}
              transition={innerTransition}
              className={styles.inner}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

ExpandableSection.displayName = "ExpandableSection";
