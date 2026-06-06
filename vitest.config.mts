import { defineConfig } from "vitest/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const isVercel =
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true" ||
  process.env.NOW_REGION !== undefined;
const isCI = process.env.CI === "1" || process.env.CI === "true";
const shouldSkipStorybookTests =
  // Vercel deploy builds shouldn't run Storybook/Vitest addon projects.
  // They rely on Storybook config + (optionally) Playwright browsers, and are
  // both slow and flaky in that environment.
  isVercel ||
  isCI ||
  process.env.SKIP_STORYBOOK_TESTS === "1" ||
  process.env.SKIP_STORYBOOK_TESTS === "true";
const shouldEnableStorybookBrowserTests =
  process.env.DISABLE_STORYBOOK_BROWSER_TESTS !== "1" &&
  process.env.DISABLE_STORYBOOK_BROWSER_TESTS !== "true";

// In vitest we don't want to compile MDX articles — no test renders blog
// prose. Returning an empty default component + empty frontmatter lets every
// consumer (blogPosts, ArticlePageTemplate, RelatedPosts, …) load without
// pulling in the MDX compiler or its remark/rehype graph. The plugin runs
// pre-react so the .mdx extension is intercepted before any other transformer
// (esbuild, the storybook MDX plugin) tries to parse it as JS.
const stubMdxInTests = {
  name: "stub-mdx-in-tests",
  enforce: "pre" as const,
  async resolveId(this: { resolve: (s: string, i?: string, o?: object) => Promise<{ id: string } | null> }, source: string, importer?: string) {
    if (!source.endsWith(".mdx")) return null;
    const resolved = await this.resolve(source, importer, { skipSelf: true });
    if (resolved) return { id: resolved.id, moduleSideEffects: false };
    return null;
  },
  load(id: string) {
    if (id.endsWith(".mdx")) {
      return [
        "export const frontmatter = {};",
        "const StubMdx = () => null;",
        "export default StubMdx;",
      ].join("\n");
    }
    return null;
  },
};

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [stubMdxInTests, react()],
  css: {
    modules: {
      // Predictable but module-scoped class names. We prefix the local name
      // with the module basename so that storybook tests (which load every
      // component's CSS into a single document) cannot collide on common
      // names like `.error`, `.warning`, `.button`, etc. Unit tests that
      // assert via `styles.xxx` keep working because they read the resolved
      // class name from the CSS Module import.
      generateScopedName: "[name]__[local]",
    },
  },
  optimizeDeps: {
    include: [
      "@testing-library/jest-dom",
      "@testing-library/react",
      "jest-axe",
    ],
  },
  test: {
    // Avoid worker teardown races ("Closing rpc while fetch was pending") under CI load.
    fileParallelism: isCI ? false : true,
    maxWorkers: isCI ? 1 : undefined,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
    include: [
      "nextjs-app/**/*.test.{ts,tsx}",
      "app/**/*.test.{ts,tsx}",
      "providers/**/*.test.{ts,tsx}",
      "lib/**/*.test.{ts,tsx}",
      "components/**/*.test.{ts,tsx}",
      "tests/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "src-legacy-vite-DO-NOT-USE/**",
      "vite-app/**",
      ".claude/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      reportsDirectory: "coverage",
      include: [
        "shared/components/**/*.{ts,tsx}",
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "nextjs-app/shared/components/**/*.{ts,tsx}",
        "nextjs-app/shared/patterns/**/*.{ts,tsx}",
        "nextjs-app/shared/utils/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.stories.{ts,tsx}",
        "**/*.test.{ts,tsx}",
        "**/index.{ts,tsx}",
        "src-legacy-vite-DO-NOT-USE/**",
        "vite-app/**",
      ".claude/**",
      ],
    },
    projects: shouldSkipStorybookTests
      ? undefined
      : [
          {
            extends: true,
            plugins: [
              // The plugin will run tests for the stories defined in your Storybook config
              // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
              storybookTest({
                configDir: path.join(dirname, ".storybook"),
                // Disable tags to avoid import.meta.env issues in browser mode
                tags: {
                  skip: [],
                },
              }),
            ],
            test: {
              name: "storybook",
              // Run storybook browser tests sequentially to avoid Vite HMR WebSocket
              // teardown races ("WebSocket closed without opened") on worker shutdown.
              fileParallelism: false,
              maxWorkers: 1,
              pool: "forks",
              browser: {
                enabled: shouldEnableStorybookBrowserTests,
                ...(shouldEnableStorybookBrowserTests
                  ? {
                      headless: true,
                      provider: playwright({}),
                      instances: [
                        {
                          browser: "chromium",
                        },
                      ],
                    }
                  : {}),
              },
              setupFiles: [".storybook/vitest.setup.ts"],
              // Prevent import.meta.env cloning issues
              isolate: false,
              // Don't specify include here - let Storybook plugin handle story discovery
            },
          },
        ],
  },
  resolve: {
    // `dedupe` is the Vite-blessed way to force one copy of each package
    // across the entire test graph. Without this, the nested `nextjs-app/
    // node_modules/react*` install (created by nextjs-app/prebuild) pulls in
    // a second React, which surfaces as `Cannot read properties of null
    // (reading 'useContext')` when react-i18next's hook calls into a
    // different React than the test harness loaded.
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-i18next",
      "i18next",
      "scheduler",
      // The nested nextjs-app/node_modules install ships its own copy of
      // these UI packages, which each carry their own React instance and
      // cause useContext-null crashes under jsdom. Dedupe ensures Vite
      // resolves a single copy across the module graph.
      "@phosphor-icons/react",
      "framer-motion",
      "motion-utils",
      "motion-dom",
    ],
    alias: [
      { find: "@dt", replacement: resolve(dirname, "nextjs-app/shared/components") },
      { find: "@dt-pages", replacement: resolve(dirname, "nextjs-app/shared/components/pages") },
      { find: "@", replacement: resolve(dirname, ".") },
      // Stub next/image and next/link to plain HTML primitives. The Next
      // implementations otherwise pull in nextjs-app/node_modules/next which
      // ships its own React, causing useContext null crashes under jsdom.
      { find: "next/image", replacement: resolve(dirname, "test-stubs/next-image.tsx") },
      { find: "next/link", replacement: resolve(dirname, "test-stubs/next-link.tsx") },
      {
        find: "next/navigation",
        replacement: resolve(dirname, "test-stubs/next-navigation.ts"),
      },
      {
        find: "next/dynamic",
        replacement: resolve(dirname, "test-stubs/next-loadable.tsx"),
      },
      {
        find: /^framer-motion$/,
        replacement: resolve(dirname, "test-stubs/framer-motion.tsx"),
      },
      {
        find: /^motion\/react$/,
        replacement: resolve(dirname, "test-stubs/framer-motion.tsx"),
      },
      // Force single React instance to avoid hook errors.
      { find: /^react$/, replacement: resolve(dirname, "node_modules/react") },
      { find: /^react-dom$/, replacement: resolve(dirname, "node_modules/react-dom") },
      { find: /^react-dom\/client$/, replacement: resolve(dirname, "node_modules/react-dom/client") },
      { find: /^react\/jsx-runtime$/, replacement: resolve(dirname, "node_modules/react/jsx-runtime") },
      // @phosphor-icons/react and framer-motion are deduped above instead of
      // aliased; an explicit alias breaks subpath imports that rely on
      // package.json `exports` (e.g. `@phosphor-icons/react/ssr`).
    ],
  },
});
