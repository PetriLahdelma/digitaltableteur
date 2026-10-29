/**
 * One machine-readable view of the engagement offer pages, built from
 * `data/engagements` and the English locale. The offer pages' Service schema,
 * the pricing page's OfferCatalog, llms.txt, llms-full.txt and the markdown
 * served to agents all read from here, so a price or a name changes in one
 * place.
 */

import {
  ENGAGEMENTS,
  getEngagementPath,
  type EngagementConfig,
} from "@/nextjs-app/shared/data/engagements";
import en from "@/nextjs-app/shared/locales/en/translation.json";
import type { ServiceSchemaOptions } from "./structuredData";

type EngagementCopy = (typeof en.engagementPages)["audit"];

/** Price as schema.org can express it; null when the offer is quoted. */
export interface EngagementPrice {
  minPrice: number;
  maxPrice: number;
  currency: "EUR";
  /** UN/CEFACT unit code when the price is per unit of time. */
  unitCode?: "MON" | "HUR";
}

export interface EngagementEntry {
  config: EngagementConfig;
  copy: EngagementCopy;
  name: string;
  path: string;
  /** Price exactly as the pricing page shows it. */
  priceLabel: string;
  durationLabel: string;
  price: EngagementPrice | null;
}

function lookup(key: string): string {
  const value = key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined,
      en,
    );
  return typeof value === "string" ? value : "";
}

/**
 * Reads the visible price strings: "€7–14k", "€5–8k / mo" and "€90/h"
 * (also "90 €/h", the Finnish and Swedish order).
 * Anything else ("Quoted per workshop") is a quote, not a price.
 */
export function parseEngagementPrice(label: string): EngagementPrice | null {
  const range = label.match(/€\s*(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*k/i);
  if (range) {
    return {
      minPrice: Number(range[1]) * 1000,
      maxPrice: Number(range[2]) * 1000,
      currency: "EUR",
      ...(/\/\s*mo/i.test(label) ? { unitCode: "MON" as const } : {}),
    };
  }
  const hourly = label.match(/(?:€\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*€)\s*\/\s*h/i);
  if (hourly) {
    const amount = Number(hourly[1] ?? hourly[2]);
    return { minPrice: amount, maxPrice: amount, currency: "EUR", unitCode: "HUR" };
  }
  return null;
}

export function getEngagementEntries(): EngagementEntry[] {
  return ENGAGEMENTS.map((config) => {
    const copy = en.engagementPages[config.id] as EngagementCopy;
    const priceLabel = lookup(config.priceKey);
    return {
      config,
      copy,
      name: lookup(config.nameKey) || copy.eyebrow,
      path: getEngagementPath(config),
      priceLabel,
      durationLabel: lookup(config.durationKey),
      price: parseEngagementPrice(priceLabel),
    };
  });
}

const SERVICE_TYPES: Record<EngagementConfig["id"], string> = {
  audit: "Design system audit",
  uxSprint: "UX design sprint",
  liftoff: "Design system development",
  aiops: "DesignOps consulting",
  partnership: "Embedded design systems partnership",
  workshop: "Design system workshop",
  designopsPilot: "AI-assisted DesignOps",
  agentPilot: "AI agent development",
  dsMcp: "Design system MCP integration",
  agentWorkforce: "AI agent development",
};

/** Service schema input for one engagement. */
export function toServiceSchemaOptions(entry: EngagementEntry): ServiceSchemaOptions {
  return {
    name: entry.name,
    description: entry.copy.metaDescription,
    url: entry.path,
    serviceType: SERVICE_TYPES[entry.config.id],
    priceLabel: entry.priceLabel,
    price: entry.price,
    offerUrl: entry.config.primaryHref,
  };
}

export function getEngagementEntry(slug: string): EngagementEntry | undefined {
  return getEngagementEntries().find((entry) => entry.config.slug === slug);
}

/** The site copy binds numbers to units with no-break spaces; plain-text
 *  outputs for agents use ordinary spaces. */
const plainSpaces = (text: string) => text.replace(/[\u00a0\u202f]/g, " ");

/** One line per engagement for llms.txt. */
export function formatEngagementLine(entry: EngagementEntry, baseUrl: string): string {
  return plainSpaces(
    `- [${entry.name}](${baseUrl}${entry.path}): ${entry.priceLabel}, ${entry.durationLabel}. ${entry.copy.metaDescription}`,
  );
}

/** Full markdown brief of one engagement, for agents and llms-full.txt. */
export function formatEngagementMarkdown(
  entry: EngagementEntry,
  baseUrl: string,
  headingLevel = 1,
): string {
  const h = "#".repeat(headingLevel);
  const sub = "#".repeat(headingLevel + 1);
  const { copy } = entry;
  const bullets = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");
  const lines = [
    `${h} ${entry.name}`,
    "",
    `> ${copy.title}`,
    "",
    `- URL: ${baseUrl}${entry.path}`,
    `- Price: ${entry.priceLabel}`,
    `- Timeline: ${entry.durationLabel}`,
    `- Book: ${baseUrl}${entry.config.primaryHref}`,
    "",
    copy.lead,
    "",
    `${sub} ${copy.signalsTitle}`,
    "",
    bullets(copy.signals),
    "",
    `${sub} ${copy.scopeTitle}`,
    "",
    copy.scope,
    "",
    `${sub} ${copy.limitsTitle}`,
    "",
    bullets(copy.limits),
    "",
    `${sub} ${copy.stepsTitle}`,
    "",
    copy.steps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    "",
    `${sub} ${copy.deliverablesTitle}`,
    "",
    bullets(copy.deliverables),
    "",
    `${sub} ${en.engagementPages.common.investTitle}`,
    "",
    `${copy.investMeta}. ${copy.investNote}`,
    "",
    `${sub} ${copy.faqTitle}`,
    "",
    copy.faq.map((item) => `**${item.question}** ${item.answer}`).join("\n\n"),
    "",
  ];
  return plainSpaces(lines.join("\n"));
}
