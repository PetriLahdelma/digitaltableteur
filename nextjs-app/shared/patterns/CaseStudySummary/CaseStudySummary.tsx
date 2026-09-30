"use client";

import { useId } from "react";
import Link from "@dt/Link";
import List from "@dt/List";
import Text from "@dt/Text";
import Title from "@dt/Title";
import { useTranslate } from "../../lib/translation";
import { cn } from "../../lib/cn";
import PageLayout from "../PageLayout";
import styles from "./CaseStudySummary.module.css";

export interface CaseStudyDecision {
  /** The decision, stated as what was chosen. */
  title: string;
  /** Why it was chosen and what it made possible. */
  detail: string;
}

export interface CaseStudyEvidence {
  /** The claim a reader might want to check. */
  claim: string;
  /** Where the claim comes from, e.g. "Self-reported, from project records". */
  source: string;
  /** Optional link to public evidence. */
  href?: string;
}

export interface CaseStudySummaryProps {
  /** What changed because of the work, in one or two sentences. */
  outcome: string;
  /** Role and scope of the engagement. */
  role: string;
  /** What made the problem hard. */
  constraints: string[];
  /** The decisions that shaped the result. */
  decisions: CaseStudyDecision[];
  /** Claims with an explicit source label; nothing is presented unsourced. */
  evidence: CaseStudyEvidence[];
  /** Section heading. Defaults to the translated "At a glance". */
  title?: string;
  /** Maximum content width. */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /** Additional class name applied to the section root. */
  className?: string;
}

/**
 * CaseStudySummary - The decision-first summary that leads a case study:
 * outcome, role, constraints, key decisions and evidence with source
 * labels. The process narrative follows below it on the page.
 */
export function CaseStudySummary({
  outcome,
  role,
  constraints,
  decisions,
  evidence,
  title,
  maxWidth = "lg",
  className,
}: CaseStudySummaryProps) {
  const t = useTranslate();
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={cn(styles.root, className)}>
      <PageLayout maxWidth={maxWidth} spacing="comfortable">
        <Title level={2} size="s" id={headingId} className={styles.eyebrow}>
          {title ?? t("caseStudySummaryTitle", "At a glance")}
        </Title>

        <Text as="p" size="l" lineHeight="snug" className={styles.outcome}>
          {outcome}
        </Text>

        <div className={styles.grid}>
          <div className={styles.block}>
            <Title level={3} size="xs" className={styles.label}>
              {t("caseStudySummaryRole", "Role and scope")}
            </Title>
            <Text as="p" size="s" lineHeight="relaxed">
              {role}
            </Text>
          </div>

          <div className={styles.block}>
            <Title level={3} size="xs" className={styles.label}>
              {t("caseStudySummaryConstraints", "Constraints")}
            </Title>
            <List
              className={styles.list}
              size="s"
              lineHeight="relaxed"
              items={constraints.map((constraint) => (
                <span key={constraint} className={styles.listItem}>
                  <Text as="span" size="s" lineHeight="relaxed">
                    {constraint}
                  </Text>
                </span>
              ))}
            />
          </div>
        </div>

        <div className={styles.block}>
          <Title level={3} size="xs" className={styles.label}>
            {t("caseStudySummaryDecisions", "Key decisions")}
          </Title>
          <List
            as="ol"
            className={styles.decisions}
            listStyleType="none"
            items={decisions.map((decision) => (
              <span key={decision.title} className={styles.decision}>
                <Text as="strong" size="s" className={styles.decisionTitle}>
                  {decision.title}
                </Text>
                <Text as="span" size="s" lineHeight="relaxed">
                  {decision.detail}
                </Text>
              </span>
            ))}
          />
        </div>

        <div className={styles.block}>
          <Title level={3} size="xs" className={styles.label}>
            {t("caseStudySummaryEvidence", "Evidence")}
          </Title>
          <List
            className={styles.list}
            size="s"
            lineHeight="relaxed"
            items={evidence.map((item) => (
              <span key={item.claim} className={styles.evidence}>
                <Text as="span" size="s" lineHeight="relaxed">
                  {item.claim}
                </Text>
                <Text as="span" size="xs" className={styles.source}>
                  {t("caseStudySummarySource", "Source")}:{" "}
                  {item.href ? (
                    <Link href={item.href} size="inherit">
                      {item.source}
                    </Link>
                  ) : (
                    item.source
                  )}
                </Text>
              </span>
            ))}
          />
        </div>
      </PageLayout>
    </section>
  );
}

CaseStudySummary.displayName = "CaseStudySummary";

export default CaseStudySummary;
