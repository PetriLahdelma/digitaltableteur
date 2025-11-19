#!/usr/bin/env node
/**
 * Convenience runner for the Context7 MCP server.
 *
 * Usage:
 *   npm run context7:mcp -- [additional CLI flags]
 *
 * The script forwards all extra arguments to `@upstash/context7-mcp`. If
 * `CONTEXT7_API_KEY` is present, it injects the `--api-key` flag automatically
 * (unless you already supplied one manually).
 */

import { spawn } from "node:child_process";
import { config as loadEnv } from "dotenv";

// Load local environment variables (matches other tooling scripts)
loadEnv({ path: ".env.local" });

const REMOTE_CHECK_FLAG = "--remote-check";
const rawArgs = process.argv.slice(2);
const wantsRemoteCheck = rawArgs.includes(REMOTE_CHECK_FLAG);
const userArgs = rawArgs.filter((arg) => arg !== REMOTE_CHECK_FLAG);
const apiKey = process.env.CONTEXT7_API_KEY?.trim();

if (wantsRemoteCheck) {
  await runRemoteCheck(apiKey);
  process.exit(0);
}

const hasExplicitApiFlag = userArgs.some((arg) => arg === "--api-key");
const cmdArgs = ["-y", "@upstash/context7-mcp", ...userArgs];

if (!hasExplicitApiFlag && apiKey) {
  cmdArgs.push("--api-key", apiKey);
} else if (!hasExplicitApiFlag && !apiKey) {
  console.warn(
    "[context7:mcp] CONTEXT7_API_KEY not set; falling back to anonymous usage (lower rate limits).",
  );
}

const proc = spawn("npx", cmdArgs, {
  stdio: "inherit",
  env: process.env,
});

proc.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});

proc.on("error", (error) => {
  console.error("[context7:mcp] failed to launch server:", error);
  process.exit(1);
});

async function runRemoteCheck(key) {
  const endpoint =
    process.env.CONTEXT7_MCP_URL?.trim() || "https://mcp.context7.com/mcp";
  const headers = {
    Accept: "application/json, text/event-stream",
    "Content-Type": "application/json",
  };
  if (key) {
    headers["Context7-API-Key"] = key;
  } else {
    console.warn(
      "[context7:mcp] CONTEXT7_API_KEY not set; remote check will run anonymously (lower rate limits).",
    );
  }

  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "digitaltableteur-helper", version: "1.0.0" },
    },
  });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body,
    });
    const text = await response.text();
    console.log(`[context7:mcp] ${response.status} ${response.statusText}`);
    console.log(text);
    if (!response.ok) {
      process.exit(1);
    }
  } catch (error) {
    console.error("[context7:mcp] remote check failed:", error);
    process.exit(1);
  }
}
