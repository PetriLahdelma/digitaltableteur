"use client";

import { useId } from "react";
import {
  Accordion,
  Badge,
  Breadcrumb,
  Button,
  Container,
  Icon,
  Link,
  Text,
  Title,
} from "@digitaltableteur/react";
import { ReliablePartnerBadge } from "../../components/ReliablePartnerBadge";
import { VisuallyHidden } from "../../components/VisuallyHidden";
import { ENGAGEMENTS, getEngagementPath, type EngagementId } from "../../data/engagements";
import { useTranslate } from "../../lib/translation";
import { cn } from "../../lib/cn";
import { ProcurementFaq } from "../ProcurementFaq";
import styles from "./EngagementPageContent.module.css";

export interface EngagementPageContentProps {
  /** Which engagement to render. */
  engagementId: EngagementId;
  /** Additional class name on the root. */
  className?: string;
}

interface QA {
  question: string;
  answer: string;
}

interface ProofCopy {
  eyebrow: string;
  title: string;
  body: string;
}

const asStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

const asQA = (value: unknown): QA[] =>
  Array.isArray(value)
    ? value.filter(
        (v): v is QA =>
          typeof v === "object" &&
          v !== null &&
          typeof (v as QA).question === "string" &&
          typeof (v as QA).answer === "string",
      )
    : [];

/**
 * One engagement offer page: the problem, when it fits, scope and limits,
 * steps, deliverables, investment, published proof, an offer FAQ, the shared
 * procurement FAQ, the other engagements and a booking call to action. A
 * breadcrumb back to Pricing leads the page. Copy comes from
 * `engagementPages.<id>`; routes, prices and proof order from
 * `data/engagements`.
 */
