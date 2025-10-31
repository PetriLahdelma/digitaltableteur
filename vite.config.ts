import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig(async () => {
  const { viteStaticCopy } = await import("vite-plugin-static-copy");
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
    ],
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
      // Generate source maps for better debugging
      sourcemap: false, // Set to true if you need source maps in production
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
