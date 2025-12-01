import { defineConfig } from "vitest/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
    include: [
      "shared/components/**/*.test.{ts,tsx}",
      "app/**/*.test.{ts,tsx}",
      "components/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "src-legacy-vite-DO-NOT-USE/**",
      "vite-app/**",
      "nextjs-app/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      reportsDirectory: "coverage",
      include: [
        "shared/components/**/*.{ts,tsx}",
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.stories.{ts,tsx}",
        "**/*.test.{ts,tsx}",
        "**/index.{ts,tsx}",
        "src-legacy-vite-DO-NOT-USE/**",
        "vite-app/**",
        "nextjs-app/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@dt": resolve(__dirname, "shared/components"),
      "@": resolve(__dirname, "."),
    },
  },
});
