"use client";

import { Fragment, useEffect, useId, useState } from "react";
import Badge from "../Badge/Badge";
import Button from "../Button/Button";
import { Card } from "../Card/Card";
import Checkbox from "../Checkbox/Checkbox";
import { cn } from "../../lib/cn";
import { useTranslate } from "../../lib/translation";
import styles from "./StageList.module.css";

/** One step of the lifecycle the list is ordered by. */
export interface StageListStage {
  /** Stable key that items reference in `stages`. */
  id: string;
  /** Display label, used as a heading or badge (for example "Design review"). */
  label: string;
  /** Mid-sentence form for the recurrence line ("design review"); defaults to `label`. */
  phrase?: string;
}

/** A named run of consecutive stages, used to group the list. */
export interface StageListPhase {
  /** Phase heading (for example "Before you ship"). */
  label: string;
  /** Stage ids in this phase, in lifecycle order. */
  stages: string[];
}

/** One entry, placed under the first stage it lists. */
export interface StageListItem {
  /** Stable key; also the anchor for the index variant. */
  id: string;
  /** What the entry is about (for example "Forms with error handling"). */
  title: string;
  /** The answer the reader scans for; rendered as the entry's headline. */
  lead: string;
  /** Supporting detail in muted text. */
  description?: string;
  /** Stage ids; the first places the entry, later ones add a recurrence line. */
  stages: string[];
  /** Owner or category shown beside the title (for example "Product team"). */
  tag?: string;
}

export type StageListVariant = "sheet" | "rail" | "index" | "checklist" | "cards";

export interface StageListProps {
  /** Entries to place by stage. */
  items: StageListItem[];
  /** Lifecycle stages in order. */
  stages: StageListStage[];
  /** Optional grouping of stages into phases (sheet, checklist and cards). */
  phases?: StageListPhase[];
  /**
   * Layout. sheet: phases with the stage pinned in the margin, entries lead
   * with the answer. rail: a vertical timeline of stages. index: a linked
   * overview by stage, then every entry in full. checklist: a tick box per
   * entry with a count per group. cards: a card grid per group.
   * @default "sheet"
   */
  variant?: StageListVariant;
  /** Level of the top headings the list renders. @default 3 */
  headingLevel?: 2 | 3 | 4;
  /** Checklist only: localStorage key that keeps ticks between visits. Omit to keep ticks in memory. */
  storageKey?: string;
  /** Accessible name for the index variant's overview navigation. */
  indexLabel?: string;
  /** Additional className for the root element. */
  className?: string;
}

type Heading = "h2" | "h3" | "h4" | "h5";
const headingTag = (level: number): Heading =>
  `h${Math.min(Math.max(level, 2), 5)}` as Heading;

