import type { FaqEntry } from "@/app/lib/structuredData";

/** Answer-first FAQ blocks for AEO / GEO — used in JSON-LD on key commercial pages. */
export const pricingFaqs: FaqEntry[] = [
  {
    question: "How much does Digitaltableteur charge for design work?",
    answer:
      "Productized packages start from €7,000. Scope covers design systems, UX/UI, DesignOps, and AI-ready workflows with fixed deliverables and senior delivery — not open-ended agency retainers.",
  },
  {
    question: "What is included in a Digitaltableteur pricing package?",
    answer:
      "Packages include defined deliverables such as audits, component libraries, design tokens, documentation, and handoff assets. Each tier lists scope, timeline, and revision boundaries up front.",
  },
  {
    question: "Does Digitaltableteur offer design systems consulting?",
    answer:
      "Yes. Digitaltableteur specializes in design system audits, component libraries, token architecture, governance, and AI-assisted DesignOps for product teams.",
  },
];

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
