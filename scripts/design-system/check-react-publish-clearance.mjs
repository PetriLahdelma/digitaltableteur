#!/usr/bin/env node
/**
 * Fast, non-browser clearance check for the GitHub OIDC publish workflow.
 *
 * Local machines run the expensive React publish preflight, including browser
 * and i18n review packets. The GitHub Trusted Publisher workflow is only the
 * tokenless publish transport, so it verifies the recorded human clearance
 * state before allowing `npm publish`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const STATE_PATH = join(ROOT, "scripts/design-system/astryx-roadmap.state.json");
const OUT_DIR = join(ROOT, ".omx/state/design-system/react-publish-clearance");
const OUT_JSON = join(OUT_DIR, "latest.json");
const OUT_MD = join(OUT_DIR, "handoff.md");
const I18N_REVIEW_REPORT = join(
  ROOT,
  ".omx/state/design-system/i18n-navigation-review/latest/report.json",
);
const I18N_REVIEW_MD = join(
  ROOT,
  ".omx/state/design-system/i18n-navigation-review/latest/review.md",
);
const SITE_DOGFOOD_REPORT = join(
  ROOT,
  ".omx/state/design-system/site-package-dogfood/latest.json",
);
const REACT_REVIEW_MD = join(
  ROOT,
  ".omx/state/design-system/react-publish-review/latest.md",
);
const REACT_REVIEW_HTML = join(
  ROOT,
  ".omx/state/design-system/react-publish-review/latest.html",
);
const TRUSTED_PUBLISHER_HANDOFF = join(
  ROOT,
  ".omx/state/design-system/trusted-publisher/handoff.md",
);
const REACT_PREFLIGHT_REPORT = join(
  ROOT,
  ".omx/state/design-system/react-publish-preflight/latest.json",
);
const REPORT = process.argv.includes("--report");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readOptionalJson(path) {
  if (!existsSync(path)) return null;
  return readJson(path);
}

function relativePath(path) {
  return relative(ROOT, path);
}

function taskStatusLine(id, task) {
  const status = task?.status ?? "missing";
  const approved = task?.approval?.clearedBy && task?.approval?.on ? "approved" : "unapproved";
  return `${id}: ${status} (${approved})`;
}

function isApprovedDone(task) {
  return task?.status === "done" && task?.approval?.clearedBy && task?.approval?.on;
}

function approvalSummary(task) {
  if (!task) return "missing";
  const approval = task.approval
    ? `${task.approval.clearedBy ?? "unknown"} on ${task.approval.on ?? "unknown"}`
    : "no approval";
  return `${task.status ?? "missing"}; ${approval}`;
}

function checkbox(ok) {
  return ok ? "[x]" : "[ ]";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function collectReviewEvidence(errors, warnings) {
  const i18nReport = readOptionalJson(I18N_REVIEW_REPORT);
  const dogfoodReport = readOptionalJson(SITE_DOGFOOD_REPORT);

  const i18nRows = Array.isArray(i18nReport?.rows) ? i18nReport.rows : [];
  const i18nLanguages = unique(i18nRows.map((row) => row.language));
  const i18nViewports = unique(i18nRows.map((row) => row.viewport));
  const i18nScreenshotRows = i18nRows.filter((row) => row.screenshot);
  const missingScreenshots = i18nScreenshotRows.filter(
    (row) => !existsSync(join(ROOT, row.screenshot)),
  );
  if (!i18nReport) {
    warnings.push(`i18n/navigation review evidence is not present at ${relativePath(I18N_REVIEW_REPORT)}.`);
  } else {
    if ((i18nReport.summary?.failed ?? 0) !== 0) {
      errors.push(
        `latest i18n/navigation review evidence has ${i18nReport.summary.failed} failed checks.`,
      );
    }
    for (const language of ["en", "fi", "sv"]) {
      if (!i18nLanguages.includes(language)) {
        errors.push(`latest i18n/navigation review evidence is missing ${language}.`);
      }
    }
    for (const viewport of ["desktop", "mobile"]) {
      if (!i18nViewports.includes(viewport)) {
        errors.push(`latest i18n/navigation review evidence is missing ${viewport}.`);
      }
    }
    if (missingScreenshots.length) {
      errors.push(
        `latest i18n/navigation review evidence references ${missingScreenshots.length} missing screenshots.`,
      );
    }
  }

  const dogfoodCategories = Array.isArray(dogfoodReport?.summary?.categories)
    ? dogfoodReport.summary.categories
    : [];
  const dogfoodLanguages = Array.isArray(dogfoodReport?.summary?.languages)
    ? dogfoodReport.summary.languages
    : [];
  if (!dogfoodReport) {
    warnings.push(`package dogfood evidence is not present at ${relativePath(SITE_DOGFOOD_REPORT)}.`);
  } else {
    const dogfoodErrors = Array.isArray(dogfoodReport.errors)
      ? dogfoodReport.errors.length
      : 0;
    if (dogfoodReport.status !== "passed" || dogfoodErrors !== 0) {
      errors.push(
        `latest package dogfood evidence is ${dogfoodReport.status ?? "unknown"} with ${dogfoodErrors} errors.`,
      );
    }
    for (const language of ["en", "fi", "sv"]) {
      if (!dogfoodLanguages.includes(language)) {
        errors.push(`latest package dogfood evidence is missing ${language}.`);
      }
    }
    for (const category of [
      "content-language-notice",
      "i18n",
      "media",
      "navigation",
      "production-consumer",
    ]) {
      if (!dogfoodCategories.includes(category)) {
        errors.push(`latest package dogfood evidence is missing ${category}.`);
      }
    }
  }

  return {
    i18nNavigationReview: {
      present: Boolean(i18nReport),
      reportPath: relativePath(I18N_REVIEW_REPORT),
      reviewPath: relativePath(I18N_REVIEW_MD),
      generatedAt: i18nReport?.generatedAt ?? null,
      passed: i18nReport?.summary?.passed ?? null,
      failed: i18nReport?.summary?.failed ?? null,
      total: i18nReport?.summary?.total ?? null,
      languages: i18nLanguages,
      viewports: i18nViewports,
      screenshotCount: i18nScreenshotRows.length,
      missingScreenshotCount: missingScreenshots.length,
    },
    sitePackageDogfood: {
      present: Boolean(dogfoodReport),
      reportPath: relativePath(SITE_DOGFOOD_REPORT),
      generatedAt: dogfoodReport?.generatedAt ?? null,
      status: dogfoodReport?.status ?? null,
      passed: dogfoodReport?.summary?.passed ?? null,
      failed: dogfoodReport?.summary?.failed ?? null,
      total: dogfoodReport?.summary?.total ?? null,
      languages: dogfoodLanguages,
      categories: dogfoodCategories,
    },
    reviewArtifacts: {
      reactPublishReviewMarkdown: {
        path: relativePath(REACT_REVIEW_MD),
        present: existsSync(REACT_REVIEW_MD),
      },
      reactPublishReviewContactSheet: {
        path: relativePath(REACT_REVIEW_HTML),
        present: existsSync(REACT_REVIEW_HTML),
      },
      trustedPublisherHandoff: {
        path: relativePath(TRUSTED_PUBLISHER_HANDOFF),
        present: existsSync(TRUSTED_PUBLISHER_HANDOFF),
      },
      reactPublishPreflightReport: {
        path: relativePath(REACT_PREFLIGHT_REPORT),
        present: existsSync(REACT_PREFLIGHT_REPORT),
      },
    },
  };
}

function artifactLine(artifact) {
  return `- ${artifact.present ? "[x]" : "[ ]"} \`${artifact.path}\``;
}

function writeHandoff(report) {
  const tasks = report.tasks;
  const evidence = report.evidence;
  const reactPublishNote = tasks["5.1"]?.approval?.note ?? "";
  const reactPublishApproved =
    Boolean(tasks["5.1"]?.approval?.clearedBy && tasks["5.1"]?.approval?.on) &&
    /@digitaltableteur\/react/.test(reactPublishNote) &&
    !/react remains unpublished|token-package registry smoke/i.test(reactPublishNote);

  const markdown = `# React publish clearance handoff

Generated: ${report.generatedAt}
Status: ${report.status}

This file is generated by \`npm run check:react-publish-clearance\`. It does not
approve, publish, or mutate roadmap state. Use it as the human checkpoint
checklist before \`@digitaltableteur/react\` publication.

## Required approvals

- ${checkbox(isApprovedDone(tasks["1.5"]))} 1.5 i18n multi-locale/browser review: ${approvalSummary(tasks["1.5"])}
- ${checkbox(isApprovedDone(tasks["1.6"]))} 1.6 navigation behavior review: ${approvalSummary(tasks["1.6"])}
- ${checkbox(reactPublishApproved)} 5.1 explicit \`@digitaltableteur/react\` publish clearance: ${approvalSummary(tasks["5.1"])}

## Evidence snapshot

This snapshot is advisory in the GitHub OIDC workflow because generated
\`.omx/state\` evidence is local-machine output, not a repository input. If a
local evidence file is present and failing, this guard blocks clearance. Missing
local evidence is listed as a warning; the strict local publish-ready command
reruns the expensive browser and package gates before React can publish.

- i18n/navigation review: ${evidence.i18nNavigationReview.present ? `${evidence.i18nNavigationReview.passed}/${evidence.i18nNavigationReview.total} passed, ${evidence.i18nNavigationReview.failed} failed` : "not present"}; generated ${evidence.i18nNavigationReview.generatedAt ?? "unknown"}; languages ${(evidence.i18nNavigationReview.languages ?? []).join(", ") || "none"}; viewports ${(evidence.i18nNavigationReview.viewports ?? []).join(", ") || "none"}; screenshots ${evidence.i18nNavigationReview.screenshotCount}
- Package dogfood: ${evidence.sitePackageDogfood.present ? `${evidence.sitePackageDogfood.passed}/${evidence.sitePackageDogfood.total} passed, ${evidence.sitePackageDogfood.failed} failed` : "not present"}; status ${evidence.sitePackageDogfood.status ?? "unknown"}; generated ${evidence.sitePackageDogfood.generatedAt ?? "unknown"}; categories ${(evidence.sitePackageDogfood.categories ?? []).join(", ") || "none"}

### Review artifact presence

${Object.values(evidence.reviewArtifacts).map(artifactLine).join("\n")}

## Evidence to review before clearing

- React publish review packet: \`.omx/state/design-system/react-publish-review/latest.md\`
- React publish review contact sheet: \`.omx/state/design-system/react-publish-review/latest.html\`
- i18n/navigation review packet: \`.omx/state/design-system/i18n-navigation-review/latest/review.md\`
- Package dogfood browser report: \`.omx/state/design-system/site-package-dogfood/latest.json\`
- Trusted Publisher handoff: \`.omx/state/design-system/trusted-publisher/handoff.md\`
- React publish preflight report: \`.omx/state/design-system/react-publish-preflight/latest.json\`

## Current blocking items

${report.errors.length ? report.errors.map((error) => `- ${error}`).join("\n") : "- none"}

## Evidence warnings

${report.evidenceWarnings.length ? report.evidenceWarnings.map((warning) => `- ${warning}`).join("\n") : "- none"}

## Roadmap approval record template

Record approvals only after the evidence above has been reviewed. The \`5.1\`
note must be explicit: it must name \`@digitaltableteur/react\` and must not reuse
the earlier token-package smoke-test wording.

~~~json
"1.5": {
  "status": "done",
  "approval": {
    "clearedBy": "<name>",
    "on": "YYYY-MM-DD",
    "note": "Approved i18n multi-locale/browser review for @digitaltableteur/react publish."
  }
},
"1.6": {
  "status": "done",
  "approval": {
    "clearedBy": "<name>",
    "on": "YYYY-MM-DD",
    "note": "Approved package navigation behavior review for @digitaltableteur/react publish."
  }
},
"5.1": {
  "status": "done",
  "approval": {
    "clearedBy": "<name>",
    "on": "YYYY-MM-DD",
    "note": "Approved publishing @digitaltableteur/react to the private npm registry."
  }
}
~~~

## Final command order after approvals are recorded

~~~bash
npm run check:react-publish-clearance
npm run check:react-publish-ready
~~~

Only run the GitHub Actions \`DS npm Publish\` workflow with \`package: react\`
and \`dry_run: false\` after the strict local publish-ready command passes and
the Trusted Publisher workflow is committed and pushed. After a real React
publish, verify the registry install smoke:

~~~bash
npm run check:react-registry-install
~~~
`;

  writeFileSync(OUT_MD, markdown);
}

const state = readJson(STATE_PATH);
const tasks = state.tasks ?? {};
const errors = [];
const evidenceWarnings = [];
const evidence = collectReviewEvidence(errors, evidenceWarnings);

for (const id of ["1.5", "1.6"]) {
  if (!isApprovedDone(tasks[id])) {
    errors.push(
      `checkpoint ${id} is not cleared for React publish (${taskStatusLine(id, tasks[id])})`,
    );
  }
}

const publishTask = tasks["5.1"];
const publishNote = publishTask?.approval?.note ?? "";
if (
  !publishTask?.approval?.clearedBy ||
  !publishTask?.approval?.on ||
  !/@digitaltableteur\/react/.test(publishNote) ||
  /react remains unpublished|token-package registry smoke/i.test(publishNote)
) {
  errors.push(
    `checkpoint 5.1 does not record explicit @digitaltableteur/react publish clearance (${taskStatusLine("5.1", publishTask)})`,
  );
}

mkdirSync(OUT_DIR, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  status: errors.length ? "blocked" : "cleared",
  handoffPath: relativePath(OUT_MD),
  evidence,
  evidenceWarnings,
  tasks: {
    "1.5": tasks["1.5"] ?? null,
    "1.6": tasks["1.6"] ?? null,
    "5.1": tasks["5.1"] ?? null,
  },
  errors,
};
writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
writeHandoff(report);

if (REPORT) {
  console.log(JSON.stringify(report, null, 2));
}

if (errors.length) {
  console.error("React publish clearance check failed:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error(`Report: ${relativePath(OUT_JSON)}`);
  console.error(`Handoff: ${relativePath(OUT_MD)}`);
  process.exit(1);
}

console.log("✓ React publish clearance verified in roadmap state.");
console.log(`  Report: ${relativePath(OUT_JSON)}`);
console.log(`  Handoff: ${relativePath(OUT_MD)}`);
