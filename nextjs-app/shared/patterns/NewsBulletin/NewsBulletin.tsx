"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "@/nextjs-app/shared/components/Icon";
import {
  NEWS_BULLETIN_ITEMS,
  type NewsBulletinItem,
  type NewsBulletinLink,
} from "@/nextjs-app/shared/data/news-bulletin";
import { cn } from "@/lib/utils";
import { NewsBulletinBadgeMark, badgeAccessibleLabel } from "./NewsBulletinBadge";
import styles from "./NewsBulletin.module.css";

const TRACK_ID = "news-bulletin-track";

export interface NewsBulletinProps {
  items?: NewsBulletinItem[];
  className?: string;
}

function cardLabel(item: NewsBulletinItem): string {
  const badgeLabel = badgeAccessibleLabel(item.badge);
  return badgeLabel ? `${badgeLabel}. ${item.body}` : item.body;
}

function BulletinCardContent({ item }: { item: NewsBulletinItem }) {
  return (
    <div className={styles.cardLayout}>
      <NewsBulletinBadgeMark badge={item.badge} />
      <p className={styles.body}>{item.body}</p>
    </div>
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
      <Link
        href={link.href}
        className={cardClass}
        aria-label={label}
        data-bulletin-card
      >
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
        data-bulletin-card
      >
        <BulletinCardContent item={item} />
      </a>
    );
  }

  return (
    <article className={styles.card} aria-label={label} data-bulletin-card>
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const updateScrollAffordance = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const epsilon = 2;
    const overflowing = track.scrollWidth > track.clientWidth + epsilon;
    setIsOverflowing(overflowing);
    setCanScrollPrev(track.scrollLeft > epsilon);
    setCanScrollNext(
      track.scrollLeft + track.clientWidth < track.scrollWidth - epsilon,
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateScrollAffordance();

    const observer = new ResizeObserver(updateScrollAffordance);
    observer.observe(track);
    track.addEventListener("scroll", updateScrollAffordance, { passive: true });

    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", updateScrollAffordance);
    };
  }, [items, updateScrollAffordance]);

  const scrollTrack = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    const cards = track.querySelectorAll<HTMLElement>("[data-bulletin-card]");
    if (!cards.length) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

    // Measure card vs track in the same (viewport) coordinate space via
    // getBoundingClientRect, then scroll by the delta. offsetLeft is relative
    // to the offset parent (here <body>, since no ancestor is positioned), so
    // it was inflated by the track's left gutter — comparing it against
    // scroll-space trackRight made the first "next" click pick the already-
    // visible first card and nudge only ~the gutter width (looked like nothing).
    const trackRect = track.getBoundingClientRect();
    const epsilon = 1;
    const scrollToCard = (card: HTMLElement) => {
      const delta = card.getBoundingClientRect().left - trackRect.left;
      track.scrollTo({ left: track.scrollLeft + delta, behavior });
    };

    if (direction === 1) {
      for (const card of cards) {
        if (card.getBoundingClientRect().right > trackRect.right + epsilon) {
          scrollToCard(card);
          return;
        }
      }
      track.scrollTo({ left: track.scrollWidth, behavior });
      return;
    }

    for (let index = cards.length - 1; index >= 0; index -= 1) {
      const card = cards[index];
      if (!card) continue;
      if (card.getBoundingClientRect().left < trackRect.left - epsilon) {
        scrollToCard(card);
        return;
      }
    }
    track.scrollTo({ left: 0, behavior });
  }, []);

  return (
    <section
      className={cn(styles.section, className)}
      aria-label={t("newsBulletinAriaLabel", "Current highlights")}
    >
      <div
        className={cn(
          styles.viewport,
          !isOverflowing && styles.viewportCentered,
        )}
      >
        {isOverflowing ? (
          canScrollPrev ? (
            <button
              type="button"
              className={styles.navButton}
              aria-label={t(
                "newsBulletinScrollPrev",
                "Show previous highlights",
              )}
              aria-controls={TRACK_ID}
              onClick={() => scrollTrack(-1)}
            >
              <Icon name="arrow-left" size="sm" ariaLabel="" />
            </button>
          ) : (
            <span className={styles.navSpacer} aria-hidden />
          )
        ) : null}

        <div
          ref={trackRef}
          id={TRACK_ID}
          className={cn(
            styles.track,
            !isOverflowing && styles.trackCentered,
          )}
          tabIndex={isOverflowing ? 0 : undefined}
        >
          {items.map((item) => (
            <BulletinCard key={item.id} item={item} />
          ))}
        </div>

        {isOverflowing ? (
          canScrollNext ? (
            <button
              type="button"
              className={styles.navButton}
              aria-label={t(
                "newsBulletinScrollNext",
                "Show more highlights",
              )}
              aria-controls={TRACK_ID}
              onClick={() => scrollTrack(1)}
            >
              <Icon name="arrow-right" size="sm" ariaLabel="" />
            </button>
          ) : (
            <span className={styles.navSpacer} aria-hidden />
          )
        ) : null}
      </div>
    </section>
  );
}

NewsBulletin.displayName = "NewsBulletin";

export default NewsBulletin;
