"use client";

// One Phosphor glyph imported directly: Icon would pull its whole registry
// into the content entry point.
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "../../lib/cn";
import { Image } from "../../lib/imageComponent";
import { Link } from "../../lib/linkComponent";
import { useTranslate } from "../../lib/translation";
import styles from "./ProjectList.module.css";

/** One project row. */
export interface ProjectListItem {
  /** Stable key. */
  id: string;
  /** Project name. */
  title: string;
  /** Case study URL; omit for a teaser that has no page yet. */
  href?: string;
  /** Cover image URL, shown as a small decorative thumbnail. */
  thumbnail?: string;
  /** Client or organisation, as written in the project record. */
  client?: string;
  /**
   * `client` is a UI label in the page language ("Self-initiated", "Various")
   * rather than a name, so it does not take `contentLanguage`.
   */
  clientIsLabel?: boolean;
  /** Discipline or category label (for example "Design systems"). */
  discipline?: string;
  /** Period, as written in the project record (for example "2020–2022"). */
  year?: string;
  /** Teaser without a page: muted, not a link, with the coming-soon label. */
  comingSoon?: boolean;
}

export interface ProjectListProps {
  /** Projects in display order. */
  items: ProjectListItem[];
  /** Accessible name for the list (for example "Projects"). */
  ariaLabel: string;
  /** Label on teaser rows; defaults to the translated "Coming soon". */
  comingSoonLabel?: string;
  /** Language of the project titles and clients when it differs from the page. */
  contentLanguage?: string;
  /** Additional className for the root element. */
  className?: string;
}

/**
 * A compact index of projects: one row per project, the whole row a link.
 *
 * Narrow (under 40rem of its own width): thumbnail, title and one meta line
 * (client, or discipline when there is no client, then the period).
 * Wide: aligned columns for project, client, discipline and period under a
 * column header row. Columns respond to the list's width, not the viewport.
 */
export function ProjectList({
  items,
  ariaLabel,
  comingSoonLabel,
  contentLanguage,
  className,
}: ProjectListProps) {
  const t = useTranslate();
  const soonLabel = comingSoonLabel ?? t("projectListComingSoon", "Coming soon");

  return (
    <div className={cn(styles.root, className)}>
      {/* Visual column labels; each row's cells speak for themselves. */}
      <div className={styles.header} aria-hidden="true">
        <span />
        <span>{t("projectListProject", "Project")}</span>
        <span>{t("projectListClient", "Client")}</span>
        <span>{t("projectListDiscipline", "Discipline")}</span>
        <span>{t("projectListYear", "Year")}</span>
        <span />
      </div>
      <ul className={styles.list} aria-label={ariaLabel}>
        {items.map((item) => {
          const meta = [item.client || item.discipline, item.year]
            .filter(Boolean)
            .join(", ");
          const linked = Boolean(item.href) && !item.comingSoon;
          // A client name is content (contentLanguage); a label or the
          // translated discipline fallback is in the page language.
          const clientLang =
            item.client && !item.clientIsLabel ? contentLanguage : undefined;
          const cells = (
            <>
              <span className={styles.thumb}>
                {item.thumbnail && (
                  <Image src={item.thumbnail} alt="" fill sizes="64px" />
                )}
              </span>
              <span className={styles.main}>
                <span className={styles.title} lang={contentLanguage}>
                  {item.title}
                </span>
                {meta && (
                  // The discipline label is translated, so the line takes
                  // the content language only when it shows the client.
                  <span className={styles.meta} lang={clientLang}>
                    {meta}
                  </span>
                )}
              </span>
              <span className={styles.client} lang={clientLang}>
                {item.client}
              </span>
              <span className={styles.discipline}>{item.discipline}</span>
              <span className={styles.year}>{item.year}</span>
              <span className={styles.end}>
                {linked ? (
                  <ArrowRight className={styles.arrow} size={20} aria-hidden="true" />
                ) : item.comingSoon ? (
                  <span className={styles.soon}>{soonLabel}</span>
                ) : null}
              </span>
            </>
          );

          return (
            <li key={item.id} className={styles.item}>
              {linked ? (
                <Link href={item.href!} className={styles.row}>
                  {cells}
                </Link>
              ) : (
                <div
                  className={cn(styles.row, item.comingSoon && styles.muted)}
                >
                  {cells}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

ProjectList.displayName = "ProjectList";

export default ProjectList;
