import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const packageRoot = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolve(packageRoot, "../..");
const sharedRoot = resolve(repoRoot, "nextjs-app/shared");
const componentsRoot = resolve(sharedRoot, "components");
const externalPackages = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
];

function isExternal(id: string): boolean {
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
