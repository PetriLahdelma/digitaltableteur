import type { PseoCatalog, PseoLeafPage } from "@/lib/pseo/types";

import { getStackDisplayName } from "@/lib/pseo/display";

import PageLayout from "../../../patterns/PageLayout/PageLayout";
import Card from "@dt/Card";
import NextLink from "next/link";
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
          Design system playbooks
        </Title>
        <Text className={styles.lead} size="L" terminals="sans">
          Practical guides for design systems and DesignOps—organized by
          service, stack, and team context. Each playbook includes a situation
          brief, failure modes, checklist, and links to relevant case work.
        </Text>

        <section className={styles.section}>
          <Title terminals="sans" level={2} size="S">
            Start by service
          </Title>
          <div className={`${styles.grid} ${styles.gridTwo}`.trim()}>
            {catalog.services.map((service) => (
              <Card
                key={service.slug}
                className={styles.card}
                link={`/pseo/services/${service.slug}`}
                linkLabel={`Open ${service.name}`}
                hoverable
                size="full"
                title={service.name}
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
            Browse by stack
          </Title>
          <div className={`${styles.grid} ${styles.gridTwo}`.trim()}>
            {catalog.stacks.map((stack) => (
              <Card
                key={stack.slug}
                className={styles.card}
                link={`/pseo/stacks/${stack.slug}`}
                linkLabel={`Open ${getStackDisplayName(stack)}`}
                hoverable
                size="full"
                title={getStackDisplayName(stack)}
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
            Browse by audience
          </Title>
          <div className={`${styles.grid} ${styles.gridThree}`.trim()}>
            {catalog.audiences.map((audience) => (
              <Card
                key={audience.slug}
                className={styles.card}
                link={`/pseo/audiences/${audience.slug}`}
                linkLabel={`Open ${audience.name}`}
                hoverable
                size="full"
                title={audience.name}
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
            Featured playbooks
          </Title>
          <Text terminals="sans">
            A sample from the full library—pick a service and stack that matches
            your team:
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
