"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Container } from "@/nextjs-app/shared/components/Container";
import {
  NEWS_BULLETIN_ITEMS,
  type NewsBulletinItem,
  type NewsBulletinLink,
} from "@/nextjs-app/shared/data/news-bulletin";
import { cn } from "@/lib/utils";
import styles from "./NewsBulletin.module.css";

export interface NewsBulletinProps {
  items?: NewsBulletinItem[];
  className?: string;
}

function cardLabel(item: NewsBulletinItem): string {
  return `${item.badge.alt}. ${item.body}`;
}

function BulletinCardContent({ item }: { item: NewsBulletinItem }) {
  return (
    <>
      <span className={styles.badge}>
        <Image
          src={item.badge.src}
          alt=""
          aria-hidden
          width={item.badge.width}
          height={item.badge.height}
          className={styles.badgeImage}
        />
      </span>
      <p className={styles.body}>{item.body}</p>
    </>
  );
}

function resolveLink(link: NewsBulletinLink | undefined): NewsBulletinLink {
  return link ?? { kind: "static" };
}

function BulletinCard({ item }: { item: NewsBulletinItem }) {
  const link = resolveLink(item.link);
  const label = cardLabel(item);
  const cardClass = cn(styles.card, link.kind !== "static" && styles.cardInteractive);

  if (link.kind === "internal") {
    return (
      <Link href={link.href} className={cardClass} aria-label={label}>
        <BulletinCardContent item={item} />
      </Link>
    );
  }

  if (link.kind === "external") {
    return (
      <a
        href={link.href}
        className={cardClass}
        aria-label={label}
        target="_blank"
        rel="noopener noreferrer"
      >
        <BulletinCardContent item={item} />
      </a>
    );
  }

  return (
    <article className={styles.card} aria-label={label}>
      <BulletinCardContent item={item} />
    </article>
  );
}

/** Three-slot topical bulletin band for the homepage (above footer). */
export function NewsBulletin({
  items = NEWS_BULLETIN_ITEMS,
  className,
}: NewsBulletinProps) {
  const { t } = useTranslation();

  return (
    <section
      className={cn(styles.section, className)}
      aria-label={t("newsBulletinAriaLabel", "Current highlights")}
    >
      <Container size="lg" className={styles.inner}>
        <div className={styles.grid}>
          {items.map((item) => (
            <BulletinCard key={item.id} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}

NewsBulletin.displayName = "NewsBulletin";

export default NewsBulletin;
