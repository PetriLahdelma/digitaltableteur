import React from "react";
import type { ComponentProps, ReactNode } from "react";
import Card from "@dt/Card";
import StatusDot from "@dt/StatusDot";
import Table from "@dt/Table";
import TableCell from "@dt/TableCell";
import TableHeaderCell from "@dt/TableHeaderCell";
import TableRow from "@dt/TableRow";
import Text from "@dt/Text";
import Title from "@dt/Title";
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
          <Text as="p" size="xs" className={styles.kicker}>
            {kicker}
          </Text>
          <Title as="h1" size="xl" lineHeight="tight" className={styles.title}>
            {title}
          </Title>
          <Text as="p" size="l" lineHeight="normal" className={styles.lede}>
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
        size="s"
        lineHeight="snug"
        id={`guide-${slug(title)}`}
        className={styles.h2}
      >
        {title}
      </Title>
      {intro ? (
        <Text as="p" size="m" lineHeight="relaxed" className={styles.p}>
          {intro}
        </Text>
      ) : null}
      {children}
    </section>
  );
}

/**
 * Large figures on a hairline, as on the site's stat rows. `of` renders a
 * quiet "of 193" after the figure instead of squeezing it into the number.
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
    <dl className={styles.facts}>
      {facts.map((fact, index) => (
        <div key={index} className={styles.fact}>
          <dt className={styles.factLabel}>
            <Text as="span" size="s" lineHeight="snug">
              {fact.label}
            </Text>
            {fact.note ? (
              <Text as="span" size="xxs" className={styles.factNote}>
                {fact.note}
              </Text>
            ) : null}
          </dt>
          <dd className={styles.factValue}>
            <Title
              as="span"
              size="m"
              lineHeight="tight"
              className={styles.factFigure}
            >
              {fact.value}
            </Title>
            {fact.of ? (
              <Text as="span" size="s" className={styles.factOf}>
                of {fact.of}
              </Text>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Numbered steps, after the site's "Strategy to scale" grid. */
export function GuideSteps({
  steps,
}: {
  steps: { title: string; body: ReactNode }[];
}) {
  return (
    <ol className={styles.steps}>
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
            className={styles.stepTitle}
          >
            {step.title}
          </Title>
          <Text
            as="p"
            size="s"
            lineHeight="relaxed"
            className={styles.stepBody}
          >
            {step.body}
          </Text>
        </Card>
      ))}
    </ol>
  );
}

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
  return (
    <div className={styles.block}>
      <Table caption={caption} hideCaption size="md">
        <thead>
          <TableRow>
            {columns.map((column) => (
              <TableHeaderCell key={column} scope="col">
                {column}
              </TableHeaderCell>
            ))}
          </TableRow>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <TableHeaderCell key={cellIndex} scope="row">
                    {cell}
                  </TableHeaderCell>
                ) : (
                  <TableCell key={cellIndex}>{cell}</TableCell>
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
 * Things the system does not cover yet. Kept on the page on purpose: a guide
 * that only lists what works overstates the system.
 */
export function GuideGaps({ items }: { items: ReactNode[] }) {
  return (
    <ul className={styles.gaps}>
      {items.map((item, index) => (
        <li key={index} className={styles.gap}>
          <StatusDot tone="warning" size="sm" />
          <Text as="span" size="s" lineHeight="relaxed">
            {item}
          </Text>
        </li>
      ))}
    </ul>
  );
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
        <Card key={item.title} as="li" variant="default" padding="lg" className={styles.card}>
          {item.meta ? (
            <Text as="span" size="xxs" className={styles.cardMeta}>
              {item.meta}
            </Text>
          ) : null}
          <Title as="h3" size="xxs" lineHeight="snug" className={styles.cardTitle}>
            <GuideAnchor href={item.href} underline="none">
              {item.title}
            </GuideAnchor>
          </Title>
          <Text as="p" size="s" lineHeight="relaxed" className={styles.cardBody}>
            {item.body}
          </Text>
        </Card>
      ))}
    </ul>
  );
}

export { GuideAnchor };

export type GuidePageProps = ComponentProps<typeof GuidePage>;
