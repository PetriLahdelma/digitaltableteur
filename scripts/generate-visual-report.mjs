import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const diffSourceDir = path.join(projectRoot, "__visual__", "diffs", "__diff_output__");
const publicDir = path.join(projectRoot, "public");
const outputDir = path.join(publicDir, "visual-diff");
const reportFile = path.join(outputDir, "report.json");

const cleanOutputDir = () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    return;
  }

  for (const entry of fs.readdirSync(outputDir)) {
    if (entry === "report.json") {
      continue;
    }
    fs.rmSync(path.join(outputDir, entry), { recursive: true, force: true });
  }
};

const collectDiffs = () => {
  if (!fs.existsSync(diffSourceDir)) {
    return [];
  }

  const files = fs.readdirSync(diffSourceDir);
  const diffEntries = files.filter((file) => file.endsWith("-diff.png"));

  return diffEntries.map((diffFile) => {
    const baseName = diffFile.replace(/-diff\.png$/, "");
    const diffPath = path.join(diffSourceDir, diffFile);
    const actualPath = path.join(diffSourceDir, `${baseName}-actual.png`);
    const baselinePath = path.join(diffSourceDir, `${baseName}-baseline.png`);

    const targetBase = baseName;

    const copyIfExists = (sourcePath, suffix) => {
      if (!fs.existsSync(sourcePath)) {
        return null;
      }
      const targetFileName = `${targetBase}-${suffix}.png`;
      const targetPath = path.join(outputDir, targetFileName);
      fs.copyFileSync(sourcePath, targetPath);
      return `visual-diff/${targetFileName}`;
    };

    return {
      id: targetBase,
      actual: copyIfExists(actualPath, "actual"),
      baseline: copyIfExists(baselinePath, "baseline"),
      diff: copyIfExists(diffPath, "diff"),
    };
  });
};

const writeReport = (diffs) => {
  const reportPayload = {
    generatedAt: new Date().toISOString(),
    diffs: diffs.filter((item) => item.actual && item.baseline && item.diff),
  };

  fs.writeFileSync(reportFile, `${JSON.stringify(reportPayload, null, 2)}\n`, "utf8");
};

const main = () => {
  cleanOutputDir();
  const diffs = collectDiffs();
  writeReport(diffs);
};

main();
