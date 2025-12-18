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
  query ComponentLabels($first: Int!, $after: String) {
    issueLabels(
      first: $first
      after: $after
      filter: { name: { startsWith: "comp:" } }
    ) {
      nodes {
        id
        name
        color
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const mutation = `
  mutation UpdateLabel($id: String!, $color: String!) {
    issueLabelUpdate(
      id: $id
      input: { color: $color }
    ) {
      issueLabel {
        id
        name
        color
      }
    }
  }
`;

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

async function getComponentLabels() {
  const labels: Array<{ id: string; name: string; color: string }> = [];
  let after: string | null = null;
  do {
    const data: {
      issueLabels: {
        nodes: Array<{ id: string; name: string; color: string }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    } = await fetchLinear<{
      issueLabels: {
        nodes: Array<{ id: string; name: string; color: string }>;
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

async function main() {
  const labels = await getComponentLabels();
  const targetColor = "000000";
  let updated = 0;
  for (const label of labels) {
    if (label.color?.toLowerCase() === targetColor) continue;
    await fetchLinear({
      query: mutation,
      variables: { id: label.id, color: targetColor },
    });
    updated += 1;
    console.log(`Updated ${label.name} -> #${targetColor}`);
  }
  console.log(`Normalized ${updated} labels to #${targetColor}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
