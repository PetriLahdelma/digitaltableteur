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
import {
  sortedProjects,
  resolveProjectNavigationPath,
} from "@/nextjs-app/shared/data/projects";
import { resolveDonnyNavigationPath } from "@/nextjs-app/shared/data/donny-navigation";
import {
  buildDonnyMailtoUrl,
  resolveDonnyMailRequestType,
  type DonnyMailRequestType,
} from "@/nextjs-app/shared/data/donny-mail-requests";
import {
  clampDonnyExpressionDurationMs,
  DONNY_EXPRESSION_LABELS,
  listDonnyShowcaseExpressions,
  resolveDonnyShowcaseExpression,
} from "@/nextjs-app/shared/data/donny-expressions";
import { VERTAAUX_ACCESSIBILITY_OFFER } from "@/nextjs-app/shared/data/donny-vertaaux-offer";
import {
  buildLeadContactPrefill,
  draftLeadFollowUp,
  getLeadCaseStudies,
  recommendLeadPackage,
  resolveLeadPersona,
} from "@/nextjs-app/shared/lib/donny-lead/donny-lead-routing";
import { resolveDonnyBookingEmbed } from "@/nextjs-app/shared/lib/donny-booking";
import { storeDonnyLead } from "../lib/donny-lead-store";

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
      let filtered = [...sortedProjects]; // Already sorted by order

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

      const totalMatches = filtered.length;
      const limit = Math.max(1, Math.min(input?.limit ?? 3, 10));

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
      "Navigate the user to a page on digitaltableteur.com. Accepts paths (/pricing, /work, /contact) OR natural language (prices, packages, SAP Build Apps, vertaaux). Use when the user asks to navigate, open, go to, view, or show me a page, prices, packages, project, or section.",
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
            "Internal path (/pricing, /work/vertaaux) or natural language (prices, packages, SAP Build Apps, contact).",
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
    async execute(input) {
      const raw = (input?.destination ?? "/").trim();
      let dest = raw;

      if (!raw.startsWith("/")) {
        const resolved = resolveDonnyNavigationPath(raw);
        if (resolved) {
          dest = resolved;
        }
      }

      // Enforce internal paths only — reject protocols, double slashes, or external URLs
      const isInternal =
        dest.startsWith("/") && !dest.startsWith("//") && !/^\/.*:/.test(dest);
      const safePath = isInternal ? dest.split("#")[0] : "/";
      const url = input?.section ? `${safePath}#${input.section}` : safePath;
      return { navigated: isInternal && safePath !== "/", url };
    },
  }),

  "studio.getCaseStudies": tool({
    description:
      "Return curated case studies for lead triage. Filter by persona (client, recruiter, other) and optional search query. Use after identifying who the visitor is — do not guess proof without calling this tool.",
    inputSchema: jsonSchema<{
      persona?: string;
      query?: string;
      limit?: number;
    }>({
      type: "object",
      properties: {
        persona: {
          type: "string",
          enum: ["client", "recruiter", "other"],
          description:
            "client = buying services; recruiter = hiring Petri; other = general interest.",
        },
        query: {
          type: "string",
          description: "Optional keyword search across titles, tags, clients.",
        },
        limit: {
          type: "number",
          description: "Max results (default 3, max 6).",
        },
      },
      additionalProperties: false,
    }),
    outputSchema: jsonSchema({
      type: "object",
      required: ["persona", "projects", "totalMatches"],
      properties: {
        persona: { type: "string", enum: ["client", "recruiter", "other"] },
        projects: { type: "array" },
        totalMatches: { type: "number" },
      },
      additionalProperties: false,
    }),
    async execute(input) {
      return getLeadCaseStudies(input);
    },
  }),

  "studio.getServicePackages": tool({
    description:
      "Return fixed consulting packages (€8–20k) and optional package recommendation from the visitor's problem or budget hints. Use during client lead triage — never invent prices.",
    inputSchema: jsonSchema<{
      problem?: string;
      budget?: string;
    }>({
      type: "object",
      properties: {
        problem: {
          type: "string",
          description: "Visitor need in their words (design system, tokens, AI DesignOps, etc.).",
        },
        budget: {
          type: "string",
          description: "Budget band or constraints, e.g. 'around 12k' or 'tight'.",
        },
      },
      additionalProperties: false,
    }),
    outputSchema: jsonSchema({
      type: "object",
      required: ["packages", "pricingUrl"],
      properties: {
        packages: { type: "array" },
        recommendedPackageId: { type: "string" },
        fit: { type: "object" },
        pricingUrl: { type: "string" },
      },
      additionalProperties: false,
    }),
    async execute(input) {
      const result = recommendLeadPackage(input);
      return {
        ...result,
        pricingUrl: "/pricing",
      };
    },
  }),

  "studio.createLead": tool({
    description:
      "Store a qualified lead from chat when the visitor explicitly consents to follow-up. Requires consent=true. Email is optional but recommended. Returns contact form prefill — never auto-submits the contact form.",
    inputSchema: jsonSchema<{
      persona: string;
      consent: boolean;
      name?: string;
      email?: string;
      company?: string;
      need?: string;
      budget?: string;
      timeline?: string;
      role?: string;
      recommendedPackageId?: string;
      recommendedCaseSlugs?: string[];
      summary?: string;
    }>({
      type: "object",
      required: ["persona", "consent"],
      properties: {
        persona: {
          type: "string",
          enum: ["client", "recruiter", "other"],
        },
        consent: {
          type: "boolean",
          description: "Must be true — visitor agreed to follow-up / storage.",
        },
        name: { type: "string" },
        email: { type: "string" },
        company: { type: "string" },
        need: { type: "string" },
        budget: { type: "string" },
        timeline: { type: "string" },
        role: { type: "string" },
        recommendedPackageId: { type: "string" },
        recommendedCaseSlugs: {
          type: "array",
          items: { type: "string" },
        },
        summary: { type: "string" },
      },
      additionalProperties: false,
    }),
    outputSchema: jsonSchema({
      type: "object",
      required: ["stored", "contactUrl"],
      properties: {
        stored: { type: "boolean" },
        leadId: { type: "string" },
        contactPrefill: { type: "object" },
        contactUrl: { type: "string" },
        reason: { type: "string" },
      },
      additionalProperties: false,
    }),
    async execute(input) {
      const persona = resolveLeadPersona(input?.persona);
      if (!input?.consent) {
        return {
          stored: false,
          contactUrl: "/contact",
          reason: "consent_required",
        };
      }

      const contactPrefill = buildLeadContactPrefill({
        persona,
        qualification: {
          need: input?.need,
          budget: input?.budget,
          timeline: input?.timeline,
          company: input?.company,
          role: input?.role,
        },
        recommendedPackageId: input?.recommendedPackageId,
        summary: input?.summary,
      });

      const { leadId, stored } = await storeDonnyLead({
        persona,
        name: input?.name,
        email: input?.email,
        company: input?.company,
        need: input?.need,
        budget: input?.budget,
        timeline: input?.timeline,
        role: input?.role,
        recommendedPackageId: input?.recommendedPackageId,
        recommendedCaseSlugs: input?.recommendedCaseSlugs,
        summary: input?.summary,
      });

      return {
        stored,
        leadId: leadId ?? undefined,
        contactPrefill,
        contactUrl: "/contact",
        reason: stored ? undefined : "storage_unavailable",
      };
    },
  }),

  "studio.draftFollowUp": tool({
    description:
      "Draft a follow-up email for the visitor to review and send themselves. Never auto-sends mail — returns subject, body, and disclaimer only.",
    inputSchema: jsonSchema<{
      persona: string;
      recipientName?: string;
      need?: string;
      recommendedPackageId?: string;
      caseSlugs?: string[];
    }>({
      type: "object",
      required: ["persona"],
      properties: {
        persona: {
          type: "string",
          enum: ["client", "recruiter", "other"],
        },
        recipientName: { type: "string" },
        need: { type: "string" },
        recommendedPackageId: { type: "string" },
        caseSlugs: {
          type: "array",
          items: { type: "string" },
        },
      },
      additionalProperties: false,
    }),
    outputSchema: jsonSchema({
      type: "object",
      required: ["subject", "body", "disclaimer", "contactUrl"],
      properties: {
        subject: { type: "string" },
        body: { type: "string" },
        disclaimer: { type: "string" },
        contactUrl: { type: "string" },
      },
      additionalProperties: false,
    }),
    async execute(input) {
      return draftLeadFollowUp({
        persona: resolveLeadPersona(input?.persona),
        recipientName: input?.recipientName,
        need: input?.need,
        recommendedPackageId: input?.recommendedPackageId,
        caseSlugs: input?.caseSlugs,
      });
    },
  }),

  "studio.bookCall": tool({
    description:
      "Show an inline scheduling embed after fit is confirmed or when the visitor asks to book a call. Use after package selection or when they want a meeting — not before basic qualification. Prefill name/email when known.",
    inputSchema: jsonSchema<{
      meetingType?: "discovery" | "consultation";
      packageId?: string;
      name?: string;
      email?: string;
      notes?: string;
    }>({
      type: "object",
      properties: {
        meetingType: {
          type: "string",
          enum: ["discovery", "consultation"],
        },
        packageId: {
          type: "string",
          description:
            "Recommended package id from getServicePackages (ux-sprint, design-system-lift-off, ai-ready-designops).",
        },
        name: { type: "string" },
        email: { type: "string" },
        notes: {
          type: "string",
          description: "Short context for the booking (need, budget band, timeline).",
        },
      },
      additionalProperties: false,
    }),
    outputSchema: jsonSchema({
      type: "object",
      required: [
        "configured",
        "provider",
        "meetingLabel",
        "embedUrl",
        "fallbackUrl",
        "prefillApplied",
      ],
      properties: {
        configured: { type: "boolean" },
        provider: { type: "string", enum: ["calcom", "calendly", "none"] },
        meetingLabel: { type: "string" },
        embedUrl: { type: "string" },
        fallbackUrl: { type: "string" },
        prefillApplied: { type: "boolean" },
        calLink: { type: "string" },
        calOrigin: { type: "string" },
        embedJsUrl: { type: "string" },
      },
      additionalProperties: false,
    }),
    async execute(input) {
      return resolveDonnyBookingEmbed({
        meetingType: input?.meetingType,
        packageId: input?.packageId,
        name: input?.name,
        email: input?.email,
        notes: input?.notes,
      });
    },
  }),

  "studio.composeMailRequest": tool({
    description:
      "Open the visitor's email client with a pre-filled message to mail@digitaltableteur.com. Use for 'Request a CV', 'Request a portfolio', or similar email requests — not for general contact form questions.",
    inputSchema: jsonSchema<{
      requestType?: DonnyMailRequestType;
      query?: string;
    }>({
      type: "object",
      properties: {
        requestType: {
          type: "string",
          enum: ["cv", "portfolio"],
          description:
            "Use 'cv' for CV/resume requests and 'portfolio' for curated work samples requests.",
        },
        query: {
          type: "string",
          description:
            "Optional natural-language fallback, e.g. 'request a CV' or 'request a portfolio'.",
        },
      },
      additionalProperties: false,
    }),
    outputSchema: jsonSchema<{
      requestType: DonnyMailRequestType;
      mailtoUrl: string;
      opened: boolean;
    }>({
      type: "object",
      required: ["requestType", "mailtoUrl", "opened"],
      properties: {
        requestType: { type: "string", enum: ["cv", "portfolio"] },
        mailtoUrl: { type: "string" },
        opened: { type: "boolean" },
      },
      additionalProperties: false,
    }),
    async execute(input) {
      let requestType = input?.requestType;
      if (requestType !== "cv" && requestType !== "portfolio" && input?.query) {
        requestType = resolveDonnyMailRequestType(input.query) ?? undefined;
      }

      if (requestType !== "cv" && requestType !== "portfolio") {
        return {
          requestType: "cv",
          mailtoUrl: buildDonnyMailtoUrl("cv"),
          opened: false,
        };
      }

      return {
        requestType,
        mailtoUrl: buildDonnyMailtoUrl(requestType),
        opened: true,
      };
    },
  }),

  "studio.listExpressions": tool({
    description:
      "List Donny's showcase avatar moods/expressions. Use when the user asks what faces, moods, or expressions Donny can show.",
    inputSchema: jsonSchema({
      type: "object",
      properties: {},
      additionalProperties: false,
    }),
    outputSchema: jsonSchema<{
      expressions: Array<{ id: string; label: string }>;
    }>({
      type: "object",
      required: ["expressions"],
      properties: {
        expressions: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "label"],
            properties: {
              id: { type: "string" },
              label: { type: "string" },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    }),
    async execute() {
      return { expressions: listDonnyShowcaseExpressions() };
    },
  }),

  "studio.showExpression": tool({
    description:
      "Show Donny's avatar in a specific mood or expression. Use when the user asks to see a face, mood, expression, or personality demo (e.g. 'look happy', 'show me your confused face', 'what moods can you make?').",
    inputSchema: jsonSchema<{
      expression: string;
      durationMs?: number;
    }>({
      type: "object",
      required: ["expression"],
      properties: {
        expression: {
          type: "string",
          description:
            "Mood to show: canonical id (celebrating, confused, playful, thinking, impressed, skeptical, waving, apologetic, confident, suggesting, remembering, focused, greeting, curious) or alias (happy, sad, surprised, wave, etc.).",
        },
        durationMs: {
          type: "number",
          description:
            "How long to hold the expression in milliseconds (800–8000, default 2500).",
        },
      },
      additionalProperties: false,
    }),
    outputSchema: jsonSchema<{
      expression: string;
      label: string;
      durationMs: number;
    }>({
      type: "object",
      required: ["expression", "label", "durationMs"],
      properties: {
        expression: { type: "string" },
        label: { type: "string" },
        durationMs: { type: "number" },
      },
      additionalProperties: false,
    }),
    async execute(input) {
      const expression = resolveDonnyShowcaseExpression(input?.expression);
      const durationMs = clampDonnyExpressionDurationMs(input?.durationMs);
      return {
        expression,
        label: DONNY_EXPRESSION_LABELS[expression],
        durationMs,
      };
    },
  }),

  "studio.vertaauxAccessibility": tool({
    description:
      "Recommend VertaaUX when the user asks about accessibility issues, WCAG, audits, a11y tooling, screen readers, or inclusive design. Returns links to the VertaaUX case study and the live product at vertaaux.ai.",
    inputSchema: jsonSchema({
      type: "object",
      properties: {},
      additionalProperties: false,
    }),
    outputSchema: jsonSchema({
      type: "object",
      required: ["caseStudyUrl", "productUrl"],
      properties: {
        caseStudyUrl: { type: "string" },
        productUrl: { type: "string" },
      },
      additionalProperties: false,
    }),
    async execute() {
      return { ...VERTAAUX_ACCESSIBILITY_OFFER };
    },
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
