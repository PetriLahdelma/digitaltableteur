#!/usr/bin/env tsx
/**
 * Automated Linear ticket creation and updating with MCP/GitHub integration
 *
 * Workflow:
 * 1. Find latest Linear issue ID and increment by 1
 * 2. Analyze git diff to determine labels and content
 * 3. Check git status to determine initial state (unstaged/staged/pushed)
 * 4. Create ticket with appropriate assignee, labels, and state
 * 5. Link to GitHub PR if pushed
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import dotenv from "dotenv";

import {
  createLinearIssue,
  LinearPriority,
  validateLinearEnv,
} from "../../lib/linear/createIssue";
import { classifyIssueDomain, deriveLabels } from "../../lib/linear/classify";
import { detectComponentLabels } from "../../lib/linear/componentDetection";

dotenv.config();
const envLocal = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal, override: false });
}

const LINEAR_ASSIGNEE_EMAIL = "petri.lahdelma@gmail.com"; // Petri Lahdelma
const LINEAR_TEAM_KEY = "DIG";

interface GitStatus {
  hasUnstagedChanges: boolean;
  hasStagedChanges: boolean;
  currentBranch: string;
  isPushed: boolean;
  remoteBranch?: string;
  prUrl?: string;
  prNumber?: number;
}

interface IssueMetadata {
  title: string;
  description: string;
  labels: string[];
  state: "Todo" | "In Progress" | "Done";
  priority: LinearPriority;
  files: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
}

/**
 * Execute git command and return output
 */
function gitExec(command: string): string {
  try {
    return execSync(`git ${command}`, { encoding: "utf-8" }).trim();
  } catch (error) {
    return "";
  }
}

/**
 * Get current git status
 */
function getGitStatus(): GitStatus {
  const currentBranch = gitExec("rev-parse --abbrev-ref HEAD");
  const unstagedChanges = gitExec("diff --name-only");
  const stagedChanges = gitExec("diff --cached --name-only");

  // Check if current branch is pushed to remote
  const remoteBranch = gitExec(
    `rev-parse --abbrev-ref ${currentBranch}@{upstream}`,
  );
  const isPushed = !!remoteBranch;

  // Try to get PR number from branch name or GitHub CLI
  let prUrl: string | undefined;
  let prNumber: number | undefined;

  try {
    const ghPrOutput = gitExec("!gh pr view --json url,number");
    if (ghPrOutput) {
      const prData = JSON.parse(ghPrOutput);
      prUrl = prData.url;
      prNumber = prData.number;
    }
  } catch {
    // GitHub CLI not available or no PR exists
  }

  return {
    hasUnstagedChanges: !!unstagedChanges,
    hasStagedChanges: !!stagedChanges,
    currentBranch,
    isPushed,
    remoteBranch: remoteBranch || undefined,
    prUrl,
    prNumber,
  };
}

/**
 * Get latest Linear issue number for the team
 */
async function getLatestIssueNumber(): Promise<number> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) throw new Error("LINEAR_API_KEY not found");

  const query = `
    query LatestIssue($teamKey: String!) {
      team(id: $teamKey) {
        issues(first: 1, orderBy: createdAt) {
          nodes {
            number
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({
      query,
      variables: { teamKey: LINEAR_TEAM_KEY },
    }),
  });

  const data = await response.json();
  const issues = data?.data?.team?.issues?.nodes || [];

  if (issues.length === 0) return 0;
  return Math.max(...issues.map((issue: { number: number }) => issue.number));
}

/**
 * Analyze git diff to extract file changes
 */
function getFileChanges(): IssueMetadata["files"] {
  const diffOutput = gitExec("diff --name-status HEAD");
  const stagedOutput = gitExec("diff --cached --name-status");
  const allOutput = `${diffOutput}\n${stagedOutput}`.trim();

  const files = {
    added: [] as string[],
    modified: [] as string[],
    deleted: [] as string[],
  };

  if (!allOutput) return files;

  allOutput.split("\n").forEach((line) => {
    const [status, ...pathParts] = line.split("\t");
    const filePath = pathParts.join("\t");

    if (status.startsWith("A")) {
      files.added.push(filePath);
    } else if (status.startsWith("M")) {
      files.modified.push(filePath);
    } else if (status.startsWith("D")) {
      files.deleted.push(filePath);
    }
  });

  return files;
}

/**
 * Generate issue metadata from git context
 */
async function generateIssueMetadata(
  gitStatus: GitStatus,
  userPrompt?: string,
): Promise<IssueMetadata> {
  const files = getFileChanges();
  const branchName = gitStatus.currentBranch;

  // Extract title from branch name (e.g., DT-135-feat-grid-and-layout -> Grid and Layout)
  let title = branchName
    .replace(/^[A-Z]+-\d+-/, "") // Remove ticket prefix
    .replace(/feat-|fix-|chore-|docs-/g, "") // Remove conventional prefixes
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // If user provided prompt, use it as title
  if (userPrompt) {
    title =
      userPrompt.length > 80 ? userPrompt.substring(0, 77) + "..." : userPrompt;
  }

  // Generate description from files and context
  const description = `# ${title}

