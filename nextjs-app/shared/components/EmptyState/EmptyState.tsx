import React from "react";
import { cn } from "@/lib/utils";
import Icon from "@dt/Icon";
import Text from "@dt/Text";
import Title from "@dt/Title";
import styles from "./EmptyState.module.css";

export type EmptyStateSize = "sm" | "md" | "lg";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Phosphor icon name rendered decoratively above the title. */
  icon?: string;
  /** Short headline stating what is empty. */
  title: string;
  /** One or two sentences explaining why, or what to do next. */
  description?: string;
  /** Heading tag for the title. @default "h2" */
  headingLevel?: "h2" | "h3" | "h4";
  /** Size token. @default "md" */
  size?: EmptyStateSize;
  /** Action slot — typically one primary Button, optionally a secondary. */
  children?: React.ReactNode;
}

const titleSizeMap = { sm: "xxs", md: "xs", lg: "s" } as const;
const textSizeMap = { sm: "xs", md: "s", lg: "m" } as const;
const iconSizeMap = { sm: "lg", md: "xl", lg: "2xl" } as const;

/** Placeholder block for empty lists, searches, and first-run screens. */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { icon, title, description, headingLevel = "h2", size = "md", children, className, ...rest },
    ref,
  ) => (
    <div ref={ref} className={cn(styles.root, styles[size], className)} {...rest}>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          <Icon name={icon} size={iconSizeMap[size]} decorative />
        </span>
      ) : null}
      <Title as={headingLevel} size={titleSizeMap[size]} className={styles.title}>
        {title}
      </Title>
      {description ? (
        <Text as="p" size={textSizeMap[size]} className={styles.description}>
          {description}
        </Text>
      ) : null}
      {children ? <div className={styles.actions}>{children}</div> : null}
    </div>
  ),
);

EmptyState.displayName = "EmptyState";

export default EmptyState;
