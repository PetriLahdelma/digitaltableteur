import { expect, test } from "vitest";

import {
  assembleBundleEvidence,
  componentEntrySource,
  entryTotalSource,
  externalsFor,
} from "./bundle-evidence-lib.mjs";

const packageJson = {
  peerDependencies: {
    react: ">=19.0.0",
    "react-dom": ">=19.0.0",
    "framer-motion": ">=12.0.0",
  },
  dependencies: {
    clsx: "^2.1.1",
    "@phosphor-icons/react": "^2.1.10",
  },
};

test("componentEntrySource re-exports exactly one named export from the entry dist", () => {
  expect(componentEntrySource("actions", "Button")).toBe(
    'export { Button } from "./dist/actions.js";\n',
  );
});

test("entryTotalSource re-exports the whole entry", () => {
  expect(entryTotalSource("layout")).toBe(
    'export * from "./dist/layout.js";\n',
  );
});

test("self mode externalizes peers AND runtime dependencies with subpaths", () => {
  const externals = externalsFor(packageJson, "self");
  expect(externals).toContain("react");
  expect(externals).toContain("react/*");
  expect(externals).toContain("clsx");
  expect(externals).toContain("@phosphor-icons/react/*");
  expect(externals).toContain("framer-motion");
});

test("withDeps mode externalizes only peers so runtime deps get bundled", () => {
  const externals = externalsFor(packageJson, "withDeps");
  expect(externals).toContain("react");
  expect(externals).toContain("framer-motion/*");
  expect(externals).not.toContain("clsx");
  expect(externals).not.toContain("@phosphor-icons/react");
});

test("externals lists are sorted for deterministic reruns", () => {
  const externals = externalsFor(packageJson, "self");
  expect(externals).toEqual([...externals].sort());
});

const size = (min, gzip) => ({ minBytes: min, gzipBytes: gzip });

test("assembleBundleEvidence sorts entries/components and sums totals", () => {
  const report = assembleBundleEvidence({
    packageName: "@digitaltableteur/react",
    packageVersion: "0.1.22",
    toolchain: { esbuild: "0.28.1", gzip: "node:zlib gzipSync (default level)" },
    entries: {
      layout: {
        js: { self: size(10, 5), withDeps: size(20, 9) },
        css: { rawBytes: 100, gzipBytes: 40 },
        components: {
          Grid: { self: size(4, 2), withDeps: size(8, 3) },
          Card: { self: size(6, 3), withDeps: size(12, 6) },
        },
      },
      actions: {
        js: { self: size(30, 12), withDeps: size(60, 25) },
        css: null,
        components: {
          Button: { self: size(30, 12), withDeps: size(60, 25) },
        },
      },
    },
  });

  expect(Object.keys(report.entries)).toEqual(["actions", "layout"]);
  expect(Object.keys(report.entries.layout.components)).toEqual([
    "Card",
    "Grid",
  ]);
  expect(report.totals.js.self).toEqual(size(40, 17));
  expect(report.totals.js.withDeps).toEqual(size(80, 34));
  expect(report.totals.css).toEqual({ rawBytes: 100, gzipBytes: 40 });
  expect(report.package).toEqual({
    name: "@digitaltableteur/react",
    version: "0.1.22",
  });
  expect(report.methodology.self).toMatch(/externalized/);
});
