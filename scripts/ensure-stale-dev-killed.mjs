#!/usr/bin/env node
/**
 * If port 3001 is in use, stop listeners so `next dev` is the only server.
 * Prevents ChunkLoadError / HMR failures from multiple competing dev processes.
 */
import { execSync } from "node:child_process";

const PORT = process.env.PORT || "3001";

try {
  const pids = execSync(`lsof -ti :${PORT}`, { encoding: "utf8" })
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (pids.length === 0) process.exit(0);

  const selfPid = String(process.pid);
  const others = pids.filter((pid) => pid !== selfPid);
  if (others.length === 0) process.exit(0);

  console.warn(
    `Port ${PORT} in use by PIDs ${others.join(", ")} — stopping stale dev server(s).`,
  );
  for (const pid of others) {
    try {
      process.kill(Number(pid), "SIGTERM");
    } catch {
      /* already gone */
    }
  }
  execSync("sleep 0.5");

  const still = execSync(`lsof -ti :${PORT}`, { encoding: "utf8" })
    .trim()
    .split(/\s+/)
    .filter((pid) => pid && pid !== selfPid);
  if (still.length > 0) {
    console.warn(
      `Port ${PORT} still busy — force-stopping PIDs ${still.join(", ")}.`,
    );
    for (const pid of still) {
      try {
        process.kill(Number(pid), "SIGKILL");
      } catch {
        /* already gone */
      }
    }
    execSync("sleep 0.3");
  }
} catch {
  /* lsof returns non-zero when port is free */
}
