#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();
const envLocal = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal, override: false });
}

const apiKey = process.env.LINEAR_API_KEY;
if (!apiKey) {
  console.error("LINEAR_API_KEY is missing. Update .env.local before running.");
  process.exit(1);
}

const issueIdentifier = process.argv[2];
if (!issueIdentifier) {
  console.error(
    "Usage: npx tsx scripts/linear/check-issue.ts <issue-identifier>",
  );
  console.error("Example: npx tsx scripts/linear/check-issue.ts DIG-16");
  process.exit(1);
}

const parseIssueIdentifier = (
  value: string,
): { teamKey: string; number: number } | null => {
  const match = /^([A-Za-z]+)-(\d+)$/.exec(value.trim());
  if (!match) return null;
  const [, teamKey, number] = match;
  const parsedNumber = Number(number);
  if (Number.isNaN(parsedNumber)) return null;
  return { teamKey: teamKey.toUpperCase(), number: parsedNumber };
};

const requestLinear = async <T>(body: Record<string, unknown>): Promise<T> => {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey!,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(
      `Linear request failed: ${JSON.stringify(json.errors ?? json, null, 2)}`,
    );
  }
  return json.data as T;
};

async function main() {
  const parsed = parseIssueIdentifier(issueIdentifier);
  if (!parsed) {
    console.error("Invalid issue identifier format. Expected format: TEAM-123");
    process.exit(1);
  }

  const lookupData = await requestLinear<{
    issues: { nodes: Array<{ id: string; identifier: string }> };
  }>({
    query: `
      query IssueIdentifierLookup($teamKey: String!, $number: Float!) {
        issues(
          filter: {
            team: { key: { eq: $teamKey } }
            number: { eq: $number }
          }
          first: 1
        ) {
          nodes {
            id
            identifier
          }
        }
      }
    `,
    variables: { teamKey: parsed.teamKey, number: parsed.number },
  });

  const issueId = lookupData.issues.nodes[0]?.id;
  if (!issueId) {
    console.error(`Issue ${issueIdentifier} not found.`);
    process.exit(1);
  }

  const issueData = await requestLinear<{
    issue: {
      id: string;
      identifier: string;
      title: string;
      url: string;
      assignee: { id: string; name: string; email: string } | null;
      state: { id: string; name: string };
      priority: number;
      labels: { nodes: Array<{ name: string }> };
    };
  }>({
    query: `
      query IssueDetail($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          url
          assignee {
            id
            name
            email
          }
          state {
            id
            name
          }
          priority
          labels {
            nodes {
              name
            }
          }
        }
      }
    `,
    variables: { id: issueId },
  });

  const issue = issueData.issue;
  console.log(`\n📋 Issue: ${issue.identifier}`);
  console.log(`   Title: ${issue.title}`);
  console.log(`   URL: ${issue.url}`);
  console.log(`   State: ${issue.state.name}`);
  console.log(`   Priority: P${issue.priority + 1}`);
  console.log(
    `   Assignee: ${issue.assignee ? `${issue.assignee.name} (${issue.assignee.email})` : "Unassigned"}`,
  );
  console.log(
    `   Labels: ${issue.labels.nodes.map((l) => l.name).join(", ") || "None"}`,
  );
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
