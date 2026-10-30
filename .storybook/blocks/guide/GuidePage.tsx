import React from "react";
import type { ComponentProps, ReactNode } from "react";
import Card from "@dt/Card";
import Code from "@dt/Code";
import StatList from "@dt/StatList";
import Table from "@dt/Table";
import TableCell from "@dt/TableCell";
import TableHeaderCell from "@dt/TableHeaderCell";
import TableRow from "@dt/TableRow";
import Text from "@dt/Text";
import Title from "@dt/Title";
import { cn } from "../../../nextjs-app/shared/lib/cn";
import { GuideAnchor, GuideContext } from "./guideMdx";
import styles from "./GuidePage.module.css";

/**
 * Guide pages: the long-form Overview and Docs pages in Storybook (principles,
 * tokens, theming, accessibility...). Component pages use `DtDocsPage`; guide
 * pages use this frame so they read like digitaltableteur.com: one display
 * title, a lede, calm sections on the reading measure, hairline tables.
 *
 * Markdown inside `<GuidePage>` renders as DS components (see guideMdx.tsx),
 * so MDX authors write plain markdown and never pick sizes. The `sb-unstyled`
 * class keeps Storybook's own docs typography out of the frame.
 */

const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function GuidePage({
  kicker,
  title,
  lede,
  children,
}: {
  /** Section the page belongs to, shown above the title. */
  kicker: string;
  title: string;
  /** One or two sentences: what the page is for and who should read it. */
  lede: ReactNode;
  children: ReactNode;
}) {
  return (
    <GuideContext.Provider value={true}>
      <article className={`sb-unstyled ${styles.page}`}>
        <header className={styles.header}>
          <Text as="p" size="xs" flush className={styles.kicker}>
            {kicker}
          </Text>
          <Title as="h1" size="m" lineHeight="tight" className={styles.title}>
            {title}
          </Title>
          <Text
            as="p"
            size="l"
            lineHeight="normal"
            flush
            className={styles.lede}
          >
            {lede}
          </Text>
        </header>
        {children}
      </article>
    </GuideContext.Provider>
  );
}

/** A titled section with an optional intro paragraph. */
export function GuideSection({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section
      className={styles.section}
      aria-labelledby={`guide-${slug(title)}`}
    >
      <Title
        as="h2"
        size="xs"
        lineHeight="snug"
        id={`guide-${slug(title)}`}
        className={styles.h2}
      >
        {title}
      </Title>
      {intro ? (
        <Text as="p" size="s" className={styles.p}>
          {intro}
        </Text>
      ) : null}
      {children}
    </section>
  );
}

/**
 * The figure row at the top of a guide page: DS StatList with its defaults
 * (rule variant, md figures). Kept as a wrapper so guide pages keep the
 * short `facts` shape and get stable ids.
 */
export function GuideFacts({
  facts,
}: {
  facts: {
    value: ReactNode;
    of?: ReactNode;
    label: ReactNode;
    note?: ReactNode;
  }[];
}) {
  return (
    <StatList
      className={styles.facts}
      items={facts.map((fact, index) => ({ id: String(index), ...fact }))}
    />
  );
}

/** Numbered steps, after the site's "Strategy to scale" grid. */
export function GuideSteps({
  steps,
}: {
  steps: { title: string; body: ReactNode }[];
}) {
  return (
    // Three steps sit in a row; more go two across, so titles stay on one
    // line and the card text keeps a readable measure.
    <ol className={cn(styles.steps, steps.length > 3 && styles.stepsTwo)}>
      {steps.map((step, index) => (
        <Card
          key={step.title}
          as="li"
          variant="default"
          padding="lg"
          className={styles.step}
        >
          <Title
            as="span"
            size="xs"
            lineHeight="tight"
            className={styles.stepNumber}
          >
            {String(index + 1).padStart(2, "0")}
          </Title>
          <Title
            as="h3"
            size="xxs"
            lineHeight="snug"
            flush
            className={styles.stepTitle}
          >
            {step.title}
          </Title>
          <Text as="p" size="xs" flush className={styles.stepBody}>
            {step.body}
          </Text>
        </Card>
      ))}
    </ol>
  );
}

/** Labels and values this short stay on one line; long text takes the slack. */
const SHORT_CELL = 28;

