/**
 * Homepage news bulletin — always exactly three topical slots.
 * Edit via `.claude/skills/news-bulletin/SKILL.md` workflows.
 */

export const NEWS_BULLETIN_SLOT_COUNT = 3 as const;

export type NewsBulletinLink =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string }
  | { kind: "static" };

export interface NewsBulletinBadge {
  /** Public URL under /public, e.g. /images/news-bulletin/go-24.svg */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface NewsBulletinItem {
  /** Stable id for agent replace/remove commands (kebab-case). */
  id: string;
  badge: NewsBulletinBadge;
  body: string;
  link?: NewsBulletinLink;
}

export const NEWS_BULLETIN_ITEMS: NewsBulletinItem[] = [
  {
    id: "go-24",
    badge: {
      src: "/images/news-bulletin/go-24.svg",
      alt: "Grand One 2024",
      width: 88,
      height: 56,
    },
    body: "K-Ruoka app, Best use of data, 2024",
    link: { kind: "static" },
  },
  {
    id: "go-23",
    badge: {
      src: "/images/news-bulletin/go-23.svg",
      alt: "Grand One 2023",
      width: 88,
      height: 56,
    },
    body: "Terveystalo Medoma app, Grand Prix, Best digital service, Best service design, 2023",
    link: { kind: "static" },
  },
  {
    id: "go-22",
    badge: {
      src: "/images/news-bulletin/go-22.svg",
      alt: "Grand One 2022",
      width: 88,
      height: 56,
    },
    body: "Terveystalo appointments, Best UX, 2022",
    link: { kind: "static" },
  },
];

export function assertNewsBulletinCount(
  items: readonly NewsBulletinItem[] = NEWS_BULLETIN_ITEMS,
): void {
  if (items.length !== NEWS_BULLETIN_SLOT_COUNT) {
    throw new Error(
      `news bulletin must have exactly ${NEWS_BULLETIN_SLOT_COUNT} items, got ${items.length}`,
    );
  }
}

assertNewsBulletinCount();
