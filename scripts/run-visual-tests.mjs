import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const isWindows = process.platform === "win32";
const runnerName = isWindows ? "test-storybook.cmd" : "test-storybook";
const runnerPath = path.join(projectRoot, "node_modules", ".bin", runnerName);

const extraArgs = process.argv.slice(2);
const runnerArgs = ["--config-dir", ".storybook", ...extraArgs];
const isUpdateSnapshot = extraArgs.includes("--updateSnapshot") || extraArgs.includes("-u");

const runGenerateReport = (exitCode) =>
  new Promise((resolve) => {
    const reportProcess = spawn(
      process.execPath,
      [path.join(projectRoot, "scripts", "generate-visual-report.mjs")],
      {
        cwd: projectRoot,
        stdio: "inherit",
      },
    );

    reportProcess.on("close", (reportCode) => {
      const finalCode = exitCode !== 0 ? exitCode : reportCode;
      resolve(finalCode);
    });
  });

const main = async () => {
  await new Promise((resolve, reject) => {
    const child = spawn(runnerPath, runnerArgs, {
      cwd: projectRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        STORYBOOK_TEST_RUNNER_MAX_WORKERS: process.env.CI ? "2" : undefined,
        STORYBOOK_VISUAL_REGRESSION: "true",
        STORYBOOK_VISUAL_UPDATE: isUpdateSnapshot ? "true" : undefined,
      },
    });

    child.on("error", reject);

    child.on("close", async (code) => {
      const finalCode = await runGenerateReport(code ?? 0);
      resolve(finalCode);
    });
  }).then(
    (code) => {
      process.exit(typeof code === "number" ? code : 0);
    },
    (error) => {
      console.error(error);
      process.exit(1);
    },
  );
};

main();
