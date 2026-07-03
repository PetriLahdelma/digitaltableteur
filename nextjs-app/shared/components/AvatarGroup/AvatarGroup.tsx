import React, { Children } from "react";
import { cn } from "@/lib/utils";
import styles from "./AvatarGroup.module.css";

export type AvatarGroupSize = "sm" | "md" | "lg";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible name for the cluster (e.g. "Project members"). */
  ariaLabel?: string;
  /** Avatars beyond this count collapse into a "+N" bubble. @default 4 */
  max?: number;
  /**
   * Size of the overflow bubble; children Avatars should match
   * (sm=2rem, md=2.5rem, lg=3rem). @default "md"
   */
  size?: AvatarGroupSize;
  /** @dt/Avatar elements (all the same size). */
  children: React.ReactNode;
}

/** Overlapping stack of Avatars with a +N overflow bubble. */
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ ariaLabel, max = 4, size = "md", children, className, ...rest }, ref) => {
    const items = Children.toArray(children);
    const visible = items.slice(0, Math.max(0, max));
    const overflow = items.length - visible.length;

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        className={cn(styles.group, styles[size], className)}
        {...rest}
      >
        {visible.map((child, index) => (
          <span key={index} className={styles.item}>
            {child}
          </span>
        ))}
        {overflow > 0 ? (
          <span className={cn(styles.item, styles.overflow)}>
            <span aria-hidden="true">+{overflow}</span>
            <span className={styles.srOnly}>{`${overflow} more`}</span>
          </span>
        ) : null}
      </div>
    );
  },
);

AvatarGroup.displayName = "AvatarGroup";

export default AvatarGroup;
