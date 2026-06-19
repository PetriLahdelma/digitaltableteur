import Link from "next/link";

import { mergeLeafCopy } from "@/lib/pseo/leaf-blocks";
import type {
  PseoLeafPage,
  PseoPageCopy,
  PseoRelatedLinkCopy,
} from "@/lib/pseo/types";

import Card from "@dt/Card";
import Button from "@dt/Button";
import MarkdownMessage from "@dt/MarkdownMessage";
import PageLayout from "../../../patterns/PageLayout/PageLayout";
import Text from "@dt/Text";
import Title from "@dt/Title";
import { PseoClusterBadges } from "./PseoClusterBadges";
import styles from "./PseoLeafPage.module.css";

type RelatedViewModel = {
  page: PseoLeafPage;
  reasonMarkdown: string;
};

const SECTION_NAV = [
  { id: "situation", title: "Situation" },
  { id: "failure-modes", title: "What goes wrong" },
  { id: "playbook", title: "Playbook" },
  { id: "deliverables", title: "Deliverables checklist" },
  { id: "proof", title: "Proof" },
  { id: "package", title: "Package fit" },
  { id: "faq", title: "FAQ" },
] as const;

const buildFallbackReason = (from: PseoLeafPage, to: PseoLeafPage): string => {
  if (from.service.slug === to.service.slug) {
    return `Same service, different angle: compare how **${from.service.name.toLowerCase()}** shifts depending on stack and team context.`;
  }
  if (from.stack.slug === to.stack.slug) {
    return `Same stack focus: additional guidance for shipping a design system with **${from.stack.displayName ?? from.stack.name}**.`;
  }
  if (from.audience.slug === to.audience.slug) {
    return `Same audience: more tactics tailored for **${from.audience.name}**.`;
  }
  return "Related guide in the same content cluster.";
};

const mergeRelated = (
  page: PseoLeafPage,
  relatedPages: PseoLeafPage[],
  relatedCopy?: PseoRelatedLinkCopy[],
): RelatedViewModel[] => {
  const bySlug = new Map<string, PseoRelatedLinkCopy>();
  for (const entry of relatedCopy ?? []) {
    bySlug.set(entry.slug, entry);
  }

  return relatedPages.map((related) => {
    const copy = bySlug.get(related.slug);
    return {
      page: related,
      reasonMarkdown:
        copy?.reasonMarkdown ?? buildFallbackReason(page, related),
    };
  });
};

