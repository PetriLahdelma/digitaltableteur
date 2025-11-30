"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import Title from "@dt/Title";
import Text from "@dt/Text";
import styles from "./Card.module.css";

const flattenChildren = (children: React.ReactNode): React.ReactNode[] =>
  React.Children.toArray(children).flatMap((child) =>
    React.isValidElement(child) && child.type === React.Fragment
      ? flattenChildren(child.props.children)
      : [child],
  );

export interface CardProps {
  /** Card size with max-width constraints */
  size?: "S" | "M" | "L" | "full";
  /** Show header with icon and title */
  showHeader?: boolean;
  /** Leading icon element */
  icon?: React.ReactNode;
  /** Card title text */
  title?: string;
  /** Title size variant */
  titleSize?: "XS" | "S" | "M" | "L" | "XL";
  /** Whether title uses sans-serif terminals */
  titleSans?: boolean;
  /** Optional header actions (icon or tertiary buttons) aligned to the right */
  headerActions?: React.ReactNode;
  /** Show footer with actions */
  showFooter?: boolean;
  /** Footer action buttons or content */
  actions?: React.ReactNode;
  /** Main card content */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const Card: React.FC<CardProps> = ({
  size = "M",
  showHeader = true,
  icon,
  title,
  titleSize = "XS",
  titleSans = true,
  headerActions,
  showFooter = false,
  actions,
  children,
  className = "",
}) => {
  const { t } = useTranslation();

  const sizeClass = styles[`size${size}`];
  const actionNodes = flattenChildren(actions);
  const hasSplitFooter = actionNodes.length >= 3;
  const footerClassNames = `${styles.footer} ${hasSplitFooter ? styles.footerSplit : ""}`.trim();

  return (
    <div className={`${styles.card} ${sizeClass} ${className}`.trim()}>
      {showHeader && (
        <div className={styles.header}>
          {icon && <span className={styles.icon}>{icon}</span>}
          {title && (
            <Title
              level={2}
              size={titleSize}
              terminals={titleSans ? "sans" : "serif"}
              className={styles.title}
            >
              {title}
            </Title>
          )}
          {headerActions && (
            <div className={styles.headerActions}>{headerActions}</div>
          )}
        </div>
      )}

      <div className={styles.content}>
        {children || (
          <Text size="M" terminals="sans" className={styles.cardText}>
            Lorem ipsum
          </Text>
        )}
      </div>

      {showFooter && actions && (
        <div
          className={footerClassNames}
          role="group"
          aria-label={t("card.actions", "Card actions")}
        >
          {hasSplitFooter ? (
            <>
              <div className={styles.footerLeading}>{actionNodes[0]}</div>
              <div className={styles.footerTrailingContainer}>
                <div className={styles.footerTrailing}>
                  {actionNodes.slice(1)}
                </div>
              </div>
            </>
          ) : (
            actions
          )}
        </div>
      )}
    </div>
  );
};

Card.displayName = "Card";

export default Card;
