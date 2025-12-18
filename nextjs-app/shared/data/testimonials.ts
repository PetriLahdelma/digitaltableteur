/**
 * Shape of a single verified LinkedIn recommendation/testimonial.
 * All fields must reflect exactly the LinkedIn recommendation content – no paraphrasing.
 */
export interface TestimonialData {
  /** Exact quoted recommendation text */
  quote: string;
  /** Recommender full name as shown on LinkedIn */
  name: string;
  /** Recommender role/title at time of recommendation */
  title: string;
  /** Company or organization associated with the recommender */
  company: string;
  /** Public LinkedIn profile URL (optional if private) */
  linkedinUrl?: string;
  /** Optional local avatar asset (do NOT scrape without permission) */
  avatarUrl?: string;
  /** Optional ISO date the recommendation was given (YYYY-MM-DD) */
  date?: string;
  /** Optional locale of the original recommendation (e.g. 'en', 'fi', 'sv') */
  locale?: string;
  /** Optional internal source reference (e.g. exported PDF page, section index) */
  sourceRef?: string;
}

/**
 * Verified LinkedIn recommendations.
 * NOTE: This array is intentionally empty until real data is supplied.
 *
 * How to populate safely:
 * 1. Export your LinkedIn profile as PDF OR manually copy each recommendation text verbatim.
 * 2. For each recommendation: add a new object with exact quote + name + title + company.
 * 3. Do NOT alter wording, fix spelling, or translate – store original text only.
 * 4. If translating for UI later, create separate translation keys – keep original here.
 * 5. Commit with a message referencing the provenance (e.g. "Add 3 LinkedIn recommendations (PDF export 2025-11-02)").
 */
export const testimonials: TestimonialData[] = [];

/**
 * If you prefer to keep the raw export separate, you can create `linkedIn-recommendations-raw.md`
 * and reference lines/pages via the `sourceRef` field for full traceability.
 */
