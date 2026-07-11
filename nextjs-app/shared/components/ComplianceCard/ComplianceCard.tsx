import React, { useState, useRef, useCallback } from "react";
import { useTranslate } from "../../lib/translation";
import Card from "@dt/Card";
import Icon from "@dt/Icon";
import Title from "@dt/Title";
import Text from "@dt/Text";
import styles from "./ComplianceCard.module.css";

export type ComplianceStatus = "pass" | "warning" | "fail";

export interface ComplianceRule {
  id: string;
  rule: string;
  status: ComplianceStatus;
  details: string;
}

export interface ComplianceCardProps {
  title: string;
  titleIcon?: React.ReactNode;
  rules: ComplianceRule[];
  className?: string;
  /** Date when compliance was last reviewed (format: YYYY-MM-DD or Date object) */
  lastReviewed?: string | Date;
}

const STATUS_ICON_MAP: Record<ComplianceStatus, string> = {
  pass: "check-fat",
  warning: "warning",
  fail: "x-circle",
};

const STATUS_COLOR_MAP: Record<ComplianceStatus, string> = {
  pass: "var(--color-success)",
  warning: "var(--color-warning-contrast)",
  fail: "var(--color-error)",
};

// Resize bounds. Keep in sync with min/max-height and min/max-width in
// ComplianceCard.module.css. Defaults MUST stay within these ranges.
const TABLE_MIN_HEIGHT = 200;
const TABLE_MAX_HEIGHT = 800;
const TABLE_MIN_WIDTH = 400;
const TABLE_MAX_WIDTH = 1200;
const TABLE_DEFAULT_HEIGHT = TABLE_MAX_HEIGHT;
const TABLE_DEFAULT_WIDTH = 800;

/**
 * ComplianceCard component.
 */
export const ComplianceCard: React.FC<ComplianceCardProps> = ({
  title,
  titleIcon,
  rules,
  className,
  lastReviewed,
}) => {
  const t = useTranslate();

  const formattedDate = React.useMemo(() => {
    if (!lastReviewed) return null;
    const date =
      lastReviewed instanceof Date ? lastReviewed : new Date(lastReviewed);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [lastReviewed]);
  const [tableHeight, setTableHeight] = useState<number>(TABLE_DEFAULT_HEIGHT);
  const [tableWidth, setTableWidth] = useState<number>(TABLE_DEFAULT_WIDTH);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "nwse-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !tableWrapperRef.current) return;

    const rect = tableWrapperRef.current.getBoundingClientRect();
    const newHeight = e.clientY - rect.top;
    const newWidth = e.clientX - rect.left;

    if (newHeight >= TABLE_MIN_HEIGHT && newHeight <= TABLE_MAX_HEIGHT) {
      setTableHeight(newHeight);
    }
    if (newWidth >= TABLE_MIN_WIDTH && newWidth <= TABLE_MAX_WIDTH) {
      setTableWidth(newWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <Card
      className={[className, styles.fitContent].filter(Boolean).join(" ")}
    >
      {/* Custom header with icon and title */}
      {(title || titleIcon) && (
        <div className={styles.header}>
          {titleIcon && <span className={styles.headerIcon}>{titleIcon}</span>}
          <div className={styles.headerContent}>
            <Title level={2} className={styles.headerTitle}>
              {title}
            </Title>
            {formattedDate && (
              <Text
                as="div"
                size="s"
                className={styles.headerDate}
              >
                {t("complianceCard.lastReviewed", { date: formattedDate })}
              </Text>
            )}
          </div>
        </div>
      )}

      <div
        ref={tableWrapperRef}
        className={styles.tableWrapper}
        style={{ height: `${tableHeight}px`, width: `${tableWidth}px` }}
      >
        <div className={styles.gridContainer}>
          {rules.map((rule) => (
            <div key={rule.id} className={styles.ruleCard}>
              <div className={styles.ruleHeader}>
                <Text
                  as="span"
                  size="s"
                  className={styles.ruleLabel}
                >
                  {rule.rule}
                </Text>
                <Icon
                  name={STATUS_ICON_MAP[rule.status]}
                  color={STATUS_COLOR_MAP[rule.status]}
                  weight="fill"
                  ariaLabel={t(`complianceCard.status.${rule.status}`)}
                />
              </div>
              <Text
                as="div"
                size="s"
                className={styles.ruleDetails}
              >
                {rule.details}
              </Text>
            </div>
          ))}
        </div>
        <div
          className={styles.resizeHandle}
          onMouseDown={handleMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-label={t("complianceCard.resizeHandle")}
          aria-valuenow={Math.round(
            ((tableHeight - TABLE_MIN_HEIGHT) /
              (TABLE_MAX_HEIGHT - TABLE_MIN_HEIGHT)) *
              100,
          )}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
        />
      </div>
    </Card>
  );
};

export default ComplianceCard;
