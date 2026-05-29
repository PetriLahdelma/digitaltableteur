import type { MetadataRoute } from "next";

import {
  agentDiscoveryBaseUrl,
  contentSignal,
} from "@/app/lib/agent-discovery";

const baseUrl = agentDiscoveryBaseUrl;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api", "/api/", "/studio", "/studio/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
    other: {
      "LLMs-Txt": `${baseUrl}/llms.txt`,
      "Content-Signal": contentSignal,
    },
  };
}
