import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
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
  server: {
    host: "0.0.0.0", // This allows access to all devices on your local network
    port: 5173,
  },
});
