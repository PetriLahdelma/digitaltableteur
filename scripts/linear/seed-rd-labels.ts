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

const LABELS = [
  { name: "ai-app", description: "Interesting AI product or app to evaluate." },
  { name: "browser-extension", description: "Browser extension worth exploring." },
  { name: "mcp", description: "Model Context Protocol server/tool to evaluate." },
  { name: "figma-plugin", description: "Figma plugin candidate for adoption." },
  { name: "design-tool", description: "Design tooling for experimentation." },
  { name: "automation", description: "Automation or scripting idea for Labs." },
  { name: "R&D", description: "Primary label for Labs/R&D discovery items." },
  { name: "Experiment", description: "Actively being tested in Labs." },
  { name: "Adoption-candidate", description: "Ready to adopt into core work." },
];

const query = `
  query Labels($names: [String!]) {
    issueLabels(filter: { name: { in: $names } }) {
      nodes { id name }
    }
  }
`;

const mutation = `
  mutation CreateLabel($input: IssueLabelCreateInput!) {
    issueLabelCreate(input: $input) {
      issueLabel { id name }
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

async function main() {
  const existing = await fetchLinear<{ issueLabels: { nodes: Array<{ name: string }> } }>({
    query,
    variables: { names: LABELS.map((l) => l.name) },
  });

  const existingSet = new Set(existing.issueLabels.nodes.map((node) => node.name));
  const toCreate = LABELS.filter((label) => !existingSet.has(label.name));

  for (const label of toCreate) {
    await fetchLinear({
      query: mutation,
      variables: {
        input: {
          name: label.name,
          description: label.description,
          color: "000000",
        },
      },
    });
    console.log(`Created label ${label.name}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
