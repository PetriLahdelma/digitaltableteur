import { loadRegistry, loadUsage } from "./data.mjs";
import { DtCliError, ERROR_CODES } from "./errors.mjs";

function canonicalName(registry, name) {
  const needle = String(name ?? "").toLocaleLowerCase();
  return Object.keys(registry).find(
    (candidate) => candidate.toLocaleLowerCase() === needle,
  );
}

/**
 * Impact analysis for a component change: who imports it directly, which
 * design-system components compose it (and would carry a change onward), and
 * which production pages the import graph says are reached.
 */
export async function affected(names, options = {}) {
  if (!names || names.length === 0) {
    throw new DtCliError(
      "Provide at least one component name, e.g. `dt affected DataTable`.",
      ERROR_CODES.MISSING_ARGUMENT,
    );
  }
  const { docsRegistry } = await loadRegistry(options);
  const registry = docsRegistry.components ?? docsRegistry;
  const usage = await loadUsage(options).catch(() => null);

  const targets = [];
  for (const raw of names) {
    const name = canonicalName(registry, raw);
    if (!name) {
      throw new DtCliError(
        `Unknown component "${raw}".`,
        ERROR_CODES.UNKNOWN_COMPONENT,
        Object.keys(registry)
          .filter((candidate) =>
            candidate
              .toLocaleLowerCase()
              .includes(String(raw).toLocaleLowerCase()),
          )
          .slice(0, 5),
      );
    }
    targets.push(name);
  }

  // Reverse composition edges: components whose contracts compose a target.
  const dependentsOf = (target) =>
    Object.values(registry)
      .filter((entry) =>
        (entry.composesWith ?? []).some(
          (related) => String(related) === target,
        ),
      )
      .map((entry) => entry.name)
      .sort();

  const allFiles = new Set();
  const allProdPages = new Set();
  const perTarget = targets.map((target) => {
    const dependents = dependentsOf(target);
    const row = usage?.get(target);
    const dependentRows = dependents
      .map((dependent) => usage?.get(dependent))
      .filter(Boolean);
    const directImporters = row?.directImporters ?? [];
    const prodPages = [
      ...(row?.prodPages ?? []),
      ...dependentRows.flatMap((dependent) => dependent.prodPages ?? []),
    ];
    for (const file of directImporters) allFiles.add(file);
    for (const page of prodPages) allProdPages.add(page);
    return {
      name: target,
      status: registry[target]?.status ?? null,
      exportedFromPackage: row?.exported ?? null,
      directImporters,
      composedBy: dependents,
      prodPages: [...new Set(prodPages)].sort(),
    };
  });

  return {
    type: "affected.report",
    data: {
      targets: perTarget,
      files: usage ? [...allFiles].sort() : null,
      prodPages: usage ? [...allProdPages].sort() : null,
      ...(usage
        ? {}
        : {
            note: "component-usage.json unavailable; run npm run report:component-usage inside the repository for file-level impact.",
          }),
    },
  };
}
