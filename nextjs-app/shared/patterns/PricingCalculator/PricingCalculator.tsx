"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  List,
  SelectableCard,
  SelectableCardGroup,
  Switch,
  Text,
  Title,
  VisuallyHidden,
} from "@digitaltableteur/react";
import { useLocalization } from "../../lib/translation";
import { cn } from "../../lib/cn";
import {
  DURATION_OPTIONS,
  HOURS_PER_DAY,
  PARTNERSHIP_MIN_DAYS,
  getWorkloadOptions,
  computePricing,
  daysToPercent,
  getDurationOption,
  nearestWorkload,
  type DurationId,
  type DurationOption,
  type WorkloadUnit,
} from "./pricingMath";
import styles from "./PricingCalculator.module.css";

type FitItem = { key: string; defaultText: string };

/** Selection-dependent "Perfect for" copy: two duration-fit services plus one
 * workload-pace line (advisory below 75% of a week, delivery from 75%). */
const PERFECT_FOR: Record<DurationId, FitItem[]> = {
  "2w": [
    {
      key: "pricingCalcPerfectFor2w1",
      defaultText: "Rapid UX sprints and POC/MVP validation",
    },
    {
      key: "pricingCalcPerfectFor2w2",
      defaultText: "Focused design audits with an actionable roadmap",
    },
  ],
  "1m": [
    {
      key: "pricingCalcPerfectFor1m1",
      defaultText: "UX/UI design for a single feature or landing page",
    },
    {
      key: "pricingCalcPerfectFor1m2",
      defaultText: "Design token foundations and component cleanup",
    },
  ],
  "2m": [
    {
      key: "pricingCalcPerfectFor2m1",
      defaultText: "End-to-end MVP design, from flows to handoff",
    },
    {
      key: "pricingCalcPerfectFor2m2",
      defaultText: "Design system lift-off: audit, tokens and core components",
    },
  ],
  "3m": [
    {
      key: "pricingCalcPerfectFor3m1",
      defaultText: "Design system build-out with adoption support",
    },
    {
      key: "pricingCalcPerfectFor3m2",
      defaultText: "AI-ready DesignOps: governance, tooling and playbooks",
    },
  ],
  "6m": [
    {
      key: "pricingCalcPerfectFor6m1",
      defaultText: "An embedded design partner across product and brand",
    },
    {
      key: "pricingCalcPerfectFor6m2",
      defaultText:
        "Design system programs with governance and agent-assisted ops",
    },
  ],
  "12m": [
    {
      key: "pricingCalcPerfectFor12m1",
      defaultText: "Holistic design leadership for your whole product",
    },
    {
      key: "pricingCalcPerfectFor12m2",
      defaultText: "Org-wide design system stewardship and AI enablement",
    },
  ],
};

const WORKLOAD_FIT: { advisory: FitItem; delivery: FitItem } = {
  advisory: {
    key: "pricingCalcPerfectForAdvisory",
    defaultText:
      "An advisory pace: direction, reviews and coaching alongside your team",
  },
  delivery: {
    key: "pricingCalcPerfectForDelivery",
    defaultText: "Hands-on, end-to-end design execution",
  },
};

export interface PricingCalculatorProps {
  /** Optional wrapper class. */
  className?: string;
  /**
   * Start from the `?duration=6m&days=4` selection in the page URL (the same
   * parameters the calculator's own CTA emits), so a link can arrive with a
   * tier already chosen. Invalid or missing values keep the defaults.
   */
  selectionFromUrl?: boolean;
}

/** Reads a valid duration/workload pair from a query string, or null. A
 * workload that only the percentage view offers (days=3.75) opens that view. */
export function parseCalculatorSelection(search: string): {
  durationId: DurationId;
  daysPerWeek: number;
  unit: WorkloadUnit;
} | null {
  const params = new URLSearchParams(search);
  const durationParam = params.get("duration");
  const option = DURATION_OPTIONS.find((item) => item.id === durationParam);
  if (!option) return null;
  const dayOptions = getWorkloadOptions(option.id, "days");
  const percentOptions = getWorkloadOptions(option.id, "percent");
  const days = Number(params.get("days"));
  if (dayOptions.includes(days)) {
    return { durationId: option.id, daysPerWeek: days, unit: "days" };
  }
  if (percentOptions.includes(days)) {
    return { durationId: option.id, daysPerWeek: days, unit: "percent" };
  }
  return {
    durationId: option.id,
    daysPerWeek: Math.max(...dayOptions),
    unit: "days",
  };
}

