import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(async () => {
  const { viteStaticCopy } = await import("vite-plugin-static-copy");
  const enableSentry = Boolean(process.env.VITE_SENTRY_DSN);
  return {
    plugins: [
      mdx({
        remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
        providerImportSource: "@mdx-js/react",
      }),
      react(),
      viteStaticCopy({
        targets: [
          {
            src: "public/404.html",
            dest: "",
          },
          {
            src: "public/llms-full.txt",
            dest: "",
            rename: "llms.txt",
          },
        ],
      }),
      enableSentry &&
        sentryVitePlugin({
          org: process.env.SENTRY_ORG || "digitaltableteur",
          project: process.env.SENTRY_PROJECT || "frontend",
          authToken: process.env.SENTRY_AUTH_TOKEN,
          // Sentry v4 plugin expects a structured release object, not a raw string.
          // Provide name only when defined; otherwise omit to let plugin auto-generate.
          release: process.env.SENTRY_RELEASE
            ? { name: process.env.SENTRY_RELEASE }
            : undefined, // set in CI
          sourcemaps: {
            filesToDeleteAfterUpload: ["dist/**/*.js.map"],
          },
        }),
    ].filter(Boolean),
    build: {
      // Enhanced cache busting
      rollupOptions: {
        output: {
          // More aggressive file naming for cache busting
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
      // Generate source maps when Sentry enabled so they can be uploaded
      sourcemap: enableSentry ? true : false,
    },
    resolve: {
      alias: {
        "@dt": resolve(__dirname, "src/components"),
      },
    },
    server: {
      host: "0.0.0.0", // This allows access to all devices on your local network
      port: 5173,
    },
  };
});