${userPrompt || "Automated ticket creation based on current git changes."}

## Changes

### Files Added (${files.added.length})
${files.added.length > 0 ? files.added.map((f) => `- \`${f}\``).join("\n") : "None"}

### Files Modified (${files.modified.length})
${files.modified.length > 0 ? files.modified.map((f) => `- \`${f}\``).join("\n") : "None"}

### Files Deleted (${files.deleted.length})
${files.deleted.length > 0 ? files.deleted.map((f) => `- \`${f}\``).join("\n") : "None"}

## Git Status

- **Branch:** \`${gitStatus.currentBranch}\`
- **Status:** ${gitStatus.isPushed ? "✅ Pushed to remote" : "📝 Local changes only"}
${gitStatus.prUrl ? `- **PR:** ${gitStatus.prUrl}` : ""}

## Next Steps

${gitStatus.isPushed ? "- Review PR and merge to main" : "- Complete implementation and push changes"}
`;

  // Determine state based on git status
  let state: "Todo" | "In Progress" | "Done" = "Todo";
  if (gitStatus.isPushed && gitStatus.prUrl) {
    state = "Done"; // Pushed with PR = Done
  } else if (gitStatus.hasStagedChanges || gitStatus.hasUnstagedChanges) {
    state = "In Progress"; // Has local changes = In Progress
  }

  // Classify and detect labels
  const allFiles = [...files.added, ...files.modified];
  const fileContext = allFiles.join(" ");

  const classification = classifyIssueDomain({
    title,
    description,
    pageOrComponent: fileContext,
    issueType: "Task",
  });

  const detection = await detectComponentLabels(
    `${title} ${description} ${fileContext}`,
    [],
  );

  const { labels } = deriveLabels({
    domain: classification.domain,
    issueType: "Task",
    providedLabels: [],
    componentLabels: detection.labels,
  });

  // Determine priority based on branch name
  let priority: LinearPriority = 2; // P3 default
  if (branchName.includes("hotfix") || branchName.includes("urgent")) {
    priority = 0; // P1
  } else if (branchName.includes("feat") || branchName.includes("feature")) {
    priority = 1; // P2
  }

  return {
    title,
    description,
    labels,
    state,
    priority,
    files,
  };
}

/**
 * Update existing issue with current git status
 */
