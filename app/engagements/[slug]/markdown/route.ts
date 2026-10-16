import { NextResponse } from "next/server";

import { ENGAGEMENTS } from "@/nextjs-app/shared/data/engagements";
import {
  formatEngagementMarkdown,
  getEngagementEntry,
} from "@/app/lib/engagementCatalog";
import { getSiteUrl } from "@/app/lib/siteUrl";

/**
 * Markdown brief of one offer page for AI agents. Served at
 * /engagements/<slug>/markdown and, through the proxy, at the page URL itself
 * for requests that send Accept: text/markdown. next.config adds a canonical
 * Link header that points search engines back at the HTML page.
 */

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return ENGAGEMENTS.map((engagement) => ({ slug: engagement.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const entry = getEngagementEntry((await params).slug);
  if (!entry) return new NextResponse("Not found", { status: 404 });

  const baseUrl = getSiteUrl();
  return new NextResponse(formatEngagementMarkdown(entry, baseUrl), {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      Vary: "Accept",
    },
  });
}
