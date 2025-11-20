import process from "node:process";

export type LinearPriority = 0 | 1 | 2 | 3;

export interface LinearIssueInput {
  title: string;
  description: string;
  priority: LinearPriority;
  teamId?: string;
  projectId?: string;
  labelNames?: string[];
  assigneeId?: string;
  assigneeEmail?: string;
  stateId?: string;
  stateName?: string;
}

export interface LinearIssueResult {
  id: string;
  identifier: string;
  title: string;
  url: string;
  priority: LinearPriority | null;
}

export class LinearError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LinearError";
  }
}

const LINEAR_ENDPOINT = "https://api.linear.app/graphql";

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

interface IssueCreateResponse {
  issueCreate: {
    success: boolean;
    issue: {
      id: string;
      identifier: string;
      title: string;
      priority: LinearPriority | null;
      url: string;
    } | null;
  };
}

async function requestLinear<T>(
  query: string,
  variables: Record<string, unknown>,
  apiKey: string,
): Promise<T> {
  const response = await fetch(LINEAR_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get("retry-after");
    throw new LinearError(
      `Linear rate limit reached. Retry after ${retryAfter ?? "a short delay"}.`,
    );
  }

  if (!response.ok) {
    const text = await response.text();
    throw new LinearError(
      `Linear request failed with ${response.status}: ${text}`,
    );
  }

  const json = (await response.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    const errorMessage = json.errors.map((e) => e.message).join("; ");
    throw new LinearError(errorMessage);
  }
  if (!json.data) {
    throw new LinearError("Linear response did not include data.");
  }
  return json.data;
}

async function lookupLabelIds(
  labelNames: string[],
  apiKey: string,
): Promise<{ found: Record<string, string>; missing: string[] }> {
  if (!labelNames.length) {
    return { found: {}, missing: [] };
  }

  const query = `
    query IssueLabels($names: [String!]) {
      issueLabels(filter: { name: { in: $names } }) {
        nodes {
          id
          name
        }
      }
    }
  `;

  const data = await requestLinear<{
    issueLabels: { nodes: Array<{ id: string; name: string }> };
  }>(query, { names: labelNames }, apiKey);

  const found: Record<string, string> = {};
  data.issueLabels.nodes.forEach((node) => {
    found[node.name.toLowerCase()] = node.id;
  });

  const missing = labelNames.filter((name) => !found[name.toLowerCase()]);

  return { found, missing };
}

async function lookupAssigneeId(
  assignee: { id?: string; email?: string },
  apiKey: string,
): Promise<string | undefined> {
  if (assignee.id) return assignee.id;
  if (!assignee.email) return undefined;

  const query = `
    query LinearUser($email: String!) {
      users(filter: { email: { eq: $email } }) {
        nodes {
          id
          name
          email
        }
      }
    }
  `;

  const data = await requestLinear<{
    users: { nodes: Array<{ id: string }> };
  }>(query, { email: assignee.email }, apiKey);

  return data.users.nodes[0]?.id;
}

async function lookupStateId(
  state: { id?: string; name?: string },
  teamId: string,
  apiKey: string,
): Promise<string | undefined> {
  if (state.id) return state.id;
  if (!state.name) return undefined;

  const query = `
    query WorkflowStates($teamId: String!) {
      workflowStates(filter: { team: { id: { eq: $teamId } } }) {
        nodes {
          id
          name
          type
        }
      }
    }
  `;

  const data = await requestLinear<{
    workflowStates: {
      nodes: Array<{ id: string; name: string; type: string }>;
    };
  }>(query, { teamId }, apiKey);

  const normalizedName = state.name.toLowerCase();
  const matchingState = data.workflowStates.nodes.find(
    (node) => node.name.toLowerCase() === normalizedName,
  );

  return matchingState?.id;
}

function getEnv(key: string): string | undefined {
  const value = process.env[key];
  if (!value || !value.trim()) {
    return undefined;
  }
  return value.trim();
}

export function validateLinearEnv() {
  const missing: string[] = [];
  if (!getEnv("LINEAR_API_KEY")) missing.push("LINEAR_API_KEY");
  if (!getEnv("LINEAR_TEAM_ID")) missing.push("LINEAR_TEAM_ID");
  if (missing.length) {
    throw new LinearError(
      `Missing Linear credentials: ${missing.join(
        ", ",
      )}. Update your .env.local file.`,
    );
  }
}

export async function createLinearIssue(
  input: LinearIssueInput,
): Promise<LinearIssueResult> {
  const apiKey = getEnv("LINEAR_API_KEY");
  const envTeamId = getEnv("LINEAR_TEAM_ID");
  const envProjectId = getEnv("LINEAR_PROJECT_ID");
  if (!apiKey || !envTeamId) {
    throw new LinearError(
      "LINEAR_API_KEY and LINEAR_TEAM_ID are required environment variables.",
    );
  }

  const teamId = input.teamId ?? envTeamId;
  const projectId = input.projectId ?? envProjectId;

  const uniqueLabelNames = Array.from(
    new Set(
      (input.labelNames ?? []).map((label) => label.trim()).filter(Boolean),
    ),
  );

  const { found: labelMap, missing } = await lookupLabelIds(
    uniqueLabelNames,
    apiKey,
  );
  if (missing.length) {
    console.warn(
      `[linear] labels not found in workspace: ${missing.join(", ")}`,
    );
  }
  const labelIds = uniqueLabelNames
    .map((label) => labelMap[label.toLowerCase()])
    .filter(Boolean);

  const assigneeId = await lookupAssigneeId(
    {
      id: input.assigneeId,
      email: input.assigneeEmail,
    },
    apiKey,
  );

  const stateId = await lookupStateId(
    {
      id: input.stateId,
      name: input.stateName,
    },
    teamId,
    apiKey,
  );

  const mutation = `
    mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          title
          priority
          url
        }
      }
    }
  `;

  const issueInput: Record<string, unknown> = {
    teamId,
    title: input.title,
    description: input.description,
    priority: input.priority,
  };

  if (projectId) issueInput.projectId = projectId;
  if (labelIds.length) issueInput.labelIds = labelIds;
  if (assigneeId) issueInput.assigneeId = assigneeId;
  if (stateId) issueInput.stateId = stateId;

  const data = await requestLinear<IssueCreateResponse>(
    mutation,
    { input: issueInput },
    apiKey,
  );

  if (!data.issueCreate?.success || !data.issueCreate.issue) {
    throw new LinearError("Linear did not return the newly created issue.");
  }

  return data.issueCreate.issue;
}
