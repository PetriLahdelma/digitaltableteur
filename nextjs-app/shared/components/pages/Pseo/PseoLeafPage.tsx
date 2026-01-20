import Link from "next/link";

import type { PseoLeafPage, PseoPageCopy, PseoRelatedLinkCopy } from "@/lib/pseo/types";

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

const defaultIntro = (page: PseoLeafPage) =>
  `This guide explains how **${page.service.name.toLowerCase()}** works for **${page.audience.name}** when your product stack includes **${page.stack.name}**.\n\nIt is written as a practical playbook: clear headings, copy-pasteable checklists, and internal links to related topics.`;

const buildDefaultSections = (page: PseoLeafPage) => [
  {
    id: "overview",
    title: "Overview",
    bodyMarkdown: `**Goal:** Ship a UI foundation that stays consistent as your product grows.\n\n**Context:** ${page.audience.shortDescription} ${page.stack.shortDescription}`,
  },
  {
    id: "deliverables",
    title: "What you get",
    bodyMarkdown:
      "- A pragmatic scope (what to standardize now vs later)\n- Accessibility and QA checklist\n- A roadmap you can execute with your team\n- Documentation and ownership model",
  },
  {
    id: "process",
    title: "Process",
    bodyMarkdown:
      "1. Baseline assessment (components, tokens, patterns)\n2. Identify sources of inconsistency and rework\n3. Define minimal viable standards\n4. Implement, document, and set governance",
  },
  {
    id: "faq",
    title: "FAQ",
    bodyMarkdown:
      "**How long does this take?** Usually days to weeks depending on surface area.\n\n**Do you work with existing code?** Yes—auditing and upgrading incrementally is often the fastest path.",
  },
];

const buildFallbackReason = (from: PseoLeafPage, to: PseoLeafPage): string => {
  if (from.service.slug === to.service.slug) {
    return `Same service, different angle: compare how **${from.service.name.toLowerCase()}** shifts depending on stack and team context.`;
  }
  if (from.stack.slug === to.stack.slug) {
    return `Same stack focus: additional guidance for shipping a design system with **${from.stack.name}**.`;
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
      reasonMarkdown: copy?.reasonMarkdown ?? buildFallbackReason(page, related),
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
  const sections =
    copy?.sections?.length && copy.sections.length > 0
      ? copy.sections
      : buildDefaultSections(page);

  const related = mergeRelated(page, relatedPages, copy?.related);

  return (
    <PageLayout as="main" maxWidth="md" spacing="comfortable">
      <div className={styles.root}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/pseo">PSEO</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/pseo/services/${page.service.slug}`}>
            {page.service.name}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/pseo/stacks/${page.stack.slug}`}>{page.stack.name}</Link>
          <span aria-hidden="true">/</span>
          <span>{page.audience.name}</span>
        </nav>

        <Title terminals="sans" level={1} size="L">
          {page.title}
        </Title>
        <Text terminals="sans" size="L">
          {page.description}
        </Text>

        <PseoClusterBadges
          className={styles.badgeRow}
          linkClassName={styles.badgeLink}
          serviceHref={`/pseo/services/${page.service.slug}`}
          serviceName={page.service.name}
          stackHref={`/pseo/stacks/${page.stack.slug}`}
          stackName={page.stack.name}
          audienceHref={`/pseo/audiences/${page.audience.slug}`}
          audienceName={page.audience.name}
        />

        <section className={styles.section} aria-label="Introduction">
          <MarkdownMessage
            content={copy?.introMarkdown ?? defaultIntro(page)}
            renderWithDesignSystem
            designSystemTextSize="S"
          />
        </section>

        <aside className={styles.toc} aria-label="Table of contents">
          <Title terminals="sans" level={2} size="XS">
            Table of contents
          </Title>
          <ol className={styles.tocList}>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
            <li>
              <a href="#related">Related guides</a>
            </li>
          </ol>
        </aside>

        {sections.map((section) => (
          <section key={section.id} id={section.id} className={styles.section}>
            <Title terminals="sans" level={2} size="S">
              {section.title}
            </Title>
            <MarkdownMessage
              content={section.bodyMarkdown}
              renderWithDesignSystem
              designSystemTextSize="S"
            />
            <MarkdownMessage
              content={section.bodyMarkdown}
              renderWithDesignSystem
              designSystemTextSize="S"
            />
          </section>
        ))}

        <section id="related" className={styles.section}>
          <Title terminals="sans" level={2} size="S">
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
                  size: "S",
                  as: "h3",
                }}
              >
                <div className={styles.relatedReason}>
                  <MarkdownMessage
                    content={item.reasonMarkdown}
                    renderWithDesignSystem
                    designSystemTextSize="S"
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className={styles.cta} aria-label="Call to action">
          <Title terminals="sans" level={2} size="S">
            Want help implementing this?
          </Title>
          <Text terminals="sans">
            If you want to move faster with a production-grade design system,
            send a message and describe your current stack and constraints.
          </Text>
          <div className={styles.ctaActions}>
            <Button href="/contact" variant="primary" size="l" data-donny-interest="pseo-contact">
              Contact
            </Button>
            <Button href="/work" variant="secondary" size="l" data-donny-interest="work-cta">
              See work
            </Button>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
