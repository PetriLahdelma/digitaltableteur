/**
 * Static replacement guidance for agent blocks — what raw UI this @dt component supersedes.
 */

/**
 * Agents must not mass-replace pattern chrome or section headings — that changes fonts and layout.
 * Allowed without design review: semantic tag + existing classes via Title `unstyled`, or h-level-only fixes.
 */
export const REPLACEMENT_GUARDRAILS = [
  "Do not swap pattern Header/Footer/CTA <button> for @dt/Button unless explicitly requested.",
  "Do not replace <h*> that already have font-display/Tailwind/module classes with default @dt/Title — use Title unstyled or change level only.",
  "lint:dt-usage flags @/components/ui/* in app/ only; patterns keep their typography.",
];

/** @type {Record<string, string[]>} */
export const REPLACEMENT_FOR = {
  Button: ["raw <button>", "@/components/ui/button", "shadcn Button"],
  Title: [
    "raw <h1>",
    "raw <h2>",
    "raw <h3>",
    "raw <h4>",
    "raw <h5>",
    "raw <h6>",
  ],
  Text: ["raw <p>", "raw <span> for body copy"],
  Link: ["raw <a> for styled navigation"],
  Icon: ["inline SVG without Icon wrapper", "react-icons used directly in product UI"],
  AlertBanner: ["custom div alert", "Toast for persistent page-level status"],
  Toast: ["AlertBanner for transient feedback", "window.alert"],
  Card: ["unstyled div wrapper for grouped content"],
  Modal: ["custom overlay dialog"],
  Stack: ["manual flex column with arbitrary gap literals"],
  Row: ["manual flex row with arbitrary gap literals"],
  Grid: ["manual CSS grid with arbitrary gap literals"],
  Container: ["max-width div without tokens"],
  FormField: ["label + input wired manually"],
  Inputs: ["raw <input> without design-system field shell"],
};

/** @type {Record<string, string[]>} */
export const COMPOSES_WITH = {
  AlertBanner: ["Button", "Icon"],
  ContactForm: ["FormField", "Inputs", "Button", "Text"],
  ChatWidget: ["Button", "Text", "Inputs", "DonnyAvatar"],
  FormField: ["Label", "Inputs", "HelperText"],
  Card: ["Title", "Text", "Button"],
  Modal: ["Button", "Title", "Text"],
  CookieConsent: ["Button", "Text"],
  ProjectHero: ["Title", "Text", "Button"],
  StoryBlock: ["Title", "Text"],
};

export const PREFERS_OVER = {
  Title: ["raw heading elements"],
  Text: ["raw paragraph elements"],
  Button: ["raw button", "Link for in-copy navigation"],
  Link: ["Button with href for body-copy links"],
  AlertBanner: ["Toast for non-persistent status"],
  Toast: ["AlertBanner for page-level persistent status"],
  HelperText: ["AlertBanner for field-level hints"],
};

/** Curated anti-patterns beyond spec.md — merged with parsed Do/Don't. */
export const FORBIDDEN_USE_CURATED = {
  Title: [
    "Default Title typography on pattern headings that already define font-display or module classes — use unstyled + existing className",
  ],
  Button: [
    "tertiary on dark or inverse backgrounds without explicit contrast verification",
    "isInverse on primary over transparent or gradient parents — use surface instead",
  ],
  Modal: [
    "Nested modals — swap content in place inside one overlay",
    "Lazy-mounting Modal only when isOpen — mount always and toggle isOpen for focus restore",
    "Pair AlertBanner with Modal for the same status — use Modal alone for blocking alerts",
  ],
  AlertBanner: [
    "Pair AlertBanner with blocking Modal for the same user outcome — pick one surface",
  ],
};

/**
 * When both @dt components appear in the same product file, flag a composition conflict.
 * @type {Array<{ id: string, a: string, b: string, message: string }>}
 */
export const INCOMPATIBLE_DT_IMPORT_PAIRS = [
  {
    id: "toast-alertbanner",
    a: "Toast",
    b: "AlertBanner",
    message:
      "Toast and AlertBanner model different persistence — pick one surface per status message.",
  },
  {
    id: "toast-modal",
    a: "Toast",
    b: "Modal",
    message:
      "Do not pair transient Toast with blocking Modal for the same user action — use Modal alone.",
  },
  {
    id: "alertbanner-modal",
    a: "AlertBanner",
    b: "Modal",
    message:
      "Do not pair inline AlertBanner with blocking Modal for the same outcome — pick one surface.",
  },
];

/**
 * @param {string} name
 * @returns {string[]}
 */
export function getReplacementFor(name) {
  return REPLACEMENT_FOR[name] ?? [];
}

/**
 * @param {string} name
 * @returns {string[]}
 */
export function getPrefersOver(name) {
  return PREFERS_OVER[name] ?? [];
}

/**
 * @param {string} name
 * @param {string[]} [avoidWhenFromSpec]
 * @returns {string[]}
 */
export function getForbiddenUse(name, avoidWhenFromSpec = []) {
  const curated = FORBIDDEN_USE_CURATED[name] ?? [];
  const fromSpec = avoidWhenFromSpec.filter(Boolean);
  return [...new Set([...curated, ...fromSpec])].slice(0, 8);
}
