#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import dotenv from "dotenv";

import {
  createLinearIssue,
  LinearPriority,
  validateLinearEnv,
} from "../../lib/linear/createIssue";
import {
  classifyIssueDomain,
  deriveLabels,
  type IssueDomain,
} from "../../lib/linear/classify";
import { detectComponentLabels } from "../../lib/linear/componentDetection";
import { rewriteIssueDescription } from "../../lib/linear/textImprover";

dotenv.config();

function bootstrapEnv() {
  const envLocal = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal, override: false });
  }
}

bootstrapEnv();

const rl = createInterface({
  input: stdin,
  output: stdout,
});

const ISSUE_TYPES = ["Bug", "Enhancement", "Task", "Research"] as const;
type IssueType = (typeof ISSUE_TYPES)[number];

function countSentences(text: string) {
  return text.split(/(?<=[.!?])\s+/).filter((segment) => segment.trim()).length;
}

async function ask(
  prompt: string,
  validator?: (value: string) => string | undefined,
): Promise<string> {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const answer = (await rl.question(`${prompt.trim()} `)).trim();
    if (!validator) return answer;
    try {
      const normalized = validator(answer);
      if (normalized !== undefined) return normalized;
    } catch (error) {
      console.log((error as Error).message);
    }
  }
}

async function askMultiline(prompt: string): Promise<string> {
  console.log(prompt);
  console.log("(Press ENTER twice to finish input)");
  const lines: string[] = [];
  while (true) {
    const line = await rl.question("> ");
    if (!line.trim() && lines.length) break;
    if (!line.trim() && !lines.length) continue;
    lines.push(line);
  }
  return lines.join("\n").trim();
}

async function confirm(prompt: string): Promise<boolean> {
  const result = await ask(`${prompt} (y/n)`, (value) => {
    if (!value) return "y";
    return value.toLowerCase();
  });
  return result === "y" || result === "yes";
}

function priorityFromInput(value: string): { label: string; code: LinearPriority } {
  const normalized = value.trim().toUpperCase();
  const allowed = ["P1", "P2", "P3", "P4"];
  const priority = allowed.includes(normalized) ? normalized : undefined;
  if (!priority) {
    throw new Error("Priority must be P1, P2, P3, or P4.");
  }
  const mapping: Record<string, LinearPriority> = {
    P1: 0,
    P2: 1,
    P3: 2,
    P4: 3,
  };
  return { label: priority, code: mapping[priority] };
}

function normalizeLabels(input: string): string[] {
  return input
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
}

async function resolveDomain(
  currentDomain: IssueDomain,
  confidence: "high" | "medium" | "low",
): Promise<IssueDomain> {
  if (confidence !== "low") {
    return currentDomain;
  }
  const override = await confirm(
    `Domain confidence is low. Keep classification as "${currentDomain}"?`,
  );
  if (override) return currentDomain;
  return currentDomain === "app" ? "design-system" : "app";
}

async function selectComponents(candidates: string[]): Promise<string[]> {
  if (candidates.length <= 1) {
    return candidates;
  }
  console.log("\nDetected multiple component references:");
  candidates.forEach((component, index) => {
    console.log(`  [${index + 1}] ${component}`);
  });
  const selection = await ask(
    "Enter comma-separated numbers to keep (blank = all):",
  );
  if (!selection.trim()) return candidates;
  const indexes = selection
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((num) => !Number.isNaN(num) && num >= 1 && num <= candidates.length);
  if (!indexes.length) return candidates;
  return indexes.map((index) => candidates[index - 1]);
}

