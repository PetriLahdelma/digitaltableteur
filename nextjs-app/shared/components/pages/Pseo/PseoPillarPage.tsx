import Link from "next/link";

import type { PseoCatalogItem, PseoLeafPage } from "@/lib/pseo/types";

import PageLayout from "../../../patterns/PageLayout/PageLayout";
import Text from "@dt/Text";
import Title from "@dt/Title";
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
  return (
    <PageLayout as="main" maxWidth="lg" spacing="comfortable">
      <div className={styles.root}>
        <Title terminals="sans" level={1} size="L">
          {item.name}
        </Title>
        <Text terminals="sans" size="L">
          {item.shortDescription}
        </Text>

        <div className={styles.metaLinks} aria-label="Explore related pillars">
          <Link href="/pseo" className={styles.metaLink}>
            All guides
          </Link>
          {siblingItems
            .filter((sibling) => sibling.slug !== item.slug)
            .slice(0, 6)
            .map((sibling) => (
              <Link
                key={sibling.slug}
                href={`/pseo/${kind}/${sibling.slug}`}
                className={styles.metaLink}
              >
                {kindTitle[kind]}: {sibling.name}
              </Link>
            ))}
        </div>

        <section aria-label="Guides" className={styles.list}>
          {leafPages.map((page) => (
            <Link
              key={page.slug}
              href={`/pseo/${page.slug}`}
              className={styles.itemLink}
            >
              <Title
                terminals="sans"
                level={2}
                size="XS"
                className={styles.itemTitle}
              >
                {page.title}
              </Title>
              <Text terminals="sans" className={styles.itemDescription}>
                {page.description}
              </Text>
            </Link>
          ))}
        </section>
      </div>
    </PageLayout>
  );
}
