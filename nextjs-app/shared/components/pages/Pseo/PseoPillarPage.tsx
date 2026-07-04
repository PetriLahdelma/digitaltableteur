import type { PseoCatalogItem, PseoLeafPage } from "@/lib/pseo/types";

import PageLayout from "../../../patterns/PageLayout/PageLayout";
import Card from "@dt/Card";
import Text from "@dt/Text";
import Title from "@dt/Title";
import { PseoPillarMetaBadgeLinks } from "./PseoPillarMetaBadgeLinks";
import styles from "./PseoPillarPage.module.css";

export type PseoPillarKind = "services" | "stacks" | "audiences";

const kindTitle: Record<PseoPillarKind, string> = {
  services: "Service",
  stacks: "Stack",
  audiences: "Audience",
};

export function PseoPillarPage({
  kind,
  item,
  leafPages,
  siblingItems,
}: {
  kind: PseoPillarKind;
  item: PseoCatalogItem;
  leafPages: PseoLeafPage[];
  siblingItems: PseoCatalogItem[];
}) {
  const metaLinks = [
    { href: "/pseo", label: "All playbooks" },
    ...siblingItems
      .filter((sibling) => sibling.slug !== item.slug)
      .slice(0, 6)
      .map((sibling) => ({
        href: `/pseo/${kind}/${sibling.slug}`,
        label: `${kindTitle[kind]}: ${sibling.name}`,
      })),
  ];

  return (
    <PageLayout as="main" maxWidth="lg" spacing="comfortable">
      <div className={styles.root}>
        <Title terminals="sans" level={1} size="l">
          {item.name}
        </Title>
        <Text terminals="sans" size="l">
          {item.shortDescription}
        </Text>

        <PseoPillarMetaBadgeLinks
          links={metaLinks}
          className={styles.metaLinks}
          linkClassName={styles.metaLink}
        />

        <section aria-label="Guides" className={styles.list}>
          {leafPages.map((page) => (
            <Card
              key={page.slug}
              className={styles.card}
              link={`/pseo/${page.slug}`}
              linkLabel={`Open ${page.title}`}
              title={page.title}
              titleProps={{
                terminals: "sans",
                level: 3,
                size: "s",
                as: "h3",
              }}
              description={page.description}
              descriptionProps={{
                size: "s",
                as: "p",
                className: styles.cardDescription,
              }}
            />
          ))}
        </section>
      </div>
    </PageLayout>
  );
}
