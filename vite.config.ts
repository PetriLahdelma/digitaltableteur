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
        ],
      }),
    ],
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