const isShort = (cell: ReactNode) =>
  (typeof cell === "string" || typeof cell === "number") &&
  String(cell).length <= SHORT_CELL;

/** A captioned table. The first column is a row header. */
export function GuideTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: ReactNode[][];
}) {
  // A column of counts aligns at the end, header included, in tabular figures.
  const numericColumns = columns.map((_, index) =>
    rows.every((row) => typeof row[index] === "number"),
  );
  return (
    <div className={styles.block}>
      {/* Below 40rem each row stacks with its column labels, so a phone
          never squeezes three columns into 340px. */}
      <Table caption={caption} hideCaption size="md" stackOnNarrow>
        <thead role="rowgroup">
          <TableRow>
            {columns.map((column, columnIndex) => (
              <TableHeaderCell
                key={column}
                scope="col"
                align={numericColumns[columnIndex] ? "end" : undefined}
                className={styles.nowrap}
              >
                {column}
              </TableHeaderCell>
            ))}
          </TableRow>
        </thead>
        <tbody role="rowgroup">
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <TableHeaderCell key={cellIndex} scope="row">
                    {cell}
                  </TableHeaderCell>
                ) : (
                  <TableCell
                    key={cellIndex}
                    label={columns[cellIndex]}
                    numeric={numericColumns[cellIndex]}
                    align={numericColumns[cellIndex] ? "end" : undefined}
                    className={isShort(cell) ? styles.nowrap : undefined}
                  >
                    {cell}
                  </TableCell>
                ),
              )}
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

/**
 * Things the system does not cover yet, as the guide's dash list. Kept on
 * the page on purpose: a guide that only lists what works overstates the
 * system.
 */
export function GuideGaps({ items }: { items: ReactNode[] }) {
  return <GuideList items={items} />;
}

/** The guide dash list, for TSX pages (MDX lists get it automatically). */
export function GuideList({
  items,
  ordered = false,
}: {
  items: ReactNode[];
  ordered?: boolean;
}) {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag className={ordered ? styles.orderedList : styles.list}>
      {items.map((item, index) => (
        <li key={index} className={styles.item}>
          {item}
        </li>
      ))}
    </ListTag>
  );
}

/**
 * Link cards: each card is one link (the title carries the href and its hit
 * area is stretched over the card), so a row of cards is a row of single tab
 * stops with real link names, not "Read more" repeated.
 */
export function GuideCards({
  items,
  columns = 3,
}: {
  items: { title: string; body: ReactNode; href: string; meta?: ReactNode }[];
  columns?: 2 | 3;
}) {
  return (
    <ul className={`${styles.cards} ${columns === 2 ? styles.cardsTwo : ""}`}>
      {items.map((item) => (
        <Card
          key={item.title}
          as="li"
          variant="default"
          padding="lg"
          className={styles.card}
        >
          {item.meta ? (
            <Text as="span" size="xs" flush className={styles.cardMeta}>
              {item.meta}
            </Text>
          ) : null}
          <Title
            as="h3"
            size="xxs"
            lineHeight="snug"
            flush
            className={styles.cardTitle}
          >
            <GuideAnchor href={item.href} underline="none">
              {item.title}
            </GuideAnchor>
          </Title>
          <Text as="p" size="xs" flush className={styles.cardBody}>
            {item.body}
          </Text>
        </Card>
      ))}
    </ul>
  );
}

/**
 * Keeps a hyphenated term on one line ("pre-push", "ADR-0004"). Satoshi has
 * no non-breaking hyphen (U+2011), so the break is prevented in CSS and the
 * real hyphen stays.
 */
export function GuideNoBreak({ children }: { children: ReactNode }) {
  return <span className={styles.nowrap}>{children}</span>;
}

/**
 * Several names as separate code chips ("props variants slots", or
 * "LayerProvider, useLayer"), so a list wraps between names instead of one
 * unbreakable chip setting the column width. Commas in the input are kept.
 */
export function GuideCodeList({ names }: { names: string }) {
  const parts = names.split(/(,?\s+)/);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          part.includes(",") ? (
            ", "
          ) : (
            " "
          )
        ) : (
          <Code key={index} size="inherit">
            {part}
          </Code>
        ),
      )}
    </>
  );
}

export { GuideAnchor };

export type GuidePageProps = ComponentProps<typeof GuidePage>;
