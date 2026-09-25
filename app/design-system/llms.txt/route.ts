import { NextResponse } from "next/server";

import { agentDiscoveryBaseUrl } from "@/app/lib/agent-discovery";
import { buildDesignSystemLlmsTxt } from "@/app/lib/design-system-llms";

export const dynamic = "force-static";

export function GET() {
  return new NextResponse(buildDesignSystemLlmsTxt(agentDiscoveryBaseUrl), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
