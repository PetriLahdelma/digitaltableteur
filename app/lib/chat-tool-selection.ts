import type { Tool } from "@ai-sdk/provider-utils";

type ToolMap = Record<string, Tool<any, any>>;

const CORE_CHAT_TOOLS = [
  "studio.navigateTo",
  "studio.contactCard",
] as const;

const LEAD_CHAT_TOOLS = [
  "studio.getCaseStudies",
  "studio.getServicePackages",
  "studio.createLead",
  "studio.draftFollowUp",
  "studio.bookCall",
] as const;

const BOOK_INTENT_PATTERN =
  /\b(book|schedule|calendar|calendly|cal\.com|meeting|call|slot|availability|available|talk live|pick a time)\b/i;

const LEAD_INTENT_PATTERN =
  /\b(budget|sprint|audit|hire|hiring|package|engagement|timeline|quote|proposal|design\s*system|component\s*library|tokens?|theming|designops|ux|15k|€|\$|eur|usd)\b/i;

const PORTFOLIO_INTENT_PATTERN =
  /\b(portfolio|case\s*stud(?:y|ies)|showcase|client\s*work|past\s*work|examples?)\b/i;

const PROJECT_INTENT_PATTERN =
  /\b(sap|vertaaux|dsharp|project|build\s*apps)\b/i;

/**
 * `\b` only knows ASCII letters, so it never matches next to ä/ö and rejects
 * Finnish inflections ("palveluita"). English terms use `\b…\b`; FI/SV terms
 * are word-start stems with a Unicode-aware lookbehind.
 */
function intent(english: RegExp, stems: readonly string[] = []): RegExp {
  if (stems.length === 0) return english;
  return new RegExp(
    `${english.source}|(?<![\\p{L}\\p{N}])(?:${stems.join("|")})`,
    "iu",
  );
}

const HOURS_INTENT_PATTERN = intent(
  /\b(open\s*hours|hours|availability)\b/i,
  ["aukiolo", "öppet", "öppettid"],
);

const SERVICES_INTENT_PATTERN = intent(
  /\b(services?|capabilities|offerings?)\b/i,
  ["palvelu", "tjänst"],
);

const ACCESSIBILITY_INTENT_PATTERN = intent(
  /\b(accessibility|a11y|wcag|screen\s*reader)\b/i,
  ["saavutettav", "tillgänglig"],
);

const EXPRESSION_INTENT_PATTERN = intent(
  /\b(expressions?|moods?|faces?|emotions?)\b/i,
  ["ilme", "uttryck", "humör"],
);

const MAIL_INTENT_PATTERN = intent(
  /\b(cv|resume|curriculum|work\s*samples?|mail\s*me)\b|\b(request|send|email|e-mail|mail|get|receive)\b.*\bportfolio\b|\bportfolio\b.*\b(e-?mail|mail|pdf|samples?)\b/i,
  ["résumé", "ansioluettel", "meritförteckning"],
);

/** Follow-up consent or contact details, e.g. "Yes, you can follow up. anna@example.com". */
const CONSENT_INTENT_PATTERN =
  /\b(follow[\s-]?up|contact\s+me|reach\s+me|get\s+back\s+to\s+me|consent|you\s+can\s+(store|save|keep|contact|email))\b|[^\s@]+@[^\s@]+\.[a-z]{2,}/i;

const PRICING_INTENT_PATTERN = intent(
  /\b(cost|costs|price|prices|pricing|how\s+much|fee|fees|rates?)\b/i,
  ["hinta", "hinnat", "hinnoittel", "maksa", "pris", "kostar", "kostnad"],
);

const NAVIGATE_INTENT_PATTERN = intent(
  /\b(take\s+me|go\s+to|navigate|open|bring\s+me|page)\b/i,
  ["siirry", "avaa", "sivu", "gå till", "öppna", "sida"],
);

