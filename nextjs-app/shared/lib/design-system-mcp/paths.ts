import { join } from "node:path";

/** Repo root for manifest reads (Next.js and stdio MCP). */
export function designSystemMcpRoot(): string {
  return process.env.DT_REPO_ROOT?.trim() || process.cwd();
}

export function agentManifestPath(root = designSystemMcpRoot()): string {
  return join(root, "nextjs-app/shared/foundations/dist/agent-manifest.json");
}

export function tokenCatalogPath(root = designSystemMcpRoot()): string {
  return join(root, "nextjs-app/shared/foundations/token-catalog.json");
}

export function publicApiDocPath(root = designSystemMcpRoot()): string {
  return join(root, "docs/PUBLIC_API.md");
}
