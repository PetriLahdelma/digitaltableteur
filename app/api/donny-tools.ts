import type { Tool } from "@ai-sdk/provider-utils";
import { jsonSchema, tool } from "@ai-sdk/provider-utils";
import type { experimental_MCPClient } from "@ai-sdk/mcp";
import { experimental_createMCPClient } from "@ai-sdk/mcp";
import { Experimental_StdioMCPTransport } from "@ai-sdk/mcp/mcp-stdio";
import {
  WEEKLY_HOURS,
  isOpenAt,
  type DayHours,
} from "@/nextjs-app/shared/data/openHours";
import { projects } from "@/nextjs-app/shared/data/projects";

// ToolSet type matches ai package's expected tool shape
type ToolMap = Record<string, Tool<any, any>>;

const HELSINKI_TZ = "Europe/Helsinki";

const pad = (value: number | null) =>
  value == null ? null : `${String(value).padStart(2, "0")}:00`;

const SERVICE_AREAS = [
  {
    id: "design",
    title: "Product & Identity Design",
    summary:
      "Design systems, product UI, and editorial storytelling tailored for AI-native experiences.",
    highlights: [
      "Design systems that cover marketing, product, and ops surfaces",
      "Rapid prototyping across web, native, and experiential canvases",
      "Illustration, motion, and editorial support for launches",
    ],
    proofPoints: [
      "Recent brand refreshes for applied-AI startups",
      "Narrative design for executive/board storytelling",
    ],
  },
  {
    id: "development",
    title: "Full-Stack Development",
    summary:
      "Senior-level engineering across React, Vite, Node, serverless edges, and design-to-code handoff.",
    highlights: [
      "Type-safe frontends with accessibility and performance baked in",
      "API integration, data viz, and geospatial experiences",
      "Design-to-code pipelines with Storybook and visual regression",
    ],
    proofPoints: [
      "Ship-ready component libraries for multi-brand organizations",
      "Secure proxy patterns for AI Gateway / MCP integrations",
    ],
  },
  {
    id: "strategy",
    title: "Product & Brand Strategy",
    summary:
      "Clarify positioning, craft go-to-market pitches, and build living roadmaps that guide execution.",
    highlights: [
      "Workshops that align leadership around KPIs and creative direction",
      "Messaging architectures for fundraising or enterprise sales",
      "Audit + playbooks for design team operations",
    ],
    proofPoints: [
      "Fractional design leadership for growth-stage teams",
      "Launch support for multi-market campaigns",
    ],
  },
  {
    id: "ai",
    title: "Applied AI & Agentic Workflows",
    summary:
      "Proofs of concept and production deployments that pair the Vercel AI SDK, AI Gateway, and custom MCP tooling.",
    highlights: [
      "Architecture reviews for GenAI copilots and chat widgets",
      "Tool-calling, Retrieval, and MCP integration patterns",
      "Evaluation harnesses and guardrail experiment design",
    ],
    proofPoints: [
      "Internal assistants for product ops and delivery teams",
      "Safety + observability workflows alongside LangSmith/Rebuff",
    ],
  },
];

const CONTACT_CARD = {
  email: "mail@digitaltableteur.com",
  responseHours: {
    typical: "Within 2 business hours",
    afterHours: "Next Helsinki morning (UTC+2/+3)",
  },
  meetingLink: "https://digitaltableteur.com/contact",
  phone: null as string | null,
  address: "Remote-first studio operating in Helsinki & Los Angeles timezones",
};

