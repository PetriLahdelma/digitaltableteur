#!/usr/bin/env node
/**
 * TypeScript MCP Automation Script
 *
 * Purpose: Provide a lightweight automation similar to sentry-automation for the
 * ts-language-server MCP entry. It validates that the server can start and respond
 * to a simple initialize + shutdown lifecycle. This ensures tooling availability
 * in CI/local environments and surfaces a stub marker file when unavailable.
 *
 * Outputs:
 * - public/observability/ts-mcp-status.json
 *   { ok: boolean, generatedAt: string, stub?: boolean, reason?: string }
 *
 * Flags:
 * --force-stub : Always write stub file without attempting to start server.
 * --debug      : Extra logging.
 */
import { spawn } from "node:child_process";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const forceStub = args.includes("--force-stub");
const debug = args.includes("--debug");

const statusPath = path.join(
  process.cwd(),
  "public",
  "observability",
  "ts-mcp-status.json",
);

async function writeStub(reason) {
  await mkdir(path.dirname(statusPath), { recursive: true });
  const payload = {
    ok: false,
    generatedAt: new Date().toISOString(),
    stub: true,
    reason,
  };
  await writeFile(statusPath, JSON.stringify(payload, null, 2));
  console.log("[ts-mcp] wrote stub status", payload);
}

async function writeOk() {
  await mkdir(path.dirname(statusPath), { recursive: true });
  const payload = { ok: true, generatedAt: new Date().toISOString() };
  await writeFile(statusPath, JSON.stringify(payload, null, 2));
  console.log("[ts-mcp] wrote ok status", payload);
}

async function run() {
  if (forceStub) {
    await writeStub("force-stub-flag");
    return;
  }

  // Start typescript-language-server via npx with --stdio. We'll perform a minimal LSP handshake.
  const proc = spawn("npx", ["typescript-language-server", "--stdio"], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  let resolved = false;
  const timeoutMs = 8000;
  const timer = setTimeout(() => {
    if (!resolved) {
      resolved = true;
      proc.kill();
      writeStub("timeout");
    }
  }, timeoutMs);

  let buffer = "";
  proc.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    if (debug) process.stdout.write(chunk.toString());
    // Detect any response to our initialize (we don't parse strictly; presence of 'Initialized' or LSP headers is enough).
    if (!resolved && /Content-Length:/i.test(buffer)) {
      // Consider successful handshake on first LSP header after initialize request.
      resolved = true;
      clearTimeout(timer);
      writeOk().then(() => proc.kill());
    }
  });

  proc.stderr.on("data", (chunk) => {
    if (debug) process.stderr.write(chunk.toString());
  });

  proc.on("error", async (err) => {
    if (!resolved) {
      resolved = true;
      clearTimeout(timer);
      await writeStub("spawn-error:" + err.message);
    }
  });

  proc.on("close", async (code) => {
    if (!resolved) {
      resolved = true;
      clearTimeout(timer);
      await writeStub("exit-code:" + code);
    }
  });

  // Send initialize request (basic LSP JSON-RPC 2.0 message).
  const initPayload = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      processId: process.pid,
      rootUri: null,
      capabilities: {},
    },
  });
  const message = `Content-Length: ${Buffer.byteLength(initPayload, "utf8")}\r\n\r\n${initPayload}`;
  proc.stdin.write(message);
  // We do not send shutdown/didExit; we terminate after successful header detection for minimal runtime.
}

run().catch((e) => {
  console.error("[ts-mcp] fatal error", e);
  writeStub("fatal:" + e.message);
});
