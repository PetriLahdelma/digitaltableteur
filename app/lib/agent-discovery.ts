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
  ];
  return links.join(", ");
}

export const contentSignal =
  "ai-train=no, search=yes, ai-input=yes";
