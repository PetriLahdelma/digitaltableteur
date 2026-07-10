import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const packageRoot = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolve(packageRoot, "../..");
const sharedRoot = resolve(repoRoot, "nextjs-app/shared");
const componentsRoot = resolve(sharedRoot, "components");
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
    ],
  },
  build: {
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(packageRoot, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
      cssFileName: "style",
    },
    rollupOptions: {
      external: isExternal,
      output: {
        banner: '"use client";',
        assetFileNames: (assetInfo) =>
          assetInfo.names?.some((name) => name.endsWith(".css"))
            ? "style.css"
            : "assets/[name][extname]",
      },
    },
  },
});
