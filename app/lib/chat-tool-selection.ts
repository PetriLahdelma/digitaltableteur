import type { Tool } from "@ai-sdk/provider-utils";

type ToolMap = Record<string, Tool<any, any>>;

const CORE_CHAT_TOOLS = ["studio.navigateTo", "studio.contactCard"] as const;

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

const HOURS_INTENT_PATTERN =
  /\b(open\s*hours|hours|availability|aukiolo|öppet)\b/i;

const SERVICES_INTENT_PATTERN =
  /\b(services?|capabilities|offerings?|palvelu|tjänst)\b/i;

const ACCESSIBILITY_INTENT_PATTERN =
  /\b(accessibility|a11y|wcag|screen\s*reader|saavutettavuus|tillgänglighet)\b/i;

const EXPRESSION_INTENT_PATTERN = /\b(expression|mood|face|moods?)\b/i;

const MAIL_INTENT_PATTERN =
  /\b(cv|resume|curriculum|portfolio\s*by\s*email|mail\s*me)\b/i;

function pickTools(tools: ToolMap, names: readonly string[]): ToolMap {
  const picked: ToolMap = {};
  for (const name of names) {
    if (tools[name]) picked[name] = tools[name];
  }
  return picked;
}

/** Expose a smaller tool set per turn to reduce prompt size and model indecision. */
export function selectDonnyToolsForChat(
  tools: ToolMap,
  lastUserMessage: string,
): ToolMap {
  const text = lastUserMessage.trim();
  if (!text) {
    return pickTools(tools, [
      ...CORE_CHAT_TOOLS,
      ...LEAD_CHAT_TOOLS,
      "studio.projectShowcase",
    ]);
  }

  const selected = new Set<string>(CORE_CHAT_TOOLS);

  if (LEAD_INTENT_PATTERN.test(text)) {
    for (const name of LEAD_CHAT_TOOLS) selected.add(name);
  }

  if (BOOK_INTENT_PATTERN.test(text)) {
    selected.add("studio.bookCall");
  }

  if (
    PORTFOLIO_INTENT_PATTERN.test(text) ||
    PROJECT_INTENT_PATTERN.test(text)
  ) {
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

  const picked = pickTools(tools, Array.from(selected));
  return Object.keys(picked).length > 0 ? picked : tools;
}
