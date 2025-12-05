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
  {
    name: "automation",
    color: "#FF8A65",
    description: "Automation infrastructure and scripting",
  },
  {
    name: "linear",
    color: "#4FC3F7",
    description: "Linear platform integration and tooling",
  },
  {
    name: "ai",
    color: "#BA68C8",
    description: "AI, ML, or LLM-related features",
  },
  {
    name: "design-system",
    color: "#9575CD",
    description: "Design system components and patterns",
  },
  {
    name: "ds-triage",
    color: "#B39DDB",
    description: "Requires design system triage and classification",
  },
  {
    name: "ui-app-bug",
    color: "#E57373",
    description: "User interface bug in the application",
  },
  {
    name: "ui-app-triage",
    color: "#FFB74D",
    description: "UI/UX issue requiring triage and investigation",
  },
  {
    name: "comp:HeroCTA",
    color: "#4DB6AC",
    description: "Hero CTA component work",
  },
  {
    name: "comp:Button",
    color: "#81C784",
    description: "Button component changes",
  },
  {
    name: "comp:ChatWidget",
    color: "#64B5F6",
    description: "Chat widget component work",
  },
  {
    name: "comp:Icon",
    color: "#AED581",
    description: "Icon component or icon system changes",
  },
  {
    name: "observability",
    color: "#90A4AE",
    description: "Monitoring, logging, and observability tooling",
  },
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
  const existing = await fetchJson<{
    issueLabels: { nodes: Array<{ name: string }> };
  }>({
    query,
    variables: { names: LABELS.map((label) => label.name) },
  });
  const existingNames = new Set(
    existing.issueLabels.nodes.map((node) => node.name),
  );
  const toCreate = LABELS.filter((label) => !existingNames.has(label.name));

  console.log(
    `Found ${existingNames.size} existing labels, creating ${toCreate.length}`,
  );

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
    const result = await fetchJson<{
      issueLabelCreate: { issueLabel: { id: string; name: string } };
    }>(payload);
    console.log(`Created label: ${result.issueLabelCreate.issueLabel.name}`);
  }
}

ensureLabels().catch((error) => {
  console.error(error);
  process.exit(1);
});
