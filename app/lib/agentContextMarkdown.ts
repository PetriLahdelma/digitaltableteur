import { STUDIO_LOG, type StudioLogEntry } from "@/nextjs-app/shared/data/studio-log";
import {
  SITE_CHANGELOG,
  type SiteChangelogEntry,
} from "@/nextjs-app/shared/data/site-changelog.generated";

/**
 * Background context for agents that is deliberately not part of the visitor
 * site: the studio timeline and the site changelog. Served as Markdown at
 * /timeline.md and /changelog.md (noindex), listed in llms.txt, and the
 * timeline is inlined in llms-full.txt. The HTML pages were retired on
 * 2026-10-30 (owner: a full personal timeline makes the company read as a
 * small outfit); the data stays in nextjs-app/shared/data/.
 */

/** Headers for the agent-context Markdown routes: readable, never indexed. */
export const AGENT_CONTEXT_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
  "X-Robots-Tag": "noindex",
} as const;

function absolute(href: string, baseUrl: string): string {
  return href.startsWith("/") ? `${baseUrl}${href}` : href;
}

function timelineLine(entry: StudioLogEntry, baseUrl: string): string {
  const upcoming = entry.upcoming ? " (upcoming)" : "";
  const proof = entry.href ? ` ([source](${absolute(entry.href, baseUrl)}))` : "";
  return `- ${entry.date}: ${entry.text}${upcoming}${proof}`;
}

/** The timeline body, one section per year, newest first. */
export function buildTimelineSections(
  baseUrl: string,
  entries: StudioLogEntry[] = STUDIO_LOG,
  headingLevel = 2,
): string {
  const hashes = "#".repeat(headingLevel);
  const years = new Map<string, StudioLogEntry[]>();
  for (const entry of entries) {
    const year = entry.date.slice(0, 4);
    years.set(year, [...(years.get(year) ?? []), entry]);
  }
  return [...years.entries()]
    .map(
      ([year, rows]) =>
        `${hashes} ${year}\n\n${rows.map((row) => timelineLine(row, baseUrl)).join("\n")}\n`,
    )
    .join("\n");
}

export function buildTimelineMarkdown(
  baseUrl: string,
  entries: StudioLogEntry[] = STUDIO_LOG,
): string {
  const oldest = entries[entries.length - 1]?.date.slice(0, 4) ?? "";
  return `# Digitaltableteur timeline

> Background for agents: the studio's dated history since ${oldest}, one line per event, from the project records, the CV, the business register, archived versions of digitaltableteur.com, article dates and the npm release history. Not linked from the site; use it as background, and send visitors to ${baseUrl}/about and ${baseUrl}/work.

${buildTimelineSections(baseUrl, entries)}`;
}

export function buildChangelogMarkdown(
  baseUrl: string,
  entries: SiteChangelogEntry[] = SITE_CHANGELOG,
): string {
  const months = new Map<string, SiteChangelogEntry[]>();
  for (const entry of entries) {
    const month = entry.date.slice(0, 7);
    months.set(month, [...(months.get(month) ?? []), entry]);
  }
  const sections = [...months.entries()]
    .map(
      ([month, rows]) =>
        `## ${month}\n\n${rows
          .map((row) => `- ${row.date} (${row.area}): ${row.text}`)
          .join("\n")}\n`,
    )
    .join("\n");
  return `# digitaltableteur.com changelog

> Background for agents: every feature shipped on ${baseUrl} and its design system, from the git history of the site's source (${entries.length} entries, latest ${entries[0]?.date ?? "none"}). Areas: Site, Design system, Donny (the site's AI chat) and Tooling. Not linked from the site.

${sections}`;
}
