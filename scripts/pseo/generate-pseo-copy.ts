import { promises as fs } from "fs";
import path from "path";

type CatalogItem = {
  slug: string;
  name: string;
  shortDescription: string;
};

type PseoCatalog = {
  version: number;
  services: CatalogItem[];
  stacks: CatalogItem[];
  audiences: CatalogItem[];
  generation?: {
    maxLeafPages?: number;
    relatedLinksPerPage?: number;
  };
};

type PseoCopySection = {
  id: string;
  title: string;
  bodyMarkdown: string;
};

type PseoRelatedLinkCopy = {
  slug: string;
  reasonMarkdown: string;
};

type PseoPageCopy = {
  introMarkdown?: string;
  sections?: PseoCopySection[];
  related?: PseoRelatedLinkCopy[];
  updatedAt?: string;
};

type PseoCopyFile = {
  version: number;
  pages: Record<string, PseoPageCopy>;
};

type LeafPage = {
  slug: string;
  title: string;
  description: string;
  service: CatalogItem;
  stack: CatalogItem;
  audience: CatalogItem;
  tags: string[];
};

const repoRoot = process.cwd();
const catalogPath = path.join(repoRoot, "content", "pseo", "catalog.json");
const copyPath = path.join(repoRoot, "content", "pseo", "copy.json");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL =
  process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const parseNumberFlag = (args: string[], flag: string): number | undefined => {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  const raw = args[idx + 1];
  if (!raw) return undefined;
  const num = Number(raw);
  return Number.isFinite(num) ? num : undefined;
};

const parseStringFlag = (args: string[], flag: string): string | undefined => {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  return args[idx + 1];
};

const hasFlag = (args: string[], flag: string) => args.includes(flag);

const toTitleCase = (text: string) =>
  text.replace(/\b\w/g, (match) => match.toUpperCase());

const buildLeafTitle = (
  service: CatalogItem,
  stack: CatalogItem,
  audience: CatalogItem,
) => `${service.name} for ${audience.name} using ${stack.name}`;

const buildLeafDescription = (
  service: CatalogItem,
  stack: CatalogItem,
  audience: CatalogItem,
) =>
  `${service.shortDescription} Tailored for ${audience.name} shipping with ${stack.name}.`;

const buildLeafPages = (catalog: PseoCatalog): LeafPage[] => {
  const pages: LeafPage[] = [];
  for (const service of catalog.services) {
    for (const stack of catalog.stacks) {
      for (const audience of catalog.audiences) {
        const slug = `${service.slug}-${stack.slug}-${audience.slug}`;
        pages.push({
          slug,
          title: toTitleCase(buildLeafTitle(service, stack, audience)),
          description: buildLeafDescription(service, stack, audience),
          service,
          stack,
          audience,
          tags: [service.slug, stack.slug, audience.slug],
        });
      }
    }
  }
  const max = catalog.generation?.maxLeafPages;
  return typeof max === "number" ? pages.slice(0, max) : pages;
};

const scoreRelated = (from: LeafPage, candidate: LeafPage): number => {
  if (candidate.slug === from.slug) return -1;
  let points = 0;
  if (candidate.service.slug === from.service.slug) points += 3;
  if (candidate.stack.slug === from.stack.slug) points += 2;
  if (candidate.audience.slug === from.audience.slug) points += 1;
  return points;
};

const getRelated = (from: LeafPage, all: LeafPage[], limit: number) =>
  all
    .map((candidate) => ({ candidate, points: scoreRelated(from, candidate) }))
    .filter((entry) => entry.points > 0)
    .sort(
      (a, b) =>
        b.points - a.points || a.candidate.slug.localeCompare(b.candidate.slug),
    )
    .slice(0, limit)
    .map((entry) => entry.candidate);

