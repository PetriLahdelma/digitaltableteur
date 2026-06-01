/**
 * Homepage news bulletin — always exactly three topical slots.
 * Edit via `.claude/skills/news-bulletin/SKILL.md` workflows.
 */

export const NEWS_BULLETIN_SLOT_COUNT = 3 as const;

export type NewsBulletinBadgeVariant = "lime" | "mono" | "gradient";

export type NewsBulletinLink =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string }
  | { kind: "static" };

export interface NewsBulletinItem {
  /** Stable id for agent replace/remove commands (kebab-case). */
  id: string;
  /** Short mark shown left of copy, e.g. award year badge. */
  badge: string;
  badgeVariant?: NewsBulletinBadgeVariant;
  body: string;
  link?: NewsBulletinLink;
}

export const NEWS_BULLETIN_ITEMS: NewsBulletinItem[] = [
  {
    id: "go-24",
    badge: "GO 24",
    badgeVariant: "lime",
    body: "K-Ruoka app, Best use of data, 2024",
    link: { kind: "static" },
  },
  {
    id: "go-23",
    badge: "GO 23",
    badgeVariant: "mono",
    body: "Terveystalo Medoma app, Grand Prix, Best digital service, Best service design, 2023",
    link: { kind: "static" },
  },
  {
    id: "go-22",
    badge: "GO 22",
    badgeVariant: "gradient",
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
