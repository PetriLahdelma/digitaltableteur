#!/usr/bin/env node
/**
 * PSEO quality gate — word count, uniqueness, proof/package links.
 *
 * Thresholds default OFF (0 / false) so ad-hoc runs can target a single check.
 * A bare run enforces NOTHING and says so loudly (it does not claim a pass).
 * The wired gate (`npm run pseo:check-quality`, run in pre-push when pSEO files
 * change) enforces two tiers:
 *   - Baseline, all pages: --min-words 250 --require-proof-link --require-package-link
 *     (floor against thinning + missing service→proof/pricing mappings; no
 *     uniqueness gate — the templated copy sits at ~10-11% and a baseline
 *     uniqueness floor there would be meaningless).
 *   - Indexed only: --indexed-only --min-words 600 --min-unique-percent 40 ...
 *     A page may only be promoted into catalog.generation.indexedLeafSlugs once
 *     it clears a real quality bar, so thin copy can never earn search traffic.
 *
 * Usage:
 *   node scripts/pseo/check-pseo-quality.mjs --min-words 250 --require-proof-link
 *   node scripts/pseo/check-pseo-quality.mjs --min-unique-percent 40 --min-words 600
 *   node scripts/pseo/check-pseo-quality.mjs --slug design-system-audit-react-startups
 *   node scripts/pseo/check-pseo-quality.mjs --indexed-only --min-words 600 --min-unique-percent 40
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const catalogPath = path.join(repoRoot, "content/pseo/catalog.json");
const copyPath = path.join(repoRoot, "content/pseo/copy.json");

const args = process.argv.slice(2);

const parseNumberFlag = (flag, fallback) => {
  const idx = args.indexOf(flag);
  if (idx === -1) return fallback;
  const num = Number(args[idx + 1]);
  return Number.isFinite(num) ? num : fallback;
};

const parseStringFlag = (flag) => {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  return args[idx + 1];
};

const hasFlag = (flag) => args.includes(flag);

const minUniquePercent = parseNumberFlag("--min-unique-percent", 0);
const minWords = parseNumberFlag("--min-words", 0);
const slugFilter = parseStringFlag("--slug");
const requireProofLink = hasFlag("--require-proof-link");
const requirePackageLink = hasFlag("--require-package-link");
const indexedOnly = hasFlag("--indexed-only");

const PRESERVED_TOKENS = {
  nextjs: "Next.js",
  typescript: "TypeScript",
  storybook: "Storybook",
  figma: "Figma",
  react: "React",
};

const getStackDisplayName = (item) =>
  item.displayName ?? PRESERVED_TOKENS[item.slug] ?? item.name;

const buildLeafTitle = (service, stack, audience) =>
  `${service.displayName ?? service.name} for ${audience.displayName ?? audience.name} using ${getStackDisplayName(stack)}`;

const buildLeafDescription = (service, stack, audience) =>
  `${service.shortDescription} Tailored for ${audience.displayName ?? audience.name} shipping with ${getStackDisplayName(stack)}.`;

const buildLeafPages = (catalog) => {
  const pages = [];
  for (const service of catalog.services) {
    for (const stack of catalog.stacks) {
      for (const audience of catalog.audiences) {
        pages.push({
          slug: `${service.slug}-${stack.slug}-${audience.slug}`,
          title: buildLeafTitle(service, stack, audience),
          description: buildLeafDescription(service, stack, audience),
          service,
          stack,
          audience,
        });
      }
    }
  }
  const max = catalog.generation?.maxLeafPages;
  return typeof max === "number" ? pages.slice(0, max) : pages;
};

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const jaccardDissimilarity = (a, b) => {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : 1 - intersection / union;
};

const wordCount = (text) => tokenize(text).length;

const buildSituation = (page) => {
  const stackName = getStackDisplayName(page.stack);
  const audienceName = page.audience.displayName ?? page.audience.name;
  const constraints = page.audience.constraints?.length
    ? page.audience.constraints.join(", ")
    : page.audience.shortDescription;
  const parts = [
    `Who this is for: ${audienceName} running ${stackName} in production.`,
    `Typical constraints: ${constraints}.`,
  ];
  if (page.audience.successMetric) {
    parts.push(`Success looks like: ${page.audience.successMetric}.`);
  }
  return parts.join(" ");
};

const buildFailureModes = (service, stack) => {
  const bullets = [...(service.painPoints ?? []), ...(stack.commonPitfalls ?? [])];
  return bullets.join(" ");
};

const buildDeliverables = (service) => (service.deliverables ?? []).join(" ");

const buildDefaultPlaybook = (page, service) => {
  const steps = service.playbookSteps ?? [];
  const stackNotes = page.stack.implementationNotes ?? [];
  return [...steps, ...stackNotes].join(" ");
};

const buildDefaultFaqs = (page, service) => {
  const stackName = getStackDisplayName(page.stack);
  const timeline = service.typicalTimeline ?? "1-4 weeks";
  return [
    `How long does ${service.name.toLowerCase()} take with ${stackName}? Most engagements run ${timeline}.`,
    "Can you work with an existing codebase? Yes, incremental upgrades are often faster.",
    "What do you need from us to start? Repo access, Figma library, and a product owner.",
  ].join(" ");
};

const renderPageText = (page, copy) => {
  const intro =
    copy?.introMarkdown ??
    `${buildLeafDescription(page.service, page.stack, page.audience)} Use this playbook to scope work and align design and engineering.`;

  const sections = [
    intro,
    buildSituation(page),
    buildFailureModes(page.service, page.stack),
    buildDeliverables(page.service),
    buildDefaultPlaybook(page, page.service),
    buildDefaultFaqs(page, page.service),
  ];

  if (copy?.sections?.length) {
    for (const section of copy.sections) {
      sections.push(section.bodyMarkdown ?? "");
    }
  }

  if (copy?.faqs?.length) {
    for (const faq of copy.faqs) {
      sections.push(`${faq.question} ${faq.answerMarkdown}`);
    }
  }

  return sections.join("\n\n");
};

const hasProofLink = (service) => (service.relatedWorkSlugs ?? []).length > 0;
const hasPackageLink = (service) => Boolean(service.pricingPackageSlug);

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const copyFile = JSON.parse(readFileSync(copyPath, "utf8"));
const pages = buildLeafPages(catalog);
const indexedSlugs = new Set(catalog.generation?.indexedLeafSlugs ?? []);

const targets = pages.filter((page) => {
  if (slugFilter && page.slug !== slugFilter) return false;
  if (indexedOnly && !indexedSlugs.has(page.slug)) return false;
  return true;
});

const rendered = targets.map((page) => ({
  page,
  text: renderPageText(page, copyFile.pages[page.slug]),
}));

const failures = [];

for (const entry of rendered) {
  const { page, text } = entry;
  const words = wordCount(text);

  if (minWords > 0 && words < minWords) {
    failures.push(`${page.slug}: ${words} words (min ${minWords})`);
  }

  if (requireProofLink && !hasProofLink(page.service)) {
    failures.push(`${page.slug}: missing proof links in catalog`);
  }

  if (requirePackageLink && !hasPackageLink(page.service)) {
    failures.push(`${page.slug}: missing pricing package mapping`);
  }
}

if (minUniquePercent > 0 && rendered.length > 1) {
  for (let i = 0; i < rendered.length; i += 1) {
    let maxSimilarity = 0;
    for (let j = 0; j < rendered.length; j += 1) {
      if (i === j) continue;
      const similarity = 1 - jaccardDissimilarity(rendered[i].text, rendered[j].text);
      if (similarity > maxSimilarity) maxSimilarity = similarity;
    }
    const uniquePercent = Math.round((1 - maxSimilarity) * 100);
    if (uniquePercent < minUniquePercent) {
      failures.push(
        `${rendered[i].page.slug}: ${uniquePercent}% unique vs nearest sibling (min ${minUniquePercent}%)`,
      );
    }
  }
}

const indexedCount = indexedSlugs.size;

const activeChecks = [];
if (minWords > 0) activeChecks.push(`min-words=${minWords}`);
if (minUniquePercent > 0) activeChecks.push(`min-unique=${minUniquePercent}%`);
if (requireProofLink) activeChecks.push("require-proof-link");
if (requirePackageLink) activeChecks.push("require-package-link");

const scope = indexedOnly ? "indexed-only" : "all";
console.log(
  `[pseo-quality] Scope: ${scope}. Checked ${targets.length} pages ` +
    `(${indexedCount} indexed). Enforced: ` +
    `${activeChecks.length ? activeChecks.join(", ") : "NOTHING"}. ` +
    `Failures: ${failures.length}`,
);

if (activeChecks.length === 0) {
  // Never claim a "pass" when no threshold was active — that false-green was
  // the whole point of the gate-is-a-no-op finding. Signal it loudly instead.
  console.warn(
    "[pseo-quality] No thresholds active — nothing was enforced. Pass " +
      "--min-words / --min-unique-percent / --require-proof-link / " +
      "--require-package-link to actually check quality.",
  );
}

if (failures.length > 0) {
  for (const failure of failures.slice(0, 30)) {
    console.error(`  ✗ ${failure}`);
  }
  if (failures.length > 30) {
    console.error(`  … and ${failures.length - 30} more`);
  }
  process.exitCode = 1;
} else if (activeChecks.length > 0) {
  console.log(`[pseo-quality] All checks passed (${activeChecks.join(", ")}).`);
}
