const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

export const agentDiscoveryBaseUrl = baseUrl;

/** RFC 8288 Link header for homepage agent discovery */
export function getAgentDiscoveryLinkHeader(): string {
  const links = [
    `<${baseUrl}/.well-known/api-catalog>; rel="api-catalog"`,
    `<${baseUrl}/llms.txt>; rel="describedby"`,
    `<${baseUrl}/.well-known/agent-card.json>; rel="describedby"`,
    `<${baseUrl}/.well-known/agent-skills/index.json>; rel="describedby"`,
    `<${baseUrl}/.well-known/mcp/server-card.json>; rel="describedby"`,
    `<${baseUrl}/auth.md>; rel="describedby"`,
  ];
  return links.join(", ");
}

export const contentSignal = "ai-train=no, search=yes, ai-input=yes";

/** robots.txt body — custom route; MetadataRoute.Robots `other` omits Content-Signal. */
export function buildRobotsTxtBody(): string {
  return [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /api",
    "Disallow: /api/",
    "Disallow: /studio",
    "Disallow: /studio/",
    "",
    `Content-Signal: ${contentSignal}`,
    "",
    `Host: ${baseUrl}`,
    `Sitemap: ${baseUrl}/sitemap.xml`,
    `LLMs-Txt: ${baseUrl}/llms.txt`,
    "",
  ].join("\n");
}

/** Set by middleware when homepage is negotiated with Accept: text/markdown */
export const markdownNegotiationHeader = "x-accept-markdown";
