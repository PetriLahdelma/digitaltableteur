import type { StorybookConfig } from "@storybook/react-vite";
import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import remarkGfm from "remark-gfm";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
loadEnv({ path: resolve(repoRoot, ".env.local") });

type ViteAliasEntry = { find: string | RegExp; replacement: string };

/** Merge Vite aliases without dropping Storybook's array-shaped defaults. */
function mergeViteAlias(
  existing: unknown,
  additions: ViteAliasEntry[],
): ViteAliasEntry[] {
  const merged: ViteAliasEntry[] = [];

  if (Array.isArray(existing)) {
    merged.push(...(existing as ViteAliasEntry[]));
  } else if (existing && typeof existing === "object") {
    for (const [find, replacement] of Object.entries(existing)) {
      merged.push({ find, replacement: String(replacement) });
    }
  }

  for (const entry of additions) {
    const index = merged.findIndex(
      (item) => String(item.find) === String(entry.find),
    );
    if (index >= 0) merged[index] = entry;
    else merged.push(entry);
  }

  return merged;
}

const enableVitestPanel = process.env.STORYBOOK_VITEST === "1";

/** Paths that must not trigger preview reloads (Next dev, generators, tooling). */
const STORYBOOK_WATCH_IGNORED = [
  "**/.next/**",
  "**/.git/**",
  "**/node_modules/**",
  "**/storybook-static/**",
  "**/dist/**",
  "**/coverage/**",
  "**/.planning/**",
  "**/.cursor/**",
  "**/app/**",
  "**/nextjs-app/app/**",
  "**/instrumentation.ts",
  "**/sentry.*.config.ts",
  "**/next.config.ts",
  "**/next-env.d.ts",
  "**/proxy.ts",
  "**/scripts/**",
  "**/postMetadata.ts",
  "**/blogManifest.ts",
  "**/codeBlockFixtures.ts",
  "**/package.json",
  "**/package-lock.json",
  "**/content/**",
  "**/digitaltableteur-blog/**",
  "**/api-legacy-vercel-functions/**",
  "**/docs/**",
  "**/tests/**",
  "**/__visual__/**",
  "**/__a11y-snapshots__/**",
  "**/playwright-report/**",
];

