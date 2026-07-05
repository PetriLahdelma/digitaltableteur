/**
 * Icon-name resolution data, shared by the runtime registry (iconRegistry.ts)
 * and the build-time codegen (scripts/design-system/build-icon-registry.mjs).
 * No React / component imports here so both sides can consume it without a
 * circular dependency on the generated icon set.
 */

/** Legacy FontAwesome-style slugs and kebab names → Phosphor PascalCase names. */
export const ICON_ALIASES: Record<string, string> = {
  "circle-info": "Info",
  info: "Info",
  "circle-check": "CheckCircle",
  "check-circle": "CheckCircle",
  "circle-xmark": "XCircle",
  "x-circle": "XCircle",
  "triangle-exclamation": "WarningCircle",
  "warning-circle": "WarningCircle",
  warning: "Warning",
  "share-nodes": "ShareNetwork",
  "share-network": "ShareNetwork",
  copy: "CopySimple",
  "copy-simple": "CopySimple",
  sync: "ArrowsClockwise",
  "arrows-rotate": "ArrowsClockwise",
  "arrow-right": "ArrowRight",
  "arrow-left": "ArrowLeft",
  "arrow-up": "ArrowUp",
  "arrow-clockwise": "ArrowClockwise",
  arrowClockwise: "ArrowClockwise",
  github: "GithubLogo",
  "github-logo": "GithubLogo",
  "square-instagram": "InstagramLogo",
  instagram: "InstagramLogo",
  "instagram-logo": "InstagramLogo",
  "square-x-twitter": "XLogo",
  "x-twitter": "XLogo",
  "twitter-logo": "XLogo",
  "square-facebook": "FacebookLogo",
  facebook: "FacebookLogo",
  "facebook-logo": "FacebookLogo",
  "square-whatsapp": "WhatsappLogo",
  whatsapp: "WhatsappLogo",
  "whatsapp-logo": "WhatsappLogo",
  "reddit-alien": "RedditLogo",
  reddit: "RedditLogo",
  "reddit-logo": "RedditLogo",
  x: "X",
  "text-align-left": "TextAlignLeft",
  "newspaper-clipping": "NewspaperClipping",
  newspaper: "Newspaper",
  "linkedin-logo": "LinkedinLogo",
  "dribbble-logo": "DribbbleLogo",
  "medium-logo": "MediumLogo",
  "caret-down": "CaretDown",
  "caret-right": "CaretRight",
  "calendar-check": "CalendarCheck",
  "calendar-x": "CalendarX",
  "file-text": "FileText",
  "circle-half": "CircleHalf",
  "circle-notch": "CircleNotch",
  "arrow-square-out": "ArrowSquareOut",
  "dots-three": "DotsThree",
  "dots-three-vertical": "DotsThreeVertical",
  "paper-plane-tilt": "PaperPlaneTilt",
  plus: "Plus",
  "check-fat": "Check",
  "question-mark": "QuestionMark",
  "sign-out": "SignOut",
  "chart-line-up": "ChartLineUp",
  "seal-check": "SealCheck",
  magnifyingglass: "MagnifyingGlass",
  MagnifyingGlass: "MagnifyingGlass",
  close: "X",
  xmark: "X",
};

/** kebab / snake / space separated → PascalCase (e.g. "caret-left" → "CaretLeft"). */
export const toPascalCase = (value: string): string =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join("");

/**
 * Resolve a raw icon name to a Phosphor PascalCase export name, or null.
 * `isKnown` decides whether a candidate is a real Phosphor icon — at runtime
 * that's "present in the bundled set", at build time it's "present in the full
 * Phosphor package". Alias hits are trusted without an isKnown check so the
 * curated alias map stays authoritative.
 */
export function resolveIconName(
  rawName: string,
  isKnown: (name: string) => boolean,
): string | null {
  const cleaned = rawName?.replace(/^fa-/, "") ?? "";
  const alias =
    ICON_ALIASES[cleaned] ?? ICON_ALIASES[rawName] ?? ICON_ALIASES[toPascalCase(cleaned)];
  const candidates = [alias, toPascalCase(cleaned), cleaned, rawName].filter(
    Boolean,
  ) as string[];
  for (const candidate of candidates) {
    if (ICON_ALIASES[candidate]) return ICON_ALIASES[candidate];
    if (isKnown(candidate)) return candidate;
  }
  return null;
}
