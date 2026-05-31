import sanitize from "mongo-sanitize";
import { getDatabase } from "./mongodb";
import type { DonnyLeadPersona } from "@/nextjs-app/shared/lib/donny-lead/donny-lead-routing";

export interface DonnyLeadRecordInput {
  persona: DonnyLeadPersona;
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
}

export async function storeDonnyLead(
  input: DonnyLeadRecordInput,
): Promise<{ leadId: string | null; stored: boolean }> {
  try {
    const db = await getDatabase();
    const collection = db.collection("donny_leads");

    const doc = {
      persona: sanitize(input.persona),
      name: input.name ? sanitize(input.name) : null,
      email: input.email ? sanitize(input.email) : null,
      company: input.company ? sanitize(input.company) : null,
      need: input.need ? sanitize(input.need) : null,
      budget: input.budget ? sanitize(input.budget) : null,
      timeline: input.timeline ? sanitize(input.timeline) : null,
      role: input.role ? sanitize(input.role) : null,
      recommendedPackageId: input.recommendedPackageId
        ? sanitize(input.recommendedPackageId)
        : null,
      recommendedCaseSlugs: (input.recommendedCaseSlugs ?? []).map((slug) =>
        sanitize(slug),
      ),
      summary: input.summary ? sanitize(input.summary) : null,
      source: "donny-chat",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    return { leadId: result.insertedId.toString(), stored: true };
  } catch (error) {
    console.warn("[DonnyLead] Failed to store lead:", error);
    return { leadId: null, stored: false };
  }
}
