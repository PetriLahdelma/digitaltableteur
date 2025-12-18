import type { PseoCatalog, PseoLeafPage } from "@/lib/pseo/types";

import PageLayout from "../../../patterns/PageLayout/PageLayout";
import Card from "@dt/Card";
import NextLink from "next/link";
import Text from "@dt/Text";
import Title from "@dt/Title";
import styles from "./PseoIndexPage.module.css";

const titleCase = (text: string) =>
  text.replace(/\b\w/g, (match) => match.toUpperCase());

export function PseoIndexPage({
  catalog,
  samplePages,
}: {
  catalog: PseoCatalog;
  samplePages: PseoLeafPage[];
}) {
  return (
    <PageLayout as="main" maxWidth="lg" spacing="comfortable">
      <div className={styles.root}>
        <Title terminals="sans" level={1} size="L">
          Programmatic Guides
        </Title>
        <Text className={styles.lead} size="L" terminals="sans">
          A structured library of design system and DesignOps playbooks. Each
          guide is built with clear headings, a table of contents, and internal
          links for both humans and LLMs.
        </Text>

        <section className={styles.section}>
          <Title terminals="sans" level={2} size="S">
            Services
          </Title>
          <div className={`${styles.grid} ${styles.gridTwo}`.trim()}>
            {catalog.services.map((service) => (
              <Card
                key={service.slug}
                className={styles.card}
                link={`/pseo/services/${service.slug}`}
                linkLabel={`Open ${titleCase(service.name)}`}
                hoverable
                size="full"
                title={titleCase(service.name)}
                titleProps={{
                  terminals: "sans",
                  level: 3,
                  size: "S",
                  as: "h3",
                }}
                description={service.shortDescription}
                descriptionProps={{
                  size: "S",
                  as: "p",
                  className: styles.cardBody,
                }}
              />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Title terminals="sans" level={2} size="S">
            Stacks
          </Title>
          <div className={`${styles.grid} ${styles.gridTwo}`.trim()}>
            {catalog.stacks.map((stack) => (
              <Card
                key={stack.slug}
                className={styles.card}
                link={`/pseo/stacks/${stack.slug}`}
                linkLabel={`Open ${titleCase(stack.name)}`}
                hoverable
                size="full"
                title={titleCase(stack.name)}
                titleProps={{
                  terminals: "sans",
                  level: 3,
                  size: "S",
                  as: "h3",
                }}
                description={stack.shortDescription}
                descriptionProps={{
                  size: "S",
                  as: "p",
                  className: styles.cardBody,
                }}
              />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Title terminals="sans" level={2} size="S">
            Audiences
          </Title>
          <div className={`${styles.grid} ${styles.gridThree}`.trim()}>
            {catalog.audiences.map((audience) => (
              <Card
                key={audience.slug}
                className={styles.card}
                link={`/pseo/audiences/${audience.slug}`}
                linkLabel={`Open ${titleCase(audience.name)}`}
                hoverable
                size="full"
                title={titleCase(audience.name)}
                titleProps={{
                  terminals: "sans",
                  level: 3,
                  size: "S",
                  as: "h3",
                }}
                description={audience.shortDescription}
                descriptionProps={{
                  size: "S",
                  as: "p",
                  className: styles.cardBody,
                }}
              />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Title terminals="sans" level={2} size="S">
            Sample pages
          </Title>
          <Text terminals="sans">
            A few example landing pages from the full catalog:
          </Text>
          <ul className={styles.smallList}>
            {samplePages.map((page) => (
              <li key={page.slug}>
                <NextLink href={`/pseo/${page.slug}`}>{page.title}</NextLink>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageLayout>
  );
}
