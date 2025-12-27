import { defineConfig } from "vitest/config";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

export default defineConfig({
  root: repoRoot,
  plugins: [
    mdx({
      remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
      providerImportSource: "@mdx-js/react",
    }),
    react(),
  ],
  test: {
    environment: "jsdom",
    setupFiles: resolve(__dirname, "vitest.setup.ts"),
    globals: true,
    include: ["src/**/*.test.tsx"],
    deps: {
      inline: [
        "react",
        "react-dom",
        "@testing-library/react",
        "@testing-library/user-event",
        "@testing-library/dom",
      ],
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      reportsDirectory: resolve(repoRoot, "coverage"),
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.stories.{ts,tsx}",
        "src/**/*.test.{ts,tsx}",
        "src/main.tsx",
        "src/setupTests.ts",
        "src/reportWebVitals.ts",
      ],
      thresholds: {
        statements: 85,
        branches: 75,
        functions: 75,
        lines: 85,
      },
    },
  },
  resolve: {
    alias: {
      "@dt": resolve(repoRoot, "src/components"),
      "@vitest/coverage-v8": resolve(
        repoRoot,
        "node_modules/@vitest/coverage-v8",
      ),
      react: resolve(repoRoot, "node_modules/react"),
      "react-dom": resolve(repoRoot, "node_modules/react-dom"),
      "react-dom/client": resolve(repoRoot, "node_modules/react-dom/client"),
      "react/jsx-runtime": resolve(repoRoot, "node_modules/react/jsx-runtime"),
      "@testing-library/react": resolve(
        repoRoot,
        "node_modules/@testing-library/react",
      ),
      "@testing-library/user-event": resolve(
        repoRoot,
        "node_modules/@testing-library/user-event",
      ),
      "@testing-library/dom": resolve(
        repoRoot,
        "node_modules/@testing-library/dom",
      ),
      "@testing-library/jest-dom": resolve(
        repoRoot,
        "node_modules/@testing-library/jest-dom",
      ),
      "jest-axe": resolve(repoRoot, "node_modules/jest-axe"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
