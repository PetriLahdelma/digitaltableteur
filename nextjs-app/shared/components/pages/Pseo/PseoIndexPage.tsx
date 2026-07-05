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
        <Title level={1} size="l">
          Design system playbooks
        </Title>
        <Text className={styles.lead} size="l">
          Practical guides for design systems and DesignOps—organized by
          service, stack, and team context. Each playbook includes a situation
          brief, failure modes, checklist, and links to relevant case work.
        </Text>

        <section className={styles.section}>
          <Title level={2} size="s">
            Start by service
          </Title>
          <div className={`${styles.grid} ${styles.gridTwo}`.trim()}>
            {catalog.services.map((service) => (
              <Card
                key={service.slug}
                className={styles.card}
                link={`/pseo/services/${service.slug}`}
                linkLabel={`Open ${service.name}`}
                title={service.name}
                titleProps={{
                  level: 3,
                  size: "s",
                  as: "h3",
                }}
                description={service.shortDescription}
                descriptionProps={{
                  size: "s",
                  as: "p",
                  className: styles.cardBody,
                }}
              />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Title level={2} size="s">
            Browse by stack
          </Title>
          <div className={`${styles.grid} ${styles.gridTwo}`.trim()}>
            {catalog.stacks.map((stack) => (
              <Card
                key={stack.slug}
                className={styles.card}
                link={`/pseo/stacks/${stack.slug}`}
                linkLabel={`Open ${getStackDisplayName(stack)}`}
                title={getStackDisplayName(stack)}
                titleProps={{
                  level: 3,
                  size: "s",
                  as: "h3",
                }}
                description={stack.shortDescription}
                descriptionProps={{
                  size: "s",
                  as: "p",
                  className: styles.cardBody,
                }}
              />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Title level={2} size="s">
            Browse by audience
          </Title>
          <div className={`${styles.grid} ${styles.gridThree}`.trim()}>
            {catalog.audiences.map((audience) => (
              <Card
                key={audience.slug}
                className={styles.card}
                link={`/pseo/audiences/${audience.slug}`}
                linkLabel={`Open ${audience.name}`}
                title={audience.name}
                titleProps={{
                  level: 3,
                  size: "s",
                  as: "h3",
                }}
                description={audience.shortDescription}
                descriptionProps={{
                  size: "s",
                  as: "p",
                  className: styles.cardBody,
                }}
              />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Title level={2} size="s">
            Featured playbooks
          </Title>
          <Text>
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
