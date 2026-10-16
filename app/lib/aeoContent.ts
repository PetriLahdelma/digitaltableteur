import type { FaqEntry } from "@/app/lib/structuredData";

/** Answer-first FAQ blocks for AEO / GEO — used in JSON-LD on key commercial pages. */
export const aboutFaqs: FaqEntry[] = [
  {
    question: "Who is Petri Lahdelma?",
    answer:
      "Petri Lahdelma is the founder of Digitaltableteur — a design systems specialist and DesignOps engineer based in Helsinki, Finland, working with product teams globally on React, TypeScript, Figma, and AI-powered design workflows.",
  },
  {
    question: "What does Digitaltableteur specialize in?",
    answer:
      "Digitaltableteur focuses on design systems, accessible component libraries, design tokens, AI-native DesignOps, and product design for modern digital products.",
  },
  {
    question: "Where is Digitaltableteur based?",
    answer:
      "Digitaltableteur is based in Helsinki, Finland (Hämeentie 8 C, 00530). Services are delivered remotely to clients in Europe and globally, in English, Finnish, and Swedish.",
  },
];

export const contactFaqs: FaqEntry[] = [
  {
    question: "How do I contact Digitaltableteur?",
    answer:
      "Use the contact form at digitaltableteur.com/contact, email mail@digitaltableteur.com, or book a call directly from the contact page. Typical response time is within one business day.",
  },
  {
    question: "What types of projects does Digitaltableteur take on?",
    answer:
      "Design system audits and builds, component libraries, design tokens, AI-powered DesignOps, branding, UX/UI, and accessibility-focused product design for startups and scale-ups.",
  },
];
