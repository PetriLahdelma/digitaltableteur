#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import {
  classifyIssueDomain,
  deriveLabels,
} from "../../lib/linear/classify";
import { detectComponentLabels } from "../../lib/linear/componentDetection";
import { rewriteIssueDescription } from "../../lib/linear/textImprover";
import {
  createLinearIssue,
  validateLinearEnv,
} from "../../lib/linear/createIssue";

dotenv.config();
const envLocal = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal, override: false });
}

validateLinearEnv();

const priorityMap = { P1: 0, P2: 1, P3: 2, P4: 3 } as const;

interface TicketSeed {
  title: string;
  issueType: "Enhancement" | "Task" | "Bug";
  priorityLabel: keyof typeof priorityMap;
  summary: string;
  scope: string[];
  acceptance: string[];
  labels?: string[];
  estimateDays: number;
}

const tasks: TicketSeed[] = [
  {
    title: "Migrate digitaltableteur.com to Next.js SSR foundation",
    issueType: "Enhancement",
    priorityLabel: "P1",
    summary:
      "Build the 2026-ready web surface with Next.js SSR/ISR, structured metadata, and hardened security baselines per PRD section 4.1 + roadmap Q1 foundation.",
    scope: [
      "Create Next.js 16 app router codebase with SSR/ISR for all current pages",
      "Implement head-manager with Organization, Article, and Service schema",
      "Add security headers (CSP, HSTS, Referrer-Policy) + SRI for third-party scripts",
      "Set up GitHub Actions pipeline with OWASP ZAP + Lighthouse gates",
      "Document migration checklist + rollback plan in repo",
    ],
    acceptance: [
      "SSR build deployed to Vercel with zero blocking regressions",
      "Security headers verified via automated check + manual curl",
      "Sitemap + metadata validated in Search Console inspection",
      "GitHub Actions pipeline blocking on OWASP + Lighthouse score ≥95",
      "Working days estimate: 10",
    ],
    labels: ["automation", "observability"],
    estimateDays: 10,
  },
  {
    title: "Launch productized offer landing pages",
    issueType: "Enhancement",
    priorityLabel: "P1",
    summary:
      "Deliver the three Q1 service packages (Design System Lift-Off, AI-Ready Brand Ops, AI UX Sprint) with pricing, outcomes, and book-a-call CTAs.",
    scope: [
      "Author copy and IA for each service page (value prop, deliverables, pricing band)",
      "Embed testimonials + related case study slots per PRD 4.1",
      "Add JSON-LD Service schema for each SKU",
      "Wire Calendly/booking CTA + contact fallback",
      "Localize EN + FI strings",
    ],
    acceptance: [
      "Three routes live with analytics + conversion tracking",
      "Each page passes structured data test for Service type",
      "CTA instrumentation recorded in analytics dashboard",
      "Working days estimate: 8",
    ],
    labels: ["design-system", "ui-app-triage"],
    estimateDays: 8,
  },
  {
    title: "Stand up case study system and publish first 3 proofs",
    issueType: "Enhancement",
    priorityLabel: "P1",
    summary:
      "Implement the Problem→Approach→Artifact→Outcome template plus gallery + SEO metadata, then ship three flagship case studies with metrics and quotes.",
    scope: [
      "Create MDX/Content schema for case studies with gallery + metrics",
      "Design reusable CaseStudy layout component",
      "Collect assets and metrics for 3 priority clients",
      "Add testimonial quotes + stack tags",
      "Publish case studies with canonical + share images",
    ],
    acceptance: [
      "Template available for future case studies in CMS/MDX",
      "Three case studies live with metrics + quotes",
      "Gallery supports images + short video embeds",
      "Working days estimate: 9",
    ],
    labels: ["design-system"],
    estimateDays: 9,
  },
  {
    title: "Build public AI demo portal for component insights",
    issueType: "Enhancement",
    priorityLabel: "P2",
    summary:
      "Deliver the Q2 AI demo: user selects a component and sees DS tokens, accessibility checks, and code via a rate-limited API + logging.",
    scope: [
      "Design UX for component selector + token/code output",
      "Implement serverless API with rate limiting + audit logs",
      "Integrate accessibility lint + token metadata",
      "Capture interaction analytics for KPI reporting",
      "Document abuse prevention + key vault usage",
    ],
    acceptance: [
      "Public demo deployed behind rate limiting + logging",
      "Supports at least 5 showcase components",
      "Analytics dashboard captures unique interactions",
      "Working days estimate: 12",
    ],
    labels: ["ai", "automation"],
    estimateDays: 12,
  },
  {
    title: "Implement CMS-powered content engine + AI brief cadence",
    issueType: "Enhancement",
    priorityLabel: "P2",
    summary:
      "Integrate Sanity/Contentlayer for articles + briefs, sync Medium canonical links, and schedule monthly 'AI in Design Systems' briefs with newsletter + webinar hooks.",
    scope: [
      "Select CMS (Sanity or Contentlayer) and wire to Next.js",
      "Model articles, briefs, webinars with canonical + tags",
      "Automate Medium canonical + RSS generation",
      "Set up Buttondown/Revue integration for newsletter",
      "Create 6-month editorial calendar with owners",
    ],
    acceptance: [
      "Editors can create/publish content without code deploy",
      "RSS + newsletter integration live",
      "Editorial calendar documented with dates + owners",
      "Working days estimate: 7",
    ],
    labels: ["automation"],
    estimateDays: 7,
  },
  {
    title: "Ship Design System Lift-Off playbook lead magnet",
    issueType: "Task",
    priorityLabel: "P2",
    summary:
      "Create the downloadable PDF lead magnet + nurture journey promised in Q2 roadmap to feed the demand engine.",
    scope: [
      "Outline playbook (diagnostics, roadmap, deliverables) aligned to DS Lift-Off offer",
      "Design PDF + responsive landing page with form",
      "Implement automated email sequence (3 touch) post-download",
      "Track downloads + attribution in analytics",
    ],
    acceptance: [
      "Playbook PDF hosted + accessible via gated form",
      "Email nurture configured + QA'd",
      "Dashboard tracks downloads + conversion to calls",
      "Working days estimate: 5",
    ],
    labels: ["design-system"],
    estimateDays: 5,
  },
  {
    title: "Publish open token library + Storybook snapshot",
    issueType: "Enhancement",
    priorityLabel: "P3",
    summary:
      "Expose token JSON + interactive Storybook gallery per Q3 roadmap to demonstrate DS capability and supply public proof.",
    scope: [
      "Export tokens to consumable JSON + CSS vars",
      "Host read-only Storybook snapshot with highlighted components",
      "Document usage + licensing on site",
      "Automate nightly token export",
    ],
    acceptance: [
      "Token library downloadable in JSON + CSS",
      "Storybook snapshot deployed + linked from site",
      "Automation job keeps snapshot fresh",
      "Working days estimate: 6",
    ],
    labels: ["design-system", "observability"],
    estimateDays: 6,
  },
];