const extractJson = (raw: string): unknown => {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return JSON.parse(trimmed);
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const slice = trimmed.slice(firstBrace, lastBrace + 1);
    return JSON.parse(slice);
  }
  throw new Error("Could not find JSON in model output");
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callOpenAI(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "[pseo] Missing OPENAI_API_KEY. Add it to .env.local before running.",
    );
  }

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You write concise, practical SEO copy for a design systems / DesignOps studio website. Output must be strict JSON and must not contain any additional keys.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[pseo] OpenAI error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("[pseo] OpenAI response missing content");
  return content;
}

async function main() {
  const args = process.argv.slice(2);

  const onlyMissing = hasFlag(args, "--only-missing");
  const dryRun = hasFlag(args, "--dry-run");
  const limit = parseNumberFlag(args, "--limit");
  const slugsCsv = parseStringFlag(args, "--slugs");

  const catalog = JSON.parse(
    await fs.readFile(catalogPath, "utf8"),
  ) as PseoCatalog;

  const existingCopy = JSON.parse(
    await fs.readFile(copyPath, "utf8"),
  ) as PseoCopyFile;

  const allLeafPages = buildLeafPages(catalog);
  const relatedLinksPerPage = catalog.generation?.relatedLinksPerPage ?? 8;

  const slugFilter = slugsCsv
    ? new Set(
        slugsCsv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      )
    : undefined;

  const targets = allLeafPages
    .filter((page) => (slugFilter ? slugFilter.has(page.slug) : true))
    .filter((page) => (onlyMissing ? !existingCopy.pages[page.slug] : true))
    .slice(0, typeof limit === "number" ? limit : allLeafPages.length);

  if (targets.length === 0) {
    console.log("[pseo] Nothing to generate.");
    return;
  }

  console.log(
    `[pseo] Generating copy for ${targets.length} pages (model: ${OPENAI_MODEL})`,
  );

  for (const page of targets) {
    const related = getRelated(page, allLeafPages, relatedLinksPerPage);

    const prompt = [
      "Generate content for a programmatic SEO landing page.",
      "",
      `Page title: ${page.title}`,
      `Meta description: ${page.description}`,
      `Service: ${page.service.name} (${page.service.shortDescription})`,
      `Stack: ${page.stack.name} (${page.stack.shortDescription})`,
      `Audience: ${page.audience.name} (${page.audience.shortDescription})`,
      "",
      "Return ONLY strict JSON with this schema:",
      "{",
      '  "introMarkdown": string,',
      '  "sections": [{ "id": string, "title": string, "bodyMarkdown": string }],',
      '  "related": [{ "slug": string, "reasonMarkdown": string }]',
      "}",
      "",
      "Rules:",
      "- Markdown only (no HTML).",
      "- Keep intro under ~120 words.",
      "- Create 4 sections: Overview, What you get, Process, FAQ.",
      "- Use stable ids: overview, deliverables, process, faq.",
      "- FAQ bodyMarkdown should contain 2-3 Q&A pairs.",
      "- related must include exactly these slugs (same order), with 1-2 sentence reasons and no links:",
      related.map((r) => `  - ${r.slug}`).join("\n"),
    ].join("\n");

    let generated: unknown;
    try {
      const raw = await callOpenAI(prompt);
      generated = extractJson(raw);
    } catch (err) {
      console.warn(
        `[pseo] Failed to generate ${page.slug}, retrying once...`,
      );
      const raw = await callOpenAI(prompt);
      generated = extractJson(raw);
    }

    const parsed = generated as {
      introMarkdown?: string;
      sections?: PseoCopySection[];
      related?: PseoRelatedLinkCopy[];
    };

    existingCopy.pages[page.slug] = {
      introMarkdown: parsed.introMarkdown,
      sections: parsed.sections,
      related: parsed.related,
      updatedAt: new Date().toISOString(),
    };

    console.log(`[pseo] ✓ ${page.slug}`);

    if (!dryRun) {
      await fs.writeFile(copyPath, JSON.stringify(existingCopy, null, 2) + "\n");
    }

    await sleep(250);
  }

  if (dryRun) {
    console.log("[pseo] Dry run complete; no files written.");
  } else {
    console.log(`[pseo] Updated: ${path.relative(repoRoot, copyPath)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

