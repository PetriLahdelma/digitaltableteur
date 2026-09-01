import Image from "next/image";
import type { CSSProperties } from "react";
import Icon from "@dt/Icon";
import type { NewsBulletinBadge } from "@/nextjs-app/shared/data/news-bulletin";
import styles from "./NewsBulletin.module.css";

export function NewsBulletinBadgeMark({ badge }: { badge: NewsBulletinBadge }) {
  switch (badge.kind) {
    case "percent":
      return (
        <span className={styles.percentBadge} aria-hidden>
          {badge.value}
        </span>
      );
    case "npm":
      return (
        <span className={styles.npmBadge} aria-hidden>
          <span className={styles.npmBadgeLabel}>npm</span>
          <span className={styles.npmBadgeVersion}>{badge.version}</span>
        </span>
      );
    case "icon":
      return (
        <span className={styles.iconBadge} aria-hidden>
          <Icon name={badge.name} size={40} weight="light" />
        </span>
      );
    case "placeholder":
      return <span className={styles.placeholderBadge} aria-hidden />;
    case "image":
      if (badge.tint === "logo-color" || badge.tint === "vertaaux-brand") {
        return (
          <span
            className={
              badge.tint === "vertaaux-brand"
                ? `${styles.logoColorMark} ${styles.vertaauxMark}`
                : styles.logoColorMark
            }
            style={
              {
                inlineSize: `${badge.width}px`,
                blockSize: `${badge.height}px`,
                WebkitMaskImage: `url(${badge.src})`,
                maskImage: `url(${badge.src})`,
              } as CSSProperties
            }
            aria-hidden
          />
        );
      }
      return (
        <span className={styles.badge}>
          <Image
            src={badge.src}
            alt=""
            aria-hidden
            width={badge.width}
            height={badge.height}
            className={styles.badgeImage}
          />
        </span>
      );
    default:
      return null;
  }
}

export function badgeAccessibleLabel(badge: NewsBulletinBadge): string {
  switch (badge.kind) {
    case "percent":
      return badge.value;
    case "npm":
      return `npm ${badge.version}`;
    case "icon":
      return badge.label;
    case "placeholder":
      return "";
    case "image":
      return badge.alt;
    default:
      return "";
  }
}