/** Joins labels as "a, b and c": the house style has no serial comma. */
function joinLabels(labels: string[], and: string): string {
  if (labels.length < 2) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} ${and} ${labels[labels.length - 1]}`;
}

/** Lists the stages of the lifecycle with the entries each one places. */
export function StageList({
  items,
  stages,
  phases,
  variant = "sheet",
  headingLevel = 3,
  storageKey,
  indexLabel,
  className,
}: StageListProps) {
  const t = useTranslate();
  const anchorBase = `stage-list-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const and = t("stageListAnd", "and");

  const stageById = new Map(stages.map((s) => [s.id, s]));
  const order = (id: string) => stages.findIndex((s) => s.id === id);
  const placedIn = (stageId: string) =>
    items.filter((item) => item.stages[0] === stageId);
  const listedIn = (stageId: string) =>
    items.filter((item) => item.stages.includes(stageId));
  const labelsOf = (ids: string[]) =>
    ids.map((id) => stageById.get(id)?.label ?? id);
  const recurrence = (item: StageListItem) => {
    const later = item.stages
      .slice(1)
      .map((id) => stageById.get(id)?.phrase ?? stageById.get(id)?.label ?? id);
    return later.length > 0
      ? t("stageListAgainAt", "Again at {{stages}}.", {
          stages: joinLabels(later, and),
        })
      : "";
  };
  const detail = (item: StageListItem) =>
    [item.description, recurrence(item)].filter(Boolean).join(" ");

  const groups: StageListPhase[] =
    phases && phases.length > 0
      ? phases
      : [{ label: "", stages: stages.map((s) => s.id) }];
  const grouped = Boolean(phases && phases.length > 0);
  const top = headingTag(headingLevel);
  const sub = headingTag(grouped ? headingLevel + 1 : headingLevel);
  const itemsOfGroup = (group: StageListPhase) =>
    items
      .filter((item) => group.stages.includes(item.stages[0] ?? ""))
      .sort((a, b) => order(a.stages[0] ?? "") - order(b.stages[0] ?? ""));

  const [ticked, setTicked] = useState<string[]>([]);
  useEffect(() => {
    if (variant !== "checklist" || !storageKey) return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setTicked(JSON.parse(saved) as string[]);
    } catch {
      /* Storage unavailable: ticks live in memory only. */
    }
  }, [variant, storageKey]);
  const saveTicks = (next: string[]) => {
    setTicked(next);
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* Storage unavailable: ticks live in memory only. */
    }
  };

  const rootClass = cn(styles.root, styles[variant], className);
  const Top = top;
  const Sub = sub;

  if (variant === "rail") {
    return (
      <ol className={rootClass} data-variant={variant}>
        {stages.map((stage) => {
          const placed = placedIn(stage.id);
          if (placed.length === 0) return null;
          return (
            <li key={stage.id} className={styles.railStage}>
              <Top className={styles.railStageName}>{stage.label}</Top>
              <ul className={styles.entries}>
                {placed.map((item) => (
                  <li key={item.id} className={styles.entry}>
                    <p className={styles.railHead}>
                      <span className={styles.railTitle}>{item.title}</span>
                      {item.tag ? (
                        <>
                          {" "}
                          <Badge variant="secondary" size="sm">
                            {item.tag}
                          </Badge>
                        </>
                      ) : null}
                    </p>
                    <p className={styles.lead}>{item.lead}</p>
                    {detail(item) ? (
                      <p className={styles.detail}>{detail(item)}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    );
  }

  if (variant === "index") {
    const ordered = [...items].sort(
      (a, b) => order(a.stages[0] ?? "") - order(b.stages[0] ?? ""),
    );
    return (
      <div className={rootClass} data-variant={variant}>
        <nav
          aria-label={indexLabel ?? t("stageListIndexLabel", "Entries by stage")}
          className={styles.indexNav}
        >
          <ol className={styles.indexList}>
            {stages.map((stage) => {
              const listed = listedIn(stage.id);
              if (listed.length === 0) return null;
              return (
                <li key={stage.id} className={styles.indexRow}>
                  <span className={styles.indexStage}>{stage.label}</span>{" "}
                  <ul className={styles.indexEntries}>
                    {listed.map((item) => (
                      <li key={item.id}>
                        <a href={`#${anchorBase}-${item.id}`}>{item.title}</a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className={styles.indexDetails}>
          {ordered.map((item) => (
            <article
              key={item.id}
              id={`${anchorBase}-${item.id}`}
              aria-labelledby={`${anchorBase}-${item.id}-title`}
              className={styles.indexDetail}
            >
              <p className={styles.eyebrow}>
                {joinLabels(labelsOf(item.stages), and)}
                {item.tag ? `, ${item.tag}` : ""}
              </p>
              <Top id={`${anchorBase}-${item.id}-title`} className={styles.indexTitle}>
                {item.title}
              </Top>
              <p className={styles.lead}>{item.lead}</p>
              {item.description ? (
                <p className={styles.detail}>{item.description}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "checklist") {
    return (
      <div className={rootClass} data-variant={variant}>
        <ol className={styles.checkGroups}>
          {groups.map((group, index) => {
            const groupItems = itemsOfGroup(group);
            if (groupItems.length === 0) return null;
            const done = groupItems.filter((i) => ticked.includes(i.id)).length;
            return (
              <li key={group.label || index} className={styles.checkGroup}>
                <div className={styles.checkHead}>
                  {grouped ? (
                    <>
                      <span className={styles.checkNumber} aria-hidden="true">
                        {index + 1}
                      </span>
                      <Top className={styles.groupName}>{group.label}</Top>
                    </>
                  ) : null}
                  <span className={styles.checkCount} aria-live="polite">
                    {t("stageListProgress", "{{done}} of {{total}} done", {
                      done,
                      total: groupItems.length,
                    })}
                  </span>
                </div>
                {group.stages.map((stageId) => {
                  const stageItems = groupItems.filter(
                    (i) => i.stages[0] === stageId,
                  );
                  if (stageItems.length === 0) return null;
                  return (
                    <fieldset key={stageId} className={styles.checkStage}>
                      <legend className={styles.checkLegend}>
                        {stageById.get(stageId)?.label ?? stageId}
                      </legend>
                      {stageItems.map((item) => (
                        <div key={item.id} className={styles.checkItem}>
                          <Checkbox
                            size="lg"
                            label={item.lead}
                            helperText={[item.title + ".", detail(item)]
                              .filter(Boolean)
                              .join(" ")}
                            checked={ticked.includes(item.id)}
                            onCheckedChange={(on) =>
                              saveTicks(
                                on
                                  ? [...ticked, item.id]
                                  : ticked.filter((id) => id !== item.id),
                              )
                            }
                          />
                        </div>
                      ))}
                    </fieldset>
                  );
                })}
              </li>
            );
          })}
        </ol>
        {ticked.length > 0 ? (
          <Button variant="tertiary" size="sm" onClick={() => saveTicks([])}>
            {t("stageListClear", "Clear all")}
          </Button>
        ) : null}
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className={rootClass} data-variant={variant}>
        {groups.map((group, index) => {
          const groupItems = itemsOfGroup(group);
          if (groupItems.length === 0) return null;
          return (
            <div key={group.label || index} className={styles.group}>
              {grouped ? (
                <Top className={styles.groupName}>{group.label}</Top>
              ) : null}
              <ul className={styles.cardGrid}>
                {groupItems.map((item) => (
                  <Card key={item.id} as="li" padding="md" className={styles.card}>
                    <div className={styles.cardTop}>
                      <Badge variant="secondary" size="sm">
                        {joinLabels(labelsOf(item.stages), and)}
                      </Badge>
                      {item.tag ? (
                        <>
                          {" "}
                          <span className={styles.cardTag}>{item.tag}</span>
                        </>
                      ) : null}
                    </div>
                    <p className={styles.cardLead}>{item.lead}</p>
                    <p className={styles.cardTitle}>{item.title}</p>
                    {item.description ? (
                      <p className={styles.detail}>{item.description}</p>
                    ) : null}
                  </Card>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  }

  // sheet
  return (
    <div className={rootClass} data-variant="sheet">
      {groups.map((group, index) => {
        const groupItems = itemsOfGroup(group);
        if (groupItems.length === 0) return null;
        return (
          <Fragment key={group.label || index}>
            {grouped ? (
              <Top className={cn(styles.groupName, styles.sheetGroupName)}>
                {group.label}
              </Top>
            ) : null}
            {group.stages.map((stageId) => {
              const stageItems = groupItems.filter(
                (i) => i.stages[0] === stageId,
              );
              if (stageItems.length === 0) return null;
              return (
                <div key={stageId} className={styles.sheetStage}>
                  <Sub className={styles.sheetStageName}>
                    {stageById.get(stageId)?.label ?? stageId}
                  </Sub>
                  <ul className={styles.entries}>
                    {stageItems.map((item) => (
                      <li key={item.id} className={styles.entry}>
                        <p className={styles.kicker}>
                          {item.title}
                          {item.tag ? `, ${item.tag}` : ""}
                        </p>
                        <p className={styles.sheetLead}>{item.lead}</p>
                        {detail(item) ? (
                          <p className={styles.detail}>{detail(item)}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
}

StageList.displayName = "StageList";

export default StageList;
