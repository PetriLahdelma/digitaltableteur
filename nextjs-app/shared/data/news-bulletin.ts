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
   * Tint via CSS mask using theme logo tokens.
   * Light theme: `--color-white`; dark theme: `--logo-color` (see NewsBulletin.module.css).
   */
  tint?: "logo-color";
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

/** Grey square until final art is ready (Figma “Group 20”) */
export type NewsBulletinPlaceholderBadge = {
  kind: "placeholder";
};

export type NewsBulletinBadge =
  | NewsBulletinImageBadge
  | NewsBulletinPercentBadge
  | NewsBulletinNpmBadge
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
    body: "Now booking",
    link: { kind: "internal", href: "/contact" },
  },
  {
    id: "rhythmguard-2",
    figmaRef: "310:897",
    badge: { kind: "npm", version: "v2.0.0" },
    body: "Rhythmguard 2.0 out now",
    link: {
      kind: "external",
      href: "https://www.npmjs.com/package/stylelint-plugin-rhythmguard",
    },
  },
  {
    id: "dsharp-case-study",
    figmaRef: "310:896",
    badge: {
      kind: "image",
      src: "/images/news-bulletin/dsharp-logobig.svg",
      alt: "DSharp",
      width: 48,
      height: 48,
      tint: "logo-color",
    },
    body: "Check out the DSharp Case Study",
    link: { kind: "internal", href: "/work/dsharp-design-system" },
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
