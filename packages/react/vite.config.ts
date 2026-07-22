import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const packageRoot = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolve(packageRoot, "../..");
const sharedRoot = resolve(repoRoot, "nextjs-app/shared");
const componentsRoot = resolve(sharedRoot, "components");
const entryNames = [
  "actions",
  "consent",
  "content",
  "feedback",
  "forms",
  "hooks",
  "identity",
  "layout",
  "navigation",
  "patterns",
  "runtime",
  "typography",
] as const;
const cssEntryName = process.env.DT_REACT_CSS_ENTRY;
const cssEntryNames = new Set(["index", ...entryNames]);
if (cssEntryName && !cssEntryNames.has(cssEntryName)) {
  throw new Error(`Unknown React package CSS entry: ${cssEntryName}`);
}
const cssOnlyBuild = Boolean(cssEntryName);
const entries = Object.fromEntries([
  ["index", resolve(packageRoot, "src/index.ts")],
  ...entryNames.map((name) => [name, resolve(packageRoot, `src/${name}.ts`)]),
]);
// Everything here must be a peerDependency or dependency in package.json:
// inlining a declared dependency ships two copies (bundle + registry install)
// with independent module state (framer AnimatePresence, phosphor registry).
const externalPackages = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "framer-motion",
  "@phosphor-icons/react",
  "class-variance-authority",
  "clsx",
  "react-phone-number-input",
];

function isExternal(id: string): boolean {
  // Stylesheets stay bundled into dist/style.css even when their package is
  // external (react-phone-number-input/style.css) — a bare CSS import in the
  // emitted JS would break non-bundler consumers.
  if (id.endsWith(".css")) return false;
  return externalPackages.some(
    (pkg) => id === pkg || id.startsWith(`${pkg}/`),
  );
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@dt\/(.+)$/,
        replacement: `${componentsRoot}/$1`,
      },
      {
        find: "@dt",
        replacement: componentsRoot,
      },
      {
        // react-markdown → micromark pulls this dual package; vite's browser
        // condition picks index.dom.js, which calls document.createElement at
        // module scope and crashes any Node/SSR import of the built dist.
        // Pin the universal Node build (works in browsers too).
        find: "decode-named-character-reference",
        replacement: resolve(
          repoRoot,
          "node_modules/decode-named-character-reference/index.js",
        ),
      },
    ],
  },
  build: {
    outDir: resolve(
      packageRoot,
      cssOnlyBuild ? `dist/.css/${cssEntryName}` : "dist",
    ),
    emptyOutDir: true,
    cssCodeSplit: !cssOnlyBuild,
    manifest: !cssOnlyBuild,
    lib: {
      entry: cssOnlyBuild
        ? resolve(packageRoot, `src/${cssEntryName}.ts`)
        : entries,
      formats: ["es"],
      fileName: (_format, entryName) =>
        cssOnlyBuild ? "index.js" : `${entryName}.js`,
      ...(cssOnlyBuild ? { cssFileName: "style" } : {}),
    },
    rollupOptions: {
      external: isExternal,
      output: {
        banner: '"use client";',
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: (assetInfo) =>
          assetInfo.names?.some((name) => name.endsWith(".css"))
            ? cssOnlyBuild
              ? "style.css"
              : "assets/css/[name][extname]"
            : "assets/[name][extname]",
      },
    },
  },
});