async function updateIssueStatus(
  issueIdentifier: string,
  gitStatus: GitStatus,
  metadata: IssueMetadata,
): Promise<void> {
  const comment = `Automated Status Update - Git Status: Branch ${gitStatus.currentBranch}, State: ${metadata.state}, Changes: ${metadata.files.added.length} added, ${metadata.files.modified.length} modified${gitStatus.prUrl ? `, PR: ${gitStatus.prUrl}` : ""}`;

  const updateScript = path.join(__dirname, "update-issue.ts");

  // Use spawnSync with proper argument array to avoid shell escaping issues
  const { spawnSync } = require("child_process");
  const result = spawnSync(
    "npx",
    [
      "tsx",
      updateScript,
      "--issue",
      issueIdentifier,
      "--state",
      metadata.state,
      "--comment",
      comment,
    ],
    {
      stdio: "inherit",
      cwd: process.cwd(),
    },
  );

  if (result.error || result.status !== 0) {
    throw new Error(
      `Failed to update issue: ${result.error?.message || "Non-zero exit code"}`,
    );
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const userPrompt = args.find((arg) => !arg.startsWith("--"));
  const autoUpdate = args.includes("--update");
  const issueId = args.find((arg) => arg.startsWith("--issue="))?.split("=")[1];

  try {
    validateLinearEnv();
  } catch (error) {
    console.error(`[linear] ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }

  console.log("→ Analyzing git repository...\n");

  const gitStatus = getGitStatus();
  console.log("📊 Git Status:");
  console.log(`  • Branch: ${gitStatus.currentBranch}`);
  console.log(
    `  • Unstaged changes: ${gitStatus.hasUnstagedChanges ? "Yes" : "No"}`,
  );
  console.log(
    `  • Staged changes: ${gitStatus.hasStagedChanges ? "Yes" : "No"}`,
  );
  console.log(`  • Pushed to remote: ${gitStatus.isPushed ? "Yes" : "No"}`);
  if (gitStatus.prUrl) {
    console.log(`  • PR: ${gitStatus.prUrl}`);
  }

  // If --update flag is provided, update existing issue
  if (autoUpdate && issueId) {
    console.log(`\n→ Updating existing issue ${issueId}...\n`);
    const metadata = await generateIssueMetadata(gitStatus, userPrompt);
    await updateIssueStatus(issueId, gitStatus, metadata);
    console.log(`\n✅ Issue ${issueId} updated successfully`);
    return;
  }

  // Otherwise, create new issue
  console.log("\n→ Generating issue metadata...\n");
  const metadata = await generateIssueMetadata(gitStatus, userPrompt);

  console.log("📝 Issue Metadata:");
  console.log(`  • Title: ${metadata.title}`);
  console.log(`  • State: ${metadata.state}`);
  console.log(`  • Priority: P${metadata.priority + 1}`);
  console.log(`  • Labels: ${metadata.labels.join(", ") || "None"}`);
  console.log(
    `  • Files: ${metadata.files.added.length} added, ${metadata.files.modified.length} modified`,
  );

  const latestNumber = await getLatestIssueNumber();
  const nextNumber = latestNumber + 1;
  const nextIdentifier = `${LINEAR_TEAM_KEY}-${nextNumber}`;

  console.log(`\n→ Creating Linear issue ${nextIdentifier}...\n`);

  try {
    const result = await createLinearIssue({
      title: metadata.title,
      description: metadata.description,
      priority: metadata.priority,
      labelNames: metadata.labels,
      assigneeEmail: LINEAR_ASSIGNEE_EMAIL,
    });

    console.log("✅ Linear issue created successfully:");
    console.log(`  • Identifier: ${result.identifier}`);
    console.log(`  • URL: ${result.url}`);
    console.log(`  • Assignee: ${LINEAR_ASSIGNEE_EMAIL}`);
    console.log(`  • Initial State: ${metadata.state}`);

    // Auto-update state if not Todo
    if (metadata.state !== "Todo") {
      console.log(`\n→ Updating state to "${metadata.state}"...`);
      await updateIssueStatus(result.identifier, gitStatus, metadata);
    }

    console.log("\n💡 Next steps:");
    console.log(`  • View issue: ${result.url}`);
    if (!gitStatus.isPushed) {
      console.log("  • Push changes to remote to update status");
    }
    if (gitStatus.isPushed && !gitStatus.prUrl) {
      console.log("  • Create PR to mark as Done");
    }
  } catch (error) {
    console.error(
      `\n❌ Failed to create issue: ${
        error instanceof Error ? error.message : error
      }`,
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(
    `[linear] fatal error: ${error instanceof Error ? error.message : error}`,
  );
  process.exit(1);
});
