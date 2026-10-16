/**
 * Homepage news bulletin — always exactly three topical slots.
 * Edit via `.claude/skills/news-bulletin/SKILL.md` workflows.
 *
 * Figma source: DT-Site-stuff node 310:899 (First / Second / Group 20)
 */

export const NEWS_BULLETIN_SLOT_COUNT = 3 as const;

export type NewsBulletinLink =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string }
  | { kind: "static" };

/** Raster/SVG mark (plain — no round badge background) */
export type NewsBulletinImageBadge = {
  kind: "image";
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * Tint via CSS mask.
   * `logo-color` follows the theme logo tokens (white on the navy band, black
   * on the HCW band). `vertaaux-brand` follows VertaaUX's own palette instead,
   * so the mark stays on-brand rather than being flattened to the band's
   * monochrome — see NewsBulletin.module.css.
   */
  tint?: "logo-color" | "vertaaux-brand";
};

/** Lime circle + bold value (Figma “First”) */
export type NewsBulletinPercentBadge = {
  kind: "percent";
  value: string;
};

/** npm-style version pill (Figma “Second”) */
export type NewsBulletinNpmBadge = {
  kind: "npm";
  version: string;
};

/**
 * Phosphor glyph, for slots whose subject has no mark of its own — an essay is
 * not a product. Rendered bare in the band's ink like the image marks, not in
 * the lime circle: the circle is reserved for the availability stat, so the
 * two never read as the same kind of thing.
 */
export type NewsBulletinIconBadge = {
  kind: "icon";
  /** Phosphor name, PascalCase or slug (see Icon's registry). */
  name: string;
  /** Spoken before the body in the card's accessible name. */
  label: string;
};

/** Grey square until final art is ready (Figma “Group 20”) */
export type NewsBulletinPlaceholderBadge = {
  kind: "placeholder";
};

export type NewsBulletinBadge =
  | NewsBulletinImageBadge
  | NewsBulletinPercentBadge
  | NewsBulletinNpmBadge
  | NewsBulletinIconBadge
  | NewsBulletinPlaceholderBadge;

export interface NewsBulletinItem {
  /** Stable id for agent replace/remove commands (kebab-case). */
  id: string;
  /** Figma layer name / node id for export sync */
  figmaRef?: string;
  badge: NewsBulletinBadge;
  body: string;
  link?: NewsBulletinLink;
}

export const NEWS_BULLETIN_ITEMS: NewsBulletinItem[] = [
  {
    // Badge carries the year, body carries the action, so the pair reads
    // "2027 — Now booking" without repeating itself. Kept short on purpose:
    // the card clamps to the viewport on phones and ellipsises the body, so
    // the previous 33-character line was cut to "Bandwidth durin…" there.
    id: "booking-2027",
    figmaRef: "310:898",
    badge: { kind: "percent", value: "2027" },
    body: "Now booking for Q1–Q2",
    link: { kind: "internal", href: "/contact" },
  },
  {
    // The article slot points at the newest post. Plausible Accessibility
    // (2026-10-15) replaced From DesignOps to AgentOps, which had held the
    // slot since it replaced the Rhythmguard release announcement.
    id: "plausible-accessibility",
    figmaRef: "310:897",
    badge: { kind: "icon", name: "Newspaper", label: "Article" },
    body: "Plausible accessibility",
    link: {
      kind: "internal",
      href: "/blog/plausible-accessibility",
    },
  },
  {
    // Replaces the DSharp case-study slot: DSharp already appears six times on
    // the homepage, and WorkMagneticField above covers the portfolio job. This
    // is the one item backed by outside urgency — the European Accessibility
    // Act became enforceable in June 2025, and the research audited 198 pages
    // across 53 EU companies six months later.
    id: "eu-accessibility-2026",
    figmaRef: "310:896",
    badge: {
      kind: "image",
      src: "/images/news-bulletin/vertaaux-mark.svg",
      alt: "VertaaUX",
      width: 57,
      height: 48,
      tint: "vertaaux-brand",
    },
    body: "2026 State of Digital Accessibility",
    link: {
      kind: "external",
      href: "https://vertaaux.ai/articles/state-of-digital-accessibility-2026-eu",
    },
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
