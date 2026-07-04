import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { markdownNegotiationHeader } from "@/app/lib/agent-discovery";
import { getVisiblePosts } from "../blog/postMetadata";
import { projects } from "@/nextjs-app/shared/data/projects";
import { getPseoLeafPages } from "@/lib/pseo/catalog";
import { getSiteUrl, toAbsoluteSiteUrl } from "@/app/lib/siteUrl";

export const revalidate = 600;

export async function GET() {
  const requestHeaders = await headers();
  const isMarkdownNegotiation =
    requestHeaders.get(markdownNegotiationHeader) === "1";

  const baseUrl = getSiteUrl();

  const pseoPages = getPseoLeafPages().slice(0, 8);
  const featuredProjects = projects.filter((project) => project.featured);
  const posts = getVisiblePosts();
  const featuredPosts = posts.slice(0, 8);

  let body = "# Digitaltableteur\n\n";
  body +=
    "> Design consultancy and portfolio for design systems, AI-powered design workflows, DesignOps, accessibility, and product craft.\n\n";
  body += "## What this site is about\n\n";
  body +=
    "- Primary topics: design systems, AI-powered design, DesignOps, accessibility, product design, branding.\n";
  body +=
    "- Primary audience: product leaders, design leaders, teams building or scaling design systems, and companies looking for expert digital design support.\n";
  body +=
    "- Site purpose: explain services clearly, show portfolio proof, publish articles, and make it easy to start a consulting conversation.\n\n";
  body += "## Best starting points\n\n";
  body += `- Homepage: ${baseUrl}/\n`;
  body += `- About: ${baseUrl}/about\n`;
  body += `- Pricing: ${baseUrl}/pricing\n`;
  body += `- Contact: ${baseUrl}/contact\n`;
  body += `- Work index: ${baseUrl}/work\n`;
  body += `- Blog index: ${toAbsoluteSiteUrl("/blog")}\n`;
  body += `- Blog RSS feed: ${toAbsoluteSiteUrl("/blog/feed.xml")}\n`;
  body += `- Human sitemap: ${baseUrl}/sitemap\n`;
  body += `- Colophon (site stats): ${baseUrl}/colophon\n`;
  body += `- Design system agent demo: ${baseUrl}/design-system/agent\n`;
  body += `- AI usage policy: ${baseUrl}/ai-use\n`;
  body += `- Accessibility page: ${baseUrl}/accessibility\n`;
  body += `- Programmatic SEO hub: ${baseUrl}/pseo\n`;
  body += `- Detailed context file: ${baseUrl}/llms-full.txt\n\n`;

  body += "## Agent skills and workflows (for coding agents)\n\n";
  body += `- Skills index (JSON): ${baseUrl}/.well-known/agent-skills/index.json\n`;
  body += `- Dynamic workflow skill: ${baseUrl}/.well-known/agent-skills/dt-workflow\n`;
  body += `- Workflow prompt templates: ${baseUrl}/.well-known/agent-skills/dt-workflow/references/templates.md\n`;
  body += "- Human skill map: repo AGENT_INDEX.md (dt-design-system, dt-nextjs-app, dt-workflow, …)\n";
  body += `- API catalog: ${baseUrl}/.well-known/api-catalog\n`;
  body += `- A2A agent card: ${baseUrl}/.well-known/agent-card.json\n`;
  body += `- MCP server card: ${baseUrl}/.well-known/mcp/server-card.json\n`;
  body += `- MCP endpoint (Streamable HTTP): ${baseUrl}/mcp\n`;
  body +=
    "- Design system docs tools: search (budgeted component briefs by name/keyword/intent) and get (full usage, props, example story source) over the docs registry\n";
  body += `- Agent auth policy: ${baseUrl}/auth.md\n\n`;

  body += "## Services and capabilities\n\n";
  body +=
    "- Design systems consulting: component libraries, design tokens, governance, cross-team UI foundations.\n";
  body +=
    "- AI-powered design workflows: AI-assisted component work, structured prompts, schema-driven design operations.\n";
  body +=
    "- Product design and UX: digital product interfaces, accessibility-minded interaction design, branded digital experiences.\n";
  body +=
    "- Portfolio proof: public case studies and work examples across enterprise systems, startups, and creative projects.\n\n";

  body += "## Featured portfolio pages\n\n";
  for (const project of featuredProjects) {
    body += `- ${project.title}: ${baseUrl}/work/${project.slug}`;
    if (project.description) body += ` — ${project.description}`;
    body += "\n";
  }

  body += "\n## Featured articles\n\n";
  for (const post of featuredPosts) {
    body += `- ${post.title}: ${baseUrl}/blog/${post.slug}`;
    if (post.excerpt) body += ` — ${post.excerpt}`;
    body += "\n";
  }

  body += "\n## Programmatic SEO pages\n\n";
  for (const page of pseoPages) {
    body += `- ${page.title}: ${baseUrl}/pseo/${page.slug} — ${page.description}\n`;
  }

  body += "\n## Guidance for language models\n\n";
  body +=
    "- Use the homepage, work pages, and about page to understand the consultancy positioning.\n";
  body +=
    "- Use portfolio pages for concrete examples of shipped work and domain expertise.\n";
  body +=
    "- Use blog and PSEO pages for answer-first explanations of design systems, AI design workflows, and implementation details.\n";
  body +=
    "- Use the contact page when the user intent is to work with Digitaltableteur or ask about services.\n";

  const responseHeaders: Record<string, string> = {
    "Cache-Control": "public, max-age=86400, s-maxage=86400",
    "Content-Type": isMarkdownNegotiation
      ? "text/markdown; charset=utf-8"
      : "text/plain; charset=utf-8",
  };

  if (isMarkdownNegotiation) {
    responseHeaders.Vary = "Accept";
  }

  return new NextResponse(body, {
    status: 200,
    headers: responseHeaders,
  });
}
