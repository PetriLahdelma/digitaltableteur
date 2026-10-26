import { describe, expect, it } from "vitest";

import {
  INTAKE_LIMITS,
  INTAKE_LOCALES,
  draftSchema,
  getQuestionnaire,
  inputFields,
  listQuestionnaires,
  pruneHiddenAnswers,
  submissionSchema,
  visibleFields,
} from "./index";
import type { LocalizedCopy, Questionnaire } from "./types";

const EM_DASH = String.fromCodePoint(0x2014);
const MIDDLE_DOT = String.fromCodePoint(0x00b7);

const brand = getQuestionnaire("client-brand-discovery") as Questionnaire;
const ds = getQuestionnaire("design-systems-discovery") as Questionnaire;

// Answer fields named in the Figma forms (2000:451, 2003:654). Checkbox rows
// collapse into one choices field per group; the typed date is server-set.
const FIGMA_FIELDS: Record<string, string[]> = {
  "client-brand-discovery": [
    "contact_name", "preferred_name", "business_name", "contact_role", "email", "phone", "timezone",
    "contact_method", "services", "project_summary", "success", "indicative_budget", "timing", "website",
    "referral", "why_now", "top_priorities", "deliverables", "scope_in", "scope_out", "budget_status",
    "budget_constraints", "budget_covers", "investment_priorities", "business_story", "name_story", "mission",
    "internal_values", "desired_perception", "audience", "audience_value", "discovery_channels",
    "audience_outcome", "competitors", "strengths", "difference", "competitor_choice", "last_update",
    "current_links", "current_problem", "keep", "remove", "constraints", "look_feel", "inspiration", "dislikes",
    "colours", "typography", "asset_link", "character_reach", "character_tone", "character_expression",
    "character_relationship", "character_era", "brand_wording", "brand_uses", "digital_requirements",
    "content_requirements", "maintenance", "other_requirements", "start_date", "launch_date", "deadline_reason",
    "decision_maker", "collaborators", "responsibilities", "dependencies", "review_complete", "share_materials",
    "acknowledgement_name",
  ],
  "design-systems-discovery": [
    "contact_name", "company", "email", "role", "phone", "timezone", "system_links", "services", "main_problem",
    "desired_change", "budget", "timing", "trigger", "purpose", "scope", "users", "reach", "sources",
    "current_state", "mismatch", "evidence", "token_source", "themes", "foundations", "coverage", "a11y",
    "behaviour", "priority_components", "stack", "distribution", "parity", "verification", "documentation",
    "quality_gaps", "constraints_eng", "sponsor", "system_owner", "capacity", "decisions", "contributions",
    "exceptions", "support", "governance_pain", "adoption", "barriers", "metrics", "migration_sources",
    "migration_constraints", "pilot", "migration_done", "ai_goal", "ai_today", "ai_context", "ai_permissions",
    "ai_review", "ai_pilot", "success_measures", "engagement_outputs", "start", "deadline", "funding",
    "approval", "dependencies", "review_complete", "share_materials", "ack_name",
  ],
};

function allCopy(q: Questionnaire): LocalizedCopy[] {
  const out: LocalizedCopy[] = [q.title, q.documentName];
  for (const page of q.pages) {
    out.push(page.part, page.title, page.intro, ...(page.closing ? [page.closing] : []));
    for (const section of page.sections) {
      out.push(section.title, ...(section.description ? [section.description] : []), ...(section.closing ? [section.closing] : []));
      for (const field of section.fields) {
        if (field.kind === "scale") out.push(field.minLabel, field.maxLabel);
        else out.push(field.label, ...(field.help ? [field.help] : []));
        if (field.kind === "choices") out.push(...field.options.map((option) => option.label));
      }
    }
  }
  return out;
}

