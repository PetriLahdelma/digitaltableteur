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
const shouldRunStorybookTests =
  process.env.RUN_STORYBOOK_TESTS === "1" ||
  process.env.RUN_STORYBOOK_TESTS === "true";
const shouldSkipStorybookTests =
  // Keep npm test on the existing unit-test contract. Storybook browser tests
  // remain available as an explicit project when RUN_STORYBOOK_TESTS=1.
  !shouldRunStorybookTests ||
  isVercel ||
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

const unitTestProject = {
  extends: true as const,
  test: {
    name: "unit",
    sequence: {
      groupOrder: 0,
    },
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
      "scripts/design-system/*.test.mjs",
      // Storybook-only resolver for contract playground.defaults element
      // descriptors (Astryx Phase 2). Scoped to this single file, not a
      // blanket .storybook/lib/**/*.test.tsx glob, so future Storybook
      // config/helper files don't accidentally get pulled into the unit
      // suite.
      ".storybook/lib/resolveElements.test.tsx",
      // Docs-frame blocks (Astryx Phase 2): pure React components with unit
      // tests, colocated under .storybook/blocks/.
      ".storybook/blocks/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      ".claude/**",
      // composition-lint-lib.test.mjs uses node:test (not vitest) and is run
      // separately via `node --test` inside scripts/design-system/agent-eval/run.mjs.
      // Vite's import-analysis plugin cannot bundle node:test, so it must stay
      // excluded from the vitest include glob above.
      "scripts/design-system/composition-lint-lib.test.mjs",
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
        ".claude/**",
      ],
    },
  },
};

const storybookTestProject = {
  extends: true as const,
  plugins: [
    // The plugin runs tests for the stories defined in .storybook/main.ts.
    storybookTest({
      configDir: path.join(dirname, ".storybook"),
      // Disable tags to avoid import.meta.env issues in browser mode.
      tags: {
        skip: [],
      },
    }),
  ],
  test: {
    name: "storybook",
    sequence: {
      groupOrder: 1,
    },
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
                browser: "chromium" as const,
              },
            ],
          }
        : {}),
    },
    // Prevent import.meta.env cloning issues.
    isolate: false,
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
    projects: shouldSkipStorybookTests
      ? [unitTestProject]
      : [unitTestProject, storybookTestProject],
  },
  resolve: {
    // `dedupe` is the Vite-blessed way to force one copy of each package
    // across the entire test graph. Without this, local nested installs or
    // linked worktrees can pull in a second React, which surfaces as
    // `Cannot read properties of null (reading 'useContext')` when hooks call
    // into a different React than the test harness loaded.
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-i18next",
      "i18next",
      "scheduler",
      // These UI packages can each carry their own React instance when linked
      // through local tooling. Dedupe ensures Vite resolves a single copy.
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
