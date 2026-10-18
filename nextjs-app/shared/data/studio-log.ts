/**
 * The studio changelog (/changelog): one dated line per event, each linking
 * to its proof. Dates are "YYYY-MM-DD", "YYYY-MM" or "YYYY" and come from the
 * project records (projects.ts periods), article publish dates, the case
 * study launch commits and the npm release history. Lines are English
 * content, like project titles. Newest first; within a month, dated days
 * precede the month-only lines. Entries without an href are
 * work whose case study is not public yet.
 */

export interface StudioLogEntry {
  /** "YYYY-MM-DD", "YYYY-MM" or "YYYY". */
  date: string;
  text: string;
  /** Proof: a case study, article or release. Omitted while unpublished. */
  href?: string;
  /** A dated event that has not happened yet. */
  upcoming?: boolean;
}

const NPM = "https://www.npmjs.com/package/@digitaltableteur/react";

export const STUDIO_LOG: StudioLogEntry[] = [
  { date: "2026-11-12", text: "Talk at TEDI", upcoming: true },
  { date: "2026-10-17", text: "Ships a list view for the work index and @digitaltableteur/react 0.1.32", href: NPM },
  { date: "2026-10-15", text: "Publishes Plausible Accessibility: Where AI Still Falls Short and Who to Call Instead", href: "/blog/plausible-accessibility" },
  { date: "2026-09-30", text: "Publishes the Ring Stats case study", href: "/work/ring-stats" },
  { date: "2026-09", text: "Begins the Process Genius Design System" },
  { date: "2026-08", text: "Begins Precedent, a local-first workspace for interface references" },
  { date: "2026-07-08", text: "Publishes @digitaltableteur/react 0.1.0 on npm", href: NPM },
  { date: "2026-07", text: "Builds Home Remote, a native macOS remote for TVs, home AV and audio", href: "/work/home-remote" },
  { date: "2026-06-03", text: "Starts the five-part Agentic Design Systems series", href: "/blog/agentic-design-systems-need-operating-models-not-more-components" },
  { date: "2026-06", text: "Begins the VR Design System with VR Group" },
  { date: "2026-04", text: "Begins the DSharp Design System", href: "/work/dsharp-design-system" },
  { date: "2026-04", text: "Releases Project Spine, an open-source CLI for agent-native project context", href: "/work/project-spine" },
  { date: "2026-02", text: "Launches Rhythmguard, a Stylelint plugin that enforces design tokens", href: "/work/rhythmguard" },
  { date: "2026-02", text: "Closes four years on the SAP Build Apps design system", href: "/work/sap-build-apps" },
  { date: "2025-12", text: "Begins VertaaUX, a UX and accessibility auditing platform", href: "/work/vertaaux" },
  { date: "2025-12", text: "Begins KnobSmith Audio", href: "/work/knobsmith-audio" },
  { date: "2025-11-20", text: "Publishes Design System Meets AI, part one", href: "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-1" },
  { date: "2025-06", text: "Rebuilds digitaltableteur.com as a component-driven design system", href: "/colophon" },
  { date: "2023", text: "The Helsinki Design System wins Best Design System at Grand One 2023", href: "/work/helsinki-design-system" },
  { date: "2022-03", text: "Begins leading the SAP Build Apps design system", href: "/work/sap-build-apps" },
  { date: "2022-03", text: "Completes the groundwork for the Helsinki Design System", href: "/work/helsinki-design-system" },
  { date: "2020-01", text: "Begins the Helsinki Design System with the City of Helsinki", href: "/work/helsinki-design-system" },
  { date: "2018-10", text: "Designs web and social assets for Garage Junction at Merikerho", href: "/work/garage-junction" },
  { date: "2017-09", text: "Begins the New Things Co brand identity", href: "/work/new-things-co" },
  { date: "2009", text: "Designs the identity system for the merged Finnish Transport Agency", href: "/work/finnish-transport-agency" },
  { date: "2009", text: "Starts the illustration practice", href: "/work/illustrations" },
];