/**
 * PricingCalculator — duration × workload → total investment. Selections are
 * two single-select SelectableCardGroups; the summary column recomputes the
 * effective hourly rate, total hours, and total investment on every change.
 */
export function PricingCalculator({
  className,
  selectionFromUrl = false,
}: PricingCalculatorProps) {
  const { translate: t, resolvedLanguage } = useLocalization();
  const titleId = useId();
  const introId = useId();
  const workloadGroupRef = useRef<HTMLDivElement>(null);
  const [durationId, setDurationId] = useState<DurationId>("2w");
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  // Many clients order 25/50/75/100% allocations; the switch shows those
  // instead of 2-5 days. Both views price the same days per week.
  const [workloadUnit, setWorkloadUnit] = useState<WorkloadUnit>("days");

  // Applied after mount rather than in the initial state: the page is
  // statically rendered, so the server never sees the query string and the
  // first client render must match it.
  useEffect(() => {
    if (!selectionFromUrl) return;
    const selection = parseCalculatorSelection(window.location.search);
    if (!selection) return;
    setDurationId(selection.durationId);
    setDaysPerWeek(selection.daysPerWeek);
    setWorkloadUnit(selection.unit);
  }, [selectionFromUrl]);

  const duration = getDurationOption(durationId);
  const workloadOptions = getWorkloadOptions(durationId, workloadUnit);
  const pricing = computePricing(durationId, daysPerWeek);

  const selectDuration = (value: string) => {
    const nextId = value as DurationId;
    setDurationId(nextId);
    const options = getWorkloadOptions(nextId, workloadUnit);
    if (!options.includes(daysPerWeek)) {
      // Safari keeps focus on a label-clicked duration while a previously
      // arrow-focused workload radio unmounts with the clamp; if that radio
      // held focus, move it to the newly checked one after re-render.
      const active = document.activeElement;
      const lostFocus =
        active instanceof HTMLInputElement &&
        workloadGroupRef.current?.contains(active) === true;
      setDaysPerWeek(Math.min(...options));
      if (lostFocus) {
        requestAnimationFrame(() => {
          workloadGroupRef.current
            ?.querySelector<HTMLInputElement>("input:checked")
            ?.focus();
        });
      }
    }
  };

  const selectWorkloadUnit = (percent: boolean) => {
    const nextUnit: WorkloadUnit = percent ? "percent" : "days";
    setWorkloadUnit(nextUnit);
    setDaysPerWeek(
      nearestWorkload(daysPerWeek, getWorkloadOptions(durationId, nextUnit)),
    );
  };

  const numberFormat = useMemo(
    () =>
      new Intl.NumberFormat(resolvedLanguage || "en", {
        maximumFractionDigits: 0,
      }),
    [resolvedLanguage],
  );
  const daysFormat = useMemo(
    () =>
      new Intl.NumberFormat(resolvedLanguage || "en", {
        maximumFractionDigits: 2,
      }),
    [resolvedLanguage],
  );
  const hoursFormat = useMemo(
    () =>
      new Intl.NumberFormat(resolvedLanguage || "en", {
        maximumFractionDigits: 1,
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
      aria-describedby={introId}
    >
      <VisuallyHidden as="div">
        <div role="status">
          {t(
            "pricingCalcLiveSummary",
            "{{hours}} hours at {{days}} days/week, {{rate}}, total {{total}} €",
            {
              hours: numberFormat.format(pricing.totalHours),
              days: daysPerWeek,
              rate: ratePhrase,
              total: numberFormat.format(pricing.total),
            },
          )}
          {pricing.discount > 0
            ? ` ${t(
                "pricingCalcPartnershipFreeDay",
                "Partnership pricing: 1 day per week is free.",
              )}`
            : ""}
        </div>
      </VisuallyHidden>

      {/* The heading names the tool; the instruction sits under it. */}
      <div className={styles.header}>
        <Title level={2} size="m" lineHeight="tight" id={titleId}>
          {t("pricingCalcHeading", "Pricing calculator")}
        </Title>
        <Text as="p" size="m" id={introId} className={styles.intro}>
          {t(
            "pricingCalcTitle",
            "Adjust duration and workload to see your total investment.",
          )}
        </Text>
      </div>

      <div className={styles.controls}>
        <SelectableCardGroup
          legend={t("pricingCalcDurationLegend", "Duration")}
          value={durationId}
          onValueChange={(value) => selectDuration(value as string)}
          orientation="horizontal"
          className={styles.optionGroup}
        >
          {DURATION_OPTIONS.map((option) => (
            <SelectableCard key={option.id} value={option.id} padding="sm">
              <span className={styles.optionContent}>
                <Text as="span" size="m" className={styles.optionAmount}>
                  {option.amount}
                </Text>{" "}
                <Text as="span" size="m" className={styles.optionUnit}>
                  {unitLabel(option)}
                </Text>{" "}
                {option.partnership ? (
                  <Badge size="xs" className={styles.partnershipBadge}>
                    {t("pricingCalcPartnershipBadge", "Partnership")}
                  </Badge>
                ) : null}
              </span>
            </SelectableCard>
          ))}
        </SelectableCardGroup>

        <div ref={workloadGroupRef} className={styles.workload}>
          {/* On the legend line from tablet width up; above it on phones. */}
          <div className={styles.unitSwitch}>
            <Switch
              size="sm"
              label={t("pricingCalcShowPercent", "Show as percentages")}
              labelPlacement="left"
              checked={workloadUnit === "percent"}
              onCheckedChange={selectWorkloadUnit}
            />
          </div>
          <SelectableCardGroup
            legend={t("pricingCalcWorkloadLegend", "Workload (per week)")}
            value={String(daysPerWeek)}
            onValueChange={(value) => setDaysPerWeek(Number(value))}
            orientation="horizontal"
            className={styles.optionGroup}
          >
            {workloadOptions.map((days) => (
              <SelectableCard key={days} value={String(days)} padding="sm">
                <span className={styles.optionContent}>
                  {workloadUnit === "percent" ? (
                    // Locale-aware: "25%" in English, "25 %" in Finnish.
                    <Text as="span" size="m" className={styles.optionAmount}>
                      {t("pricingCalcAllocationValue", "{{percent}}%", {
                        percent: daysToPercent(days),
                      })}
                    </Text>
                  ) : (
                    <>
                      <Text as="span" size="m" className={styles.optionAmount}>
                        {daysFormat.format(days)}
                      </Text>{" "}
                      <Text as="span" size="m" className={styles.optionUnit}>
                        {t("pricingCalcUnitDays", "days")}
                      </Text>
                    </>
                  )}{" "}
                  {duration.partnership && days >= PARTNERSHIP_MIN_DAYS ? (
                    <Badge size="xs" className={styles.partnershipBadge}>
                      {t("pricingCalcPartnershipBadge", "Partnership")}
                    </Badge>
                  ) : null}
                </span>
              </SelectableCard>
            ))}
          </SelectableCardGroup>
        </div>

        <div className={styles.metaRow}>
          <Card variant="muted" padding="md" className={styles.metaCard}>
            <div className={styles.metaHeader}>
              <Text as="span" size="s" className={styles.metaLabel}>
                {t("pricingCalcAllocationLabel", "Allocation")}
              </Text>
              <Text as="span" size="l" className={styles.metaValue}>
                {t("pricingCalcAllocationValue", "{{percent}}%", {
                  percent: pricing.allocationPercent,
                })}
              </Text>
            </div>
            <Text as="p" size="s" className={styles.metaFootnote}>
              {t(
                "pricingCalcAllocationBasis",
                "{{days}} days/week × {{hours}} hrs/day",
                {
                  days: daysFormat.format(daysPerWeek),
                  hours: hoursFormat.format(HOURS_PER_DAY),
                },
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
                {pricing.discount > 0 ? (
                  // The partnership rate is in effect: strike the standard
                  // rate so the lower price further down reads as applied.
                  <>
                    <s className={styles.rateSuperseded}>
                      {standardRatePhrase}
                    </s>
                    <VisuallyHidden>
                      {t(
                        "pricingCalcStandardRateReplaced",
                        " (replaced by the partnership rate)",
                      )}
                    </VisuallyHidden>
                  </>
                ) : (
                  standardRatePhrase
                )}
              </Text>
            </div>
          </Card>
        </div>
      </div>

      <div className={styles.summaryFooter}>
        <Card
          variant="muted"
          padding="lg"
          className={cn(
            styles.priceCard,
            pricing.discount > 0 && styles.priceCardDiscounted,
          )}
        >
          <Text as="p" size="s" className={styles.priceLabel}>
            {t("pricingCalcYourPriceLabel", "Your price")}
          </Text>
          <Text as="p" size="l" className={styles.priceValue}>
            {ratePhrase}
          </Text>
          <Text as="p" size="s" className={styles.priceHint}>
            {t(
              "pricingCalcPartnershipHint",
              "Partnership rate 90€/hour applies on 6 and 12 month engagements at 4+ days per week (75%+) workloads.",
            )}
          </Text>
          <Text as="p" size="xs" className={cn(styles.priceHint, styles.priceTerms)}>
            {t(
              "pricingCalcTerms",
              "Prices exclude Finnish VAT. This is an estimate, not an offer: scope, schedule and price are confirmed in a written proposal.",
            )}
          </Text>
        </Card>

        <Card variant="muted" padding="lg" className={styles.totalCard}>
          <Text as="span" size="m" className={styles.totalLabel}>
            {t("pricingCalcTotalInvestmentLabel", "Total Investment:")}
          </Text>
          <Text as="span" size="l" className={styles.totalValue}>
            {numberFormat.format(pricing.total)}&nbsp;€
          </Text>
          {pricing.discount > 0 ? (
            <Text as="span" size="s" className={styles.totalNote}>
              {/* "1 day free" is the days framing (4+ days); at 75% the same
                  25% discount is less than a day, so say it as a share. */}
              {workloadUnit === "percent"
                ? t(
                    "pricingCalcPartnershipPercentOff",
                    "Partnership pricing: 25% off the standard rate.",
                  )
                : t(
                    "pricingCalcPartnershipFreeDay",
                    "Partnership pricing: 1 day per week is free.",
                  )}
            </Text>
          ) : null}
        </Card>

        <Button
          href={`/contact?mode=book&duration=${durationId}&days=${daysPerWeek}`}
          variant="primary"
          size="lg"
          className={styles.cta}
        >
          {t("pricingCalcCta", "Get in touch")}
        </Button>
      </div>

      <div className={styles.included}>
        <Text as="p" size="m" className={styles.includedTitle}>
          {t("pricingCalcIncludedTitle", "What's included in your investment:")}
        </Text>
        <List
          size="m"
          spacing="normal"
          listStyleType="dash"
          className={styles.includedList}
          items={[
            t(
              "pricingCalcIncludedDuration",
              "{{duration}} design partnership",
              {
                duration: durationPhrase,
              },
            ),
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

      <div className={styles.perfectFor}>
        <Text as="p" size="m" className={styles.perfectForTitle}>
          {t("pricingCalcPerfectForTitle", "Perfect for:")}
        </Text>
        <List
          size="m"
          spacing="normal"
          listStyleType="dash"
          className={styles.perfectForList}
          items={[
            ...PERFECT_FOR[durationId].map((item) =>
              t(item.key, item.defaultText),
            ),
            t(
              daysPerWeek < PARTNERSHIP_MIN_DAYS
                ? WORKLOAD_FIT.advisory.key
                : WORKLOAD_FIT.delivery.key,
              daysPerWeek < PARTNERSHIP_MIN_DAYS
                ? WORKLOAD_FIT.advisory.defaultText
                : WORKLOAD_FIT.delivery.defaultText,
            ),
          ]}
        />
      </div>
    </section>
  );
}

PricingCalculator.displayName = "PricingCalculator";

export default PricingCalculator;
