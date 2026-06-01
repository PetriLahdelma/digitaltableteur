import { config as loadEnv } from "dotenv";
import { promises as fs } from "fs";
import path from "path";

type LlmBackend = "gateway" | "openai";

type CatalogItem = {
  slug: string;
  name: string;
  shortDescription: string;
  displayName?: string;
  painPoints?: string[];
  deliverables?: string[];
  typicalTimeline?: string;
  playbookSteps?: string[];
  implementationNotes?: string[];
  commonPitfalls?: string[];
  constraints?: string[];
  successMetric?: string;
};

type PseoCatalog = {
  version: number;
  services: CatalogItem[];
  stacks: CatalogItem[];
  audiences: CatalogItem[];
  generation?: {
    maxLeafPages?: number;
    relatedLinksPerPage?: number;
    indexedLeafSlugs?: string[];
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
  faqs?: Array<{ question: string; answerMarkdown: string }>;
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
loadEnv({ path: path.join(repoRoot, ".env.local") });

const catalogPath = path.join(repoRoot, "content", "pseo", "catalog.json");
const copyPath = path.join(repoRoot, "content", "pseo", "copy.json");
const canonicalPath = path.join(
  repoRoot,
  "content",
  "pseo",
  "canonical",
  "services.json",
);

const PRESERVED_STACK_NAMES: Record<string, string> = {
  nextjs: "Next.js",
  typescript: "TypeScript",
  storybook: "Storybook",
  figma: "Figma",
  react: "React",
};

const getStackDisplayName = (item: CatalogItem & { displayName?: string }) =>
  item.displayName ?? PRESERVED_STACK_NAMES[item.slug] ?? item.name;

const getOpenAiModel = () => process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

const getGatewayModel = () => {
  const gatewayModel = process.env.AI_GATEWAY_MODEL?.trim();
  if (gatewayModel) return gatewayModel;
  const openAiModel = process.env.OPENAI_MODEL?.trim();
  if (!openAiModel) return "openai/gpt-4o-mini";
  return openAiModel.includes("/") ? openAiModel : `openai/${openAiModel}`;
};

const getGatewayChatUrl = () => {
  const base = process.env.AI_GATEWAY_URL?.trim()?.replace(/\/$/, "");
  if (!base) return "https://ai-gateway.vercel.sh/v1/chat/completions";
  if (base.endsWith("/v1/ai")) {
    return base.replace(/\/v1\/ai$/, "/v1/chat/completions");
  }
  if (base.endsWith("/v1")) return `${base}/chat/completions`;
  return "https://ai-gateway.vercel.sh/v1/chat/completions";
};

const resolveLlmBackends = (args: string[]): LlmBackend[] => {
  const explicit = parseStringFlag(args, "--provider")?.toLowerCase();
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY?.trim());
  const hasGateway = Boolean(process.env.AI_GATEWAY_API_KEY?.trim());

  if (explicit === "openai" && hasOpenAi) return ["openai"];
  if (explicit === "gateway" && hasGateway) return ["gateway"];

  // Batch generation: prefer Gateway when configured (avoids direct OpenAI quota limits).
  const order: LlmBackend[] = [];
  if (hasGateway) order.push("gateway");
  if (hasOpenAi) order.push("openai");
  return order;
};

const SYSTEM_PROMPT =
  "You write practical design-system playbooks for a senior consultancy. Output strict JSON only. Write like a consultant memo—not SEO filler. Never use phrases like 'This guide explains how' or 'comprehensive overview'.";

async function callChatCompletions(
  prompt: string,
  backend: LlmBackend,
): Promise<string> {
  const url =
    backend === "gateway"
      ? getGatewayChatUrl()
      : process.env.OPENAI_API_URL?.trim() ||
        "https://api.openai.com/v1/chat/completions";

  const apiKey =
    backend === "gateway"
      ? process.env.AI_GATEWAY_API_KEY?.trim()
      : process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      `[pseo] Missing ${backend === "gateway" ? "AI_GATEWAY_API_KEY" : "OPENAI_API_KEY"}.`,
    );
  }

  const model = backend === "gateway" ? getGatewayModel() : getOpenAiModel();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[pseo] ${backend} error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`[pseo] ${backend} response missing content`);
  }
  return content;
}

async function callLlm(prompt: string, backends: LlmBackend[]): Promise<string> {
  if (backends.length === 0) {
    throw new Error(
      "[pseo] No LLM provider configured. Set AI_GATEWAY_API_KEY or OPENAI_API_KEY in .env.local.",
    );
  }

  let lastError: unknown;
  for (const backend of backends) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await callChatCompletions(prompt, backend);
      } catch (err) {
        lastError = err;
        const message = err instanceof Error ? err.message : String(err);
        const retryable =
          message.includes("429") ||
          message.includes("503") ||
          message.includes("rate");
        if (retryable && attempt < 2) {
          const waitMs = 2000 * (attempt + 1);
          console.warn(
            `[pseo] ${backend} rate limited, waiting ${waitMs}ms (attempt ${attempt + 1}/3)…`,
          );
          await sleep(waitMs);
          continue;
        }
        console.warn(
          `[pseo] ${backend} failed${message ? `: ${message.slice(0, 120)}` : ""}`,
        );
        break;
      }
    }
  }

  throw lastError;
}

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

