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
        color
        description
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function fetchLabels() {
  const labels: Array<{
    id: string;
    name: string;
    color: string;
    description?: string;
  }> = [];
  let after: string | null = null;
  do {
    const res: Response = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey!,
      },
      body: JSON.stringify({ query, variables: { first: 250, after } }),
    });
    const json: any = await res.json();
    if (!res.ok || json.errors) {
      throw new Error(
        `Failed to fetch labels: ${JSON.stringify(json.errors ?? json, null, 2)}`,
      );
    }
    const payload: any = json.data.issueLabels;
    labels.push(...payload.nodes);
    after = payload.pageInfo.hasNextPage ? payload.pageInfo.endCursor : null;
  } while (after);
  return labels;
}

function normalizeColor(color: string) {
  return color.startsWith("#") ? color : `#${color}`;
}

function buildTable(
  labels: Array<{
    id: string;
    name: string;
    color: string;
    description?: string;
  }>,
) {
  return [
    "| Name | ID | Color | Description |",
    "| --- | --- | --- | --- |",
    ...labels.map(
      (label) =>
        `| ${label.name} | \`${label.id}\` | ${normalizeColor(label.color)} | ${label.description ?? ""} |`,
    ),
  ].join("\n");
}

async function main() {
  const labels = await fetchLabels();
  const general = labels.filter((label) => !label.name.startsWith("comp:"));
  const component = labels.filter((label) => label.name.startsWith("comp:"));

  const docLines = [
    "# Linear Labels",
    "",
    "## General Labels",
    buildTable(general),
    "",
    "## Component Labels",
    buildTable(component),
    "",
    `> Generated at ${new Date().toISOString()} via \`scripts/linear/export-labels.ts\`.`,
  ];

  const targetPath = path.join(process.cwd(), "docs", "LINEAR_LABELS.md");
  await fs.promises.writeFile(targetPath, docLines.join("\n"), "utf8");
  console.log(`Wrote ${labels.length} labels to ${targetPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
