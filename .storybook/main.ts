import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";

const config: StorybookConfig = {
  stories: [
    "../nextjs-app/shared/components/**/*.mdx",
    "../nextjs-app/shared/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../nextjs-app/shared/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../nextjs-app/shared/patterns/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-mcp",
    "@storybook/addon-vitest",
  ],
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
    const componentsPath = fileURLToPath(
      new URL("../nextjs-app/shared/components", import.meta.url),
    );
    const sharedComponentsPath = componentsPath;
    const patternsPath = fileURLToPath(
      new URL("../nextjs-app/shared/patterns", import.meta.url),
    );

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@dt": componentsPath,
      "@dt/shared": sharedComponentsPath,
      "@dt/patterns": patternsPath,
    };

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
      "react-chartjs-2",
      "@storybook/testing-library",
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
      },
      watch: {
        // Ensure file watching works properly
        usePolling: false,
        interval: 100,
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
