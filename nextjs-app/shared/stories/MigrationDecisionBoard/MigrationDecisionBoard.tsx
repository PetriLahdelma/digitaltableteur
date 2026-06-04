import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./MigrationDecisionBoard.module.css";

export type DecisionBlockVariant = "legacy" | "wrong" | "proposed" | "defer";

const LABEL_CLASS: Record<DecisionBlockVariant, string> = {
  legacy: styles.label,
  wrong: styles.labelBad,
  proposed: styles.labelGood,
  defer: styles.labelDefer,
};

export function MigrationDecisionPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageLead}>{lead}</p>
      </header>
      {children}
    </div>
  );
}

export function MigrationDecisionBand({
  title,
  className,
  style,
  children,
}: {
  title: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <section className={cn(styles.band, className)} style={style}>
      <h2 className={styles.bandTitle}>{title}</h2>
      {children}
    </section>
  );
}

export function MigrationDecisionBlock({
  variant,
  title,
  children,
  center,
}: {
  variant: DecisionBlockVariant;
  title: string;
  children: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={styles.block}>
      <p className={LABEL_CLASS[variant]}>{title}</p>
      <div className={cn(styles.row, center && styles.rowCenter)}>{children}</div>
    </div>
  );
}

export type MigrationBoardLink = {
  title: string;
  storyId: string;
  note: string;
  status?: "approved" | "review" | "defer";
};

export function MigrationReviewHub({ boards }: { boards: MigrationBoardLink[] }) {
  return (
    <MigrationDecisionPage
      title="@dt migration — decision boards"
      lead={
        <>
          Same workflow as the Button surface board: open each story full-screen,
          compare three rows (Today / Wrong / Proposed), approve the green row before
          any production swap. Restart Storybook after pulling new board files.
        </>
      }
    >
      <ul className={styles.hubList}>
        {boards.map((board) => (
          <li key={board.storyId} className={styles.hubItem}>
            <a
              href={`?path=/story/${board.storyId}`}
              className={styles.hubLink}
            >
              {board.title}
              {board.status === "approved" ? " ✓" : null}
            </a>
            <p className={styles.hubNote}>{board.note}</p>
          </li>
        ))}
      </ul>
    </MigrationDecisionPage>
  );
}
