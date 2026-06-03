import React from "react";
import styles from "./PageLayout.module.css";

export interface PageLayoutProps {
  /**
   * Content to be displayed within the layout
   */
  children: React.ReactNode;

  /**
   * Maximum width constraint for the content
   * @default "lg"
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";

  /**
   * Whether to use the 12-column grid system
   * @default false
   */
  grid?: boolean;

  /**
   * Number of columns for grid layout (only applies when grid=true)
   * Automatically responsive: 4 cols mobile, 8 cols tablet, 12 cols desktop
   */
  columns?: number;

  /**
   * Vertical spacing between sections
   * @default "default"
   */
  spacing?: "compact" | "default" | "comfortable" | "spacious";

  /**
   * Apply consistent page margins
   * @default true
   */
  withMargins?: boolean;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Semantic HTML element to use for the container
   * @default "div"
   */
  as?: "div" | "main" | "section" | "article";

  /**
   * ARIA role for accessibility
   */
  role?: string;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;

  style?: React.CSSProperties;
}

/**
 * PageLayout provides a consistent, responsive layout container with optional grid system.
 * Implements a 12-column grid on desktop, 8 columns on tablet, and 4 columns on mobile.
 *
 * @example
 * ```tsx
 * <PageLayout maxWidth="lg" spacing="comfortable">
 *   <h1>Page Title</h1>
 *   <p>Content goes here...</p>
 * </PageLayout>
 * ```
 *
 * @example With Grid
 * ```tsx
 * <PageLayout grid maxWidth="xl">
 *   <div style={{ gridColumn: 'span 6' }}>Left column</div>
 *   <div style={{ gridColumn: 'span 6' }}>Right column</div>
 * </PageLayout>
 * ```
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  maxWidth = "lg",
  grid = false,
  columns,
  spacing = "default",
  withMargins = true,
  className = "",
  as: Component = "div",
  role,
  ariaLabel,
  style,
}) => {
  const classNames = [
    styles.pageLayout,
    styles[`maxWidth${maxWidth.charAt(0).toUpperCase() + maxWidth.slice(1)}`],
    styles[`spacing${spacing.charAt(0).toUpperCase() + spacing.slice(1)}`],
    grid && styles.grid,
    withMargins && styles.withMargins,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const gridStyle = (() => {
    if (!grid || columns == null) return {};
    const n = Math.max(1, Math.floor(Number(columns)));
    if (!Number.isFinite(n)) return {};
    return { gridTemplateColumns: `repeat(${n}, 1fr)` } as React.CSSProperties;
  })();

  return (
    <Component
      className={classNames}
      style={gridStyle}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </Component>
  );
};

export default PageLayout;
