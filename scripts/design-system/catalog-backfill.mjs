#!/usr/bin/env node
/**
 * Backfill alpha-tier contracts for page-pattern surfaces and catalog-gap atoms.
 * Raises raw catalog completeness toward the 85% release gate without forcing
 * full beta Storybook gates on route assemblies.
 *
 * Run: node scripts/design-system/catalog-backfill.mjs
 * Dry-run: node scripts/design-system/catalog-backfill.mjs --dry-run
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildFigmaUrl } from "./figma-config.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dryRun = process.argv.includes("--dry-run");

const SCHEMA = "../../../scripts/design-system/contract.schema.v2.json";

/** @type {Array<{ name: string, root: "components"|"patterns", tier: string, group: string, description: string }>} */
const BACKFILL = [
  {
    name: "Tooltip",
    root: "components",
    tier: "molecule",
    group: "overlay",
    description: "Radix tooltip primitive set (Provider, Trigger, Content) for icon hints.",
  },
  {
    name: "NewsBulletin",
    root: "patterns",
    tier: "pattern",
    group: "marketing",
    description: "Homepage news bulletin strip with three topical slots.",
  },
  {
    name: "ContactInquiryPanel",
    root: "patterns",
    tier: "pattern",
    group: "forms",
    description: "Contact page inquiry panel wrapping editorial form and copy.",
  },
  {
    name: "PricingPageContent",
    root: "patterns",
    tier: "pattern",
    group: "marketing",
    description: "Pricing page content assembly with tiers and FAQ.",
  },
  {
    name: "WorkHero",
    root: "patterns",
    tier: "pattern",
    group: "marketing",
    description: "Work index hero with portfolio positioning copy.",
  },
  {
    name: "AboutHero",
    root: "patterns",
    tier: "pattern",
    group: "marketing",
    description: "About page hero with studio positioning.",
  },
  {
    name: "BlogHero",
    root: "patterns",
    tier: "pattern",
    group: "marketing",
    description: "Blog index hero section.",
  },
  {
    name: "ArticleHero",
    root: "patterns",
    tier: "pattern",
    group: "content",
    description: "Blog article hero with title, meta, and cover.",
  },
  {
    name: "ProjectHero",
    root: "patterns",
    tier: "pattern",
    group: "content",
    description: "Case study hero with project title and summary.",
  },
  {
    name: "WorkCTA",
    root: "patterns",
    tier: "pattern",
    group: "marketing",
    description: "Work page closing CTA band.",
  },
  {
    name: "StatsSection",
    root: "patterns",
    tier: "pattern",
    group: "marketing",
    description: "Metrics/stats grid for case study or about pages.",
  },
  {
    name: "ValuesSection",
    root: "patterns",
    tier: "pattern",
    group: "marketing",
    description: "Studio values section for about page.",
  },
  {
    name: "ManifestoSection",
    root: "patterns",
    tier: "pattern",
    group: "content",
    description: "Long-form manifesto prose section.",
  },
  {
    name: "ContentSection",
    root: "patterns",
    tier: "pattern",
    group: "content",
    description: "Generic content section wrapper for marketing pages.",
  },
  {
    name: "CVDownloadSection",
    root: "patterns",
    tier: "pattern",
    group: "content",
    description: "CV download call-to-action section.",
  },
  {
    name: "RelatedPosts",
    root: "patterns",
    tier: "pattern",
    group: "navigation",
    description: "Related blog posts grid at article footer.",
  },
  {
    name: "RelatedProjects",
    root: "patterns",
    tier: "pattern",
    group: "navigation",
    description: "Related case studies grid at project footer.",
  },
  {
    name: "ArticleLayout",
    root: "patterns",
    tier: "template",
    group: "layout",
    description: "Blog article page layout shell.",
  },
  {
    name: "ArticlePageTemplate",
    root: "patterns",
    tier: "template",
    group: "layout",
    description: "Full blog article page template.",
  },
  {
    name: "ProjectDetailLayout",
    root: "patterns",
    tier: "template",
    group: "layout",
    description: "Case study detail layout shell.",
  },
  {
    name: "ProjectDetailTemplate",
    root: "patterns",
    tier: "template",
    group: "layout",
    description: "Full case study page template.",
  },
  {
    name: "BlogIndexContent",
    root: "patterns",
    tier: "pattern",
    group: "content",
    description: "Blog index main content assembly.",
  },
  {
    name: "ProjectMetaSection",
    root: "patterns",
    tier: "pattern",
    group: "content",
    description: "Case study metadata (client, role, year).",
  },
  {
    name: "ArticleContent",
    root: "components",
    tier: "organism",
    group: "content",
    description: "Article body prose wrapper with MDX styling.",
  },
  {
    name: "ArticleShareSection",
    root: "components",
    tier: "organism",
    group: "content",
    description: "Share links section for blog articles.",
  },
  {
    name: "BlogCategoryFilter",
    root: "components",
    tier: "molecule",
    group: "navigation",
    description: "Blog category filter control.",
  },
  {
    name: "BlogGrid",
    root: "components",
    tier: "organism",
    group: "content",
    description: "Blog post card grid for index pages.",
  },
  {
    name: "BlogMediaImage",
    root: "components",
    tier: "atom",
    group: "media",
    description: "Blog-optimized responsive image with caption.",
  },
  {
    name: "BlogNav",
    root: "components",
    tier: "molecule",
    group: "navigation",
    description: "Blog section navigation links.",
  },
  {
    name: "ProjectCard",
    root: "components",
    tier: "molecule",
    group: "content",
    description: "Portfolio project card for work grid.",
  },
  {
    name: "ProjectGallery",
    root: "components",
    tier: "organism",
    group: "media",
    description: "Case study image gallery.",
  },
  {
    name: "ProjectNav",
    root: "components",
    tier: "molecule",
    group: "navigation",
    description: "Prev/next navigation for case studies.",
  },
  {
    name: "WorkGrid",
    root: "components",
    tier: "organism",
    group: "content",
    description: "Portfolio work index grid.",
  },
  {
    name: "WorkNav",
    root: "components",
    tier: "molecule",
    group: "navigation",
    description: "Work section sub-navigation.",
  },
];

