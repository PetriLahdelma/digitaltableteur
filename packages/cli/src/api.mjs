import { loadRegistry } from "./data.mjs";
import { DtCliError, ERROR_CODES } from "./errors.mjs";
import { CAPABILITY_MANIFEST } from "./manifest.mjs";

export { DtCliError, ERROR_CODES } from "./errors.mjs";
export { diff, classifyContractDiff } from "./diff.mjs";
export { affected } from "./affected.mjs";

const GET_SECTIONS = ["all", "usage", "props", "examples", "theming"];

function envelope(type, data) {
  return { type, data };
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase();
}

function scoreEntry(entry, query) {
  const q = normalize(query);
  if (!q) return 0;
  const name = normalize(entry.name);
  const keywords = (entry.keywords ?? []).map(normalize);
  if (name === q) return 100;
  if (name.startsWith(q) || keywords.includes(q)) return 90;
  if (name.includes(q)) return 85;
  const words = q.split(/\s+/).filter(Boolean);
  const haystack = normalize(
    [
      name,
      entry.group,
      entry.status,
      entry.dense,
      entry.description,
      keywords.join(" "),
    ].join(" "),
  );
  if (words.every((word) => haystack.includes(word))) return 75;
  return 0;
}

function rankedEntries(registry, query, limit) {
  return Object.values(registry)
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name),
    )
    .slice(0, limit);
}

function suggestionsFor(registry, requested) {
  const query = normalize(requested);
  const contains = Object.values(registry)
    .filter((entry) => normalize(entry.name).includes(query))
    .slice(0, 5)
    .map((entry) => ({ name: entry.name, reason: "partial name match" }));
  if (contains.length > 0) return contains;

  return Object.values(registry)
    .map((entry) => ({
      name: entry.name,
      distance: Math.abs(entry.name.length - requested.length),
    }))
    .sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name))
    .slice(0, 3)
    .map(({ name }) => ({ name, reason: "similar name length" }));
}

async function registryComponents(options) {
  const { docsRegistry } = await loadRegistry(options);
  return docsRegistry.components ?? {};
}

export async function search(query, options = {}) {
  if (!normalize(query)) {
    throw new DtCliError(
      "search requires an intent query.",
      ERROR_CODES.MISSING_ARGUMENT,
    );
  }
  const registry = await registryComponents(options);
  const limit = Math.min(Math.max(Number(options.limit ?? 8), 1), 20);
  const results = rankedEntries(registry, query, limit).map(
    ({ entry, score }) => ({
      score,
      name: entry.name,
      group: entry.group,
      status: entry.status,
      description: entry.dense || entry.description,
      import: entry.importLine,
      keyProps: entry.keyProps ?? [],
      related: (entry.composesWith ?? []).slice(0, 6),
    }),
  );
  return envelope("search", { query, results });
}

export async function component(name, options = {}) {
  if (!normalize(name)) {
    throw new DtCliError(
      "component requires a component name.",
      ERROR_CODES.MISSING_ARGUMENT,
    );
  }
  const registry = await registryComponents(options);
  const entry =
    registry[name] ??
    Object.values(registry).find(
      (candidate) => normalize(candidate.name) === normalize(name),
    );
  if (!entry) {
    throw new DtCliError(
      `Unknown component "${name}".`,
      ERROR_CODES.UNKNOWN_COMPONENT,
      suggestionsFor(registry, name),
    );
  }
  const section = options.section ?? "all";
  if (!GET_SECTIONS.includes(section)) {
    throw new DtCliError(
      `Unknown section "${section}". Valid sections: ${GET_SECTIONS.join(", ")}.`,
      ERROR_CODES.UNKNOWN_SECTION,
    );
  }

  const base = {
    name: entry.name,
    group: entry.group,
    status: entry.status,
    import: entry.importLine,
    description: entry.description,
  };
  const sections = {
    usage: {
      dense: entry.dense,
      keywords: entry.keywords,
      usage: entry.usage,
      composesWith: entry.composesWith,
      prefersOver: entry.prefersOver,
      forbiddenUse: entry.forbiddenUse,
    },
    props: { props: entry.props },
    examples: { examples: entry.examples },
    theming: { tokens: entry.tokens },
  };
  return envelope("component.detail", {
    ...base,
    ...(section === "all"
      ? {
          ...sections.usage,
          ...sections.props,
          ...sections.examples,
          ...sections.theming,
        }
      : sections[section]),
  });
}

export async function example(name, options = {}) {
  const result = await component(name, { ...options, section: "examples" });
  const examples = result.data.examples ?? [];
  const story = normalize(options.story);
  if (!story) {
    return envelope("component.examples", {
      name: result.data.name,
      examples,
    });
  }
  const match = examples.find(
    (candidate) => normalize(candidate.story) === story,
  );
  if (!match) {
    throw new DtCliError(
      `Unknown story "${options.story}" for ${result.data.name}.`,
      ERROR_CODES.UNKNOWN_STORY,
      examples.slice(0, 5).map((candidate) => ({
        name: candidate.story,
        reason: "available story",
      })),
    );
  }
  return envelope("component.examples", {
    name: result.data.name,
    examples: [match],
  });
}

export async function compose(query, options = {}) {
  const searchResult = await search(query, options);
  const seeds = searchResult.data.results;
  const registry = await registryComponents(options);
  const seen = new Set(seeds.map(({ name }) => name));
  const related = [];
  for (const seed of seeds) {
    const entry = registry[seed.name];
    for (const name of entry?.composesWith ?? []) {
      if (seen.has(name) || !registry[name]) continue;
      seen.add(name);
      related.push({
        name,
        reason: `Composes with ${seed.name}`,
        import: registry[name].importLine,
      });
    }
  }
  return envelope("composition.suggestions", {
    query,
    seeds,
    related: related.slice(0, Number(options.limit ?? 5)),
  });
}

export async function manifest() {
  return envelope("manifest", CAPABILITY_MANIFEST);
}

export async function doctor(options = {}) {
  const { directory, docsRegistry, agentManifest } =
    await loadRegistry(options);
  const docsCount = Object.keys(docsRegistry.components ?? {}).length;
  const manifestCount = (agentManifest.components ?? []).length;
  const checks = [
    {
      id: "registry-data",
      status: docsCount > 0 ? "pass" : "fail",
      detail: `${docsCount} documentation entries`,
    },
    {
      id: "manifest-data",
      status: manifestCount > 0 ? "pass" : "fail",
      detail: `${manifestCount} manifest entries`,
    },
    {
      id: "registry-parity",
      status: docsCount === manifestCount ? "pass" : "fail",
      detail: `${docsCount}/${manifestCount} docs-to-manifest entries`,
    },
  ];
  return envelope("doctor", {
    healthy: checks.every(({ status }) => status === "pass"),
    directory,
    checks,
  });
}
