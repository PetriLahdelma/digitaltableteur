/**
 * The studio changelog (/changelog): one dated line per event, linking to its
 * proof where a public one exists. Dates are "YYYY-MM-DD", "YYYY-MM" or
 * "YYYY" and come from the project records (projects.ts periods), the CV, the
 * business register, archived versions of digitaltableteur.com, article
 * publish dates, the studio's correspondence and the npm release history.
 * Every line was approved by the owner; client names appear only where the
 * owner cleared them. Lines are English content, like project titles. Newest
 * first; within a month, dated days precede the month-only lines. Entries
 * without an href have no public proof (yet).
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

const WAYBACK_2009 = "https://web.archive.org/web/20090309021510/http://digitaltableteur.com/";
const WAYBACK_2013 = "https://web.archive.org/web/20130821201534/http://www.digitaltableteur.com/";

export const STUDIO_LOG: StudioLogEntry[] = [
  { date: "2026-11-12", text: "Keynote at the first TEDI design system community day, Tallinn", upcoming: true },
  { date: "2026-10-17", text: "Ships a list view for the work index and @digitaltableteur/react 0.1.32", href: NPM },
  { date: "2026-10-15", text: "Publishes Plausible Accessibility: Where AI Still Falls Short and Who to Call Instead", href: "/blog/plausible-accessibility" },
  { date: "2026-10", text: "Completes the OpenAI Academy paths in AI leadership and Codex" },
  { date: "2026-09-30", text: "Publishes the Ring Stats case study", href: "/work/ring-stats" },
  { date: "2026-09", text: "Begins the Process Genius Design System" },
  { date: "2026-08-13", text: "Becomes a Vastuu Group Reliable Partner" },
  { date: "2026-08", text: "Begins Precedent, a local-first workspace for interface references" },
  { date: "2026-07-08", text: "Publishes @digitaltableteur/react 0.1.0 on npm", href: NPM },
  { date: "2026-07", text: "Builds Home Remote, a native macOS remote for TVs, home AV and audio", href: "/work/home-remote" },
  { date: "2026-06-03", text: "Starts the five-part Agentic Design Systems series", href: "/blog/agentic-design-systems-need-operating-models-not-more-components" },
  { date: "2026-06", text: "Begins the VR Design System with VR Group" },
  { date: "2026-05-01", text: "Releases the VertaaUX iOS app to TestFlight beta testers" },
  { date: "2026-04", text: "Begins the DSharp Design System", href: "/work/dsharp-design-system" },
  { date: "2026-04", text: "Releases Project Spine, an open-source CLI for agent-native project context", href: "/work/project-spine" },
  { date: "2026-04", text: "Opens VertaaUX sign-ups", href: "/work/vertaaux" },
  { date: "2026-03", text: "Ships the first TapeSmith build, KnobSmith Audio's tape saturation plugin" },
  { date: "2026-02-23", text: "Publishes The European Accessibility Act Is the New GDPR" },
  { date: "2026-02-17", text: "Publishes Your Design System Is Leaking Spacing" },
  { date: "2026-02-17", text: "Ships Rhythmguard 1.0.0, a Stylelint plugin that enforces design tokens", href: "/work/rhythmguard" },
  { date: "2026-02", text: "Closes four years on the SAP Build Apps design system", href: "/work/sap-build-apps" },
  { date: "2026-02", text: "Designs Seppo 2.0 for Seppo.io, through The Good Side" },
  { date: "2025-12-29", text: "Publishes From Tokens to Thinking Systems", href: "/blog/from-tokens-to-thinking-systems-making-ai-native-design-systems-actually-work" },
  { date: "2025-12-03", text: "Publishes The Evolutionary Difference Between Constructive and Constrictive Criticism", href: "/blog/the-evolutionary-difference-between-constructive-and-constrictive-criticism" },
  { date: "2025-12", text: "Begins VertaaUX, a UX and accessibility auditing platform", href: "/work/vertaaux" },
  { date: "2025-12", text: "Begins KnobSmith Audio", href: "/work/knobsmith-audio" },
  { date: "2025-12", text: "Releases LLM Component Schema", href: "/work/llm-component-schema" },
  { date: "2025-12", text: "Designs product flows for an AI developer-tools startup" },
  { date: "2025-11-26", text: "Publishes Branding Design Systems", href: "/blog/branding-design-systems-essay" },
  { date: "2025-11-23", text: "Publishes Design System Meets AI, part two", href: "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-2" },
  { date: "2025-11-20", text: "Publishes Design System Meets AI, part one", href: "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-1" },
  { date: "2025-07-09", text: "Publishes Stop Solving Problems and Start Raising Better Questions" },
  { date: "2025-06-10", text: "Publishes Digital Craftsmanship", href: "/blog/digital-craftsmanship" },
  { date: "2025-06-05", text: "Publishes MCP, Design Systems and Generative UI", href: "/blog/figma-mcp-design-systems" },
  { date: "2025-06", text: "Rebuilds digitaltableteur.com as a component-driven design system", href: "/colophon" },
  { date: "2025-02-11", text: "Publishes In Search of Impact", href: "/blog/in-search-of-impact" },
  { date: "2025-02-09", text: "Publishes Designing in 2025", href: "/blog/designing-in-2025" },
  { date: "2023-02", text: "Becomes Design System Lead for SAP Build Apps", href: "/work/sap-build-apps" },
  { date: "2023", text: "The Helsinki Design System wins Best Design System at Grand One 2023", href: "/work/helsinki-design-system" },
  { date: "2022-03-14", text: "Joins AppGyver, now SAP Build, as a Senior Designer", href: "/work/sap-build-apps" },
  { date: "2022-03", text: "Completes the groundwork for the Helsinki Design System", href: "/work/helsinki-design-system" },
  { date: "2021-09", text: "Works on the new Helsinki Design System documentation site", href: "/work/helsinki-design-system" },
  { date: "2020-01", text: "Begins the Helsinki Design System with the City of Helsinki", href: "/work/helsinki-design-system" },
  { date: "2020", text: "Designs the Linked Events platform for the City of Helsinki" },
  { date: "2019-08-30", text: "Publishes Why I'm Excited about Joint Futures" },
  { date: "2019-02-01", text: "Joins Nitor as a Senior Designer" },
  { date: "2018-10", text: "Designs web and social assets for Garage Junction at Merikerho", href: "/work/garage-junction" },
  { date: "2018-06-07", text: "Publishes Thoughts on Future Branding", href: "/blog/thoughts-on-future-branding" },
  { date: "2018-01-09", text: "Becomes an Editor of the New Things Co publication on Medium" },
  { date: "2017-11", text: "Delivers user personas for Intrum" },
  { date: "2017-10", text: "Designs Aiddo's product brochure and UI graphics" },
  { date: "2017-09", text: "Begins the New Things Co brand identity", href: "/work/new-things-co" },
  { date: "2017-09", text: "Joins Lab of New, later New Things Co, as a Senior Designer" },
  { date: "2017-08", text: "Designs features for the KONE Toolbox service at Mirum" },
  { date: "2017-08", text: "Runs workshops and user interviews for Intrum's new system at Mirum" },
  { date: "2017-06", text: "Designs the Label Life web experience for UPM Raflatac at Mirum" },
  { date: "2017-05-10", text: "Joins Mirum Helsinki as a Senior Digital Designer" },
  { date: "2017-05", text: "Lays out the Hella Marine 2017 catalogue and a Berrie export brochure" },
  { date: "2017-02", text: "Designs the campaign flyers and ads for Maria Ohisalo's 2017 municipal election campaign" },
  { date: "2016-10", text: "Designs product graphics for Aiddo" },
  { date: "2016-05-19", text: "Begins UX and UI design for Finnish Customs (Tulli), through Codemen" },
  { date: "2016-05", text: "Joins Codemen as a Senior Design Consultant" },
  { date: "2016-02", text: "Designs the IndoorAtlas website at Ottoboni" },
  { date: "2016-01", text: "Joins Ottoboni as a Senior Designer" },
  { date: "2015-12", text: "Joins the Better Digital Services Academy and helps organise the first Blue Arrow Awards" },
  { date: "2015-02", text: "Lays out Raw View issue 2" },
  { date: "2014-11-01", text: "Raw View issue 1 launches" },
  { date: "2014-10", text: "Designs the Raw View logo and launch campaign" },
  { date: "2014-09-24", text: "Lays out the first issue of Raw View, the renamed Photo Raw photography magazine" },
  { date: "2014-09-09", text: "Joins SC5 as Lead Art Director" },
  { date: "2014-09", text: "Designs Sanoma's Flou app at SC5" },
  { date: "2014-08", text: "Launches the Kg Shop webshop" },
  { date: "2014-04", text: "Becomes Art Director of Kg magazine" },
  { date: "2014-02", text: "Begins laying out Kg magazine for Acacom Media" },
  { date: "2014-01-30", text: "Joins Anders Innovations as a Graphic Designer" },
  { date: "2013-09", text: "Joins Huvila Brand & Design as a Digital Designer" },
  { date: "2013-09", text: "Designs the Finnpilot 10th anniversary emblem at Huvila" },
  { date: "2013-08", text: "Launches a new studio website", href: WAYBACK_2013 },
  { date: "2013-08", text: "Designs the logo, S/S14 Mercedes-Benz Fashion Week invitation and website for fashion designer Isabell Yalda Hellysaz" },
  { date: "2013-07-03", text: "Joins Dribbble as Digitaltableteur" },
  { date: "2013-07", text: "Designs the visual identity and website for Mili Viita Communications" },
  { date: "2012-09", text: "Leaves Warrantify" },
  { date: "2012-03", text: "Creates the Warrantify brand book" },
  { date: "2012-02-16", text: "Ships the Warrantify Android app" },
  { date: "2011-11-01", text: "Becomes Creative Director at Warrantify" },
  { date: "2011-11", text: "Designs Warrantify's presence at Slush Helsinki" },
  { date: "2011-10-15", text: "Ships the redesigned warrantify.com service" },
  { date: "2011-09", text: "Designs the Warrantify logotype and brand identity" },
  { date: "2011-08-29", text: "Joins Warrantify to lead its design" },
  { date: "2011-07", text: "Launches the redesigned Saimatext website" },
  { date: "2011-04", text: "Designs the Hortoilu website for Saimatext" },
  { date: "2011-04", text: "Designs an 88-page photography book for Elina Relander" },
  { date: "2011-01", text: "Completes the Wiktio identity: brand guidelines, stationery, presentation template and website layout" },
  { date: "2010-09", text: "Joins Miltton as a Graphic Designer" },
  { date: "2010-09", text: "Designs the visual identity for Wiktio, the Rauma startup that won InnoSuomi 2010" },
  { date: "2010-09", text: "Designs a promotional brochure for Takkatekniikka" },
  { date: "2010-08", text: "Joins Grafia, the Association of Finnish Graphic Designers" },
  { date: "2010-06-08", text: "Launches the second studio website, built with Sofokus" },
  { date: "2010-04", text: "Designs the website for CI City Image" },
  { date: "2010-02", text: "Designs the Työnhakuopas job-seeking guide and its website for Sofokus" },
  { date: "2010-01", text: "Designs Arttu! magazine, later featured on Editorial Design Served" },
  { date: "2009-09", text: "Begins MA studies in Graphic Design at TaiK, the University of Art and Design Helsinki, now Aalto University" },
  { date: "2009-07", text: "Joins Werklig as a Graphic Designer" },
  { date: "2009-04-29", text: "Registers Digitaltableteur as a graphic design business" },
  { date: "2009-03-09", text: "digitaltableteur.com goes online as a multidisciplinary graphic design service", href: WAYBACK_2009 },
  { date: "2009-03", text: "Designs the identity for A.K.A. Luova, a high-end hair salon" },
  { date: "2009", text: "Designs the identity system for the merged Finnish Transport Agency", href: "/work/finnish-transport-agency" },
  { date: "2008-08", text: "Joins Talentor Finland as a Graphic Design Intern" },
  { date: "2008-06", text: "Graduates BA (Hons) Graphic Design, University of Cumbria" },
  { date: "2008-03", text: "Designs a project for the St Bride Library, London" },
  { date: "2005-09", text: "Begins a BA in Graphic Design at the University of Cumbria" },
  { date: "2003-11", text: "Begins Media Studies at Turku University" },
  { date: "2003-08", text: "Studies Cinematography at the Räisälä Institute of Arts" },
  { date: "2003-01", text: "Studies Fine Art, Printmaking and Photography at the VS Fine Arts Center, Turku" },
  { date: "2003", text: "Begins working as Digitaltableteur" },
  { date: "2002-08", text: "Begins teaching Fine Art as a Substitute Teacher at Turun normaalikoulu" },
];
