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
  console.error("Missing LINEAR_API_KEY in env");
  process.exit(1);
}

const LABELS: Array<{ name: string; color: string; description?: string }> = [
  { name: "automation", color: "#FF8A65", description: "Automation infrastructure" },
  { name: "linear", color: "#4FC3F7", description: "Linear platform work" },
  { name: "ai", color: "#BA68C8", description: "AI or ML related" },
  { name: "design-system", color: "#9575CD", description: "Design system scope" },
  { name: "ds-triage", color: "#B39DDB", description: "Needs design system triage" },
  { name: "ui-app-bug", color: "#E57373", description: "UI bug in app" },
  { name: "ui-app-triage", color: "#FFB74D", description: "UI/UX requires triage" },
  { name: "comp:HeroCTA", color: "#4DB6AC" },
  { name: "comp:Button", color: "#81C784" },
  { name: "comp:ChatWidget", color: "#64B5F6" },
  { name: "comp:Icon", color: "#AED581" },
  { name: "observability", color: "#90A4AE" },
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

async function fetchJson<T>(body: object): Promise<T> {
  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey!,
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok || json.errors) {
    throw new Error(
      `Linear error: ${JSON.stringify(json.errors ?? json, null, 2)}`,
    );
  }
  return json.data as T;
}

async function ensureLabels() {
  const existing = await fetchJson<{ issueLabels: { nodes: Array<{ name: string }> } }>({
    query,
    variables: { names: LABELS.map((label) => label.name) },
  });
  const existingNames = new Set(existing.issueLabels.nodes.map((node) => node.name));
  const toCreate = LABELS.filter((label) => !existingNames.has(label.name));

  console.log(`Found ${existingNames.size} existing labels, creating ${toCreate.length}`);

  for (const label of toCreate) {
    const payload = {
      query: mutation,
      variables: {
        input: {
          name: label.name,
          color: label.color.replace("#", ""),
          description: label.description,
        },
      },
    };
    const result = await fetchJson<{ issueLabelCreate: { issueLabel: { id: string; name: string } } }>(payload);
    console.log(`Created label: ${result.issueLabelCreate.issueLabel.name}`);
  }
}

ensureLabels().catch((error) => {
  console.error(error);
  process.exit(1);
});
