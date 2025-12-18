import Link from "next/link";

import type { PseoCatalog, PseoLeafPage } from "@/lib/pseo/types";

import PageLayout from "../../../patterns/PageLayout/PageLayout";
import Text from "@dt/Text";
import Title from "@dt/Title";
import styles from "./PseoIndexPage.module.css";

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
          <div className={styles.grid}>
            {catalog.services.map((service) => (
              <Link
                key={service.slug}
                href={`/pseo/services/${service.slug}`}
                className={styles.cardLink}
              >
                <Title
                  terminals="sans"
                  level={3}
                  size="XS"
                  className={styles.cardTitle}
                >
                  {service.name}
                </Title>
                <Text terminals="sans" className={styles.cardDescription}>
                  {service.shortDescription}
                </Text>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Title terminals="sans" level={2} size="S">
            Stacks
          </Title>
          <div className={styles.grid}>
            {catalog.stacks.map((stack) => (
              <Link
                key={stack.slug}
                href={`/pseo/stacks/${stack.slug}`}
                className={styles.cardLink}
              >
                <Title
                  terminals="sans"
                  level={3}
                  size="XS"
                  className={styles.cardTitle}
                >
                  {stack.name}
                </Title>
                <Text terminals="sans" className={styles.cardDescription}>
                  {stack.shortDescription}
                </Text>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Title terminals="sans" level={2} size="S">
            Audiences
          </Title>
          <div className={styles.grid}>
            {catalog.audiences.map((audience) => (
              <Link
                key={audience.slug}
                href={`/pseo/audiences/${audience.slug}`}
                className={styles.cardLink}
              >
                <Title
                  terminals="sans"
                  level={3}
                  size="XS"
                  className={styles.cardTitle}
                >
                  {audience.name}
                </Title>
                <Text terminals="sans" className={styles.cardDescription}>
                  {audience.shortDescription}
                </Text>
              </Link>
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
                <Link href={`/pseo/${page.slug}`}>{page.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageLayout>
  );
}
