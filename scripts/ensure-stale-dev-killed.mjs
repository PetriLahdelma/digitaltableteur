#!/usr/bin/env node
/**
 * If port 3001 is in use, stop listeners so `next dev` is the only server.
 * Prevents ChunkLoadError / HMR failures from multiple competing dev processes.
 */
import { execFileSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

function parsePort(value) {
  const port = Number.parseInt(String(value ?? "3001"), 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${value}`);
  }
  return port;
}

function listPidsOnPort(port) {
  try {
    return execFileSync("lsof", ["-ti", `:${port}`], { encoding: "utf8" })
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  } catch {
    return [];
  }
}

const PORT = parsePort(process.env.PORT);

try {
  const selfPid = String(process.pid);
  let pids = listPidsOnPort(PORT).filter((pid) => pid !== selfPid);

  if (pids.length === 0) process.exit(0);

  console.warn(
    `Port ${PORT} in use by PIDs ${pids.join(", ")} — stopping stale dev server(s).`,
  );
  for (const pid of pids) {
    try {
      process.kill(Number(pid), "SIGTERM");
    } catch {
      /* already gone */
    }
  }
  await sleep(500);

  pids = listPidsOnPort(PORT).filter((pid) => pid !== selfPid);
  if (pids.length > 0) {
    console.warn(
      `Port ${PORT} still busy — force-stopping PIDs ${pids.join(", ")}.`,
    );
    for (const pid of pids) {
      try {
        process.kill(Number(pid), "SIGKILL");
      } catch {
        /* already gone */
      }
    }
    await sleep(300);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
