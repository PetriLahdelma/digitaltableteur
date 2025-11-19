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

const COMPONENTS_ROOT = path.join(process.cwd(), "src", "components");

async function listComponents(dir: string): Promise<string[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const names: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (/^[A-Z]/.test(entry.name)) {
        names.push(entry.name);
      }
      const nested = await listComponents(fullPath);
      names.push(...nested);
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      const base = entry.name.replace(/\.tsx$/, "");
      if (/^[A-Z]/.test(base)) {
        names.push(base);
      }
    }
  }

  return names;
}

const labelQuery = `
  query Labels($names: [String!]) {
    issueLabels(filter: { name: { in: $names } }) {
      nodes { id name }
    }
  }
`;

const createMutation = `
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
  if (!fs.existsSync(COMPONENTS_ROOT)) {
    console.error(`Missing components directory at ${COMPONENTS_ROOT}`);
    process.exit(1);
  }

  const rawNames = await listComponents(COMPONENTS_ROOT);
  const componentNames = Array.from(
    new Set(rawNames.filter((name) => !name.includes("."))),
  ).sort();

  const labelNames = componentNames.map((name) => `comp:${name}`);
  const existing = await fetchLinear<{
    issueLabels: { nodes: Array<{ name: string }> };
  }>({
    query: labelQuery,
    variables: { names: labelNames },
  });

  const existingSet = new Set(existing.issueLabels.nodes.map((node) => node.name));
  const toCreate = labelNames.filter((label) => !existingSet.has(label));
  console.log(
    `Found ${labelNames.length - toCreate.length} existing labels, creating ${toCreate.length}`,
  );

  for (const label of toCreate) {
    const color = "000000";
    await fetchLinear<{
      issueLabelCreate: { issueLabel: { id: string; name: string } };
    }>({
      query: createMutation,
      variables: {
        input: {
          name: label,
          color,
        },
      },
    });
    console.log(`Created label ${label}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