const config: StorybookConfig = {
  stories: [
    "../nextjs-app/shared/components/**/*.mdx",
    "../nextjs-app/shared/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../nextjs-app/shared/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../nextjs-app/shared/patterns/**/*.mdx",
    "../nextjs-app/shared/patterns/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../nextjs-app/shared/templates/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../nextjs-app/shared/foundations/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../nextjs-app/shared/foundations/**/*.mdx",
  ],
  addons: [
    {
      name: "@storybook/addon-docs",
      options: {
        // @mdx-js/mdx (what addon-docs runs) does NOT enable GFM syntax by
        // default, so markdown tables in foundation .mdx docs render as raw
        // pipe text. Register remark-gfm so tables/strikethrough/task-lists
        // parse. remark-gfm is already a direct dependency.
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    "@storybook/addon-designs",
    "@storybook/addon-a11y",
    "@storybook/addon-mcp",
    ...(enableVitestPanel ? ["@storybook/addon-vitest"] : []),
  ],
  core: {
    disableWhatsNewNotifications: true,
  },
  features: {
    onboarding: false,
  },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../public", { from: "../app/fonts", to: "/fonts" }],
  // Configure base path for subdirectory deployment
  managerHead: (head) => `
    ${head}
    <base href="${process.env.NODE_ENV === "production" ? "/storybook/" : "/"}">
  `,
  viteFinal: async (config, { configType }) => {
    const isProductionBuild = configType === "PRODUCTION";
    const rootPath = fileURLToPath(new URL("..", import.meta.url));
    const componentsPath = fileURLToPath(
      new URL("../nextjs-app/shared/components", import.meta.url),
    );
    const sharedComponentsPath = componentsPath;
    const patternsPath = fileURLToPath(
      new URL("../nextjs-app/shared/patterns", import.meta.url),
    );
    const reactPath = fileURLToPath(
      new URL("../node_modules/react", import.meta.url),
    );
    const reactDomPath = fileURLToPath(
      new URL("../node_modules/react-dom", import.meta.url),
    );
    const reactJsxRuntimePath = fileURLToPath(
      new URL("../node_modules/react/jsx-runtime", import.meta.url),
    );
    const testStubsPath = fileURLToPath(
      new URL("../test-stubs", import.meta.url),
    );
    const nextNavigationStub = resolve(testStubsPath, "next-navigation.ts");
    const nextImageStub = resolve(testStubsPath, "next-image.tsx");
    const nextLinkStub = resolve(testStubsPath, "next-link.tsx");
    const nextDynamicStub = resolve(testStubsPath, "next-loadable.tsx");

    // Predictable but module-scoped class names. Storybook bundles every
    // component's CSS into a single document, so duplicate local names like
    // `.error`, `.info`, `.warning`, `.title` from different CSS Modules
    // collide when the default `[local]` scoping is used. Prefixing with the
    // module basename keeps tests that read `styles.xxx` correct (they read
    // the resolved class name) while preventing cross-module bleed.
    config.css = {
      ...(config.css || {}),
      modules: {
        ...((config.css as any)?.modules || {}),
        generateScopedName: "[name]__[local]",
      },
    };

    config.resolve = config.resolve || {};
    config.resolve.alias = mergeViteAlias(config.resolve.alias, [
      { find: "@", replacement: rootPath },
      { find: "@dt", replacement: componentsPath },
      { find: "@dt/shared", replacement: sharedComponentsPath },
      { find: "@dt/patterns", replacement: patternsPath },
      { find: "react", replacement: reactPath },
      { find: "react-dom", replacement: reactDomPath },
      { find: "react/jsx-runtime", replacement: reactJsxRuntimePath },
      { find: "next/navigation", replacement: nextNavigationStub },
      { find: "next/image", replacement: nextImageStub },
      { find: "next/link", replacement: nextLinkStub },
      { find: "next/dynamic", replacement: nextDynamicStub },
    ]);
    config.resolve.dedupe = Array.from(
      new Set([
        ...(config.resolve.dedupe || []),
        "react",
        "react-dom",
        "react/jsx-runtime",
      ]),
    );

    // SECURITY: only inline non-secret env vars that the bundled client code
    // actually reads. Inlining the whole `process.env` (with .env.local loaded
    // above) baked secrets — API keys, tokens, the Mongo URI, the CV password —
    // into the deployed storybook-static bundle, because at every `process.env.X`
    // site Vite replaced `process.env` with the full env object. Bare
    // `process.env` now resolves to `{}`, so any unlisted var (every secret) is
    // `undefined` in the bundle rather than exposed. Allow only what the preview
    // and stories use: NODE_ENV, a few test/CI toggles, and the public-by-
    // convention NEXT_PUBLIC_ / STORYBOOK_ / DT_ families.
    const isSafeEnvKey = (key: string): boolean =>
      key === "NODE_ENV" ||
      key === "CI" ||
      key === "VITEST" ||
      key === "TARGET_URL" ||
      key.startsWith("NEXT_PUBLIC_") ||
      key.startsWith("STORYBOOK_") ||
      key.startsWith("DT_");
    const safeEnvDefines = Object.fromEntries(
      Object.entries(process.env)
        .filter(
          ([key, value]) => isSafeEnvKey(key) && typeof value === "string",
        )
        .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
    );
    config.define = {
      ...(config.define || {}),
      ...safeEnvDefines,
      // Bare `process.env` reads resolve to an empty object literal (a valid
      // esbuild define value): unlisted vars become `undefined`, no leakage.
      "process.env": "{}",
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
    };

    const optimizeIncludes = [
      "chart.js",
      "mermaid",
      "react-chartjs-2",
      "@gsap/react",
      "gsap",
      "@phosphor-icons/react",
      // The JSX runtime is injected by the esbuild/SWC transform, not written as
      // an import, so optimizeDeps.entries scanning never sees it — pin it so it
      // is pre-bundled at boot instead of discovered (and reloaded) on first
      // story render. Both variants: jsx-dev-runtime for Storybook dev
      // (esbuild.jsxDev = true), jsx-runtime for the Vitest path below.
      "react/jsx-dev-runtime",
      "react/jsx-runtime",
    ];

    // Storybook serves stories as lazy dynamic imports, so Vite's dependency
    // scanner — which only crawls the entries it knows at boot — never sees
    // story-only deps (Radix primitives, react-icons/si, lucide-react, leaflet,
    // prismjs, …). They get discovered on first story view, which forces a
    // re-optimize + full preview reload; any story import in flight during that
    // reload rejects with "Failed to fetch dynamically imported module", which
    // surfaces as *every* story failing during the cold-cache window.
    //
    // Pointing optimizeDeps.entries at preview.tsx + the story globs makes the
    // scanner crawl the whole story graph at boot, so the entire dep set is
    // pre-bundled in a single pass and no mid-session re-optimize/reload occurs.
    // preview.tsx is listed first so deps Vite already scanned from the preview
    // graph stay covered when `entries` overrides Vite's default entry crawl.
    const optimizeEntries = [
      ".storybook/preview.tsx",
      "nextjs-app/shared/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
      "nextjs-app/shared/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
      "nextjs-app/shared/patterns/**/*.stories.@(js|jsx|mjs|ts|tsx)",
      "nextjs-app/shared/templates/**/*.stories.@(js|jsx|mjs|ts|tsx)",
      "nextjs-app/shared/foundations/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    ].map((entry) => resolve(rootPath, entry));

    const existingEntries = config.optimizeDeps?.entries;
    const normalizedExistingEntries = Array.isArray(existingEntries)
      ? existingEntries
      : existingEntries
        ? [existingEntries]
        : [];

    config.optimizeDeps = {
      ...(config.optimizeDeps || {}),
      entries: Array.from(
        new Set([...normalizedExistingEntries, ...optimizeEntries]),
      ),
      exclude: Array.from(
        new Set([
          ...(config.optimizeDeps?.exclude || []),
          "next/navigation",
          "next/image",
          "next/link",
          "next/dynamic",
        ]),
      ),
      include: Array.from(
        new Set([...(config.optimizeDeps?.include || []), ...optimizeIncludes]),
      ),
    };

    // Safely merge optimizeIncludes into ssr.noExternal
    const existingNoExternal = config.ssr?.noExternal;
    let mergedNoExternal: typeof existingNoExternal | string[];

    if (Array.isArray(existingNoExternal)) {
      mergedNoExternal = Array.from(
        new Set([
          ...(existingNoExternal as (string | RegExp)[]),
          ...optimizeIncludes,
        ]),
      );
    } else if (
      existingNoExternal === true ||
      existingNoExternal instanceof RegExp ||
      typeof existingNoExternal === "string"
    ) {
      // Preserve non-array forms (true, RegExp, string)
      mergedNoExternal = existingNoExternal;
    } else {
      mergedNoExternal = optimizeIncludes;
    }

    config.ssr = {
      ...(config.ssr || {}),
      noExternal: mergedNoExternal as any,
    };

    const isVitest =
      process.env.VITEST === "true" || process.env.VITEST === "1";

    // Storybook dev HMR; disable under Vitest browser tests to avoid WebSocket
    // teardown races ("WebSocket closed without opened") on worker shutdown.
    config.server = {
      ...config.server,
      ...(isVitest
        ? { hmr: false }
        : {
            hmr: {
              overlay: true,
              // Avoid clashing with other Vite instances (default 24678)
              port: 24680,
            },
          }),
      watch: {
        usePolling: false,
        interval: 100,
        ignored: STORYBOOK_WATCH_IGNORED,
      },
    };

    if (isVitest) {
      config.define = {
        ...(config.define || {}),
        "import.meta.hot": "undefined",
      };
      config.esbuild = {
        ...config.esbuild,
        jsxDev: false,
      };
    } else {
      // jsxDev helps dev-server HMR, but it MUST stay off for `storybook
      // build`: the transform emits jsxDEV() calls while the production
      // react/jsx-dev-runtime stubs jsxDEV as undefined, so every page of
      // storybook-static crashed at runtime with "e.jsxDEV is not a function".
      config.esbuild = {
        ...config.esbuild,
        jsxDev: !isProductionBuild,
      };
    }

    // Set base for production builds under /storybook/
    if (process.env.NODE_ENV === "production") {
      config.base = "/storybook/";
    }

    return config;
  },
};
export default config;
