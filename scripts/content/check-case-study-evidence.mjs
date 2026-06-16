#!/usr/bin/env node
/* eslint-disable no-console */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const WORK_PAGES_DIR = join(ROOT, "nextjs-app/shared/components/pages/Work");
const strict = process.argv.includes("--strict");

const checks = [
  {
    key: "problem",
    label: "Problem / brief",
    required: true,
    pattern: /\b(problem|challenge|brief|goal|vision)\b/i,
  },
  {
    key: "buyerContext",
    label: "Buyer context",
    required: false,
    pattern: /\b(client|customer|organization|enterprise|public sector|startup|agency|city|company)\b/i,
  },
  {
    key: "role",
    label: "Role",
    required: true,
    pattern: /\b(role|lead|senior|designer|consultant|developer|art director|project lead)\b/i,
  },
  {
    key: "timeline",
    label: "Timeline",
    required: true,
    pattern: /\b(duration|timeline|date=|20\d{2}|present)\b/i,
  },
  {
    key: "team",
    label: "Team",
    required: false,
    pattern: /\b(team|collaboration|contributors?|project lead|developer|designer|consultant)\b/i,
  },
  {
    key: "deliverables",
    label: "Deliverables",
    required: false,
    pattern: /\b(deliverables?|services?|components?|guidelines?|documentation|assets?|system|prototype)\b/i,
  },
  {
    key: "constraints",
    label: "Constraints",
    required: false,
    pattern: /\b(constraints?|accessibility|multivendor|legacy|technical|bilingual|multilingual|compliance|scale)\b/i,
  },
  {
    key: "outcome",
    label: "Outcome",
    required: true,
    pattern: /\b(outcomes?|impact|results?|reduction|increase|adoption|score|launched|published|released)\b/i,
  },
];

const walk = (dir) => {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...walk(path));
    else if (entry.endsWith("Page.tsx") && entry !== "WorkIndexPage.tsx") files.push(path);
  }
  return files;
};

const rows = walk(WORK_PAGES_DIR).map((filePath) => {
  const source = readFileSync(filePath, "utf8");
  const slug = source.match(/getProjectBySlug\("([^"]+)"\)/)?.[1] ?? relative(ROOT, filePath);
  const evidence = checks.map((check) => ({
    ...check,
    present: check.pattern.test(source),
  }));
  const score = evidence.filter((item) => item.present).length;
  const missingRequired = evidence.filter((item) => item.required && !item.present);

  return {
    slug,
    filePath,
    score,
    evidence,
    missingRequired,
  };
});

console.log("# Case Study Evidence Report\n");
console.log("Required fields: problem/brief, role, timeline, outcome.\n");
console.log("| Case study | Score | Missing required | File |");
console.log("| --- | ---: | --- | --- |");

for (const row of rows.sort((a, b) => a.slug.localeCompare(b.slug))) {
  const missing = row.missingRequired.map((item) => item.label).join(", ") || "None";
  console.log(
    `| ${row.slug} | ${row.score}/${checks.length} | ${missing} | ${relative(ROOT, row.filePath)} |`,
  );
}

const failing = rows.filter((row) => row.missingRequired.length > 0);

if (strict && failing.length > 0) {
  console.error(`\nFAIL: ${failing.length} case study page(s) miss required evidence fields.`);
  process.exit(1);
}

if (failing.length > 0) {
  console.log(
    `\nNote: ${failing.length} case study page(s) miss required evidence fields. Re-run with --strict to fail on gaps.`,
  );
}
