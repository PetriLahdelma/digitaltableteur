#!/usr/bin/env node
/** Poll until Storybook serves index.json (not just TCP accept). */
const host = process.env.STORYBOOK_HOST || "127.0.0.1";
const port = process.env.STORYBOOK_PORT || "6010";
const indexUrl = `http://${host}:${port}/index.json`;
const timeoutMs = Number(process.env.STORYBOOK_WAIT_MS || 180_000);
const start = Date.now();

async function ready() {
  const res = await fetch(indexUrl, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) return false;
  const data = await res.json();
  return Boolean(data?.entries && Object.keys(data.entries).length > 0);
}

while (Date.now() - start < timeoutMs) {
  try {
    if (await ready()) {
      console.log(`Storybook ready at ${indexUrl}`);
      process.exit(0);
    }
  } catch {
    // not up yet
  }
  await new Promise((r) => setTimeout(r, 500));
}
console.error(`Timed out waiting for Storybook at ${indexUrl}`);
process.exit(1);
