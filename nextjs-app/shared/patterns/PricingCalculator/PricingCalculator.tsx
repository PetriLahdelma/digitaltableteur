"use client";

import { useId, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  List,
  SelectableCard,
  SelectableCardGroup,
  Text,
  Title,
} from "@digitaltableteur/react";
import { useLocalization } from "../../lib/translation";
import { cn } from "../../lib/cn";
import {
  DAYS_PER_WEEK_OPTIONS,
  DURATION_OPTIONS,
  HOURS_PER_DAY,
  computePricing,
  getDurationOption,
  type DurationId,
  type DurationOption,
} from "./pricingMath";
import styles from "./PricingCalculator.module.css";

export interface PricingCalculatorProps {
  /** Optional wrapper class. */
  className?: string;
}

/**
 * PricingCalculator — duration × workload → total investment. Selections are
 * two single-select SelectableCardGroups; the summary column recomputes the
 * effective hourly rate, total hours, and total investment on every change.
 */
export function PricingCalculator({ className }: PricingCalculatorProps) {
  const { translate: t, resolvedLanguage } = useLocalization();
  const titleId = useId();
  const [durationId, setDurationId] = useState<DurationId>("2m");
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const duration = getDurationOption(durationId);
  const pricing = computePricing(durationId, daysPerWeek);

  const numberFormat = useMemo(
    () =>
      new Intl.NumberFormat(resolvedLanguage || "en", {
        maximumFractionDigits: 0,
      }),
    [resolvedLanguage],
  );

  const unitLabel = (option: DurationOption): string => {
    if (option.unit === "weeks") {
      return t("pricingCalcUnitWeeks", "weeks");
    }
    return option.amount === 1
      ? t("pricingCalcUnitMonth", "month")
      : t("pricingCalcUnitMonths", "months");
  };

  const durationPhrase = `${duration.amount} ${unitLabel(duration)}`;
  const ratePhrase = t("pricingCalcRatePerHour", "{{rate}}€/hour", {
    rate: pricing.effectiveRate,
  });
  const standardRatePhrase = t("pricingCalcRatePerHour", "{{rate}}€/hour", {
    rate: pricing.standardRate,
  });

  return (
    <section
      className={cn(styles.calculator, className)}
      aria-labelledby={titleId}
    >
      <div className={styles.controls}>
        <Title
          level={3}
          size="m"
          lineHeight="tight"
          id={titleId}
          className={styles.title}
        >
          {t(
            "pricingCalcTitle",
            "Adjust duration and workload to see your total investment.",
          )}
        </Title>

        <SelectableCardGroup
          legend={t("pricingCalcDurationLegend", "Duration")}
          value={durationId}
          onValueChange={(value) => setDurationId(value as DurationId)}
          orientation="horizontal"
          className={styles.optionGroup}
        >
          {DURATION_OPTIONS.map((option) => (
            <SelectableCard
              key={option.id}
              value={option.id}
              padding="sm"
            >
              <span className={styles.optionContent}>
                <Text as="span" size="m" className={styles.optionAmount}>
                  {option.amount}
                </Text>
                <Text as="span" size="m" className={styles.optionUnit}>
                  {unitLabel(option)}
                </Text>
              </span>
              {option.partnership ? (
                <Badge size="sm" className={styles.partnershipBadge}>
                  {t("pricingCalcPartnershipBadge", "Partnership")}
                </Badge>
              ) : null}
            </SelectableCard>
          ))}
        </SelectableCardGroup>

        <SelectableCardGroup
          legend={t("pricingCalcWorkloadLegend", "Workload")}
          value={String(daysPerWeek)}
          onValueChange={(value) => setDaysPerWeek(Number(value))}
          orientation="horizontal"
          className={styles.optionGroup}
        >
          {DAYS_PER_WEEK_OPTIONS.map((days) => (
            <SelectableCard
              key={days}
              value={String(days)}
              padding="sm"
            >
              <span className={styles.optionContent}>
                <Text as="span" size="m" className={styles.optionAmount}>
                  {days}
                </Text>
                <Text as="span" size="m" className={styles.optionUnit}>
                  {t("pricingCalcUnitDaysPerWeek", "days/week")}
                </Text>
              </span>
            </SelectableCard>
          ))}
        </SelectableCardGroup>

        <div className={styles.metaRow}>
          <Card variant="muted" padding="md" className={styles.metaCard}>
            <div className={styles.metaHeader}>
              <Text as="span" size="s" className={styles.metaLabel}>
                {t("pricingCalcAllocationLabel", "Allocation")}
              </Text>
              <Text as="span" size="l" className={styles.metaValue}>
                {pricing.allocationPercent}%
              </Text>
            </div>
            <Text as="p" size="s" className={styles.metaFootnote}>
              {t(
                "pricingCalcAllocationBasis",
                "Based on {{days}} days/week × {{hours}} hours/day",
                { days: daysPerWeek, hours: HOURS_PER_DAY },
              )}
            </Text>
          </Card>
          <Card variant="muted" padding="md" className={styles.metaCard}>
            <div className={styles.metaLine}>
              <Text as="span" size="s" className={styles.metaLabel}>
                {t("pricingCalcTotalHoursLabel", "Total hours:")}
              </Text>
              <Text as="span" size="s" className={styles.metaFigure}>
                {numberFormat.format(pricing.totalHours)}
              </Text>
            </div>
            <div className={styles.metaLine}>
              <Text as="span" size="s" className={styles.metaLabel}>
                {t("pricingCalcStandardRateLabel", "Standard rate:")}
              </Text>
              <Text as="span" size="s" className={styles.metaFigure}>
                {standardRatePhrase}
              </Text>
            </div>
          </Card>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.included}>
          <Text as="p" size="m" className={styles.includedTitle}>
            {t("pricingCalcIncludedTitle", "What's included in your investment:")}
          </Text>
          <List
            size="m"
            spacing="normal"
            className={styles.includedList}
            items={[
              t("pricingCalcIncludedDuration", "{{duration}} design partnership", {
                duration: durationPhrase,
              }),
              t(
                "pricingCalcIncludedWorkload",
                "Dedicated design expertise for {{days}} days per week",
                { days: daysPerWeek },
              ),
              t(
                "pricingCalcIncludedProcess",
                "Complete end-to-end design process and deliverables",
              ),
              t(
                "pricingCalcIncludedCollaboration",
                "Direct collaboration and strategic design guidance",
              ),
            ]}
          />
        </div>

        <Card variant="muted" padding="lg" className={styles.priceCard}>
          <Text as="p" size="s" className={styles.priceLabel}>
            {t("pricingCalcYourPriceLabel", "Your price")}
          </Text>
          <Text as="p" size="l" className={styles.priceValue}>
            {ratePhrase}
          </Text>
        </Card>

        <Card variant="muted" padding="lg" className={styles.totalCard}>
          <Text as="span" size="m" className={styles.totalLabel}>
            {t("pricingCalcTotalInvestmentLabel", "Total Investment:")}
          </Text>
          <Text as="span" size="l" className={styles.totalValue}>
            {numberFormat.format(pricing.total)}&nbsp;€
          </Text>
        </Card>

        <Button
          href="/contact?mode=book"
          variant="primary"
          size="lg"
          className={styles.cta}
        >
          {t("pricingCalcCta", "Get in touch")}
        </Button>
      </div>
    </section>
  );
}

PricingCalculator.displayName = "PricingCalculator";

export default PricingCalculator;