/** How many recent user turns keep lead tools available during triage. */
const LEAD_CONTEXT_TURNS = 3;

function pickTools(tools: ToolMap, names: readonly string[]): ToolMap {
  const picked: ToolMap = {};
  for (const name of names) {
    if (tools[name]) picked[name] = tools[name];
  }
  return picked;
}

type ChatMessageLike = {
  role?: unknown;
  content?: unknown;
  parts?: unknown;
};

function messageText(message: ChatMessageLike): string {
  const source = message.content ?? message.parts;
  if (typeof source === "string") return source;
  if (!Array.isArray(source)) return "";
  return source
    .map((part) =>
      typeof part === "string"
        ? part
        : typeof (part as { text?: unknown })?.text === "string"
          ? (part as { text: string }).text
          : "",
    )
    .join(" ");
}

/** Text of the most recent user messages, oldest first. */
export function recentUserTexts(
  messages: readonly unknown[],
  limit = LEAD_CONTEXT_TURNS,
): string[] {
  return messages
    .filter((m): m is ChatMessageLike => (m as ChatMessageLike)?.role === "user")
    .slice(-limit)
    .map(messageText);
}

/**
 * Expose a smaller tool set per turn to reduce prompt size and model indecision.
 * `recentUserMessages` keeps lead tools available across a multi-turn triage,
 * where later answers ("I'm a client", "yes, follow up") carry no keywords.
 */
export function selectDonnyToolsForChat(
  tools: ToolMap,
  lastUserMessage: string,
  recentUserMessages: readonly string[] = [],
): ToolMap {
  const text = lastUserMessage.trim();
  if (!text) {
    return pickTools(tools, [...CORE_CHAT_TOOLS, ...LEAD_CHAT_TOOLS, "studio.projectShowcase"]);
  }

  const selected = new Set<string>(CORE_CHAT_TOOLS);

  const leadContext = recentUserMessages
    .slice(-LEAD_CONTEXT_TURNS)
    .some((message) => LEAD_INTENT_PATTERN.test(message));
  const pricingQuestion = PRICING_INTENT_PATTERN.test(text);

  if (
    LEAD_INTENT_PATTERN.test(text) ||
    CONSENT_INTENT_PATTERN.test(text) ||
    pricingQuestion ||
    leadContext
  ) {
    for (const name of LEAD_CHAT_TOOLS) selected.add(name);
  }

  if (BOOK_INTENT_PATTERN.test(text)) {
    selected.add("studio.bookCall");
  }

  if (PORTFOLIO_INTENT_PATTERN.test(text) || PROJECT_INTENT_PATTERN.test(text)) {
    selected.add("studio.projectShowcase");
    selected.add("studio.getCaseStudies");
  }

  if (HOURS_INTENT_PATTERN.test(text)) {
    selected.add("studio.openHours");
  }

  if (SERVICES_INTENT_PATTERN.test(text)) {
    selected.add("studio.services");
  }

  if (ACCESSIBILITY_INTENT_PATTERN.test(text)) {
    selected.add("studio.vertaauxAccessibility");
  }

  if (EXPRESSION_INTENT_PATTERN.test(text)) {
    selected.add("studio.showExpression");
    selected.add("studio.listExpressions");
  }

  if (MAIL_INTENT_PATTERN.test(text)) {
    selected.add("studio.composeMailRequest");
  }

  if (selected.size <= CORE_CHAT_TOOLS.length) {
    selected.add("studio.projectShowcase");
    for (const name of LEAD_CHAT_TOOLS) selected.add(name);
  }

  // A cost question needs package data, not a page. navigateTo's description
  // invites "prices, packages", so models chose it over getServicePackages.
  if (pricingQuestion && !NAVIGATE_INTENT_PATTERN.test(text)) {
    selected.delete("studio.navigateTo");
  }

  const picked = pickTools(tools, Array.from(selected));
  return Object.keys(picked).length > 0 ? picked : tools;
}