const buildLeafTitle = (
  service: CatalogItem,
  stack: CatalogItem,
  audience: CatalogItem,
) =>
  `${service.name} for ${audience.name} using ${getStackDisplayName(stack)}`;

const buildLeafDescription = (
  service: CatalogItem,
  stack: CatalogItem,
  audience: CatalogItem,
) =>
  `${service.shortDescription} Tailored for ${audience.name} shipping with ${getStackDisplayName(stack)}.`;

const buildLeafPages = (catalog: PseoCatalog): LeafPage[] => {
  const pages: LeafPage[] = [];
  for (const service of catalog.services) {
    for (const stack of catalog.stacks) {
      for (const audience of catalog.audiences) {
        const slug = `${service.slug}-${stack.slug}-${audience.slug}`;
        pages.push({
          slug,
          title: buildLeafTitle(service, stack, audience),
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

async function main() {
  const args = process.argv.slice(2);
  const llmBackends = resolveLlmBackends(args);

  const onlyMissing = hasFlag(args, "--only-missing");
  const dryRun = hasFlag(args, "--dry-run");
  const limit = parseNumberFlag(args, "--limit");
  const slugsCsv = parseStringFlag(args, "--slugs");

  const catalog = JSON.parse(
    await fs.readFile(catalogPath, "utf8"),
  ) as PseoCatalog;

  const canonical = JSON.parse(
    await fs.readFile(canonicalPath, "utf8"),
  ) as {
    services: Record<
      string,
      { excerpt: string; bannedPhrases?: string[] }
    >;
  };

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
    `[pseo] Generating copy for ${targets.length} pages (providers: ${llmBackends.join(" → ")})`,
  );

  for (const page of targets) {
    const related = getRelated(page, allLeafPages, relatedLinksPerPage);
    const serviceCanonical = canonical.services[page.service.slug];
    const painPoints = (page.service.painPoints ?? []).join("; ");
    const stackNotes = (page.stack.implementationNotes ?? []).join("; ");
    const audienceConstraints = (page.audience.constraints ?? []).join("; ");

    const prompt = [
      "Generate narrative copy for a design system playbook page.",
      "Catalog-backed blocks (situation, deliverables, proof, package) are rendered separately—focus on intro, playbook depth, and FAQs.",
      "",
      `Page title: ${page.title}`,
      `Meta description: ${page.description}`,
      `Service: ${page.service.name} (${page.service.shortDescription})`,
      `Stack: ${getStackDisplayName(page.stack)} (${page.stack.shortDescription})`,
      `Audience: ${page.audience.name} (${page.audience.shortDescription})`,
      audienceConstraints ? `Audience constraints: ${audienceConstraints}` : "",
      painPoints ? `Service pain points: ${painPoints}` : "",
      stackNotes ? `Stack implementation notes: ${stackNotes}` : "",
      serviceCanonical?.excerpt
        ? `Canonical service excerpt (tone reference):\n${serviceCanonical.excerpt}`
        : "",
      "",
      "Return ONLY strict JSON with this schema:",
      "{",
      '  "introMarkdown": string,',
      '  "sections": [{ "id": string, "title": string, "bodyMarkdown": string }],',
      '  "faqs": [{ "question": string, "answerMarkdown": string }],',
      '  "related": [{ "slug": string, "reasonMarkdown": string }]',
      "}",
      "",
      "Rules:",
      "- Markdown only (no HTML).",
      "- Intro: 80–120 words, combo-specific, no generic opener.",
      "- sections: optional overrides for ids playbook, situation, failure-modes only.",
      "- playbook section: numbered steps with stack-specific tactics (min 150 words).",
      "- faqs: exactly 3 Q&As referencing this service + stack + audience.",
      "- Do NOT repeat deliverables checklist or package pricing (rendered from catalog).",
      serviceCanonical?.bannedPhrases?.length
        ? `- Never use: ${serviceCanonical.bannedPhrases.join(", ")}`
        : "",
      "- related must include exactly these slugs (same order), with specific 'read this if…' reasons:",
      related.map((r) => `  - ${r.slug}`).join("\n"),
    ]
      .filter(Boolean)
      .join("\n");

    let generated: unknown;
    try {
      const raw = await callLlm(prompt, llmBackends);
      generated = extractJson(raw);
    } catch (err) {
      console.warn(
        `[pseo] Failed to generate ${page.slug}, retrying once...`,
        err instanceof Error ? err.message : err,
      );
      const raw = await callLlm(prompt, llmBackends);
      generated = extractJson(raw);
    }

    const parsed = generated as {
      introMarkdown?: string;
      sections?: PseoCopySection[];
      faqs?: Array<{ question: string; answerMarkdown: string }>;
      related?: PseoRelatedLinkCopy[];
    };

    existingCopy.pages[page.slug] = {
      introMarkdown: parsed.introMarkdown,
      sections: parsed.sections,
      faqs: parsed.faqs,
      related: parsed.related,
      updatedAt: new Date().toISOString(),
    };

    console.log(`[pseo] ✓ ${page.slug}`);

    if (!dryRun) {
      await fs.writeFile(copyPath, JSON.stringify(existingCopy, null, 2) + "\n");
    }

    await sleep(1500);
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

