import { NextResponse } from "next/server";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

export const dynamic = "force-static";

export async function GET() {
  const agentCard = {
    schema_version: "1.0",
    name: "Digitaltableteur",
    description:
      "Helsinki-based design systems consultancy. We build, audit, and scale design systems, and ship open-source tools that prove the expertise.",
    url: baseUrl,
    provider: {
      organization: "Digitaltableteur",
      url: baseUrl,
    },
    logo: `${baseUrl}/logo512.png`,
    contact: {
      email: "mail@digitaltableteur.com",
      form: `${baseUrl}/contact`,
      phone: "+358 45 657 4469",
    },
    location: {
      address: "Hämeentie 8 C, 00530 Helsinki, Finland",
      timezone: "Europe/Helsinki",
    },
    capabilities: [
      "design-system-audit",
      "component-library-build",
      "design-tokens-theming",
      "ai-powered-designops",
      "brand-identity",
      "digital-product-design",
      "ux-ui-design",
      "accessibility-consulting",
    ],
    services: [
      {
        name: "Design system audit",
        description:
          "Assess your current UI foundation, identify gaps, and create a prioritized roadmap.",
      },
      {
        name: "Component library build",
        description:
          "Production-ready accessible components with documentation and governance.",
      },
      {
        name: "Design tokens & theming",
        description:
          "Define tokens, align design and code, ship a scalable theming foundation.",
      },
      {
        name: "AI-powered DesignOps",
        description:
          "Automate workflows, reduce design debt, scale consistent execution.",
      },
    ],
    open_source: [
      {
        name: "Rhythmguard",
        description:
          "Stylelint plugin that enforces spacing scales and design token usage at lint time.",
        url: "https://www.npmjs.com/package/stylelint-plugin-rhythmguard",
        repository:
          "https://github.com/PetriLahdelma/stylelint-plugin-rhythmguard",
      },
      {
        name: "Project Spine",
        description:
          "CLI that compiles briefs, repos, and tokens into agent-native operating context.",
        url: "https://projectspine.dev",
        repository: "https://github.com/PetriLahdelma/project-spine",
      },
      {
        name: "LLM Component Schema",
        description:
          "npm schema and CLI for component contracts with drift detection and eval benchmarks.",
        repository:
          "https://github.com/PetriLahdelma/llm-component-schema-template",
      },
    ],
    interaction: {
      human_contact: `${baseUrl}/contact`,
      ai_chat: `${baseUrl}/api/chat`,
      context: `${baseUrl}/llms.txt`,
      context_full: `${baseUrl}/llms-full.txt`,
      design_system_mcp: `${baseUrl}/mcp`,
      design_system_demo: `${baseUrl}/design-system/agent`,
    },
    languages: ["en", "fi", "sv"],
    business_id: "2226445-2",
    operating_hours: {
      timezone: "Europe/Helsinki",
      schedule: "Monday-Friday 09:00-17:00",
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