async function main() {
  for (const task of tasks) {
    const baseDescription = [
      task.summary,
      "\nScope:",
      ...task.scope.map((item) => `- ${item}`),
      "\nAcceptance Criteria:",
      ...task.acceptance.map((item) => `- ${item}`),
      `\nEstimate: ~${task.estimateDays} working days`,
      "\nReferences: PRD 2026 + Roadmap 2026",
    ].join("\n");

    const classification = classifyIssueDomain({
      title: task.title,
      description: baseDescription,
      issueType: task.issueType,
    });

    const detection = await detectComponentLabels(
      `${task.title} ${baseDescription}`,
    );

    const { labels, autoApplied } = deriveLabels({
      domain: classification.domain,
      issueType: task.issueType,
      providedLabels: task.labels,
      componentLabels: detection.labels,
    });

    const rewrite = rewriteIssueDescription({
      title: task.title,
      issueType: task.issueType,
      priority: task.priorityLabel,
      description: baseDescription,
      labels,
      rawInput: baseDescription,
    });

    const issue = await createLinearIssue({
      title: task.title,
      description: rewrite.finalBody,
      priority: priorityMap[task.priorityLabel],
      labelNames: labels,
    });

    console.log(
      `Created ${issue.identifier} (${task.title}) with labels: ${labels.join(", ")}. Auto labels: ${autoApplied.join(", ")}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
