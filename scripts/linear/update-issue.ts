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

type Args = {
  issue?: string;
  comment?: string;
  state?: string;
  addLabels: string[];
  removeLabels: string[];
};

type ParsedIssueIdentifier = {
  teamKey: string;
  number: number;
};

const uniqueLabelNames = (names: string[]): string[] => {
  const map = new Map<string, string>();
  names.forEach((name) => {
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (!map.has(key)) {
      map.set(key, trimmed);
    }
  });
  return Array.from(map.values());
};

const parseArgs = (): Args => {
  const args: Args = {
    addLabels: [],
    removeLabels: [],
  };
  const input = process.argv.slice(2);
  for (let i = 0; i < input.length; i++) {
    const key = input[i];
    const nextValue = input[i + 1];
    const ensureValue = () => {
      if (!nextValue || nextValue.startsWith("-")) {
        console.error(`Flag ${key} requires a value.`);
        process.exit(1);
      }
    };
    if (key === "--issue" || key === "-i") {
      ensureValue();
      args.issue = input[++i];
    } else if (key === "--comment" || key === "-c") {
      ensureValue();
      args.comment = input[++i];
    } else if (key === "--state" || key === "-s") {
      ensureValue();
      args.state = input[++i];
    } else if (key === "--add-label" || key === "-a") {
      ensureValue();
      args.addLabels.push(input[++i]);
    } else if (key === "--remove-label" || key === "-r") {
      ensureValue();
      args.removeLabels.push(input[++i]);
    }
  }
  args.addLabels = uniqueLabelNames(
    args.addLabels
      .join(",")
      .split(","),
  );
  args.removeLabels = uniqueLabelNames(
    args.removeLabels
      .join(",")
      .split(","),
  );
  return args;
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

const ISSUE_QUERY = `
  query IssueDetail($id: String!) {
    issue(id: $id) {
      id
      identifier
      title
      url
      state {
        id
        name
      }
      team {
        id
        name
        states(includeArchived: false) {
          nodes {
            id
            name
          }
        }
      }
    }
  }
`;

const ISSUE_IDENTIFIER_LOOKUP_QUERY = `
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
`;

const COMMENT_MUTATION = `
  mutation AddComment($input: CommentCreateInput!) {
    commentCreate(input: $input) {
      success
    }
  }
`;

const ISSUE_UPDATE_MUTATION = `
  mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
    issueUpdate(id: $id, input: $input) {
      success
    }
  }
`;

const LABEL_LOOKUP_QUERY = `
  query IssueLabels($names: [String!]) {
    issueLabels(filter: { name: { in: $names } }) {
      nodes {
        id
        name
      }
    }
  }
`;

const parseIssueIdentifier = (value: string): ParsedIssueIdentifier | null => {
  const match = /^([A-Za-z]+)-(\d+)$/.exec(value.trim());
  if (!match) return null;
  const [, teamKey, number] = match;
  const parsedNumber = Number(number);
  if (Number.isNaN(parsedNumber)) return null;
  return { teamKey: teamKey.toUpperCase(), number: parsedNumber };
};

async function lookupLabelIds(names: string[]): Promise<{
  map: Record<string, string>;
  missing: string[];
}> {
  const deduped = uniqueLabelNames(names);
  if (!deduped.length) {
    return { map: {}, missing: [] };
  }
  const data = await requestLinear<{
    issueLabels: { nodes: Array<{ id: string; name: string }> };
  }>({
    query: LABEL_LOOKUP_QUERY,
    variables: { names: deduped },
  });
  const map: Record<string, string> = {};
  data.issueLabels.nodes.forEach((node) => {
    map[node.name.toLowerCase()] = node.id;
  });
  const missing = deduped
    .map((name) => name.toLowerCase())
    .filter((name) => !map[name]);
  return { map, missing };
}

async function main() {
  const args = parseArgs();
  if (!args.issue) {
    console.error(
      'Usage: npm run linear:update -- --issue DIG-123 [--comment "..."] [--state "In Progress"] [--add-label labelA,labelB] [--remove-label labelC]',
    );
    process.exit(1);
  }

  let issueId = args.issue;
  const parsedIdentifier = parseIssueIdentifier(args.issue);
  if (parsedIdentifier) {
    const issueLookup = await requestLinear<{
      issues: { nodes: Array<{ id: string; identifier: string }> };
    }>({
      query: ISSUE_IDENTIFIER_LOOKUP_QUERY,
      variables: {
        teamKey: parsedIdentifier.teamKey,
        number: parsedIdentifier.number,
      },
    });
    const firstMatch = issueLookup.issues.nodes[0];
    if (!firstMatch) {
      console.error(
        `Issue ${args.issue} not found in team ${parsedIdentifier.teamKey}.`,
      );
      process.exit(1);
    }
    issueId = firstMatch.id;
  }

  const issueData = await requestLinear<{
    issue: {
      id: string;
      identifier: string;
      title: string;
      url: string;
      state: { id: string; name: string } | null;
      team: {
        id: string;
        name: string;
        states: { nodes: Array<{ id: string; name: string }> };
      };
    } | null;
  }>({
    query: ISSUE_QUERY,
  variables: { id: issueId },
});

  if (!issueData.issue) {
    console.error(`Issue ${args.issue} not found.`);
    process.exit(1);
  }

  const updates: string[] = [];
  const addLabelIds: string[] = [];
  const removeLabelIds: string[] = [];

  if (args.addLabels.length) {
    const { map, missing } = await lookupLabelIds(args.addLabels);
    if (missing.length) {
      console.error(
        `Labels not found in workspace: ${missing.join(
          ", ",
        )}. Check names or create them first.`,
      );
      process.exit(1);
    }
    addLabelIds.push(
      ...args.addLabels.map((label) => map[label.toLowerCase()]).filter(Boolean),
    );
  }

  if (args.removeLabels.length) {
    const { map, missing } = await lookupLabelIds(args.removeLabels);
    if (missing.length) {
      console.error(
        `Labels not found in workspace: ${missing.join(
          ", ",
        )}. Check names before removing.`,
      );
      process.exit(1);
    }
    removeLabelIds.push(
      ...args.removeLabels
        .map((label) => map[label.toLowerCase()])
        .filter(Boolean),
    );
  }

  if (args.state) {
    const stateName = args.state.trim().toLowerCase();
    const states = issueData.issue.team.states.nodes;
    const found = states.find(
      (state) => state.name.trim().toLowerCase() === stateName,
    );
    if (!found) {
      console.error(
        `State "${args.state}" not found for team ${issueData.issue.team.name}. Available states: ${states
          .map((s) => s.name)
          .join(", ")}`,
      );
      process.exit(1);
    }
    await requestLinear({
      query: ISSUE_UPDATE_MUTATION,
      variables: {
        id: issueData.issue.id,
        input: {
          stateId: found.id,
        },
      },
    });
    updates.push(`state → ${found.name}`);
  }

  if (addLabelIds.length || removeLabelIds.length) {
    await requestLinear({
      query: ISSUE_UPDATE_MUTATION,
      variables: {
        id: issueData.issue.id,
        input: {
          addedLabelIds: addLabelIds.length ? addLabelIds : undefined,
          removedLabelIds: removeLabelIds.length ? removeLabelIds : undefined,
        },
      },
    });
    if (addLabelIds.length) {
      updates.push(
        `labels added → ${args.addLabels.join(", ")}`,
      );
    }
    if (removeLabelIds.length) {
      updates.push(
        `labels removed → ${args.removeLabels.join(", ")}`,
      );
    }
  }

  if (args.comment) {
    await requestLinear({
      query: COMMENT_MUTATION,
      variables: {
        input: {
          issueId: issueData.issue.id,
          body: args.comment,
        },
      },
    });
    updates.push("comment added");
  }

  if (!updates.length) {
    console.log("Nothing to update. Provide --state and/or --comment.");
    return;
  }

  console.log(
    `Updated ${issueData.issue.identifier} (${issueData.issue.title}): ${updates.join(
      ", ",
    )}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
