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
  console.error("Missing LINEAR_API_KEY");
  process.exit(1);
}

const query = `
  query Labels($first: Int!, $after: String) {
    issueLabels(first: $first, after: $after) {
      nodes {
        id
        name
        description
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const mutation = `
  mutation UpdateLabel($id: String!, $input: IssueLabelUpdateInput!) {
    issueLabelUpdate(id: $id, input: $input) {
      issueLabel { id name description }
    }
  }
`;

const generalDescriptions: Record<string, string> = {
  observability: "Telemetry, logging, and monitoring improvements.",
  "ui-app-triage": "Incoming UI/UX work that needs triage.",
  "ui-app-bug": "Confirmed UI bug affecting the application.",
  "ds-triage": "Design system issues queued for triage.",
  "design-system": "Work scoped to the Digitaltableteur design system.",
  ai: "AI/ML powered product or automation work.",
  linear: "Linear integrations, automations, or configuration work.",
  automation: "Automation infrastructure, pipelines, or bots.",
  Bug: "Linear default bug classification label.",
  Feature: "Linear default feature classification label.",
  Improvement: "Linear default improvement classification label.",
};

async function fetchLinear<T>(body: object): Promise<T> {
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
}

async function getAllLabels() {
  const labels: Array<{
    id: string;
    name: string;
    description?: string | null;
  }> = [];
  let after: string | null = null;
  do {
    const data: {
      issueLabels: {
        nodes: Array<{ id: string; name: string; description?: string | null }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    } = await fetchLinear<{
      issueLabels: {
        nodes: Array<{ id: string; name: string; description?: string | null }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>({
      query,
      variables: { first: 250, after },
    });
    labels.push(...data.issueLabels.nodes);
    after = data.issueLabels.pageInfo.hasNextPage
      ? data.issueLabels.pageInfo.endCursor
      : null;
  } while (after);
  return labels;
}

function descriptionForLabel(name: string): string {
  if (generalDescriptions[name]) {
    return generalDescriptions[name];
  }
  if (name.startsWith("comp:")) {
    const componentName = name.replace(/^comp:/, "");
    return `Component label for ${componentName}. Use to track work on ${componentName}.`;
  }
  return `Workspace label for ${name}.`;
}

async function main() {
  const labels = await getAllLabels();
  let updated = 0;
  for (const label of labels) {
    if (label.description && label.description.trim().length > 0) continue;
    const description = descriptionForLabel(label.name);
    await fetchLinear({
      query: mutation,
      variables: { id: label.id, input: { description } },
    });
    updated += 1;
    console.log(`Updated description for ${label.name}`);
  }
  console.log(`Updated ${updated} labels.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