export function EngagementPageContent({
  engagementId,
  className,
}: EngagementPageContentProps) {
  const t = useTranslate();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const config = ENGAGEMENTS.find((engagement) => engagement.id === engagementId);
  if (!config) return null;

  const key = (field: string) => `engagementPages.${engagementId}.${field}`;
  const text = (field: string) => t(key(field));
  const list = (field: string) =>
    asStrings(t(key(field), { returnObjects: true, defaultValue: [] }) as unknown);
  const common = (field: string) => t(`engagementPages.common.${field}`);
  const price = t(config.priceKey);
  const faq = asQA(t(key("faq"), { returnObjects: true, defaultValue: [] }) as unknown);
  const proof = config.proof.map((slug) => ({
    slug,
    ...(t(`engagementPages.proof.${slug}`, {
      returnObjects: true,
      defaultValue: { eyebrow: "", title: slug, body: "" },
    }) as unknown as ProofCopy),
  }));
  const siblings = ENGAGEMENTS.filter((engagement) => engagement.id !== engagementId).map(
    (engagement) => ({
      id: engagement.id,
      href: getEngagementPath(engagement),
      name: t(`engagementPages.${engagement.id}.eyebrow`),
      meta: `${t(engagement.durationKey)}, ${t(engagement.priceKey)}`,
    }),
  );
  const ids = {
    title: `${uid}-title`,
    signals: `${uid}-signals`,
    scope: `${uid}-scope`,
    steps: `${uid}-steps`,
    deliverables: `${uid}-deliverables`,
    invest: `${uid}-invest`,
    proof: `${uid}-proof`,
    faq: `${uid}-faq`,
    other: `${uid}-other`,
    book: `${uid}-book`,
  };

  return (
    <article
      aria-labelledby={ids.title}
      className={cn(styles.root, className)}
      data-engagement={engagementId}
    >
      <Container size="lg">
        <div className={styles.breadcrumb}>
          <Breadcrumb
            aria-label={common("breadcrumbLabel")}
            items={[
              { label: common("breadcrumbHome"), href: "/" },
              { label: common("breadcrumbPricing"), href: "/pricing" },
              { label: text("eyebrow") },
            ]}
          />
        </div>
        <header className={styles.hero}>
          <Badge variant="secondary" size="md">
            {text("eyebrow")}
          </Badge>
          <Title level={1} size="l" id={ids.title} className={styles.heroTitle}>
            {text("title")}
          </Title>
          <Text as="p" size="l" className={styles.lead}>
            {text("lead")}
          </Text>
          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>{common("factTimeline")}</dt>
              <dd>{t(config.durationKey)}</dd>
            </div>
            <div className={styles.fact}>
              <dt>{common("factInvestment")}</dt>
              <dd>{price}</dd>
            </div>
            <div className={styles.fact}>
              <dt>{common("factPackage")}</dt>
              <dd>{text("package")}</dd>
            </div>
          </dl>
          <div className={styles.ctas}>
            <Button href={config.primaryHref} variant="primary" size="md">
              {text("cta1")}
            </Button>
            <Button href={config.secondaryHref} variant="secondary" size="md">
              {text("cta2")}
            </Button>
          </div>
        </header>

        <section aria-labelledby={ids.signals} className={styles.section}>
          <Title level={2} size="s" id={ids.signals} className={styles.sectionTitle}>
            {text("signalsTitle")}
          </Title>
          <ul className={styles.signals}>
            {list("signals").map((signal) => (
              <li key={signal} className={styles.signal}>
                <Text as="span" size="m">
                  {signal}
                </Text>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={ids.scope} className={cn(styles.section, styles.split)}>
          <div className={styles.stack}>
            <Title level={2} size="xs" id={ids.scope}>
              {text("scopeTitle")}
            </Title>
            <Text as="p" size="m">
              {text("scope")}
            </Text>
          </div>
          <div className={styles.limits}>
            <Title level={3} size="xxs">
              {text("limitsTitle")}
            </Title>
            <ul className={styles.limitList}>
              {list("limits").map((limit) => (
                <li key={limit}>
                  <Text as="span" size="s">
                    {limit}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby={ids.steps} className={styles.section}>
          <Title level={2} size="s" id={ids.steps} className={styles.sectionTitle}>
            {text("stepsTitle")}
          </Title>
          <ol className={styles.steps}>
            {list("steps").map((step, index) => (
              <li key={step} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <Text as="span" size="m">
                  {step}
                </Text>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby={ids.deliverables} className={styles.section}>
          <div className={styles.band}>
            <Title level={2} size="s" id={ids.deliverables} className={styles.bandTitle}>
              {text("deliverablesTitle")}
            </Title>
            <ul className={styles.deliverables}>
              {list("deliverables").map((item) => (
                <li key={item} className={styles.deliverable}>
                  <Icon name="check-circle" size={24} aria-hidden="true" />
                  <Text as="span" size="m">
                    {item}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby={ids.invest} className={cn(styles.section, styles.split)}>
          <div className={styles.priceCard}>
            <Text as="p" size="s" className={styles.muted}>
              {common("investLabel")}
            </Text>
            <p className={styles.price}>{price}</p>
            <Text as="p" size="m" className={styles.muted}>
              {text("investMeta")}
            </Text>
            <Link href={config.investHref} className={styles.arrowLink}>
              {text("investLink")}
              <Icon name="arrow-right" size={20} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.stack}>
            <Title level={2} size="xs" id={ids.invest}>
              {common("investTitle")}
            </Title>
            <Text as="p" size="m">
              {text("investNote")}
            </Text>
            <div className={styles.trust}>
              <ReliablePartnerBadge size="sm" />
              <Text as="p" size="s" className={styles.muted}>
                {t(
                  "pricingTrustNote",
                  "Digitaltableteur is a Vastuu Group Reliable Partner: tax, pension and employer obligations continuously verified.",
                )}
              </Text>
            </div>
          </div>
        </section>

        <section aria-labelledby={ids.proof} className={styles.section}>
          <Title level={2} size="s" id={ids.proof} className={styles.sectionTitle}>
            {common("proofTitle")}
          </Title>
          <ul className={styles.proof}>
            {proof.map((item) => (
              <li key={item.slug} className={styles.proofCard}>
                <Text as="p" size="s" className={styles.muted}>
                  {item.eyebrow}
                </Text>
                <Title level={3} size="xxs">
                  {item.title}
                </Title>
                <Text as="p" size="s">
                  {item.body}
                </Text>
                <Link href={`/work/${item.slug}`} className={styles.arrowLink}>
                  {common("proofLink")}
                  <VisuallyHidden>{`: ${item.title}`}</VisuallyHidden>
                  <Icon name="arrow-right" size={20} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={ids.faq} className={cn(styles.section, styles.faq)}>
          <Title level={2} size="s" id={ids.faq}>
            {text("faqTitle")}
          </Title>
          <Accordion
            variant="divided"
            defaultOpenId={faq.length ? `${uid}-faq-0` : undefined}
            items={faq.map((item, index) => ({
              id: `${uid}-faq-${index}`,
              title: item.question,
              content: (
                <Text as="p" size="s">
                  {item.answer}
                </Text>
              ),
            }))}
          />
        </section>

        <div className={styles.section}>
          <ProcurementFaq id={`${uid}-procurement`} />
        </div>

        <section aria-labelledby={ids.other} className={styles.section}>
          <Title level={2} size="s" id={ids.other} className={styles.sectionTitle}>
            {common("otherTitle")}
          </Title>
          <ul className={styles.siblings}>
            {siblings.map((sibling) => (
              <li key={sibling.id} className={styles.sibling}>
                <Link href={sibling.href} underline="none" className={styles.siblingLink}>
                  <span className={styles.siblingHead}>
                    <span className={styles.siblingName}>{sibling.name}</span>
                    <Icon name="arrow-right" size={20} aria-hidden="true" />
                  </span>{" "}
                  <span className={styles.siblingMeta}>{sibling.meta}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={ids.book} className={cn(styles.section, styles.bookSection)}>
          <div className={styles.book}>
            <div className={styles.stack}>
              <Title level={2} size="s" id={ids.book} className={styles.onPanel}>
                {text("bookTitle")}
              </Title>
              <Text as="p" size="l" className={styles.onPanel}>
                {text("bookBody")}
              </Text>
            </div>
            <div className={styles.bookActions}>
              <Button href={config.primaryHref} variant="primary" surface="onDark" size="md">
                {text("cta1")}
              </Button>
              <Button href={config.secondaryHref} variant="secondary" surface="onDark" size="md">
                {text("cta2")}
              </Button>
            </div>
          </div>
        </section>
      </Container>
    </article>
  );
}

EngagementPageContent.displayName = "EngagementPageContent";

export default EngagementPageContent;
