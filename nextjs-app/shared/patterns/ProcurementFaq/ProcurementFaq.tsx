"use client";

import { useId } from "react";
import { Accordion, Link, Text, Title } from "@digitaltableteur/react";
import { ReliablePartnerBadge } from "../../components/ReliablePartnerBadge";
import { useTranslate } from "../../lib/translation";
import { cn } from "../../lib/cn";
import styles from "./ProcurementFaq.module.css";

export interface ProcurementFaqItem {
  /** Stable id; also selects the extras some answers carry (badge, policy link). */
  id: string;
  question: string;
  answer: string;
}

export interface ProcurementFaqProps {
  /** Heading level of the section title. @default 2 */
  headingLevel?: 2 | 3;
  /** Section id, for in-page links. @default "procurement-faq" */
  id?: string;
  /** Additional class name on the section. */
  className?: string;
}

/** Reads the procurement items from the active locale, dropping malformed rows. */
export function readProcurementItems(value: unknown): ProcurementFaqItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is ProcurementFaqItem =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as ProcurementFaqItem).id === "string" &&
      typeof (item as ProcurementFaqItem).question === "string" &&
      typeof (item as ProcurementFaqItem).answer === "string",
  );
}

/**
 * Visible answers for procurement, legal and finance teams: contracting
 * party, supplier verification, invoicing, agreements, ownership, languages,
 * location, accessibility law and AI use. The same items feed the FAQ
 * structured data of the pages that show this section.
 */
export function ProcurementFaq({
  headingLevel = 2,
  id = "procurement-faq",
  className,
}: ProcurementFaqProps) {
  const t = useTranslate();
  const titleId = `${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-procurement-title`;
  const items = readProcurementItems(
    t("procurementFaq.items", { returnObjects: true, defaultValue: [] }) as unknown,
  );

  const extra = (item: ProcurementFaqItem) => {
    if (item.id === "verified-supplier") {
      return <ReliablePartnerBadge size="sm" className={styles.badge} />;
    }
    if (item.id === "ai-use") {
      return (
        <Link href="/ai-use">
          {t("procurementFaq.aiPolicyLink", "Read the AI use policy")}
        </Link>
      );
    }
    return null;
  };

  return (
    <section id={id} aria-labelledby={titleId} className={cn(styles.root, className)}>
      <div className={styles.intro}>
        <Title level={headingLevel} size="s" id={titleId}>
          {t("procurementFaq.title", "Buying from Digitaltableteur")}
        </Title>
        <Text as="p" size="m" className={styles.introText}>
          {t(
            "procurementFaq.intro",
            "Answers for procurement, legal and finance teams. Anything not covered here can go in the first message.",
          )}
        </Text>
      </div>
      <Accordion
        variant="divided"
        headingLevel={headingLevel === 2 ? 3 : 4}
        className={styles.list}
        defaultOpenId={items[0] ? `${id}-${items[0].id}` : undefined}
        items={items.map((item) => ({
          id: `${id}-${item.id}`,
          title: item.question,
          content: (
            <div className={styles.answer}>
              <Text as="p" size="s">
                {item.answer}
              </Text>
              {extra(item)}
            </div>
          ),
        }))}
      />
    </section>
  );
}

ProcurementFaq.displayName = "ProcurementFaq";

export default ProcurementFaq;
