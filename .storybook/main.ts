import type { StorybookConfig } from "@storybook/react-vite";
import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
loadEnv({ path: resolve(repoRoot, ".env.local") });

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
  "**/middleware.ts",
  "**/scripts/**",
  "**/postMetadata.ts",
  "**/blogManifest.ts",
  "**/codeBlockFixtures.ts",
  "**/package.json",
  "**/package-lock.json",
  "**/content/**",
  "**/digitaltableteur-blog/**",
  "**/api-legacy-vercel-functions/**",
  "**/akaunting/**",
  "**/docs/**",
  "**/tests/**",
  "**/__visual__/**",
  "**/playwright-report/**",
];

const config: StorybookConfig = {
  stories: [
    "../nextjs-app/shared/components/**/*.mdx",
    "../nextjs-app/shared/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../nextjs-app/shared/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../nextjs-app/shared/patterns/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../nextjs-app/shared/templates/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../nextjs-app/shared/foundations/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../nextjs-app/shared/foundations/**/*.mdx",
  ],
  addons: [
    "@storybook/addon-docs",
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
  staticDirs: ["../public"],
  // Configure base path for subdirectory deployment
  managerHead: (head) => `
    ${head}
    <base href="${process.env.NODE_ENV === "production" ? "/storybook/" : "/"}">
  `,
  viteFinal: async (config) => {
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
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": rootPath,
      "@dt": componentsPath,
      "@dt/shared": sharedComponentsPath,
      "@dt/patterns": patternsPath,
      react: reactPath,
      "react-dom": reactDomPath,
      "react/jsx-runtime": reactJsxRuntimePath,
    };
    config.resolve.dedupe = Array.from(
      new Set([
        ...(config.resolve.dedupe || []),
        "react",
        "react-dom",
        "react/jsx-runtime",
      ]),
    );

    // Define process.env for Next.js Image component
    config.define = {
      ...(config.define || {}),
      "process.env": JSON.stringify(process.env),
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
    };

    const optimizeIncludes = [
      "chart.js",
      "mermaid",
      "react-chartjs-2",
      "@storybook/testing-library",
      "@gsap/react",
      "gsap",
    ];

    config.optimizeDeps = {
      ...(config.optimizeDeps || {}),
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

    // Ensure HMR is enabled and configured properly
    config.server = {
      ...config.server,
      hmr: {
        overlay: true,
        // Avoid clashing with other Vite instances (default 24678)
        port: 24680,
      },
      watch: {
        usePolling: false,
        interval: 100,
        ignored: STORYBOOK_WATCH_IGNORED,
      },
    };

    // Add esbuild options to help with HMR
    config.esbuild = {
      ...config.esbuild,
      jsxDev: true,
    };

    // Set base for production builds under /storybook/
    if (process.env.NODE_ENV === "production") {
      config.base = "/storybook/";
    }

    return config;
  },
};
export default config;
