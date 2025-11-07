import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(async () => {
  const { viteStaticCopy } = await import("vite-plugin-static-copy");
  const enableSentry = Boolean(process.env.VITE_SENTRY_DSN);
  return {
    plugins: [
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
          include: ["dist"],
          urlPrefix: "~/", // served root
          release: process.env.SENTRY_RELEASE, // set in CI
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
