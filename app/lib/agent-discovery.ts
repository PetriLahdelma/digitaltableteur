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

/** AI answer-engine crawlers — explicitly allowed alongside global Allow. */
export const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "FacebookBot",
  "meta-externalagent",
] as const;

/** robots.txt body (custom route). Standard directives only; the non-standard
 *  Content-Signal / LLMs-Txt lines were removed so robots.txt validates. */
export function buildRobotsTxtBody(): string {
  const disallow = [
    "Disallow: /api",
    "Disallow: /api/",
    "Disallow: /studio",
    "Disallow: /studio/",
  ];

  const aiCrawlerBlocks = AI_CRAWLER_USER_AGENTS.flatMap((agent) => [
    `User-Agent: ${agent}`,
    "Allow: /",
    ...disallow,
    "",
  ]);

  return [
    "User-Agent: *",
    "Allow: /",
    ...disallow,
    "",
    "# AI answer engines and LLM crawlers",
    ...aiCrawlerBlocks,
    `Host: ${baseUrl}`,
    `Sitemap: ${baseUrl}/sitemap.xml`,
    "",
  ].join("\n");
}

/** Set by proxy when homepage is negotiated with Accept: text/markdown */
export const markdownNegotiationHeader = "x-accept-markdown";
