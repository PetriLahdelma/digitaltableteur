import { NextResponse } from "next/server";

import { agentDiscoveryBaseUrl } from "@/app/lib/agent-discovery";

export const dynamic = "force-static";

export async function GET() {
  const baseUrl = agentDiscoveryBaseUrl;

  const agentCard = {
    name: "Digitaltableteur",
    version: "1.0.0",
    description:
      "Helsinki-based design systems consultancy. Public AI chat, portfolio context, and consulting contact.",
    url: baseUrl,
    supportedInterfaces: [
      {
        url: `${baseUrl}/api/chat`,
        protocolBinding: "HTTP+JSON",
        protocolVersion: "1.0",
      },
    ],
    capabilities: [
      "streaming-chat",
      "design-system-consulting",
      "portfolio-context",
    ],
    skills: [
      {
        id: "site-context",
        name: "Site context",
        description: "Answer questions using llms.txt and public portfolio content.",
      },
      {
        id: "contact-routing",
        name: "Contact routing",
        description: "Direct users to the contact form for consulting inquiries.",
      },
    ],
    interaction: {
      human_contact: `${baseUrl}/contact`,
      ai_chat: `${baseUrl}/api/chat`,
      context: `${baseUrl}/llms.txt`,
      context_full: `${baseUrl}/llms-full.txt`,
    },
    design_system: {
      repo_paths: {
        operating_model: "docs/AGENTIC_DS_OPERATING_MODEL.md",
        case_study: "docs/AGENTIC_DS_CASE_STUDY.md",
        catalog_policy: "docs/CATALOG-POLICY.md",
        manifest: "nextjs-app/shared/foundations/dist/agent-manifest.json",
      },
      agent_demo: `${baseUrl}/design-system/agent`,
      mcp: `${baseUrl}/mcp`,
      eval: "npm run agent:eval (intent ≥90%, pattern composition golden set)",
    },
  };

  return NextResponse.json(agentCard, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
