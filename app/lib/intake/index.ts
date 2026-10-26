import { CLIENT_BRAND_DISCOVERY_V1 } from "./questionnaires/client-brand-discovery.v1";
import { DESIGN_SYSTEMS_DISCOVERY_V1 } from "./questionnaires/design-systems-discovery.v1";
import type { Questionnaire } from "./types";

export * from "./types";
export * from "./schema";

/** Every published version stays registered so old submissions still resolve. */
const REGISTRY: readonly Questionnaire[] = [CLIENT_BRAND_DISCOVERY_V1, DESIGN_SYSTEMS_DISCOVERY_V1];

export const QUESTIONNAIRE_IDS = ["client-brand-discovery", "design-systems-discovery"] as const;
export type QuestionnaireId = (typeof QUESTIONNAIRE_IDS)[number];

export function getQuestionnaire(id: string, version?: string): Questionnaire | undefined {
  const matches = REGISTRY.filter((q) => q.id === id && (version === undefined || q.version === version));
  return matches.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))[0];
}

export function listQuestionnaires(): readonly Questionnaire[] {
  return REGISTRY;
}