async function main() {
  try {
    validateLinearEnv();
  } catch (error) {
    console.error(`[linear] ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }

  console.log("→ Starting Linear ticket flow (type 'ctrl+c' to abort)\n");

  const issueTypeInput = await ask(
    `Issue type (${ISSUE_TYPES.join("/")})?`,
    (value) => {
      const candidate = ISSUE_TYPES.find(
        (type) => type.toLowerCase() === value.toLowerCase(),
      );
      if (!candidate) {
        throw new Error(`Please choose one of: ${ISSUE_TYPES.join(", ")}`);
      }
      return candidate;
    },
  );

  const title = await ask("Short title (<80 chars)?", (value) => {
    if (value.length < 5) throw new Error("Title must be at least 5 characters.");
    if (value.length > 80) throw new Error("Title must be less than 80 characters.");
    return value;
  });

  const description = await askMultiline(
    "Provide description (minimum 3 sentences).",
  );
  if (countSentences(description) < 3) {
    console.log("Description must contain at least 3 sentences. Please try again.");
    process.exit(1);
  }

  const priorityValue = await ask("Priority (P1-P4)?", (value) => value.toUpperCase());
  const { label: priorityLabel, code: priorityCode } = priorityFromInput(priorityValue);

  const surface = await ask("Page or component (optional):", (value) => value);
  const labelInput = await ask("Labels (comma separated, optional):", (value) => value);
  const labels = normalizeLabels(labelInput);

  const assigneeInput = await ask(
    "Assignee (email or Linear ID, optional):",
    (value) => value,
  );

  const classification = classifyIssueDomain({
    title,
    description,
    pageOrComponent: surface,
    issueType: issueTypeInput,
  });
  const domain = await resolveDomain(classification.domain, classification.confidence);

  const detection = await detectComponentLabels(
    [title, description, surface].filter(Boolean).join(" "),
    surface ? [surface] : [],
  );
  const selectedComponents = await selectComponents(detection.components);
  const componentLabels = detection.labels.filter((label, index) =>
    selectedComponents.includes(detection.components[index]),
  );

  const { labels: mergedLabels, autoApplied } = deriveLabels({
    domain,
    issueType: issueTypeInput,
    providedLabels: labels,
    componentLabels,
  });

  const rewrite = rewriteIssueDescription({
    title,
    issueType: issueTypeInput,
    priority: priorityLabel,
    description,
    pageOrComponent: surface,
    labels: mergedLabels,
    rawInput: description,
  });

  console.log("\nSummary:");
  console.log(`• Title: ${title}`);
  console.log(`• Type: ${issueTypeInput}`);
  console.log(`• Priority: ${priorityLabel}`);
  console.log(`• Domain: ${domain} (${classification.confidence} confidence)`);
  if (surface) console.log(`• Surface: ${surface}`);
  if (selectedComponents.length) {
    console.log(`• Components: ${selectedComponents.join(", ")}`);
  }
  if (mergedLabels.length) {
    console.log(`• Labels: ${mergedLabels.join(", ")}`);
  }
  if (autoApplied.length) {
    console.log(`• Auto labels added: ${autoApplied.join(", ")}`);
  }

  const confirmation = await confirm(
    `Confirm issue creation with: title="${title}" priority="${priorityLabel}" labels="${mergedLabels.join(", ")}"?`,
  );
  if (!confirmation) {
    console.log("Aborted.");
    process.exit(0);
  }

  const assignee =
    assigneeInput && assigneeInput.includes("@")
      ? { assigneeEmail: assigneeInput }
      : assigneeInput
        ? { assigneeId: assigneeInput }
        : {};

  try {
    const result = await createLinearIssue({
      title,
      description: rewrite.finalBody,
      priority: priorityCode,
      labelNames: mergedLabels,
      ...assignee,
    });
    console.log("\n✅ Linear issue created:");
    console.log(`• Identifier: ${result.identifier}`);
    console.log(`• URL: ${result.url}`);
  } catch (error) {
    console.error(
      `\n❌ Failed to create issue: ${
        error instanceof Error ? error.message : error
      }`,
    );
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(`[linear] fatal error: ${error instanceof Error ? error.message : error}`);
  rl.close();
  process.exit(1);
});
