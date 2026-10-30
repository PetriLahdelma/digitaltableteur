import { NextResponse } from "next/server";

import { AGENT_CONTEXT_HEADERS, buildTimelineMarkdown } from "@/app/lib/agentContextMarkdown";
import { getSiteUrl } from "@/app/lib/siteUrl";

/** Served at `/timeline.md` via rewrite in next.config.ts (`.md` is a pageExtension). */
export const dynamic = "force-static";

export function GET() {
  return new NextResponse(buildTimelineMarkdown(getSiteUrl()), {
    status: 200,
    headers: AGENT_CONTEXT_HEADERS,
  });
}
