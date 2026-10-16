import en from "@/nextjs-app/shared/locales/en/translation.json";
import type { FaqEntry } from "@/app/lib/structuredData";

/**
 * The visible procurement FAQ (ProcurementFaq pattern), in English, for the
 * FAQPage structured data of every page that renders it. Reading the locale
 * keeps the markup and the structured data from drifting apart.
 */
export const procurementFaqEntries: FaqEntry[] = en.procurementFaq.items.map(
  ({ question, answer }) => ({ question, answer }),
);
