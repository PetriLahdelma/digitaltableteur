import { existsSync, readFileSync } from "node:fs";

import {
  agentManifestPath,
  publicApiDocPath,
  tokenCatalogPath,
} from "./paths";
import type { AgentManifest } from "./types";

const BUILD_TOKENS_HINT = "Run `npm run build:tokens` from the repo root.";

export function loadAgentManifest(root?: string): AgentManifest | null {
  const path = agentManifestPath(root);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as AgentManifest;
}

export function loadTokenCatalog(root?: string): Record<string, unknown> | null {
  const path = tokenCatalogPath(root);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

export function loadPublicApiDoc(root?: string): string | null {
  const path = publicApiDocPath(root);
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8");
}

export function manifestMissingMessage(): string {
  return `agent-manifest.json not found. ${BUILD_TOKENS_HINT}`;
}
