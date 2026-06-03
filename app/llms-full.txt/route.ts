import { NextResponse } from "next/server";

import { getVisiblePosts } from "../blog/postMetadata";
import { projects } from "@/nextjs-app/shared/data/projects";
import { getPseoCatalog, getPseoLeafPages } from "@/lib/pseo/catalog";
import type { PseoCatalogItem } from "@/lib/pseo/types";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

export const revalidate = 600;

export async function GET() {
  const pseoCatalog = getPseoCatalog();
  const pseoLeafPages = getPseoLeafPages();
  const posts = getVisiblePosts();

  let body = "# Digitaltableteur — Full Context\n\n";
  body +=
    "> Helsinki-based design systems consultancy. We build, audit, and scale design systems, and ship open-source tools that prove the expertise.\n\n";

  // Identity
  body += "## Identity\n\n";
  body += "- Name: Digitaltableteur\n";
  body += "- Founder: Petri Lahdelma\n";
  body += "- Location: Hämeentie 8 C, 00530 Helsinki, Finland\n";
  body += "- Business ID: 2226445-2 (Finnish sole proprietorship, est. 2009)\n";
  body += "- Email: mail@digitaltableteur.com\n";
  body += "- Phone: +358 45 657 4469\n";
  body += "- Operating hours: Monday-Friday 09:00-17:00 (Europe/Helsinki)\n";
  body += "- Languages: English, Finnish, Swedish\n";
  body += `- Website: ${baseUrl}\n`;
  body += `- Agent endpoint: ${baseUrl}/.well-known/agent.json\n\n`;

  // Services
  body += "## Services\n\n";
  body += "### Design system audit\n";
  body +=
    "Assess your current UI foundation, identify gaps, and create a prioritized roadmap.\n\n";
  body += "### Component library build\n";
  body +=
    "Production-ready accessible components with documentation and governance.\n\n";
  body += "### Design tokens & theming\n";
  body +=
    "Define tokens, align design and code, ship a scalable theming foundation.\n\n";
  body += "### AI-powered DesignOps\n";
  body +=
    "Automate workflows, reduce design debt, scale consistent execution.\n\n";
  body += "### Brand & Identity\n";
  body +=
    "Visual identity systems, brand strategy, and creative direction.\n\n";
  body += "### Digital Product Design\n";
  body +=
    "User-centered product interfaces with accessibility and performance.\n\n";

  // Open source tools
  body += "## Open-source tools\n\n";
  body += "### Rhythmguard\n";
  body +=
    "Stylelint plugin that enforces spacing scales and design token usage across CSS declarations and Tailwind class strings. Three rules (use-scale, prefer-token, no-offscale-transform), all with autofix. 17 built-in scale presets, 7 config presets, ESLint companion for Tailwind arbitrary classes, CLI tools (audit, init, doctor). v1.5.0, MIT.\n";
  body += "- npm: https://www.npmjs.com/package/stylelint-plugin-rhythmguard\n";
  body +=
    "- GitHub: https://github.com/PetriLahdelma/stylelint-plugin-rhythmguard\n";
  body += `- Case study: ${baseUrl}/work/rhythmguard\n\n`;

  body += "### Project Spine\n";
  body +=
    "OSS CLI that compiles a client brief, a repo, and optional design tokens into a repo-native operating layer for AI coding agents. Emits 19 files per compile: AGENTS.md, CLAUDE.md, copilot-instructions.md at repo root plus 11 markdown exports under .project-spine/. Hashed export manifest for drift detection. 6 built-in brief templates. 121 Vitest tests. v0.9.x alpha, MIT.\n";
  body += "- Homepage: https://projectspine.dev\n";
  body += "- GitHub: https://github.com/PetriLahdelma/project-spine\n";
  body += `- Case study: ${baseUrl}/work/project-spine\n\n`;

  body += "### LLM Component Schema\n";
  body +=
    "JSON schema, CLI, and governance toolkit that makes component intent machine-readable. Two npm packages (@petritapanilahdelma/llm-component-contracts and @petritapanilahdelma/llm-component-cli). 4 CLI commands: validate, drift-check, migrate, init. 2 style packs (base and tailwind). Agent eval harness, failing-examples regression library, governance templates. v1.2.0, MIT.\n";
  body +=
    "- GitHub: https://github.com/PetriLahdelma/llm-component-schema-template\n";
  body += `- Case study: ${baseUrl}/work/llm-component-schema\n\n`;

  // All portfolio projects
  body += "## Portfolio\n\n";
  for (const project of projects) {
    body += `### ${project.title}\n`;
    if (project.description) body += `${project.description}\n`;
    body += `- Category: ${project.category}\n`;
    body += `- Tags: ${project.tags.join(", ")}\n`;
    if (project.duration) body += `- Duration: ${project.duration}\n`;
    if (project.client) body += `- Client: ${project.client}\n`;
    if (project.liveUrl) body += `- Live: ${project.liveUrl}\n`;
    body += `- Case study: ${baseUrl}/work/${project.slug}\n\n`;
  }

  // All blog posts
  body += "## Blog posts\n\n";
  for (const post of posts) {
    body += `### ${post.title}\n`;
    if (post.excerpt) body += `${post.excerpt}\n`;
    body += `- Published: ${post.publishedAt}\n`;
    if (post.readTime) body += `- Read time: ${post.readTime}\n`;
    body += `- URL: ${baseUrl}/blog/${post.slug}\n\n`;
  }

  // PSEO pages
  body += "## Design system guides (PSEO)\n\n";

  body += "### Services\n";
  for (const s of pseoCatalog.services as PseoCatalogItem[]) {
    body += `- ${s.name}: ${baseUrl}/pseo/services/${s.slug}`;
    if (s.shortDescription) body += ` — ${s.shortDescription}`;
    body += "\n";
  }

  body += "\n### Technology stacks\n";
  for (const s of pseoCatalog.stacks as PseoCatalogItem[]) {
    body += `- ${s.name}: ${baseUrl}/pseo/stacks/${s.slug}`;
    if (s.shortDescription) body += ` — ${s.shortDescription}`;
    body += "\n";
  }

  body += "\n### Audiences\n";
  for (const a of pseoCatalog.audiences as PseoCatalogItem[]) {
    body += `- ${a.name}: ${baseUrl}/pseo/audiences/${a.slug}`;
    if (a.shortDescription) body += ` — ${a.shortDescription}`;
    body += "\n";
  }

  body += "\n### Guide pages\n";
  for (const page of pseoLeafPages) {
    body += `- ${page.title}: ${baseUrl}/pseo/${page.slug}\n`;
  }

  // Agent skills (coding agents / Claude Code dynamic workflows)
  body += "\n## Agent skills and dynamic workflows\n\n";
  body += `- Skills index (JSON): ${baseUrl}/.well-known/agent-skills/index.json\n`;
  body += `- dt-workflow (ultracode bulk sweeps): ${baseUrl}/.well-known/agent-skills/dt-workflow\n`;
  body += `- Workflow templates: ${baseUrl}/.well-known/agent-skills/dt-workflow/references/templates.md\n`;
  body += `- MCP server card: ${baseUrl}/.well-known/mcp/server-card.json\n`;
  body += `- MCP endpoint: ${baseUrl}/mcp\n`;
  body += `- Agent auth policy: ${baseUrl}/auth.md\n`;
  body += "- dt-design-system, dt-nextjs-app, dt-api-routes, dt-scripts, dt-sanity-cms, dt-ship-pr: same index\n";
  body += "- Workflow prompt templates live in repo: .claude/skills/dt-workflow/references/templates.md\n";
  body += "- Human index: repo AGENT_INDEX.md; architecture: docs/AGENT_WORKFLOW.md\n\n";

  // Contact guidance
  body += "\n## How to reach us\n\n";
  body += `- Contact form: ${baseUrl}/contact\n`;
  body += "- Email: mail@digitaltableteur.com\n";
  body += "- Phone: +358 45 657 4469\n";
  body += `- AI chat (Donny): available on ${baseUrl} during operating hours\n`;
  body += `- Agent endpoint: ${baseUrl}/.well-known/agent.json\n`;
  body += `- Programmatic contact: POST to ${baseUrl}/api/contact with JSON body (name, email, message fields required)\n`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
