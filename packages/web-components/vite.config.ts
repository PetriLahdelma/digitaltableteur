import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const packageRoot = fileURLToPath(new URL(".", import.meta.url));

const entries = {
  index: resolve(packageRoot, "src/index.ts"),
  native: resolve(packageRoot, "src/native.ts"),
  react: resolve(packageRoot, "src/react.ts"),
  register: resolve(packageRoot, "src/register.ts"),
  "register-native": resolve(packageRoot, "src/register-native.ts"),
  "register-react": resolve(packageRoot, "src/register-react.ts"),
};

const externalPackages = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "@digitaltableteur/react",
  "@r2wc/react-to-web-component",
];

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: resolve(packageRoot, "dist"),
    emptyOutDir: true,
    lib: {
      entry: entries,
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: (id) =>
        externalPackages.some(
          (packageName) => id === packageName || id.startsWith(`${packageName}/`),
        ),
      output: {
        chunkFileNames: "chunks/[name]-[hash].js",
      },
    },
  },
});