describe.each(listQuestionnaires().map((q) => [q.id, q] as const))("%s", (id, q) => {
  it("covers every answer field in the Figma form, in order", () => {
    expect(inputFields(q).map((field) => field.id)).toEqual(FIGMA_FIELDS[id]);
  });

  it("uses unique field ids", () => {
    const ids = inputFields(q).map((field) => field.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a semantic version", () => {
    expect(q.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("has non-empty copy in every locale and follows the house style", () => {
    for (const copy of allCopy(q)) {
      for (const locale of INTAKE_LOCALES) {
        expect(copy[locale].trim(), `${locale}: ${copy.en}`).not.toBe("");
        expect(copy[locale], `em dash in ${locale}: ${copy.en}`).not.toContain(EM_DASH);
        expect(copy[locale], `middle dot in ${locale}: ${copy.en}`).not.toContain(MIDDLE_DOT);
      }
    }
  });

  it("classifies every field", () => {
    for (const field of inputFields(q)) expect(field.sensitivity).toBeDefined();
  });

  it("accepts an empty draft and rejects unknown keys", () => {
    expect(draftSchema(q).safeParse({}).success).toBe(true);
    expect(draftSchema(q).safeParse({ injected: "x" }).success).toBe(false);
  });

  it("rejects over-long answers", () => {
    const longField = inputFields(q).find((field) => field.kind === "longText")!;
    const tooLong = "a".repeat(INTAKE_LIMITS.longText + 1);
    expect(draftSchema(q).safeParse({ [longField.id]: tooLong }).success).toBe(false);
  });

  it("requires the essentials and the acknowledgement on submit", () => {
    const result = submissionSchema(q).safeParse({});
    expect(result.success).toBe(false);
    const missing = result.error!.issues.map((issue) => issue.path[0]).sort();
    const required = inputFields(q).filter((field) => field.required === "submit").map((field) => field.id).sort();
    expect(missing).toEqual(required);
    expect(required).toEqual(expect.arrayContaining(["contact_name", "email", "review_complete"]));
  });
});

const minimalBrand = {
  contact_name: "Test Person",
  business_name: "Test Oy",
  email: "test@example.com",
  project_summary: "A new identity.",
  success: "Clearer offer.",
  review_complete: true,
  acknowledgement_name: "Test Person",
};

describe("submission rules", () => {
  it("accepts the minimal page 1 submission", () => {
    expect(submissionSchema(brand).safeParse(minimalBrand).success).toBe(true);
  });

  it("rejects an invalid email address", () => {
    expect(submissionSchema(brand).safeParse({ ...minimalBrand, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects options that are not in the definition", () => {
    expect(draftSchema(brand).safeParse({ services: ["brand_identity", "hacking"] }).success).toBe(false);
  });

  it("rejects scale values outside 1 to 5", () => {
    expect(draftSchema(brand).safeParse({ character_tone: 6 }).success).toBe(false);
    expect(draftSchema(brand).safeParse({ character_tone: 3 }).success).toBe(true);
  });
});

describe("conditional sections", () => {
  it("shows every service section while nothing is selected", () => {
    const ids = visibleFields(brand, {}).map((field) => field.id);
    expect(ids).toEqual(expect.arrayContaining(["brand_wording", "digital_requirements"]));
  });

  it("hides the website section for an identity-only brief and drops its answers", () => {
    const answers = { ...minimalBrand, services: ["brand_identity"], digital_requirements: "CMS", brand_wording: "Exact name" };
    const ids = visibleFields(brand, answers).map((field) => field.id);
    expect(ids).toContain("brand_wording");
    expect(ids).not.toContain("digital_requirements");
    const pruned = pruneHiddenAnswers(brand, answers);
    expect(pruned).not.toHaveProperty("digital_requirements");
    expect(pruned).toHaveProperty("brand_wording", "Exact name");
  });

  it("shows the AI page only for AI briefs once services are chosen", () => {
    const base = { services: ["audit"] };
    expect(visibleFields(ds, base).map((field) => field.id)).not.toContain("ai_goal");
    expect(visibleFields(ds, { services: ["audit", "ai"] }).map((field) => field.id)).toContain("ai_goal");
  });

  it("shows migration questions when overlapping systems are reported", () => {
    const answers = { services: ["audit"], current_state: ["overlapping"] };
    expect(visibleFields(ds, answers).map((field) => field.id)).toContain("migration_sources");
    expect(visibleFields(ds, { services: ["audit"], current_state: ["shared_code"] }).map((field) => field.id)).not.toContain(
      "migration_sources",
    );
  });
});
