import React from "react";
import styles from "./ServicesGrid.module.css";
import { useTranslate } from "../../lib/translation";
import Icon from "@dt/Icon";

export interface ServicesGridProps {
  className?: string;
}

// Icon order aligned with titles: Design, Development, Strategy, AI Innovation
const ICONS = ["palette", "code", "strategy", "robot"] as const;

/**
 * ServicesGrid component.
 */
export const ServicesGrid: React.FC<ServicesGridProps> = ({ className }) => {
  const t = useTranslate();
  const ariaLabel = t("servicesGrid.ariaLabel");
  const titles = [
    t("servicesGrid.titles.design"),
    t("servicesGrid.titles.development"),
    t("servicesGrid.titles.strategy"),
    t("servicesGrid.titles.aiInnovation"),
  ];

  return (
    <div className={[styles.fillVertical, className].filter(Boolean).join(" ")}>
      <div className={styles.root} data-testid="services-grid">
        <span className={styles.gridLabel} aria-hidden="true">
          {ariaLabel}
        </span>
        {ICONS.map((iconName, idx) => (
          <div
            key={idx}
            className={styles.item}
            aria-label={`${titles[idx]} (${ariaLabel} ${idx + 1})`}
            data-testid="services-grid-item"
          >
            <div
              className={styles.iconWrapper}
              aria-hidden="true"
              data-testid="services-grid-icon"
            >
              <Icon name={iconName} size={32} ariaLabel={titles[idx]} />
            </div>
            <div className={styles.title}>{titles[idx]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesGrid;