export function PseoLeafPageView({
  page,
  copy,
  relatedPages,
}: {
  page: PseoLeafPage;
  copy?: PseoPageCopy;
  relatedPages: PseoLeafPage[];
}) {
  const { introMarkdown, blocks } = mergeLeafCopy(page, copy);
  const related = mergeRelated(page, relatedPages, copy?.related);

  return (
    <PageLayout as="main" maxWidth="md" spacing="comfortable">
      <div className={styles.root}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/pseo">Playbooks</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/pseo/services/${page.service.slug}`}>
            {page.service.name}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/pseo/stacks/${page.stack.slug}`}>
            {page.stack.displayName ?? page.stack.name}
          </Link>
          <span aria-hidden="true">/</span>
          <span>{page.audience.name}</span>
        </nav>

        <Title terminals="sans" level={1} size="l">
          {page.title}
        </Title>
        <Text terminals="sans" size="l">
          {page.description}
        </Text>

        <PseoClusterBadges
          className={styles.badgeRow}
          linkClassName={styles.badgeLink}
          serviceHref={`/pseo/services/${page.service.slug}`}
          serviceName={page.service.name}
          stackHref={`/pseo/stacks/${page.stack.slug}`}
          stackName={page.stack.displayName ?? page.stack.name}
          audienceHref={`/pseo/audiences/${page.audience.slug}`}
          audienceName={page.audience.name}
        />

        <section className={styles.section} aria-label="Introduction">
          <MarkdownMessage
            content={introMarkdown}
            renderWithDesignSystem
            designSystemTextSize="s"
          />
        </section>

        <aside className={styles.toc} aria-label="Table of contents">
          <Title terminals="sans" level={2} size="xs">
            Table of contents
          </Title>
          <ol className={styles.tocList}>
            {SECTION_NAV.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
            <li>
              <a href="#related">Related guides</a>
            </li>
          </ol>
        </aside>

        <section id="situation" className={styles.section}>
          <Title terminals="sans" level={2} size="s">
            Situation
          </Title>
          <MarkdownMessage
            content={blocks.situationMarkdown}
            renderWithDesignSystem
            designSystemTextSize="s"
          />
        </section>

        <section id="failure-modes" className={styles.section}>
          <Title terminals="sans" level={2} size="s">
            What goes wrong
          </Title>
          <MarkdownMessage
            content={blocks.failureModesMarkdown}
            renderWithDesignSystem
            designSystemTextSize="s"
          />
        </section>

        <section id="playbook" className={styles.section}>
          <Title terminals="sans" level={2} size="s">
            Playbook
          </Title>
          <MarkdownMessage
            content={blocks.playbookMarkdown}
            renderWithDesignSystem
            designSystemTextSize="s"
          />
        </section>

        <section id="deliverables" className={styles.section}>
          <Title terminals="sans" level={2} size="s">
            Deliverables checklist
          </Title>
          <MarkdownMessage
            content={blocks.deliverablesMarkdown}
            renderWithDesignSystem
            designSystemTextSize="s"
          />
        </section>

        {blocks.proofLinks.length > 0 ? (
          <section id="proof" className={styles.section}>
            <Title terminals="sans" level={2} size="s">
              Proof
            </Title>
            <div className={styles.proofGrid}>
              {blocks.proofLinks.map((proof) => (
                <Card
                  key={proof.slug}
                  className={styles.proofCard}
                  link={proof.href}
                  linkLabel={`View case study: ${proof.title}`}
                  hoverable
                  size="full"
                  title={proof.title}
                  titleProps={{
                    terminals: "sans",
                    level: 3,
                    size: "s",
                    as: "h3",
                  }}
                  description={proof.reason}
                  descriptionProps={{
                    size: "s",
                    as: "p",
                    className: styles.proofReason,
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

        {blocks.packageFit ? (
          <section id="package" className={styles.callout}>
            <Title terminals="sans" level={2} size="s">
              Package fit
            </Title>
            <Text terminals="sans">{blocks.packageFit.reason}</Text>
            <Text terminals="sans" size="s">
              {blocks.packageFit.name} · {blocks.packageFit.duration} ·{" "}
              {blocks.packageFit.priceRangeEur}
            </Text>
            <div className={styles.ctaActions}>
              <Button
                href="/pricing"
                variant="secondary"
                size="md"
                data-donny-interest="pseo-pricing"
              >
                View pricing
              </Button>
              <Button
                href="/contact?mode=book"
                variant="primary"
                size="md"
                data-donny-interest="pseo-contact"
              >
                Book a call
              </Button>
            </div>
          </section>
        ) : null}

        <section id="faq" className={styles.section}>
          <Title terminals="sans" level={2} size="s">
            FAQ
          </Title>
          <div className={styles.faqList}>
            {blocks.faqs.map((faq) => (
              <div key={faq.question} className={styles.faqItem}>
                <Title terminals="sans" level={3} size="xs" as="h3">
                  {faq.question}
                </Title>
                <MarkdownMessage
                  content={faq.answerMarkdown}
                  renderWithDesignSystem
                  designSystemTextSize="s"
                />
              </div>
            ))}
          </div>
        </section>

        <section id="related" className={styles.section}>
          <Title terminals="sans" level={2} size="s">
            Related guides
          </Title>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <Card
                key={item.page.slug}
                className={styles.relatedCard}
                link={`/pseo/${item.page.slug}`}
                linkLabel={`Open ${item.page.title}`}
                hoverable
                size="full"
                title={item.page.title}
                titleProps={{
                  terminals: "sans",
                  level: 3,
                  size: "s",
                  as: "h3",
                }}
              >
                <div className={styles.relatedReason}>
                  <MarkdownMessage
                    content={item.reasonMarkdown}
                    renderWithDesignSystem
                    designSystemTextSize="s"
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className={styles.cta} aria-label="Call to action">
          <Title terminals="sans" level={2} size="s">
            Want help implementing this?
          </Title>
          <Text terminals="sans">
            Describe your stack, team size, and timeline—we will suggest a
            scoped engagement or point you to the right playbook next step.
          </Text>
          <div className={styles.ctaActions}>
            <Button
              href="/contact"
              variant="primary"
              size="lg"
              data-donny-interest="pseo-contact"
            >
              Contact
            </Button>
            <Button
              href="/work"
              variant="secondary"
              size="lg"
              data-donny-interest="work-cta"
            >
              See work
            </Button>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
