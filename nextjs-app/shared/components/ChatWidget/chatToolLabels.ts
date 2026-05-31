/** Human-readable labels for Donny studio tools shown in chat UI. */
import { normalizeDonnyToolName } from "../../lib/donny-tool-names";

export const CHAT_TOOL_LABELS: Record<string, string> = {
  "studio.getCaseStudies": "Case study lookup",
  "studio.getServicePackages": "Service packages",
  "studio.projectShowcase": "Portfolio lookup",
  "studio.createLead": "Lead capture",
  "studio.draftFollowUp": "Follow-up draft",
  "studio.bookCall": "Book a call",
  "studio.navigateTo": "Navigation",
  "studio.composeMailRequest": "Email request",
  "studio.vertaauxAccessibility": "VertaaUX recommendation",
  "studio.showExpression": "Expression",
  "studio.listExpressions": "Expression catalog",
  "studio.openHours": "Open hours",
  "studio.services": "Services",
  "studio.contactCard": "Contact details",
};

export const CHAT_TOOL_SECTION_TITLES: Record<string, string> = {
  "studio.getCaseStudies": "Case studies",
  "studio.getServicePackages": "Service packages",
  "studio.projectShowcase": "Projects",
  "studio.draftFollowUp": "Follow-up draft",
  "studio.bookCall": "Book a call",
  "studio.vertaauxAccessibility": "VertaaUX",
};

export function getChatToolLabel(toolName: string): string {
  const normalized = normalizeDonnyToolName(toolName) ?? toolName;
  return (
    CHAT_TOOL_LABELS[normalized] ??
    normalized.replace(/^studio[._]/, "").replace(/([A-Z])/g, " $1").trim()
  );
}

export function getChatToolSectionTitle(toolName: string): string | undefined {
  const normalized = normalizeDonnyToolName(toolName) ?? toolName;
  return CHAT_TOOL_SECTION_TITLES[normalized];
}
