/** OpenAI Responses API only allows tool names matching ^[a-zA-Z0-9_-]+$. */
export function toOpenAiToolName(name: string): string {
  return name.replace(/\./g, "_");
}

/** Reverse {@link toOpenAiToolName} — studio_getCaseStudies → studio.getCaseStudies */
export function fromOpenAiToolName(name: string): string {
  if (name.includes(".")) return name;
  const match = /^([a-zA-Z0-9]+)_(.+)$/.exec(name);
  if (!match) return name;
  return `${match[1]}.${match[2]}`;
}

export function normalizeDonnyToolName(name: string | undefined): string | undefined {
  if (!name) return name;
  return fromOpenAiToolName(name);
}

/** True when a raw tool name or `tool-*` part type refers to the canonical Donny tool. */
export function matchesDonnyToolName(
  nameOrType: string | undefined,
  expected: string,
): boolean {
  if (!nameOrType) return false;
  return normalizeDonnyToolName(nameOrType) === expected;
}

export function isDonnyToolPart(
  part: { type?: string; toolName?: string },
  expected: string,
): boolean {
  if (matchesDonnyToolName(part.toolName, expected)) return true;
  if (part.type?.startsWith("tool-")) {
    return matchesDonnyToolName(part.type.slice("tool-".length), expected);
  }
  return false;
}

export function adaptToolRecordKeys<T extends Record<string, unknown>>(
  tools: T,
  adaptName: (name: string) => string,
): T {
  const adapted = {} as T;
  for (const [name, definition] of Object.entries(tools)) {
    adapted[adaptName(name) as keyof T] = definition as T[keyof T];
  }
  return adapted;
}
