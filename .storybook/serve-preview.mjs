import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

// Serve the production base path locally without touching other dev servers.
const root = resolve(process.argv[2] || "storybook-static");
const port = Number(process.argv[3] || 6020);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (url.pathname === "/") {
      response.writeHead(302, { Location: `/storybook/${url.search}` }).end();
      return;
    }
    const path = resolve(
      root,
      decodeURIComponent(url.pathname)
        .replace(/^\/storybook\//, "")
        .replace(/^\//, "") || "index.html",
    );
    if (!path.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    const file = (await stat(path)).isDirectory()
      ? resolve(path, "index.html")
      : path;
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(file)
      .on("error", () => response.destroy())
      .pipe(response);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Storybook preview: http://127.0.0.1:${port}/storybook/`),
);