function baseDir(entry) {
  return join(
    ROOT,
    entry.root === "patterns"
      ? "nextjs-app/shared/patterns"
      : "nextjs-app/shared/components",
    entry.name,
  );
}

function buildContract(entry) {
  return {
    $schema: SCHEMA,
    name: entry.name,
    tier: entry.tier,
    group: entry.group,
    status: "alpha",
    description: entry.description,
    figma: buildFigmaUrl(entry.name),
    radixPrimitive: entry.name === "Tooltip" ? "@radix-ui/react-tooltip" : null,
    element: entry.tier === "template" ? "main" : "div",
    variants: {},
    slots: [],
    asChild: false,
    subParts: [],
    requiredStories: ["Default"],
    a11y: {
      keyboard: [],
      ariaRequirements: [],
      reducedMotion: true,
      reviewed: false,
      forcedColorsVerified: false,
    },
    tokens: { colors: [], spacing: [] },
    lightDarkVerified: false,
    schemaVersion: 2,
    composesWith: [],
  };
}

function buildSpec(entry) {
  return `# ${entry.name}

## Intent
${entry.description}

## Interaction contract
- Keyboard: inherit from composed @dt/* primitives
- Pointer: standard link/button targets where interactive
- Screen readers: use landmarks and labels from child components

## Do / don't
- Do: compose from cataloged @dt/* atoms and molecules for new UI in this surface
- Do: treat this as a page assembly reference when matching production routes
- Don't: invent parallel primitives inside this folder
- Don't: promote to stable without production consumer evidence

## Design notes
- Tokens: inherit from child components
- Figma: ${buildFigmaUrl(entry.name)}
`;
}

let written = 0;
for (const entry of BACKFILL) {
  const dir = baseDir(entry);
  const tsx = join(dir, `${entry.name}.tsx`);
  if (!existsSync(tsx)) {
    console.warn(`SKIP ${entry.name}: missing ${entry.name}.tsx`);
    continue;
  }

  const contractPath = join(dir, `${entry.name}.contract.json`);
  if (existsSync(contractPath)) {
    console.log(`skip ${entry.name} (contract exists)`);
    continue;
  }

  const specPath = join(dir, `${entry.name}.spec.md`);
  const contract = buildContract(entry);
  const spec = buildSpec(entry);

  if (dryRun) {
    console.log(`[dry-run] would write ${entry.name}.contract.json + spec.md`);
  } else {
    writeFileSync(contractPath, `${JSON.stringify(contract, null, 4)}\n`);
    if (!existsSync(specPath)) {
      writeFileSync(specPath, spec);
    }
    console.log(`backfilled ${entry.name} (alpha)`);
  }
  written += 1;
}

if (!dryRun && written > 0) {
  mkdirSync(join(ROOT, "nextjs-app/shared/foundations/dist"), { recursive: true });
}

console.log(`\n${dryRun ? "Would backfill" : "Backfilled"} ${written} component(s).`);
