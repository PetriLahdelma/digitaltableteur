import fs from "node:fs";
import path from "node:path";

const STORAGE_DIR = path.join(process.cwd(), "data", "test-health");
const LATEST_FILE = path.join(STORAGE_DIR, "latest.json");

const ensureStorageDir = () => {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
};

export type PersistedRun = {
  runId: string;
  timestamp: string;
  branch?: string;
  status: "pending" | "completed";
  metrics: Record<string, unknown>;
};

export const writeLatestRun = (run: PersistedRun) => {
  ensureStorageDir();
  fs.writeFileSync(LATEST_FILE, JSON.stringify(run, null, 2), "utf8");
};

export const readLatestRun = (): PersistedRun | null => {
  if (!fs.existsSync(LATEST_FILE)) return null;
  try {
    const raw = fs.readFileSync(LATEST_FILE, "utf8");
    return JSON.parse(raw) as PersistedRun;
  } catch (error) {
    console.error("Unable to read latest test health run", error);
    return null;
  }
};
