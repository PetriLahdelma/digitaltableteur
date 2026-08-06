/**
 * Pure helpers for per-component bundle-cost evidence (Astryx-gap Phase 4).
 *
 * The measurement model is two honest numbers per exported component of
 * @digitaltableteur/react, both minified + gzipped:
 *
 * - self: only the package's own code. Every bare import (peer AND runtime
 *   dependency) is externalized. This is the number the design system is
 *   accountable for.
 * - withDeps: the marginal cost to a consumer app. Peer dependencies are
 *   externalized (the consumer already ships React etc. by contract), runtime
 *   dependencies are bundled in (they arrive with the package install).
 *
 * Shared chunks are counted in full for every component that imports them, so
 * per-component numbers deliberately over-state the cost of importing several
 * components together; entry totals give the amortized number.
 */

/** Entry stub that treeshakes everything except one named export. */
export function componentEntrySource(entry, exportName) {
  return `export { ${exportName} } from "./dist/${entry}.js";\n`;
}

/** Entry stub for a whole subpath entry (amortized group cost). */
export function entryTotalSource(entry) {
  return `export * from "./dist/${entry}.js";\n`;
}

/**
 * Externalization lists derived from the package manifest, so the measurement
 * can never drift from what the package actually declares.
 *
 * mode "self": peers + dependencies external.
 * mode "withDeps": peers external, dependencies bundled.
 */
export function externalsFor(packageJson, mode) {
  const peers = Object.keys(packageJson.peerDependencies ?? {});
  const deps = Object.keys(packageJson.dependencies ?? {});
  const names = mode === "self" ? [...peers, ...deps] : peers;
  // react/jsx-runtime, react-dom/client, @phosphor-icons/react/ssr, … —
  // subpath imports must be externalized alongside the bare specifier.
  return names.flatMap((name) => [name, `${name}/*`]).sort();
}

/**
 * Assemble the report substance (everything except the runtime stamp) from
 * per-component and per-entry measurements. Keys are sorted so reruns are
 * byte-stable when the numbers have not changed.
 */
export function assembleBundleEvidence({
  packageName,
  packageVersion,
  toolchain,
  entries,
}) {
  const sortedEntries = {};
  let totals = { js: zeroJs(), css: { rawBytes: 0, gzipBytes: 0 } };
  for (const entryName of Object.keys(entries).sort()) {
    const entry = entries[entryName];
    const components = {};
    for (const componentName of Object.keys(entry.components).sort()) {
      components[componentName] = entry.components[componentName];
    }
    sortedEntries[entryName] = { js: entry.js, css: entry.css, components };
    totals = {
      js: {
        self: addSizes(totals.js.self, entry.js.self),
        withDeps: addSizes(totals.js.withDeps, entry.js.withDeps),
      },
      css: {
        rawBytes: totals.css.rawBytes + (entry.css?.rawBytes ?? 0),
        gzipBytes: totals.css.gzipBytes + (entry.css?.gzipBytes ?? 0),
      },
    };
  }
  return {
    package: { name: packageName, version: packageVersion },
    toolchain,
    methodology: {
      self: "component bundled from the built dist with ALL bare imports (peer and runtime dependencies) externalized; minified; gzipped (node:zlib default level). The package's own contribution.",
      withDeps:
        "component bundled from the built dist with only declared peerDependencies externalized; runtime dependencies are bundled in; minified; gzipped. The marginal cost to a consumer app that already satisfies the peer contract.",
      sharedChunks:
        "shared chunks are counted in full for every component that imports them, so per-component numbers over-state the cost of importing several components together. Entry js totals are the amortized group cost.",
      css: "per-entry stylesheet dist/<entry>.css measured as shipped (raw and gzipped); JS numbers never include CSS.",
    },
    entries: sortedEntries,
    totals,
  };
}

function zeroJs() {
  return {
    self: { minBytes: 0, gzipBytes: 0 },
    withDeps: { minBytes: 0, gzipBytes: 0 },
  };
}

function addSizes(a, b) {
  return {
    minBytes: a.minBytes + (b?.minBytes ?? 0),
    gzipBytes: a.gzipBytes + (b?.gzipBytes ?? 0),
  };
}
