import path from "node:path";
import { readdir } from "node:fs/promises";

const COMPONENTS_ROOT = path.join(process.cwd(), "src", "components");
let cachedComponentNames: string[] | null = null;

async function readComponentDirectory(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const names: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (/^[A-Z][A-Za-z0-9-]+$/.test(entry.name)) {
        names.push(entry.name);
      }
      const nested = await readComponentDirectory(
        path.join(dir, entry.name),
      );
      names.push(...nested);
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      const base = entry.name.replace(/\.tsx$/, "");
      if (/^[A-Z][A-Za-z0-9-]+$/.test(base)) {
        names.push(base);
      }
    }
  }

  return names;
}

async function getComponentNames(): Promise<string[]> {
  if (cachedComponentNames) {
    return cachedComponentNames;
  }
  try {
    const results = await readComponentDirectory(COMPONENTS_ROOT);
    cachedComponentNames = Array.from(new Set(results));
    return cachedComponentNames;
  } catch {
    cachedComponentNames = [];
    return cachedComponentNames;
  }
}

function normalizeTokens(text: string): string[] {
  return text
    .split(/[^A-Za-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => token.toLowerCase());
}

export interface ComponentDetectionResult {
  components: string[];
  labels: string[];
}

function matchesComponent(
  componentName: string,
  tokens: Set<string>,
): boolean {
  const lower = componentName.toLowerCase();
  if (tokens.has(lower)) return true;
  const kebab = lower.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  if (tokens.has(kebab)) return true;
  if (tokens.has(`${lower}component`)) return true;
  return false;
}

export async function detectComponentLabels(
  text: string,
  explicitComponents: string[] = [],
): Promise<ComponentDetectionResult> {
  const names = await getComponentNames();
  const tokens = new Set(normalizeTokens(text));
  const detected = new Set<string>();

  names.forEach((component) => {
    if (matchesComponent(component, tokens)) {
      detected.add(component);
    }
  });

  explicitComponents.forEach((component) => {
    const trimmed = component.trim();
    if (!trimmed) return;
    const match = names.find(
      (name) => name.toLowerCase() === trimmed.toLowerCase(),
    );
    detected.add(match ?? trimmed);
  });

  const components = Array.from(detected);
  return {
    components,
    labels: components.map((component) => `comp:${component}`),
  };
}
