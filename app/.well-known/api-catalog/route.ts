import { NextResponse } from "next/server";

import { agentDiscoveryBaseUrl } from "@/app/lib/agent-discovery";

export const dynamic = "force-static";

export async function GET() {
  const baseUrl = agentDiscoveryBaseUrl;

  const linkset = {
    linkset: [
      {
        anchor: `${baseUrl}/api/chat`,
        link: [
          {
            rel: "service-doc",
            href: `${baseUrl}/llms-full.txt`,
            type: "text/plain",
            title: "Site context and API overview for agents",
          },
          {
            rel: "service-doc",
            href: `${baseUrl}/.well-known/agent.json`,
            type: "application/json",
            title: "Agent interaction card",
          },
        ],
      },
      {
        anchor: `${baseUrl}/mcp`,
        link: [
          {
            rel: "service-doc",
            href: `${baseUrl}/.well-known/mcp/server-card.json`,
            type: "application/json",
            title: "MCP server card (SEP-1649)",
          },
          {
            rel: "service-doc",
            href: `${baseUrl}/auth.md`,
            type: "text/markdown",
            title: "Agent authentication policy",
          },
        ],
      },
      {
        anchor: `${baseUrl}/api/contact`,
        link: [
          {
            rel: "service-doc",
            href: `${baseUrl}/contact`,
            type: "text/html",
            title: "Contact form (human-facing)",
          },
        ],
      },
    ],
  };

  return NextResponse.json(linkset, {
    status: 200,
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
