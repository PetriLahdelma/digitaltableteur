"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
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
  /** Stagger delay for child animations (ms) */
  staggerDelay?: number;
}

export function ExpandableSection({
  collapsedLabel,
  expandedLabel,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  children,
  className,
  staggerDelay = 60,
}: ExpandableSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1], // ease-out-expo
              },
              opacity: {
                duration: 0.3,
                ease: [0.33, 1, 0.68, 1], // ease-out-cubic
              },
            }}
            className={styles.content}
          >
            <motion.div
              initial={{ y: 16 }}
              animate={{ y: 0 }}
              exit={{ y: 16 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1,
              }}
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
