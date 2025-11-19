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

const mutation = `
  mutation CreateTeam($input: TeamCreateInput!) {
    teamCreate(input: $input) {
      team { id name key }
    }
  }
`;

async function main() {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey!,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          name: "R&D",
          key: "LAB",
          description: "Labs/R&D tracking team for experiments, MCPs, and side explorations.",
        },
      },
    }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(
      `Failed to create team: ${JSON.stringify(json.errors ?? json, null, 2)}`,
    );
  }
  console.log(json.data.teamCreate.team);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
