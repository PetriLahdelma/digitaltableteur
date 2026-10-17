import { NextResponse } from "next/server";

import { isRoutableProject, projectDuration, projects } from "@/nextjs-app/shared/data/projects";
import en from "@/nextjs-app/shared/locales/en/translation.json";

const CATEGORY_LABELS: Record<string, string> = {
  "design-systems": en.workFilterDesignSystems,
  "ux-design": en.workFilterUXDesign,
  branding: en.workFilterBranding,
  illustration: en.workFilterIllustration,
  tools: en.workFilterTools,
};
import { getSiteUrl } from "@/app/lib/siteUrl";

/**
 * Markdown summary of a case study for AI agents: the project record (client,
 * period, discipline, tags, summary) with a link to the full HTML case study.
 * Served at /work/<slug>.md through the proxy. A request for the case-study
 * URL with Accept: text/markdown keeps the full HTML page, since this is
 * only a summary.
 */

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = 3600;

const routable = () => projects.filter((project) => isRoutableProject(project));

export function generateStaticParams() {
  return routable().map((project) => ({ slug: project.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const project = routable().find((entry) => entry.slug === slug);
  if (!project) return new NextResponse("Not found", { status: 404 });

  const baseUrl = getSiteUrl();
  const url = `${baseUrl}/work/${project.slug}`;
  const lines = [
    `# ${project.title}`,
    "",
    ...(project.description ? [`> ${project.description}`, ""] : []),
    `- Case study: ${url}`,
    ...(project.client ? [`- Client: ${project.client}`] : []),
    ...(projectDuration(project) ? [`- Period: ${projectDuration(project)}`] : []),
    `- Discipline: ${CATEGORY_LABELS[project.category] ?? project.category}`,
    ...(project.tags.length ? [`- Topics: ${project.tags.join(", ")}`] : []),
    ...(project.liveUrl ? [`- Live: ${project.liveUrl}`] : []),
    "",
    `Summary only. The full case study is the HTML page at ${url}. Engagements and prices: ${baseUrl}/pricing.`,
    "",
  ];

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      Vary: "Accept",
    },
  });
}