const staticTools: ToolMap = {
  "studio.openHours": tool({
    description:
      "Lookup Digitaltableteur's Helsinki studio hours and current availability.",
    inputSchema: jsonSchema({
      type: "object",
      properties: {
        timestamp: {
          type: "string",
          format: "date-time",
          description:
            "ISO 8601 timestamp to evaluate. Defaults to the current time in UTC.",
        },
      },
      additionalProperties: false,
    }),
    outputSchema: jsonSchema({
      type: "object",
      required: ["timezone", "isOpen", "weeklyHours", "message", "timestamp"],
      properties: {
        timezone: { type: "string" },
        timestamp: { type: "string", format: "date-time" },
        isOpen: { type: "boolean" },
        message: { type: "string" },
        todaysHours: {
          type: ["object", "null"],
          properties: {
            day: { type: "string" },
            open: { type: ["string", "null"] },
            close: { type: ["string", "null"] },
          },
          additionalProperties: false,
        },
        weeklyHours: {
          type: "array",
          items: {
            type: "object",
            required: ["day", "open", "close"],
            properties: {
              day: { type: "string" },
              open: { type: ["string", "null"] },
              close: { type: ["string", "null"] },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    }),
    async execute(input?: { timestamp?: string }) {
      const now = input?.timestamp ? new Date(input.timestamp) : new Date();
      const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: HELSINKI_TZ,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        weekday: "long",
      });
      const parts = formatter.formatToParts(now);
      const weekday =
        parts.find((part) => part.type === "weekday")?.value?.toLowerCase() ??
        "";
      const todaysConfig = WEEKLY_HOURS.find((day: DayHours) =>
        weekday.startsWith(day.day),
      ) ?? {
        day: weekday || "today",
        open: null,
        close: null,
      };
      const localizedToday = {
        day: todaysConfig.day,
        open: pad(todaysConfig.open),
        close: pad(todaysConfig.close),
      };
      const weeklyHours = WEEKLY_HOURS.map((day: DayHours) => ({
        day: day.day,
        open: pad(day.open),
        close: pad(day.close),
      }));
      const isOpen = isOpenAt(now);
      const message = isOpen
        ? "The studio is currently open in Helsinki (09:00–17:00 local, Monday–Friday)."
        : todaysConfig.open == null
          ? "The studio is closed today. We operate Monday through Friday, 09:00–17:00 Helsinki time."
          : `We're currently closed. Today's window is ${localizedToday.open}–${localizedToday.close} Helsinki time.`;
      return {
        timezone: HELSINKI_TZ,
        timestamp: now.toISOString(),
        isOpen,
        message,
        todaysHours: localizedToday,
        weeklyHours,
      };
    },
  }),
  "studio.services": tool({
    description:
      "Summarize Digitaltableteur's core services or zoom into a specific capability.",
    inputSchema: jsonSchema({
      type: "object",
      properties: {
        focus: {
          type: "string",
          description:
            "Optional focus area ID (design, development, strategy, ai).",
          enum: SERVICE_AREAS.map((area) => area.id),
        },
      },
      additionalProperties: false,
    }),
    outputSchema: jsonSchema({
      type: "object",
      required: ["categories", "query"],
      properties: {
        query: { type: "string" },
        categories: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "title", "summary"],
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              summary: { type: "string" },
              highlights: {
                type: "array",
                items: { type: "string" },
              },
              proofPoints: {
                type: "array",
                items: { type: "string" },
              },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    }),
    async execute(input?: { focus?: string }) {
      const normalized = input?.focus?.toLowerCase();
      const categories = normalized
        ? SERVICE_AREAS.filter((area) => area.id === normalized)
        : SERVICE_AREAS;
      return {
        query: normalized ?? "all",
        categories,
      };
    },
  }),
  "studio.projectShowcase": tool({
    description:
      "Browse and display portfolio projects. Can filter by category, search by keyword, or fetch a specific project by slug. Returns rich project data for inline display.",
    inputSchema: jsonSchema<{
      query?: string;
      category?: string;
      slug?: string;
      limit?: number;
    }>({
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Free-text search across titles, descriptions, and tags.",
        },
        category: {
          type: "string",
          enum: ["design-systems", "ux-design", "branding", "illustration"],
          description: "Filter by project category.",
        },
        slug: {
          type: "string",
          description:
            "Fetch a specific project by its URL slug (e.g. 'vertaaux', 'helsinki-design-system').",
        },
        limit: {
          type: "number",
          description: "Max results to return (default 3).",
        },
      },
      additionalProperties: false,
    }),
    outputSchema: jsonSchema<{
      projects: {
        title: string;
        slug: string;
        description: string;
        thumbnail: string;
        category: string;
        tags: string[];
        client?: string;
        duration?: string;
        liveUrl?: string;
        url: string;
      }[];
      totalMatches: number;
    }>({
      type: "object",
      required: ["projects", "totalMatches"],
      properties: {
        projects: {
          type: "array",
          items: {
            type: "object",
            required: ["title", "slug", "description", "thumbnail", "category", "tags", "url"],
            properties: {
              title: { type: "string" },
              slug: { type: "string" },
              description: { type: "string" },
              thumbnail: { type: "string" },
              category: { type: "string" },
              tags: { type: "array", items: { type: "string" } },
              client: { type: "string" },
              duration: { type: "string" },
              liveUrl: { type: "string" },
              url: { type: "string" },
            },
            additionalProperties: false,
          },
        },
        totalMatches: { type: "number" },
      },
      additionalProperties: false,
    }),
    async execute(input) {
      let filtered = [...projects];

      // Filter by slug (exact match)
      if (input?.slug) {
        filtered = filtered.filter((p) => p.slug === input.slug);
      }
      // Filter by category
      if (input?.category) {
        filtered = filtered.filter((p) => p.category === input.category);
      }
      // Free-text search
      if (input?.query) {
        const q = input.query.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.description?.toLowerCase().includes(q) ?? false) ||
            p.tags.some((t) => t.toLowerCase().includes(q)) ||
            (p.client?.toLowerCase().includes(q) ?? false),
        );
      }

      // Sort by order
      filtered.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

      const totalMatches = filtered.length;
      const limit = input?.limit ?? 3;

      return {
        projects: filtered.slice(0, limit).map((p) => ({
          title: p.title,
          slug: p.slug,
          description: p.description || "",
          thumbnail: p.thumbnail,
          category: p.category.replace("-", " "),
          tags: p.tags,
          client: p.client,
          duration: p.duration,
          liveUrl: p.liveUrl,
          url: `/work/${p.slug}`,
        })),
        totalMatches,
      };
    },
  }),

  "studio.navigateTo": tool({
    description:
      "Navigate the user to a specific page or scroll to a section on the current page. Use when the user wants to see a specific page, project, or section. This is a client-side tool — it will be executed in the user's browser.",
    inputSchema: jsonSchema<{
      destination: string;
      section?: string;
      label?: string;
    }>({
      type: "object",
      required: ["destination"],
      properties: {
        destination: {
          type: "string",
          description:
            "URL path to navigate to, e.g. '/work', '/work/vertaaux', '/contact', '/about'.",
        },
        section: {
          type: "string",
          description:
            "Optional anchor/section ID to scroll to after navigation, e.g. 'services', 'contact-cta'.",
        },
        label: {
          type: "string",
          description:
            "Human-readable label for the destination, e.g. 'VertaaUX case study'.",
        },
      },
      additionalProperties: false,
    }),
    outputSchema: jsonSchema<{ navigated: boolean; url: string }>({
      type: "object",
      required: ["navigated", "url"],
      properties: {
        navigated: { type: "boolean" },
        url: { type: "string" },
      },
      additionalProperties: false,
    }),
    // No execute — this is a client-side tool.
    // The client will handle navigation and call addToolResult().
  }),

  "studio.contactCard": tool({
    description:
      "Return the studio contact details, response windows, and meeting link.",
    inputSchema: jsonSchema({
      type: "object",
      properties: {},
      additionalProperties: false,
    }),
    outputSchema: jsonSchema({
      type: "object",
      required: ["email", "responseHours", "meetingLink"],
      properties: {
        email: { type: "string" },
        phone: { type: ["string", "null"] },
        meetingLink: { type: "string" },
        address: { type: "string" },
        responseHours: {
          type: "object",
          required: ["typical", "afterHours"],
          properties: {
            typical: { type: "string" },
            afterHours: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    }),
    async execute() {
      return CONTACT_CARD;
    },
  }),
};

type ToolOptions = {
  enableMcp?: boolean;
  allowStdio?: boolean;
};

const toolCache = new Map<string, Promise<ToolMap>>();
const mcpClients = new Map<string, experimental_MCPClient>();
let cleanupAttached = false;

export const getDonnyTools = (options: ToolOptions = {}) => {
  const { enableMcp = true, allowStdio = true } = options;
  const cacheKey = enableMcp
    ? allowStdio
      ? "mcp+stdio"
      : "mcp-no-stdio"
    : "static";
  if (!toolCache.has(cacheKey)) {
    toolCache.set(cacheKey, buildToolset({ enableMcp, allowStdio }));
  }
  return toolCache.get(cacheKey)!;
};

const buildToolset = async ({
  enableMcp,
  allowStdio,
}: Required<ToolOptions>): Promise<ToolMap> => {
  if (!enableMcp) {
    return { ...staticTools };
  }
  const combined: ToolMap = { ...staticTools };
  const mcpTools = await loadMcpTools({ allowStdio });
  return Object.keys(mcpTools).length ? { ...combined, ...mcpTools } : combined;
};

type McpConfig = {
  mcpServers?: Record<string, McpServerConfig>;
};

type McpServerConfig =
  | {
      type: "sse" | "http";
      url: string;
      headers?: Record<string, string>;
      env?: Record<string, string>;
    }
  | {
      type: "command";
      command: string;
      args?: string[];
      env?: Record<string, string>;
      cwd?: string;
    };

const loadMcpTools = async ({
  allowStdio,
}: {
  allowStdio: boolean;
}): Promise<ToolMap> => {
  if (typeof process === "undefined" || !process.versions?.node) {
    return {};
  }
  try {
    const [{ readFile }, path] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    const configPath = path.resolve(process.cwd(), "mcp.json");
    const raw = await readFile(configPath, "utf8");
    const parsed = JSON.parse(raw) as McpConfig;
    const servers = Object.entries(parsed.mcpServers ?? {});
    if (!servers.length) return {};

    const toolEntries = await Promise.all(
      servers.map(([name, server]) =>
        loadServerTools(name, server, { allowStdio }),
      ),
    );

    const merged: ToolMap = {};
    for (const entry of toolEntries) {
      Object.assign(merged, entry);
    }
    return merged;
  } catch (error) {
    console.warn("[DonnyTools] Unable to load MCP configuration:", error);
    return {};
  }
};

const loadServerTools = async (
  name: string,
  server: McpServerConfig,
  { allowStdio }: { allowStdio: boolean },
): Promise<ToolMap> => {
  if (server.type === "command" && !allowStdio) {
    return {};
  }
  try {
    const client = await ensureMcpClient(name, server);
    const tools = await client.tools();
    const namespaced: ToolMap = {};
    for (const [toolName, toolDefinition] of Object.entries(tools)) {
      namespaced[`${name}.${toolName}`] = toolDefinition;
    }
    return namespaced;
  } catch (error) {
    console.warn(`[DonnyTools] Failed to load MCP server "${name}":`, error);
    return {};
  }
};

const ensureMcpClient = async (
  name: string,
  server: McpServerConfig,
): Promise<experimental_MCPClient> => {
  if (mcpClients.has(name)) {
    return mcpClients.get(name)!;
  }
  const transport =
    server.type === "command"
      ? new Experimental_StdioMCPTransport({
          command: server.command,
          args: server.args,
          env: resolveEnv(server.env),
          cwd: server.cwd,
        })
      : {
          type: server.type,
          url: server.url,
          headers: resolveEnv(server.env, server.headers),
        };

  const client = await experimental_createMCPClient({
    transport,
    name: `digitaltableteur-${name}`,
    onUncaughtError: (error) =>
      console.warn(`[DonnyTools] MCP client error (${name}):`, error),
  });
  mcpClients.set(name, client);
  attachCleanup();
  return client;
};

const resolveEnv = (
  env: Record<string, string> | undefined,
  headers?: Record<string, string>,
) => {
  if (!env && !headers) return headers;
  const resolvedEntries: Record<string, string> = {};
  Object.entries(env ?? {}).forEach(([key, value]) => {
    const fallback = (value ?? "").startsWith("<") ? "" : (value ?? "");
    const finalValue = process.env[key]?.trim() || fallback;
    if (finalValue) {
      resolvedEntries[key] = finalValue;
    }
  });
  return headers
    ? Object.fromEntries(
        Object.entries(headers).map(([key, value]) => [
          key,
          value.replace(
            /\{\{(\w+)\}\}/g,
            (_, envKey) => resolvedEntries[envKey] || process.env[envKey] || "",
          ),
        ]),
      )
    : resolvedEntries;
};

const attachCleanup = () => {
  if (cleanupAttached || typeof process === "undefined" || !process.on) {
    return;
  }
  cleanupAttached = true;
  const teardown = async () => {
    await Promise.all(
      Array.from(mcpClients.values()).map((client) =>
        client
          .close()
          .catch((error) =>
            console.warn("[DonnyTools] MCP client close failed:", error),
          ),
      ),
    );
    mcpClients.clear();
  };
  process.on("beforeExit", () => {
    teardown().catch(() => {
      /* no-op */
    });
  });
  process.on("SIGTERM", () => {
    teardown().catch(() => {
      /* no-op */
    });
  });
};
